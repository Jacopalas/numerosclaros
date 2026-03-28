/**
 * Motor de cálculo de pensiones — Seguridad Social España 2025/2026.
 *
 * Sistema dual (reforma 2023): la SS calcula con dos fórmulas y aplica la más favorable.
 * Fórmula A: últimos 25 años de cotización / 350.
 * Fórmula B: últimos 29 años, descartando los 2 peores / 350 (transición hasta 2044).
 *
 * Fuente: Ley 21/2021 de reforma de pensiones, RDL 2/2023.
 * Art. 209 LGSS (base reguladora), art. 210 (porcentaje por años).
 */

/** Base de cotización máxima 2025 — Fuente: Orden PJC/51/2025 */
export const BASE_COTIZACION_MAX_2025 = 4909.50;
/** Base de cotización mínima grupo 7 — 2025 */
export const BASE_COTIZACION_MIN_2025 = 1184.40;
/** Pensión máxima mensual 2025 (14 pagas) — Fuente: RDL de revalorización */
export const PENSION_MAX_2025 = 3267.60;
/** Pensión mínima jubilación >65, con cónyuge a cargo, 2025 */
export const PENSION_MIN_CONYUGE_2025 = 1033.20;
/** Pensión mínima jubilación >65, sin cónyuge, 2025 */
export const PENSION_MIN_SIN_CONYUGE_2025 = 835.80;

export interface ResultadoPension {
  baseReguladora: number;
  baseReguladoraFormulaA: number;
  baseReguladoraFormulaB: number;
  porcentajePorAnios: number;
  pensionMensual: number;
  pensionAnual: number;
  tasaSustitucion: number; // % sobre último sueldo
  formulaAplicada: 'A' | 'B';
  coeficienteEdad: number;
  detalleAnios: {
    aniosCotizados: number;
    mesesAdicionales: number;
    porcentajeBase: number;
  };
}

/**
 * Calcula el porcentaje de la base reguladora según años cotizados.
 * Art. 210 LGSS:
 * - 15 años: 50%
 * - Cada mes adicional entre 15 y 25 años: +0.19% (120 meses × 0.19 = 22.8%)
 * - Cada mes adicional entre 25 y 36.5 años: +0.18% (138 meses × 0.18 = 24.84%)
 * - Transición 2013-2027, en 2025: 36 años y 6 meses para el 100%.
 *
 * Para 2025: 36 años y 6 meses = 100%.
 */
export function porcentajePorAniosCotizados(anios: number): {
  porcentaje: number;
  mesesAdicionales: number;
} {
  if (anios < 15) return { porcentaje: 0, mesesAdicionales: 0 };

  const mesesTotales = Math.round(anios * 12);
  const mesesBase = 15 * 12; // 180 meses = 50%
  const mesesAdicionales = mesesTotales - mesesBase;

  if (mesesAdicionales <= 0) return { porcentaje: 0.50, mesesAdicionales: 0 };

  // Primeros 49 meses adicionales: +0.21% por mes (2025 transición)
  // Siguientes 209 meses: +0.19% por mes
  // Esto da 100% a los 36.5 años (2025)
  let porcentaje = 0.50;
  const primerBloque = Math.min(mesesAdicionales, 49);
  porcentaje += primerBloque * 0.0021;

  if (mesesAdicionales > 49) {
    const segundoBloque = Math.min(mesesAdicionales - 49, 209);
    porcentaje += segundoBloque * 0.0019;
  }

  return {
    porcentaje: Math.min(1.0, porcentaje),
    mesesAdicionales,
  };
}

/**
 * Coeficiente reductor por jubilación anticipada.
 * Art. 208 LGSS. Penalización por cada trimestre de anticipación.
 *
 * Si cotizado >= 38.5 años: -1.625% por trimestre
 * Si cotizado < 38.5 años: -1.875% por trimestre
 * Máximo 24 meses de anticipación (jubilación voluntaria).
 */
export function coeficienteEdad(
  edadJubilacion: number,
  edadLegal: number,
  aniosCotizados: number
): number {
  if (edadJubilacion >= edadLegal) {
    // Jubilación demorada: +4% por año adicional (art. 210.2 LGSS)
    const aniosExtra = edadJubilacion - edadLegal;
    return 1 + aniosExtra * 0.04;
  }

  const mesesAnticipacion = (edadLegal - edadJubilacion) * 12;
  const trimestres = Math.ceil(mesesAnticipacion / 3);

  const penalizacionTrimestre = aniosCotizados >= 38.5 ? 0.01625 : 0.01875;
  return Math.max(0.5, 1 - trimestres * penalizacionTrimestre);
}

/**
 * Edad legal de jubilación 2025.
 * Art. 205.1.a LGSS: 67 años (o 65 si se han cotizado 38 años y 3 meses).
 */
export function edadLegalJubilacion(aniosCotizados: number): number {
  return aniosCotizados >= 38.25 ? 65 : 67;
}

/**
 * Calcula la pensión de jubilación estimada.
 *
 * @param baseCotizacionMedia Base de cotización media mensual de los últimos años
 * @param aniosCotizados Total de años cotizados
 * @param edadJubilacion Edad a la que se quiere jubilar
 * @param ultimoSueldoBruto Último sueldo bruto mensual (para tasa de sustitución)
 */
export function calcularPension(
  baseCotizacionMedia: number,
  aniosCotizados: number,
  edadJubilacion: number,
  ultimoSueldoBruto?: number
): ResultadoPension {
  // Limitar base a la máxima
  const baseReal = Math.min(baseCotizacionMedia, BASE_COTIZACION_MAX_2025);

  // Fórmula A: últimos 25 años (300 meses) / 350
  const baseRegA = (baseReal * 300) / 350;

  // Fórmula B: últimos 29 años (348 meses), descartando los 24 peores / 350
  // Simplificación: asumimos cotización estable, así que descartar 24 peores ≈ quitar los más bajos
  // En la práctica con cotización estable, B ≈ (baseReal * 324) / 350
  const baseRegB = (baseReal * 324) / 350;

  // Se aplica la más favorable
  const formulaAplicada = baseRegA >= baseRegB ? 'A' : 'B';
  const baseReguladora = Math.max(baseRegA, baseRegB);

  // Porcentaje por años cotizados
  const { porcentaje } = porcentajePorAniosCotizados(aniosCotizados);

  // Coeficiente por edad
  const edadLegal = edadLegalJubilacion(aniosCotizados);
  const coefEdad = coeficienteEdad(edadJubilacion, edadLegal, aniosCotizados);

  // Pensión bruta mensual
  let pensionMensual = baseReguladora * porcentaje * coefEdad;

  // Aplicar topes
  pensionMensual = Math.min(pensionMensual, PENSION_MAX_2025);
  pensionMensual = Math.max(pensionMensual, aniosCotizados >= 15 ? PENSION_MIN_SIN_CONYUGE_2025 : 0);

  const pensionAnual = pensionMensual * 14; // 14 pagas

  return {
    baseReguladora,
    baseReguladoraFormulaA: baseRegA,
    baseReguladoraFormulaB: baseRegB,
    porcentajePorAnios: porcentaje,
    pensionMensual,
    pensionAnual,
    tasaSustitucion: ultimoSueldoBruto ? pensionMensual / ultimoSueldoBruto : 0,
    formulaAplicada,
    coeficienteEdad: coefEdad,
    detalleAnios: {
      aniosCotizados,
      mesesAdicionales: porcentajePorAniosCotizados(aniosCotizados).mesesAdicionales,
      porcentajeBase: porcentaje,
    },
  };
}
