import { buildOnboardingTestEmail } from './gmail-otp.helper'
import type {
  DatosContacto,
  DatosPersonales,
  DatosProfesionales,
} from '../pages/Intramed/OnboardingPage-Intramed'

/** Contraseña que cumple los 5 requisitos que lista el paso 2 del wizard. */
export const PASSWORD_VALIDA = 'Conexa123!'

function entero(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Sufijo de solo letras para el apellido. La app rechaza cualquier dígito con
 * "El apellido solo puede contener letras, espacios, puntos y apóstrofes" y
 * deja "Siguiente" deshabilitado sin más señal que ese texto.
 */
function sufijoDeLetras(largo = 4): string {
  const letras = 'abcdefghijklmnopqrstuvwxyz'
  return Array.from(
    { length: largo },
    () => letras[entero(0, letras.length - 1)],
  ).join('')
}

/**
 * Datos de alta para el paso 1. El email es único por corrida
 * (plus-addressing) para no chocar con la validación de "email ya registrado".
 *
 * No se usa faker a propósito: el repo mobile no lo tiene como dependencia y
 * los únicos campos libres son nombre y apellido, que la app valida como solo
 * letras.
 */
export function buildDatosPersonales(
  overrides: Partial<DatosPersonales> = {},
): DatosPersonales {
  return {
    trato: 'Dr.',
    nombre: 'Automation',
    apellido: `Mobile${sufijoDeLetras()}`,
    email: buildOnboardingTestEmail('onb'),
    fechaNacimiento: '15-05-1990',
    tipoDocumento: 'DNI',
    nroDocumento: String(entero(20000000, 45000000)),
    ...overrides,
  }
}

/**
 * Datos del paso "Información de contacto".
 *
 * La lista de ciudades es alfabética y sin buscador, así que cuanto más arriba
 * esté la opción menos scroll hay que hacer dentro del bottom sheet:
 * "25 de Mayo" es la primera de Buenos Aires (mismo criterio que la suite web).
 */
export const CONTACTO: DatosContacto = {
  pais: 'Argentina',
  provincia: 'Buenos Aires',
  ciudad: '25 de Mayo',
}

/**
 * Datos del paso "Formación profesional".
 *
 * "No encuentro mi subespecialidad" es una opción real del selector y evita
 * depender de qué subespecialidades cuelgan de cada especialidad.
 * El tipo de identidad NO puede ser "-": ese es el placeholder y deja
 * "Continuar" deshabilitado sin mostrar ningún error.
 */
export function buildDatosProfesionales(
  overrides: Partial<DatosProfesionales> = {},
): DatosProfesionales {
  return {
    ocupacion: 'Profesional de salud',
    carrera: 'Medicina',
    especialidad: 'Cardiología',
    subespecialidad: 'No encuentro mi subespecialidad',
    tipoIdentidad: 'Matrícula Nacional',
    nroMatricula: String(entero(100000, 999999)),
    ...overrides,
  }
}
