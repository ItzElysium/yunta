// Supabase Edge Function: cobra un plan con "Pagar con Yape" (celular + código de aprobación) vía Culqi.
// Despliegue:  supabase functions deploy cobrar-yape
// Secretos:    supabase secrets set CULQI_PUBLIC_KEY=pk_live_... CULQI_SECRET_KEY=sk_live_...
//
// Flujo: la app envía { plan, servicio?, celular, codigo }. Aquí, en el servidor:
//   1. Se valida al usuario con su sesión (nunca se confía en el precio que manda la app).
//   2. Se crea la compra en plan_purchases (canal yape_codigo).
//   3. Se pide a Culqi un token Yape con el celular y el código de aprobación (vence en 2 minutos).
//   4. Se hace el cargo con la llave secreta. Si Culqi lo aprueba, la compra pasa a "pagado" y
//      el trigger apply_purchase suma los contactos.
// IMPORTANTE: revisa los nombres exactos de campos y rutas en la documentación de Culqi
// (docs.culqi.com → Pagos online → Cargo único → Tokens Yape) antes de pasar a producción.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const asUser = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: { user } } = await asUser.auth.getUser();
  if (!user) return json({ error: "Inicia sesión" }, 401);

  const { plan, servicio, celular, codigo } = await req.json();
  if (!/^9\d{8}$/.test(String(celular ?? ""))) return json({ error: "Celular de 9 dígitos" }, 400);
  if (!/^\d{6}$/.test(String(codigo ?? ""))) return json({ error: "El código de aprobación tiene 6 dígitos" }, 400);

  const { data: p } = await admin.from("plans").select("*").eq("id", plan).single();
  if (!p) return json({ error: "Plan no existe" }, 400);
  const centimos = Math.round(Number(p.price) * 100);
  if (centimos > 200000) return json({ error: "Yape permite hasta S/ 2,000 por pago" }, 400);

  const { data: compra, error: e1 } = await admin.from("plan_purchases").insert({
    user_id: user.id, plan_id: p.id, service_id: servicio ?? null, amount: p.price,
    method: "yape", channel: "yape_codigo", expected_amount: p.price,
  }).select().single();
  if (e1) return json({ error: e1.message }, 500);

  // 1) Token Yape (llave pública)
  const tok = await fetch("https://secure.culqi.com/v2/tokens/yape", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("CULQI_PUBLIC_KEY")}` },
    body: JSON.stringify({ amount: String(centimos), number_phone: String(celular), otp: String(codigo) }),
  }).then((r) => r.json());
  if (!tok?.id) {
    await admin.from("plan_purchases").update({ status: "rechazado" }).eq("id", compra.id);
    return json({ error: tok?.user_message ?? "Yape no aprobó el código. Genera uno nuevo e intenta otra vez." }, 402);
  }

  // 2) Cargo (llave secreta, solo en el servidor)
  const cargo = await fetch("https://api.culqi.com/v2/charges", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("CULQI_SECRET_KEY")}` },
    body: JSON.stringify({
      amount: String(centimos), currency_code: "PEN", email: user.email, source_id: tok.id,
      metadata: { purchase_id: compra.id },
    }),
  }).then((r) => r.json());

  const ok = cargo?.outcome?.type === "venta_exitosa" || cargo?.object === "charge";
  await admin.from("plan_purchases").update({
    status: ok ? "pagado" : "rechazado", operation_code: cargo?.id ?? null,
  }).eq("id", compra.id);

  return ok
    ? json({ ok: true, purchase_id: compra.id })
    : json({ error: cargo?.user_message ?? "El pago no se completó" }, 402);
});
