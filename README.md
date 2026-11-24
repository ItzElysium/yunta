# Yunta

Marketplace peruano de compañía social, tutorías, salud y oficios, con personas verificadas.

## Qué incluye

| Parte | Archivo |
|---|---|
| Base de datos, seguridad (RLS), triggers, storage | `supabase/schema.sql` |
| Webhook para confirmar pagos automáticamente | `supabase/functions/confirmar-pago/index.ts` |
| App web (login, explorar, publicar, verificar, desbloquear contacto, reservas, panel admin) | `index.html`, `css/`, `js/` |
| Versión demo en un solo archivo | `dist/yunta-demo.html` (se genera con `python3 build-demo.py`) |

La app funciona en **modo demo** (datos en el navegador) mientras `js/config.js` no tenga claves de Supabase.

## Poner la base real en marcha (15 minutos)

1. Crea un proyecto gratis en https://supabase.com (región: São Paulo es la más cercana a Lima).
2. **SQL Editor → New query** → pega `supabase/schema.sql` → **Run**.
3. **Authentication → Providers**: activa Email. Para "Continuar con Google", activa Google y pega el Client ID/Secret de Google Cloud.
4. **Authentication → URL Configuration**: pon la URL donde publicarás la app.
5. **Project Settings → API**: copia `Project URL` y `anon public key` en `js/config.js`.
6. Regístrate en la app y hazte admin en el SQL Editor:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'TU_CORREO');
   ```
7. Publica la carpeta en Vercel, Netlify o GitHub Pages (es una web estática).

La `anon key` es pública por diseño; la seguridad está en las políticas RLS. **Nunca** pongas la `service_role key` en el navegador.

## Cómo se protege el contacto (monetización)

- El teléfono, WhatsApp, correo y DNI viven en `provider_private`, que solo puede leer el dueño, un admin o un cliente con un registro **pagado** en `contact_unlocks`.
- El resto de la gente consulta la vista `provider_contact`, que devuelve `9•• ••• •••`.
- El cliente solo puede crear desbloqueos en estado `pendiente`. Lo pasa a `pagado` un admin (panel **Revisión**) o el webhook de la pasarela.
- Precios en `js/config.js`: S/ 5 por contacto, paquete de 5 por S/ 19, destacado S/ 15 por 7 días, 10% de comisión en reservas.

Probado en PostgreSQL 16: un cliente sin pago ve 0 filas privadas, no puede marcarse `pagado`, un proveedor no puede activarse ni marcarse verificado solo, y un CUL de más de 90 días se rechaza.

## Verificación de identidad

| Paso | Hoy en la app | Para producción |
|---|---|---|
| DNI | Foto + número, revisión manual | Lector de DNI de un proveedor KYC (MetaMap, Veriff, Truora, Onfido, Facephi u otro que soporte DNI peruano) |
| Rostro | Selfie + pasos de prueba de vida; el admin compara con la foto del DNI | SDK del mismo proveedor: prueba de vida real y puntaje de coincidencia, guardado en `verifications.face_match_score` |
| Antecedentes | PDF del **Certificado Único Laboral (CUL)** + número + fecha | Revisión manual en Empleos Perú (abajo) |
| Colegiatura | Número escrito, revisión manual | Consultar el buscador del C.Ps.P. / C.N.P. |

**Cómo comprobar que un CUL es real:** el CUL lo emite gratis el Ministerio de Trabajo (Ley 31760) y reúne datos de identidad, antecedentes policiales, penales y judiciales, estudios y experiencia. Para entregarlo a un empleador vale 90 días. Su autenticidad se comprueba en la sede digital **Empleos Perú (empleosperu.gob.pe)** con el número del certificado y el DNI del titular, hasta 12 meses después de emitido. Nunca confíes solo en el PDF: puede editarse. Si los datos del portal no coinciden con el PDF, rechaza.

Datos biométricos = datos sensibles (Ley 29733): pide consentimiento expreso (ya está en el formulario), guarda las imágenes en el bucket privado y borra selfies cuando ya no se necesiten. Inscribe tu banco de datos ante la Autoridad Nacional de Protección de Datos Personales.

## Pagos

Mientras empiezas: Yape/Plin a la cuenta de la empresa + código de operación + confirmación manual en el panel **Revisión**.

Para automatizar: usa una pasarela que acepte Yape y tarjetas (por ejemplo Culqi, Mercado Pago o Niubiz; confirma condiciones y comisiones en su web), crea el registro `contact_unlocks` antes de cobrar, manda su `id` como `metadata.unlock_id`, y despliega el webhook:

```bash
supabase functions deploy confirmar-pago --no-verify-jwt
supabase secrets set WEBHOOK_SECRET=el_de_tu_pasarela
```

Adapta la validación de firma al formato de tu pasarela.

## Pendientes antes de lanzar

- RUC, boletas electrónicas (SUNAT) y Libro de Reclamaciones conectado a una tabla real.
- Términos y condiciones, y política de privacidad, revisados por un abogado (sobre todo para la categoría Compañía).
- Integrar el proveedor biométrico y la pasarela.
- Correos de aviso (verificación aprobada, pago confirmado).
