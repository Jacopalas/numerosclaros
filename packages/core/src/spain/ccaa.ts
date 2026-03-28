/**
 * Datos fiscales por Comunidad Autónoma — España 2025/2026.
 * Fuentes: BOE, webs oficiales de cada CCAA, AEAT, Ministerio de Hacienda.
 *
 * Incluye: tramos IRPF autonómicos, ITP, Patrimonio, Sucesiones,
 *          base del ahorro, mínimos personales/familiares, SS.
 *
 * IMPORTANTE: España tiene un sistema IRPF dual.
 * - La parte ESTATAL (art. 63 LIRPF) es ~mitad del tipo total.
 * - La parte AUTONÓMICA la fija cada CCAA.
 * - El "tipo total" = estatal + autonómico.
 * - Navarra y País Vasco tienen régimen foral (tramos propios completos).
 */

export type ComunidadId =
  | 'andalucia' | 'aragon' | 'asturias' | 'baleares' | 'canarias'
  | 'cantabria' | 'castilla_mancha' | 'castilla_leon' | 'cataluna'
  | 'extremadura' | 'galicia' | 'madrid' | 'murcia' | 'navarra'
  | 'pais_vasco' | 'rioja' | 'valencia' | 'ceuta' | 'melilla';

export interface Tramo {
  hasta: number;  // Límite superior (Infinity para el último)
  tipo: number;   // Tipo impositivo (decimal, ej: 0.19)
}

export interface DatosCCAA {
  nombre: string;
  irpfTramos: Tramo[];
  itpGeneral: number;        // ITP transmisiones onerosas, tipo general
  itpReducido?: number;      // Tipo reducido (vivienda habitual jóvenes, etc.)
  ajd: number;               // Actos Jurídicos Documentados
  patrimonioMinExento: number;
  patrimonioTramos: Tramo[];
  sucesionesBonificacion: number; // 0-1, bonificación grupo I/II (hijos, cónyuge)
}

// ---------------------------------------------------------------------------
// 1. ESCALA ESTATAL — Base liquidable general (art. 63.1 LIRPF)
// ---------------------------------------------------------------------------
/**
 * Tramos IRPF ESTATALES (parte estatal) — 2025/2026.
 * Fuente: Ley 35/2006, art. 63, vigente para 2025 y 2026.
 *
 * Cuotas acumuladas de referencia:
 *   0 → 0.00 | 12450 → 1,182.75 | 20200 → 2,112.75
 *   35200 → 4,362.75 | 60000 → 8,950.75 | 300000 → 62,950.75
 */
export const IRPF_ESTATAL: Tramo[] = [
  { hasta: 12_450,   tipo: 0.095 },
  { hasta: 20_200,   tipo: 0.12 },
  { hasta: 35_200,   tipo: 0.15 },
  { hasta: 60_000,   tipo: 0.185 },
  { hasta: 300_000,  tipo: 0.225 },
  { hasta: Infinity,  tipo: 0.245 },
];

// ---------------------------------------------------------------------------
// 2. BASE DEL AHORRO (rendimientos del capital / ganancias patrimoniales)
// ---------------------------------------------------------------------------
/**
 * Escala ESTATAL del ahorro — art. 66 LIRPF, modificado por Ley 7/2024.
 * Vigente desde 1-ene-2025. Último tramo sube de 14% a 15%.
 */
export const AHORRO_ESTATAL: Tramo[] = [
  { hasta: 6_000,    tipo: 0.095 },
  { hasta: 50_000,   tipo: 0.105 },
  { hasta: 200_000,  tipo: 0.115 },
  { hasta: 300_000,  tipo: 0.135 },
  { hasta: Infinity,  tipo: 0.15 },
];

/**
 * Escala AUTONÓMICA del ahorro — art. 76 LIRPF, modificado por Ley 7/2024.
 * Vigente desde 1-ene-2025. Último tramo sube de 14% a 15%.
 * Esta escala es la misma para todas las CCAA de régimen común
 * (las CCAA no tienen competencia para modificar la escala del ahorro).
 */
export const AHORRO_AUTONOMICO: Tramo[] = [
  { hasta: 6_000,    tipo: 0.095 },
  { hasta: 50_000,   tipo: 0.105 },
  { hasta: 200_000,  tipo: 0.115 },
  { hasta: 300_000,  tipo: 0.135 },
  { hasta: Infinity,  tipo: 0.15 },
];

