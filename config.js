// Configuración de Yunta.
// Deja SUPABASE_URL vacío para usar el MODO DEMO (datos de ejemplo en el navegador).
window.YUNTA_CONFIG = {
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',

  // Planes para clientes: cantidad de contactos que pueden ver (deben coincidir con la tabla "plans")
  PLANES: [
    { id: 'uno',    nombre: '1 contacto', contactos: 1,  precio: 5,     periodo: null, nota: 'Pago único' },
    { id: 'basico', nombre: 'Básico',     contactos: 5,  precio: 19.90, periodo: 'mes', nota: 'Para probar' },
    { id: 'plus',   nombre: 'Plus',       contactos: 15, precio: 39.90, periodo: 'mes', nota: 'El más elegido', top: true, extras: ['Filtro "En línea ahora"', 'Ve primero a los nuevos'] },
    { id: 'pro',    nombre: 'Pro',        contactos: 40, precio: 79.90, periodo: 'mes', nota: 'Para eventos y empresas', extras: ['Filtro "En línea ahora"', 'Ve primero a los nuevos', 'Soporte prioritario'] }
  ],
  // Para quien ofrece servicios
  IMPULSOS: [
    { id: 'boost',     nombre: 'Boost 24 h',       precio: 9.90, desc: 'Sales primero en tu categoría por 24 horas.' },
    { id: 'destacado', nombre: 'Destacado 7 días', precio: 15,   desc: 'Etiqueta "Destacado" y lugar fijo en la portada.' }
  ],
  CONTACTOS_BIENVENIDA: 1,

  // Cuenta que recibe Yape/Plin (mientras no haya pasarela)
  YAPE_NUMERO: '999 000 111',
  YAPE_TITULAR: 'Yunta Servicios',

  CUL_VIGENCIA_DIAS: 90,
  PUNTAJE_ROSTRO_MIN: 0.85,

  // Niveles de prestigio (se recalculan cada mes)
  NIVELES: [
    { id: 'nuevo',     nombre: 'Nuevo',            req: 'Identidad, rostro y CUL verificados' },
    { id: 'confiable', nombre: 'Yunta Confiable',  n: 3,  nota: 4.5, req: '3 reseñas y nota 4.5 o más' },
    { id: 'destacado', nombre: 'Yunta Destacado',  n: 15, nota: 4.7, rapido: 0.8, req: '15 reseñas, nota 4.7+, 80% dicen que respondes rápido y 0 reportes' },
    { id: 'oro',       nombre: 'Yunta Oro',        n: 40, nota: 4.85, rapido: 0.8, req: '40 reseñas, nota 4.85+, 0 reportes, CUL vigente y revisión del equipo' }
  ],
  // Reputación mínima del cliente para contactar en Compañía
  CLIENTE_NOTA_MIN: 3.5
};
