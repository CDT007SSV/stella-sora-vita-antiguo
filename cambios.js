// Historial de cambios de la app. Lo que pongas aquí aparece en "Novedades" como tipo "App".
// Para anunciar un cambio nuevo: agrega un bloque ARRIBA de la lista (con un id distinto y la fecha de hoy).
// Enlace de tu formulario de opiniones (Google Forms, etc.). Si lo dejas vacío "" el botón de opinión no aparece.
const BETA_FORM = "";
// Versión que ve la gente en Ajustes. Súbela a mano en cada lanzamiento (1.1, 1.2…). El número de caché de sw.js es interno.
const APP_VERSION = "1.0";
const CAMBIOS = [
  {
    id: "v:2026-11-09-v1",
    fecha: "2026-11-09T18:00:00-06:00",
    titulo: "Stella Sora Vita 1.0 ya está aquí",
    puntos: [
      "Termina la beta: esta es la primera versión oficial. De aquí en adelante vienen las actualizaciones 1.1, 1.2…",
      "Lector de historias con fondos, sprites, emojis, música y sonidos, como en el juego.",
      "Heartlink: lee las conversaciones de chat de cada Trekker, igual que en el juego.",
      "L2D en las fichas de personajes y discos, con zoom, y una lista de todos en Galería de arte.",
      "Visor 3D con calidad a tu gusto. Carga solo cuando lo pides, y puedes desactivarlo en Ajustes si tu teléfono es modesto.",
      "Armador de equipos con imagen para compartir.",
      "La app carga más rápido y pesa mucho menos."
    ]
  },
  {
    id: "v:2026-11-05-beta",
    fecha: "2026-11-05T17:00:00-06:00",
    titulo: "Prueba beta: ¡ayúdanos a mejorar!",
    puntos: [
      "Stella Sora Vita está en beta pública por un día y medio: pruébala y cuéntanos qué falla o qué te gustaría ver.",
      "Nuevo lector de historias: lee el prólogo y los capítulos 1 al 3 con fondos, sprites, emojis, música y sonidos como en el juego (botón «Leer en el lector» en Historia).",
      "Mapa de actos para elegir dónde seguir leyendo, protagonista él/ella y tamaño de sprites ajustable.",
      "Los emojis salen cerca de los personajes y desaparecen solos, como en el juego.",
      "Si algo no carga bien, cierra y vuelve a abrir la app para recibir la última versión."
    ]
  },
  {
    id: "v:2026-11-05c",
    fecha: "2026-11-05T02:00:00-06:00",
    titulo: "Historias que se agregan solas",
    puntos: [
      "Capítulos, eventos, Nova Times e historias de personajes nuevos aparecen solos en sus listas, con su imagen y un botón a la wiki.",
      "Los nuevos llevan la etiqueta NUEVO; el resumen en español se agrega después."
    ]
  },
  {
    id: "v:2026-11-05b",
    fecha: "2026-11-05T01:00:00-06:00",
    titulo: "Buscador y portadas automáticas",
    puntos: [
      "Nuevo buscador (lupa arriba): encuentra personajes, discos, historias, eventos y builds.",
      "Personajes: los filtros principales siempre visibles y el resto en «Más filtros».",
      "Las imágenes de los botones de inicio e Historia se actualizan solas con lo más nuevo del juego."
    ]
  },
  {
    id: "v:2026-11-05",
    fecha: "2026-11-05T00:00:00-06:00",
    titulo: "Música continua y historias en español",
    puntos: [
      "Las historias de los discos ahora se leen en español.",
      "La música de un disco sigue sonando mientras navegas; usa el botón «Parar» de la barra inferior para detenerla.",
      "Los discos muestran su arte completo al tocar la imagen.",
      "Las skins con modelo 3D se pueden ver en el visor."
    ]
  },
  {
    id: "v:2026-11-04",
    fecha: "2026-11-04T21:00:00-06:00",
    titulo: "Stella Sora Vita: nueva versión",
    puntos: [
      "Nueva barra y centro de Novedades (campanita arriba a la derecha).",
      "Equipos y builds ahora se ven dentro de la app, con el diseño de la galería.",
      "Fichas de personajes en español: perfil, afiliación, habilidades y más.",
      "Estrella de rareza más grande y dorada; rol como etiqueta; botón de la wiki más limpio.",
      "Botón «Acerca de» con el aviso legal y los créditos."
    ]
  }
];
