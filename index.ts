// Supabase Edge Function: confirma pagos de desbloqueo de contacto.
// Despliegue:  supabase functions deploy confirmar-pago --no-verify-jwt
// Configura en tu pasarela (Culqi, Mercado Pago, Niubiz) el webhook hacia:
//   https://<tu-proyecto>.supabase.co/functions/v1/confirmar-pago
// Variables:  supabase secrets set WEBHOOK_SECRET=... (el que te da la pasarela)
//
// La pasarela debe enviar en "metadata" el id del registro de contact_unlocks
// (lo creas al iniciar el cobro). Ajusta la lectura del cuerpo al formato exacto
// de tu pasarela y valida SIEMPRE la firma antes de confiar en el evento.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, // solo en el servidor, nunca en el navegador
);

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Método no permitido", { status: 405 });

  const secret = Deno.env.get("WEBHOOK_SECRET");
  if (!secret || req.headers.get("x-webhook-secret") !== secret) {
    // Reemplaza por la verificación de firma HMAC que documenta tu pasarela.
    return new Response("Firma inválida", { status: 401 });
  }

  const evt = await req.json();
  const unlockId = evt?.data?.metadata?.unlock_id;
  const paid = ["charge.succeeded", "payment.approved", "order.status.paid"].includes(evt?.type);
  if (!unlockId) return new Response("Falta unlock_id", { status: 400 });

  if (paid) {
    const { error } = await supabase.from("contact_unlocks")
      .update({ status: "pagado", paid_at: new Date().toISOString(), operation_code: evt?.data?.id ?? null })
      .eq("id", unlockId).eq("status", "pendiente");
    if (error) return new Response(error.message, { status: 500 });
  }
  return new Response("ok");
});
