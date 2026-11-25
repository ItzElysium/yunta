// Supabase Edge Function: recibe los avisos de pago que envía la app "Yunta Cobros"
// (instalada en el celular de la empresa, lee las notificaciones de Yape y de los bancos con Plin).
// Despliegue:  supabase functions deploy aviso-pago --no-verify-jwt
// Secreto:     supabase secrets set COBROS_SECRET=<una clave larga que también pones en la app>
//
// Cruza el aviso con una compra por QR pendiente que tenga EXACTAMENTE el mismo monto
// (cada compra tiene céntimos únicos). Si cruza, la compra pasa a "pagado" y se suman los contactos.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

// Montos tipo "S/ 39.81", "S/39,81" o "S/. 39.81"
const montoDe = (t: string) => {
  const m = t.match(/S\/\.?\s?(\d{1,5}(?:[.,]\d{3})*[.,]\d{2})/i);
  if (!m) return null;
  const s = m[1].replace(/[.,](?=\d{3}\b)/g, "").replace(",", ".");
  return Number(s);
};
// Nombre de quien paga: "Camila Rojas te envió un pago" / "Recibiste S/ 10 de Juan Pérez"
const nombreDe = (t: string) => {
  const n = t.match(/^(.{2,60}?)\s+te\s+(?:envi[oó]|yape[oó])/i)?.[1] ??
    t.match(/\bde\s+([A-ZÁÉÍÓÚÑ][^\n,.]{1,59})/)?.[1];
  return n ? n.replace(/^yape!?\s*/i, "").replace(/\s+por\s+.*$/i, "").trim() : null;
};

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Método no permitido", { status: 405 });
  const secret = Deno.env.get("COBROS_SECRET");
  if (!secret || req.headers.get("x-yunta-secret") !== secret) return new Response("No autorizado", { status: 401 });

  const { source, title, text } = await req.json();
  const raw = `${title ?? ""}\n${text ?? ""}`.trim();
  const amount = montoDe(raw);
  if (!amount) return new Response(JSON.stringify({ status: "ignorado", motivo: "sin monto" }), { status: 200 });

  const { data, error } = await admin.rpc("registrar_aviso", {
    p_source: String(source ?? "desconocido").slice(0, 80),
    p_name: nombreDe(text ?? "") ?? nombreDe(title ?? ""),
    p_amount: amount,
    p_raw: raw.slice(0, 500),
  });
  if (error) return new Response(error.message, { status: 500 });
  return new Response(JSON.stringify({ status: data.status, monto: amount }), { headers: { "Content-Type": "application/json" } });
});
