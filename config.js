// Configuración de Yunta.
// Deja SUPABASE_URL vacío para usar el MODO DEMO (datos de ejemplo en el navegador).
// Para usar la base real: Supabase → Project Settings → API → copia URL y "anon public key".
window.YUNTA_CONFIG = {
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',

  // Monetización (soles)
  PRECIO_DESBLOQUEO: 5,                 // ver el contacto de 1 persona
  PAQUETE: { creditos: 5, precio: 19 }, // paquete de desbloqueos
  PRECIO_DESTACADO: 15,                 // anuncio destacado por 7 días (lo paga el proveedor)
  COMISION_RESERVA: 0.10,               // 10% al reservar con pago protegido

  // Cuenta que recibe los Yape/Plin (mientras no haya pasarela)
  YAPE_NUMERO: '999 000 111',
  YAPE_TITULAR: 'Yunta Servicios',

  CUL_VIGENCIA_DIAS: 90,
  PUNTAJE_ROSTRO_MIN: 0.85
};