/**
 * Escala COMBINADA del ahorro (estatal + autonómica) — conveniencia.
 * Los tipos combinados son: 19%, 21%, 23%, 27%, 30%.
 */
export const AHORRO_TRAMOS: Tramo[] = [
  { hasta: 6_000,    tipo: 0.19 },
  { hasta: 50_000,   tipo: 0.21 },
  { hasta: 200_000,  tipo: 0.23 },
  { hasta: 300_000,  tipo: 0.27 },
  { hasta: Infinity,  tipo: 0.30 },
];

// ---------------------------------------------------------------------------
// 3. MÍNIMO PERSONAL Y FAMILIAR (art. 57-61 LIRPF)
// ---------------------------------------------------------------------------
/**
 * Fuente: Art. 57-61 LIRPF. Vigente 2025/2026.
 * Se aplica tanto a la cuota estatal como a la autonómica.
 */
export const MINIMO_PERSONAL = 5_550;
export const MINIMO_PERSONAL_65 = 1_150;    // Incremento si > 65 años
export const MINIMO_PERSONAL_75 = 1_400;    // Incremento adicional si > 75 años

export const MINIMO_DESCENDIENTE_1 = 2_400;
export const MINIMO_DESCENDIENTE_2 = 2_700;
export const MINIMO_DESCENDIENTE_3 = 4_000;
export const MINIMO_DESCENDIENTE_4 = 4_500; // 4º y siguientes
export const MINIMO_DESCENDIENTE_MENOR_3 = 2_800; // Incremento si < 3 años

export const MINIMO_ASCENDIENTE = 1_150;    // > 65 años o discapacidad >= 33%
export const MINIMO_ASCENDIENTE_75 = 1_400; // Incremento adicional si > 75 años

export const MINIMO_DISCAPACIDAD_33 = 3_000;  // Discapacidad >= 33% y < 65%
export const MINIMO_DISCAPACIDAD_65 = 9_000;  // Discapacidad >= 65%
export const MINIMO_DISCAPACIDAD_ASISTENCIA = 3_000; // Gastos asistencia (movilidad reducida o >= 65%)

// ---------------------------------------------------------------------------
// 4. COTIZACIONES SEGURIDAD SOCIAL — Régimen General (cuenta ajena)
// ---------------------------------------------------------------------------
/**
 * Tipos de cotización 2025 para trabajadores por cuenta ajena.
 * Fuente: Orden PJC/178/2025 (BOE-A-2025-3780).
 */
export const SS_2025 = {
  baseMinimaMensual: 1_381.20,
  baseMaximaMensual: 4_909.50,

  contingenciasComunes: { total: 0.2830, empresa: 0.2360, trabajador: 0.0470 },
  desempleoIndefinido: { total: 0.0705, empresa: 0.0550, trabajador: 0.0155 },
  desempleoTemporal:   { total: 0.0830, empresa: 0.0670, trabajador: 0.0160 },
  formacionProfesional:{ total: 0.0070, empresa: 0.0060, trabajador: 0.0010 },
  fogasa:              { total: 0.0020, empresa: 0.0020, trabajador: 0 },
  mei:                 { total: 0.0080, empresa: 0.0067, trabajador: 0.0013 },

  /** Total trabajador (contrato indefinido): 4.70 + 1.55 + 0.10 + 0.13 = 6.48% */
  totalTrabajadorIndefinido: 0.0648,
  /** Total trabajador (contrato temporal): 4.70 + 1.60 + 0.10 + 0.13 = 6.53% */
  totalTrabajadorTemporal: 0.0653,
} as const;

/**
 * Tipos de cotización 2026 para trabajadores por cuenta ajena.
 * Fuente: Orden de cotización 2026 (Ministerio de Inclusión, SS y Migraciones).
 */
