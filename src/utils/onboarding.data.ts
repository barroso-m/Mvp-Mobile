import { buildOnboardingTestEmail } from './gmail-otp.helper'
import type {
  DatosContacto,
  DatosPersonales,
  DatosProfesionales,
} from '../pages/Intramed/OnboardingPage-Intramed'

export const PASSWORD_VALIDA = 'Conexa123!'

function entero(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function sufijoDeLetras(largo = 4): string {
  const letras = 'abcdefghijklmnopqrstuvwxyz'
  return Array.from(
    { length: largo },
    () => letras[entero(0, letras.length - 1)],
  ).join('')
}

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

export const CONTACTO: DatosContacto = {
  pais: 'Argentina',
  provincia: 'Buenos Aires',
  ciudad: '25 de Mayo',
}

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
