// Supabase Edge Function: confirma compras de planes (contactos, Boost, Destacado).
// Despliegue: supabase functions deploy confirmar-pago --no-verify-jwt
// Secretos:   supabase secrets set WEBHOOK_SECRET=...   (el que te da tu pasarela)
// Tu pasarela (Culqi, Mercado Pago, Niubiz) debe enviar en "metadata" el id de plan_purchases
// que creas antes de cobrar. Valida SIEMPRE la firma según la documentación de tu pasarela.
// Al marcar la compra como "pagado", el trigger apply_purchase suma los contactos o activa el Boost.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Método no permitido", { status: 405 });
  const secret = Deno.env.get("WEBHOOK_SECRET");
  if (!secret || req.headers.get("x-webhook-secret") !== secret) return new Response("Firma inválida", { status: 401 });

  const evt = await req.json();
  const purchaseId = evt?.data?.metadata?.purchase_id;
  const paid = ["charge.succeeded", "payment.approved", "order.status.paid"].includes(evt?.type);
  if (!purchaseId) return new Response("Falta purchase_id", { status: 400 });

  if (paid) {
    const { error } = await supabase.from("plan_purchases")
      .update({ status: "pagado", operation_code: evt?.data?.id ?? null })
      .eq("id", purchaseId).eq("status", "pendiente");
    if (error) return new Response(error.message, { status: 500 });
  }
  return new Response("ok");
});