export const SS_2026 = {
  baseMinimaMensual: 1_381.20, // Pendiente de SMI 2026
  baseMaximaMensual: 5_101.20,

  contingenciasComunes: { total: 0.2830, empresa: 0.2360, trabajador: 0.0470 },
  desempleoIndefinido: { total: 0.0705, empresa: 0.0550, trabajador: 0.0155 },
  desempleoTemporal:   { total: 0.0830, empresa: 0.0670, trabajador: 0.0160 },
  formacionProfesional:{ total: 0.0070, empresa: 0.0060, trabajador: 0.0010 },
  fogasa:              { total: 0.0020, empresa: 0.0020, trabajador: 0 },
  mei:                 { total: 0.0090, empresa: 0.0075, trabajador: 0.0015 },

  /** Total trabajador (contrato indefinido): 4.70 + 1.55 + 0.10 + 0.15 = 6.50% */
  totalTrabajadorIndefinido: 0.0650,
  /** Total trabajador (contrato temporal): 4.70 + 1.60 + 0.10 + 0.15 = 6.55% */
  totalTrabajadorTemporal: 0.0655,
} as const;

// ---------------------------------------------------------------------------
// 5. DATOS POR COMUNIDAD AUTÓNOMA (parte autonómica del IRPF)
// ---------------------------------------------------------------------------
/**
 * Los tramos autonómicos son la "otra mitad" del IRPF.
 * Para régimen común, el tipo total = IRPF_ESTATAL + irpfTramos de la CCAA.
 * Para Navarra y País Vasco (forales), irpfTramos contiene el tipo TOTAL.
 *
 * Fuentes: Normativa fiscal de cada CCAA vigente en 2025 (ejercicio fiscal 2025).
 *          Ministerio de Hacienda "Tributación Autonómica 2025" (marzo 2026).
 *          idealista.com, taxdown.es compilaciones cruzadas con BOE.
 */
