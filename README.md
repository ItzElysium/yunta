# Yunta

App peruana para encontrar compañía social, tutorías, salud y oficios con personas verificadas.
El cliente compra un **plan de contactos**, desbloquea el WhatsApp de quien le interesa y coordinan directo.

**Sitio:** https://itzelysium.github.io/yunta/

## Archivos (todos en la raíz)

| Archivo | Qué es |
|---|---|
| `index.html`, `styles.css`, `app.js` | Interfaz |
| `config.js` | Claves de Supabase, planes, precios, niveles |
| `api-demo.js` | Modo demo (datos de ejemplo en el navegador) |
| `api-supabase.js` | Conexión real a Supabase (se activa al poner las claves) |
| `avatars.js` | Avatares dibujados |
| `schema.sql` | Base de datos completa con seguridad (RLS) |
| `confirmar-pago.ts` | Webhook para confirmar pagos automáticamente |
| `yunta-demo.html` | Todo en un solo archivo (se genera con `python3 build-demo.py`) |

## Qué tiene

- **Inicio:** buscador, personas en línea (historias), categorías, filtros rápidos y "Top de la semana".
- **Descubrir:** tarjetas para deslizar (derecha guarda, izquierda pasa).
- **Perfil:** nivel, insignias, estadísticas, extras con precio, disponibilidad, límites, verificación y reseñas con etiquetas.
- **Contacto bloqueado:** se ve con 1 crédito del plan; luego botón directo a WhatsApp.
- **Planes:** 1 contacto (S/ 5), Básico 5 (S/ 19.90/mes), Plus 15 (S/ 39.90/mes), Pro 40 (S/ 79.90/mes). Para proveedores: Boost 24 h (S/ 9.90) y Destacado 7 días (S/ 15).
- **Niveles:** Nuevo → Confiable → Destacado → Oro, según reseñas, nota, "responde rápido" y reportes. Oro requiere revisión del equipo y CUL vigente.
- **Reputación del cliente:** quien ofrece califica al cliente; con nota menor a 3.5 no puede contactar en Compañía.
- **Cita segura:** temporizador, aviso a un contacto de confianza, llamada falsa y SOS.
- **Verificación:** DNI, selfie con prueba de vida y Certificado Único Laboral (validar en empleosperu.gob.pe con número + DNI).
- **Panel admin:** confirma pagos de Yape/Plin y aprueba identidades.

## Activar la base real

1. Crea un proyecto en https://supabase.com.
2. SQL Editor → pega `schema.sql` → Run.
3. Authentication → activa Email (y Google si quieres). En URL Configuration pon `https://itzelysium.github.io/yunta/`.
4. Project Settings → API: copia `Project URL` y `anon public key` en `config.js`.
5. Regístrate en la app y hazte admin:
   ```sql
   update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'TU_CORREO');
   ```

Nunca pongas la `service_role key` en el navegador. La seguridad está en las políticas RLS: el contacto solo se lee si existe un desbloqueo, y el desbloqueo solo se crea con la función `unlock_contact()`, que descuenta un crédito.

## Pendiente

- Pasarela de pago (Culqi, Mercado Pago o Niubiz) y proveedor biométrico real.
- Términos, privacidad (Ley 29733) y revisión legal de la categoría Compañía.
- Cobro del servicio dentro de la app (largo plazo).
