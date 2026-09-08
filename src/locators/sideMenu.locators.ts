export const SideMenuLocators = {
  // Único Button en el header del Feed (sin content-desc/resource-id propio).
  // Antes se ubicaba por @bounds hardcodeado, lo cual es frágil ante
  // corrimientos de píxeles (banners, densidad de pantalla, etc.).
  btnAvatarHeader: '//android.widget.Button',
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