export const CCAA_DATA: Record<ComunidadId, DatosCCAA> = {
  andalucia: {
    nombre: 'Andalucía',
    irpfTramos: [
      { hasta: 13_000,   tipo: 0.095 },
      { hasta: 21_100,   tipo: 0.12 },
      { hasta: 35_200,   tipo: 0.15 },
      { hasta: 60_000,   tipo: 0.185 },
      { hasta: Infinity,  tipo: 0.225 },
    ],
    itpGeneral: 0.07,
    ajd: 0.012,
    patrimonioMinExento: 700_000,
    patrimonioTramos: [
      { hasta: 167_129,   tipo: 0.002 },
      { hasta: 333_252,   tipo: 0.003 },
      { hasta: 668_500,   tipo: 0.005 },
      { hasta: 1_336_999, tipo: 0.009 },
      { hasta: 2_673_999, tipo: 0.013 },
      { hasta: 5_347_999, tipo: 0.017 },
      { hasta: 10_695_996, tipo: 0.021 },
      { hasta: Infinity,  tipo: 0.025 },
    ],
    sucesionesBonificacion: 0.99,
  },

  aragon: {
    nombre: 'Aragón',
    irpfTramos: [
      { hasta: 13_972.50, tipo: 0.095 },
      { hasta: 21_210,    tipo: 0.12 },
      { hasta: 36_959.90, tipo: 0.15 },
      { hasta: 52_499.90, tipo: 0.185 },
      { hasta: 60_000,    tipo: 0.205 },
      { hasta: 70_000,    tipo: 0.23 },
      { hasta: 90_000,    tipo: 0.24 },
      { hasta: 130_000,   tipo: 0.25 },
      { hasta: Infinity,   tipo: 0.255 },
    ],
    itpGeneral: 0.08,
    ajd: 0.015,
    patrimonioMinExento: 700_000,
    patrimonioTramos: [
      { hasta: 167_129,   tipo: 0.002 },
      { hasta: 333_252,   tipo: 0.003 },
      { hasta: 668_500,   tipo: 0.005 },
      { hasta: 1_336_999, tipo: 0.009 },
      { hasta: 2_673_999, tipo: 0.013 },
      { hasta: 5_347_999, tipo: 0.017 },
      { hasta: 10_695_996, tipo: 0.021 },
      { hasta: Infinity,  tipo: 0.025 },
    ],
    sucesionesBonificacion: 0.65,
  },

  asturias: {
    nombre: 'Asturias',
    irpfTramos: [
      { hasta: 12_450,   tipo: 0.10 },
      { hasta: 17_707,   tipo: 0.12 },
      { hasta: 33_007,   tipo: 0.14 },
      { hasta: 53_407,   tipo: 0.185 },
      { hasta: 70_000,   tipo: 0.215 },
      { hasta: 90_000,   tipo: 0.225 },
      { hasta: 175_000,  tipo: 0.25 },
      { hasta: Infinity,  tipo: 0.255 },
    ],
    itpGeneral: 0.08,
    ajd: 0.012,
    patrimonioMinExento: 700_000,
    patrimonioTramos: [
      { hasta: 167_129,   tipo: 0.002 },
      { hasta: 333_252,   tipo: 0.003 },
      { hasta: 668_500,   tipo: 0.005 },
      { hasta: 1_336_999, tipo: 0.009 },
      { hasta: 2_673_999, tipo: 0.013 },
      { hasta: 5_347_999, tipo: 0.017 },
      { hasta: 10_695_996, tipo: 0.021 },
      { hasta: Infinity,  tipo: 0.035 },
    ],
    sucesionesBonificacion: 0.0,
  },

  baleares: {
    nombre: 'Islas Baleares',
    irpfTramos: [
      { hasta: 10_000,   tipo: 0.09 },
      { hasta: 18_000,   tipo: 0.1125 },
      { hasta: 30_000,   tipo: 0.1425 },
      { hasta: 48_000,   tipo: 0.175 },
      { hasta: 70_000,   tipo: 0.19 },
      { hasta: 90_000,   tipo: 0.2175 },
      { hasta: 120_000,  tipo: 0.2275 },
      { hasta: 175_000,  tipo: 0.2375 },
      { hasta: Infinity,  tipo: 0.2475 },
    ],
    itpGeneral: 0.08,
    ajd: 0.012,
    patrimonioMinExento: 700_000,
    patrimonioTramos: [
      { hasta: 167_129,   tipo: 0.002 },
      { hasta: 333_252,   tipo: 0.003 },
      { hasta: 668_500,   tipo: 0.005 },
      { hasta: 1_336_999, tipo: 0.009 },
      { hasta: 2_673_999, tipo: 0.013 },
      { hasta: 5_347_999, tipo: 0.017 },
      { hasta: 10_695_996, tipo: 0.021 },
      { hasta: Infinity,  tipo: 0.035 },
    ],
    sucesionesBonificacion: 0.0,
  },

  canarias: {
    nombre: 'Canarias',
    irpfTramos: [
      { hasta: 12_450,   tipo: 0.09 },
      { hasta: 17_707,   tipo: 0.115 },
      { hasta: 33_007,   tipo: 0.14 },
      { hasta: 53_407,   tipo: 0.185 },
      { hasta: 90_000,   tipo: 0.235 },
      { hasta: 120_000,  tipo: 0.25 },
      { hasta: Infinity,  tipo: 0.26 },
    ],
    itpGeneral: 0.065,
    ajd: 0.0075,
    patrimonioMinExento: 700_000,
    patrimonioTramos: [
      { hasta: 167_129,   tipo: 0.002 },
      { hasta: 333_252,   tipo: 0.003 },
      { hasta: 668_500,   tipo: 0.005 },
      { hasta: 1_336_999, tipo: 0.009 },
      { hasta: 2_673_999, tipo: 0.013 },
      { hasta: 5_347_999, tipo: 0.017 },
      { hasta: 10_695_996, tipo: 0.021 },
      { hasta: Infinity,  tipo: 0.025 },
    ],
    sucesionesBonificacion: 0.998,
  },

  cantabria: {
    nombre: 'Cantabria',
    irpfTramos: [
      { hasta: 13_000,   tipo: 0.085 },
      { hasta: 21_000,   tipo: 0.11 },
      { hasta: 35_200,   tipo: 0.145 },
      { hasta: 60_000,   tipo: 0.18 },
      { hasta: 90_000,   tipo: 0.225 },
      { hasta: Infinity,  tipo: 0.245 },
    ],
    itpGeneral: 0.10,
    ajd: 0.015,
    patrimonioMinExento: 700_000,
    patrimonioTramos: [
      { hasta: 167_129,   tipo: 0.002 },
      { hasta: 333_252,   tipo: 0.003 },
      { hasta: 668_500,   tipo: 0.005 },
      { hasta: 1_336_999, tipo: 0.009 },
      { hasta: 2_673_999, tipo: 0.013 },
      { hasta: 5_347_999, tipo: 0.017 },
      { hasta: 10_695_996, tipo: 0.021 },
      { hasta: Infinity,  tipo: 0.025 },
    ],
    sucesionesBonificacion: 0.0,
  },

  castilla_mancha: {
    nombre: 'Castilla-La Mancha',
    irpfTramos: [
      { hasta: 12_450,   tipo: 0.095 },
      { hasta: 20_200,   tipo: 0.12 },
      { hasta: 35_200,   tipo: 0.15 },
      { hasta: 60_000,   tipo: 0.185 },
      { hasta: Infinity,  tipo: 0.225 },
    ],
    itpGeneral: 0.09,
    ajd: 0.015,
    patrimonioMinExento: 700_000,
    patrimonioTramos: [
      { hasta: 167_129,   tipo: 0.002 },
      { hasta: 333_252,   tipo: 0.003 },
      { hasta: 668_500,   tipo: 0.005 },
      { hasta: 1_336_999, tipo: 0.009 },
      { hasta: 2_673_999, tipo: 0.013 },
      { hasta: 5_347_999, tipo: 0.017 },
      { hasta: 10_695_996, tipo: 0.021 },
      { hasta: Infinity,  tipo: 0.025 },
    ],
    sucesionesBonificacion: 0.0,
  },

  castilla_leon: {
    nombre: 'Castilla y León',
    irpfTramos: [
      { hasta: 12_450,   tipo: 0.09 },
      { hasta: 20_200,   tipo: 0.12 },
      { hasta: 35_200,   tipo: 0.14 },
      { hasta: 53_407,   tipo: 0.185 },
      { hasta: Infinity,  tipo: 0.215 },
    ],
    itpGeneral: 0.08,
    ajd: 0.015,
    patrimonioMinExento: 700_000,
    patrimonioTramos: [
      { hasta: 167_129,   tipo: 0.002 },
      { hasta: 333_252,   tipo: 0.003 },
      { hasta: 668_500,   tipo: 0.005 },
      { hasta: 1_336_999, tipo: 0.009 },
      { hasta: 2_673_999, tipo: 0.013 },
      { hasta: 5_347_999, tipo: 0.017 },
      { hasta: 10_695_996, tipo: 0.021 },
      { hasta: Infinity,  tipo: 0.025 },
    ],
    sucesionesBonificacion: 0.99,
  },

  cataluna: {
    nombre: 'Cataluña',
    irpfTramos: [
      { hasta: 12_450,   tipo: 0.105 },
      { hasta: 17_707,   tipo: 0.12 },
      { hasta: 21_000,   tipo: 0.14 },
      { hasta: 33_007,   tipo: 0.15 },
      { hasta: 53_407,   tipo: 0.188 },
      { hasta: 90_000,   tipo: 0.215 },
      { hasta: 120_000,  tipo: 0.235 },
      { hasta: 175_000,  tipo: 0.245 },
      { hasta: Infinity,  tipo: 0.255 },
    ],
    itpGeneral: 0.10,
    ajd: 0.015,
    patrimonioMinExento: 500_000,
    patrimonioTramos: [
      { hasta: 167_129,   tipo: 0.002 },
      { hasta: 333_252,   tipo: 0.003 },
      { hasta: 668_500,   tipo: 0.005 },
      { hasta: 1_336_999, tipo: 0.009 },
      { hasta: 2_673_999, tipo: 0.013 },
      { hasta: 5_347_999, tipo: 0.017 },
      { hasta: 10_695_996, tipo: 0.021 },
      { hasta: Infinity,  tipo: 0.025 },
    ],
    sucesionesBonificacion: 0.0,
  },

  extremadura: {
    nombre: 'Extremadura',
    irpfTramos: [
      { hasta: 12_450,   tipo: 0.08 },
      { hasta: 20_200,   tipo: 0.10 },
      { hasta: 24_200,   tipo: 0.16 },
      { hasta: 35_200,   tipo: 0.175 },
      { hasta: 60_000,   tipo: 0.21 },
      { hasta: 80_200,   tipo: 0.235 },
      { hasta: 99_200,   tipo: 0.24 },
      { hasta: 120_200,  tipo: 0.245 },
      { hasta: 300_000,  tipo: 0.25 },
      { hasta: Infinity,  tipo: 0.25 },
    ],
    itpGeneral: 0.08,
    ajd: 0.015,
    patrimonioMinExento: 700_000,
    patrimonioTramos: [
      { hasta: 167_129,   tipo: 0.003 },
      { hasta: 333_252,   tipo: 0.005 },
      { hasta: 668_500,   tipo: 0.008 },
      { hasta: 1_336_999, tipo: 0.011 },
      { hasta: 2_673_999, tipo: 0.015 },
      { hasta: 5_347_999, tipo: 0.020 },
      { hasta: 10_695_996, tipo: 0.025 },
      { hasta: Infinity,  tipo: 0.030 },
    ],
    sucesionesBonificacion: 0.0,
  },

  galicia: {
    nombre: 'Galicia',
    irpfTramos: [
      { hasta: 12_985,   tipo: 0.09 },
      { hasta: 21_068,   tipo: 0.1165 },
      { hasta: 35_200,   tipo: 0.149 },
      { hasta: 47_600,   tipo: 0.184 },
      { hasta: Infinity,  tipo: 0.225 },
    ],
    itpGeneral: 0.08,
    itpReducido: 0.07,
    ajd: 0.015,
    patrimonioMinExento: 700_000,
    patrimonioTramos: [
      { hasta: 167_129,   tipo: 0.002 },
      { hasta: 333_252,   tipo: 0.003 },
      { hasta: 668_500,   tipo: 0.005 },
      { hasta: 1_336_999, tipo: 0.009 },
      { hasta: 2_673_999, tipo: 0.013 },
      { hasta: 5_347_999, tipo: 0.017 },
      { hasta: 10_695_996, tipo: 0.021 },
      { hasta: Infinity,  tipo: 0.025 },
    ],
    sucesionesBonificacion: 0.0,
  },

  madrid: {
    nombre: 'Madrid',
    irpfTramos: [
      { hasta: 13_362,   tipo: 0.085 },
      { hasta: 18_004,   tipo: 0.107 },
      { hasta: 35_425,   tipo: 0.128 },
      { hasta: 57_320,   tipo: 0.174 },
      { hasta: Infinity,  tipo: 0.205 },
    ],
    itpGeneral: 0.06,
    ajd: 0.007,
    patrimonioMinExento: 700_000,
    patrimonioTramos: [
      // Madrid tiene bonificación del 100% en Patrimonio
      { hasta: Infinity, tipo: 0.0 },
    ],
    sucesionesBonificacion: 0.99,
  },

  murcia: {
    nombre: 'Murcia',
    irpfTramos: [
      { hasta: 12_450,   tipo: 0.095 },
      { hasta: 20_200,   tipo: 0.112 },
      { hasta: 34_000,   tipo: 0.133 },
      { hasta: 60_000,   tipo: 0.179 },
      { hasta: Infinity,  tipo: 0.225 },
    ],
    itpGeneral: 0.08,
    ajd: 0.015,
    patrimonioMinExento: 700_000,
    patrimonioTramos: [
      { hasta: 167_129,   tipo: 0.002 },
      { hasta: 333_252,   tipo: 0.003 },
      { hasta: 668_500,   tipo: 0.005 },
      { hasta: 1_336_999, tipo: 0.009 },
      { hasta: 2_673_999, tipo: 0.013 },
      { hasta: 5_347_999, tipo: 0.017 },
      { hasta: 10_695_996, tipo: 0.021 },
      { hasta: Infinity,  tipo: 0.025 },
    ],
    sucesionesBonificacion: 0.99,
  },

  navarra: {
    nombre: 'Navarra',
    // Navarra tiene régimen foral — tramos propios completos (no split estatal/autonómico).
    // Fuente: Ley Foral del IRPF de Navarra.
    irpfTramos: [
      { hasta: 4_458,    tipo: 0.13 },
      { hasta: 10_030,   tipo: 0.22 },
      { hasta: 21_175,   tipo: 0.25 },
      { hasta: 35_663,   tipo: 0.28 },
      { hasta: 51_266,   tipo: 0.365 },
      { hasta: 66_869,   tipo: 0.415 },
      { hasta: 89_159,   tipo: 0.44 },
      { hasta: 139_310,  tipo: 0.47 },
      { hasta: 195_034,  tipo: 0.49 },
      { hasta: 334_344,  tipo: 0.505 },
      { hasta: Infinity,  tipo: 0.54 },
    ],
    itpGeneral: 0.06,
    ajd: 0.005,
    patrimonioMinExento: 800_000,
    patrimonioTramos: [
      { hasta: 167_129,   tipo: 0.0016 },
      { hasta: 333_252,   tipo: 0.0024 },
      { hasta: 668_500,   tipo: 0.0040 },
      { hasta: 1_336_999, tipo: 0.0072 },
      { hasta: 2_673_999, tipo: 0.0104 },
      { hasta: Infinity,  tipo: 0.0200 },
    ],
    sucesionesBonificacion: 0.0,
  },

  pais_vasco: {
    nombre: 'País Vasco',
    // País Vasco tiene régimen foral — tramos propios completos.
    // Fuente: Norma Foral IRPF (Bizkaia/Gipuzkoa/Araba varían ligeramente;
    //         aquí se usa la escala general más común).
    irpfTramos: [
      { hasta: 17_720,   tipo: 0.23 },
      { hasta: 35_440,   tipo: 0.28 },
      { hasta: 53_160,   tipo: 0.35 },
      { hasta: 75_910,   tipo: 0.40 },
      { hasta: 105_130,  tipo: 0.45 },
      { hasta: 140_130,  tipo: 0.46 },
      { hasta: 204_270,  tipo: 0.47 },
      { hasta: Infinity,  tipo: 0.47 },
    ],
    itpGeneral: 0.07,
    ajd: 0.005,
    patrimonioMinExento: 800_000,
    patrimonioTramos: [
      { hasta: 200_000,   tipo: 0.002 },
      { hasta: 400_000,   tipo: 0.003 },
      { hasta: 800_000,   tipo: 0.005 },
      { hasta: 1_600_000, tipo: 0.009 },
      { hasta: Infinity,  tipo: 0.013 },
    ],
    sucesionesBonificacion: 0.0,
  },

  rioja: {
    nombre: 'La Rioja',
    irpfTramos: [
      { hasta: 12_450,   tipo: 0.08 },
      { hasta: 20_200,   tipo: 0.106 },
      { hasta: 35_200,   tipo: 0.136 },
      { hasta: 40_000,   tipo: 0.178 },
      { hasta: 50_000,   tipo: 0.183 },
      { hasta: 60_000,   tipo: 0.19 },
      { hasta: 120_000,  tipo: 0.245 },
      { hasta: Infinity,  tipo: 0.27 },
    ],
    itpGeneral: 0.07,
    ajd: 0.01,
    patrimonioMinExento: 700_000,
    patrimonioTramos: [
      // La Rioja: bonificación 100%
      { hasta: Infinity, tipo: 0.0 },
    ],
    sucesionesBonificacion: 0.99,
  },

  valencia: {
    nombre: 'Comunidad Valenciana',
    irpfTramos: [
      { hasta: 12_000,   tipo: 0.09 },
      { hasta: 22_000,   tipo: 0.12 },
      { hasta: 32_000,   tipo: 0.15 },
      { hasta: 42_000,   tipo: 0.175 },
      { hasta: 52_000,   tipo: 0.20 },
      { hasta: 65_000,   tipo: 0.225 },
      { hasta: 72_000,   tipo: 0.25 },
      { hasta: 100_000,  tipo: 0.265 },
      { hasta: 150_000,  tipo: 0.275 },
      { hasta: 200_000,  tipo: 0.285 },
      { hasta: Infinity,  tipo: 0.295 },
    ],
    itpGeneral: 0.10,
    ajd: 0.015,
    patrimonioMinExento: 500_000,
    patrimonioTramos: [
      { hasta: 167_129,   tipo: 0.0025 },
      { hasta: 333_252,   tipo: 0.0037 },
      { hasta: 668_500,   tipo: 0.0068 },
      { hasta: 1_336_999, tipo: 0.0118 },
      { hasta: 2_673_999, tipo: 0.0164 },
      { hasta: 5_347_999, tipo: 0.0217 },
      { hasta: 10_695_996, tipo: 0.0269 },
      { hasta: Infinity,  tipo: 0.035 },
    ],
    sucesionesBonificacion: 0.50,
  },

  ceuta: {
    nombre: 'Ceuta',
    // Ceuta no tiene escala autonómica propia; aplica escala complementaria
    // (= misma que estatal). Además, deducción del 60% de cuota íntegra
    // por rentas obtenidas en Ceuta (art. 68.4 LIRPF).
    irpfTramos: [
      { hasta: 12_450,   tipo: 0.095 },
      { hasta: 20_200,   tipo: 0.12 },
      { hasta: 35_200,   tipo: 0.15 },
      { hasta: 60_000,   tipo: 0.185 },
      { hasta: 300_000,  tipo: 0.225 },
      { hasta: Infinity,  tipo: 0.245 },
    ],
    itpGeneral: 0.06,
    ajd: 0.005,
    patrimonioMinExento: 700_000,
    patrimonioTramos: [
      { hasta: 167_129,   tipo: 0.002 },
      { hasta: 333_252,   tipo: 0.003 },
      { hasta: 668_500,   tipo: 0.005 },
      { hasta: 1_336_999, tipo: 0.009 },
      { hasta: 2_673_999, tipo: 0.013 },
      { hasta: 5_347_999, tipo: 0.017 },
      { hasta: 10_695_996, tipo: 0.021 },
      { hasta: Infinity,  tipo: 0.025 },
    ],
    sucesionesBonificacion: 0.50,
  },

  melilla: {
    nombre: 'Melilla',
    // Melilla: misma situación que Ceuta — escala complementaria + deducción 60%.
    irpfTramos: [
      { hasta: 12_450,   tipo: 0.095 },
      { hasta: 20_200,   tipo: 0.12 },
      { hasta: 35_200,   tipo: 0.15 },
      { hasta: 60_000,   tipo: 0.185 },
      { hasta: 300_000,  tipo: 0.225 },
      { hasta: Infinity,  tipo: 0.245 },
    ],
    itpGeneral: 0.06,
    ajd: 0.005,
    patrimonioMinExento: 700_000,
    patrimonioTramos: [
      { hasta: 167_129,   tipo: 0.002 },
      { hasta: 333_252,   tipo: 0.003 },
      { hasta: 668_500,   tipo: 0.005 },
      { hasta: 1_336_999, tipo: 0.009 },
      { hasta: 2_673_999, tipo: 0.013 },
      { hasta: 5_347_999, tipo: 0.017 },
      { hasta: 10_695_996, tipo: 0.021 },
      { hasta: Infinity,  tipo: 0.025 },
    ],
    sucesionesBonificacion: 0.50,
  },
};

