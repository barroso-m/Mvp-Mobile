export const SideMenuLocators = {
  // Sin content-desc/resource-id propio y SIN garantía de ser el único
  // Button en pantalla: un post institucional con "Seguir", o cualquier post
  // con imagen ("Ver imagen") o video ("Reproducir video"), también renderiza
  // como android.widget.Button y puede aparecer ANTES que el avatar en el
  // árbol — un locator genérico por clase termina tocando ese botón en vez
  // del avatar (confirmado 2026-09-08). La posición del header sí es estable
  // (es fija, no es parte del contenido scrolleable), así que se ancla por
  // @bounds — frágil ante un cambio de resolución/densidad del emulador, pero
  // no hay otra señal disponible.
  btnAvatarHeader: '//android.widget.Button[@bounds="[46,116][161,231]"]',
  // Tab "Inicio" del bottom nav (ese sí es fijo). Se usa para devolver el feed
  // al tope y recuperar el header: ver `abrir()`.
  tabInicio: '~Inicio',
  itemVerPerfil: '~Ver Perfil',
  itemGuardados: '~Guardados',
  itemMisInscripciones: '~Mis inscripciones',
  itemEventos: '~Eventos',
  itemConfiguracion: '~Configuración de usuario',
  itemCerrarSesion: '~Cerrar sesión',
  idiomaEs: '~ES',
  idiomaEn: '~EN',
  idiomaPt: '~PT',
} as const