/** Deducción Ceuta/Melilla: 60% de cuota íntegra por rentas obtenidas allí */
export const CEUTA_MELILLA_DEDUCCION = 0.60;

/** Lista de CCAA para dropdowns, ordenada alfabéticamente */
export const CCAA_LIST: [ComunidadId, string][] = Object.entries(CCAA_DATA)
  .map(([id, d]) => [id as ComunidadId, d.nombre] as [ComunidadId, string])
  .sort((a, b) => a[1].localeCompare(b[1], 'es'));

/** CCAA con régimen foral (IRPF propio, no split estatal/autonómico) */
export const CCAA_FORALES: ComunidadId[] = ['navarra', 'pais_vasco'];

/**
 * Calcula impuesto progresivo según tramos.
 * Usado para IRPF, Patrimonio, Sucesiones, etc.
 */
export function calcularProgresivo(base: number, tramos: Tramo[]): number {
  let impuesto = 0;
  let restante = base;
  let prevHasta = 0;

  for (const tramo of tramos) {
    const anchura = tramo.hasta === Infinity
      ? restante
      : tramo.hasta - prevHasta;
    const enTramo = Math.min(restante, anchura);
    impuesto += enTramo * tramo.tipo;
    restante -= enTramo;
    prevHasta = tramo.hasta === Infinity ? prevHasta : tramo.hasta;
    if (restante <= 0) break;
  }

  return impuesto;
}

/**
 * Obtiene el tipo marginal para una base imponible dada.
 */
export function tipoMarginal(base: number, tramos: Tramo[]): number {
  for (const tramo of tramos) {
    if (base <= tramo.hasta) return tramo.tipo;
  }
  return tramos[tramos.length - 1].tipo;
}
