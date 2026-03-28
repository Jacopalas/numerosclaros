/**
 * Motor de cálculo para Autónomos y SL — España 2025/2026.
 *
 * Cuota autónomos: sistema por tramos de rendimientos netos.
 * Fuente: RDL 13/2022, disposición transitoria 1ª (tabla 2025).
 * SL: IS 25% + dividendos base ahorro.
 */

import { calcularIRPF, calcularIRPFAhorro } from './irpf.js';
import { type ComunidadId } from './ccaa.js';

/**
 * Tramos de cuota de autónomos 2025 (transición al sistema definitivo).
 * Rendimiento neto MENSUAL → cuota mínima mensual.
 * Fuente: Tabla 2025, RDL 13/2022 (tabla reducida simplificada).
 *
 * Nota: para 2026 se espera la tabla definitiva, pero aún no publicada.
 * Usamos 2025 como base.
 */
export interface TramoAutonomo {
  rendimientoMin: number;   // Rendimiento neto mensual desde
  rendimientoMax: number;   // Rendimiento neto mensual hasta
  cuotaMinima: number;      // Cuota mínima mensual
  baseCotizacion: number;   // Base de cotización mínima
}

export const TRAMOS_AUTONOMOS_2025: TramoAutonomo[] = [
  // Tabla reducida (rendimientos <= IPREM)
  { rendimientoMin: 0,       rendimientoMax: 670,     cuotaMinima: 200,    baseCotizacion: 653.59 },
  { rendimientoMin: 670,     rendimientoMax: 900,     cuotaMinima: 220,    baseCotizacion: 718.95 },
  { rendimientoMin: 900,     rendimientoMax: 1166.70, cuotaMinima: 260,    baseCotizacion: 849.67 },
  // Tabla general
  { rendimientoMin: 1166.70, rendimientoMax: 1300,    cuotaMinima: 291,    baseCotizacion: 950.98 },
  { rendimientoMin: 1300,    rendimientoMax: 1500,    cuotaMinima: 294,    baseCotizacion: 960.78 },
  { rendimientoMin: 1500,    rendimientoMax: 1700,    cuotaMinima: 294,    baseCotizacion: 960.78 },
  { rendimientoMin: 1700,    rendimientoMax: 1850,    cuotaMinima: 350,    baseCotizacion: 1143.79 },
  { rendimientoMin: 1850,    rendimientoMax: 2030,    cuotaMinima: 370,    baseCotizacion: 1209.15 },
  { rendimientoMin: 2030,    rendimientoMax: 2330,    cuotaMinima: 390,    baseCotizacion: 1274.51 },
  { rendimientoMin: 2330,    rendimientoMax: 2760,    cuotaMinima: 415,    baseCotizacion: 1356.21 },
  { rendimientoMin: 2760,    rendimientoMax: 3190,    cuotaMinima: 440,    baseCotizacion: 1437.91 },
  { rendimientoMin: 3190,    rendimientoMax: 3620,    cuotaMinima: 465,    baseCotizacion: 1519.61 },
  { rendimientoMin: 3620,    rendimientoMax: 4050,    cuotaMinima: 491,    baseCotizacion: 1601.31 },
  { rendimientoMin: 4050,    rendimientoMax: 6000,    cuotaMinima: 531,    baseCotizacion: 1732.03 },
  { rendimientoMin: 6000,    rendimientoMax: Infinity, cuotaMinima: 591,   baseCotizacion: 1928.10 },
];

/** Tipo total de cotización RETA: 31.40% (2025). Incluye CC, CP, cese, FP, MEI */
export const TIPO_TOTAL_RETA = 0.314;
/** Cuota SS administrador societario (base mín 1.000€ × 31.40%) — 2025 */
export const CUOTA_ADMIN_SOCIETARIO = 314;
/** Tipo IS general */
export const TIPO_IS_GENERAL = 0.25;
/** Tipo IS reducido nuevas empresas (primeros 2 años, primeros 50k) */
export const TIPO_IS_REDUCIDO = 0.15;

export interface ResultadoCuotaAutonomo {
  rendimientoNetoMensual: number;
  cuotaMensual: number;
  cuotaAnual: number;
  baseCotizacion: number;
  tramo: string;
}

/**
 * Calcula la cuota de autónomos por tramos de rendimiento neto.
 * @param rendimientoNetoAnual Rendimiento neto anual (ingresos - gastos deducibles)
 */
export function calcularCuotaAutonomo(rendimientoNetoAnual: number): ResultadoCuotaAutonomo {
  const mensual = rendimientoNetoAnual / 12;

  let tramo = TRAMOS_AUTONOMOS_2025[0];
  for (const t of TRAMOS_AUTONOMOS_2025) {
    if (mensual >= t.rendimientoMin && mensual < t.rendimientoMax) {
      tramo = t;
      break;
    }
    tramo = t; // último tramo si excede todos
  }

  return {
    rendimientoNetoMensual: mensual,
    cuotaMensual: tramo.cuotaMinima,
    cuotaAnual: tramo.cuotaMinima * 12,
    baseCotizacion: tramo.baseCotizacion,
    tramo: `${tramo.rendimientoMin}€ - ${tramo.rendimientoMax === Infinity ? '∞' : tramo.rendimientoMax + '€'}`,
  };
}

export interface ComparacionAutonomoSL {
  autonomo: {
    ingresosBrutos: number;
    gastos: number;
    rendimientoNeto: number;
    cuotaRETAAnual: number;
    baseIRPF: number;
    irpf: number;
    netoFinal: number;
    tipoEfectivo: number;
  };
  sl: {
    ingresosBrutos: number;
    gastos: number;
    salarioAdmin: number;
    baseIS: number;
    impuestoSociedades: number;
    beneficioNeto: number;
    dividendos: number;
    impuestoDividendos: number;
    cuotaSSAdmin: number;
    irpfSalario: number;
    netoFinal: number;
    tipoEfectivo: number;
  };
  diferencia: number;
  recomendacion: 'autonomo' | 'sl';
}

/**
 * Compara autónomo persona física vs SL.
 * @param ingresosBrutos Facturación bruta anual
 * @param gastosDeducibles Gastos deducibles anuales
 * @param ccaa Comunidad autónoma para IRPF
 * @param salarioAdmin Salario del administrador en la SL (default: 24.000€)
 */
export function compararAutonomoVsSL(
  ingresosBrutos: number,
  gastosDeducibles: number,
  ccaa: ComunidadId,
  salarioAdmin = 24000
): ComparacionAutonomoSL {
  // === AUTÓNOMO ===
  const rendimientoNeto = ingresosBrutos - gastosDeducibles;
  const cuotaAutonomo = calcularCuotaAutonomo(rendimientoNeto);
  const baseIRPFAutonomo = rendimientoNeto - cuotaAutonomo.cuotaAnual;
  const irpfAutonomo = calcularIRPF(Math.max(0, baseIRPFAutonomo), ccaa);
  const netoAutonomo = rendimientoNeto - cuotaAutonomo.cuotaAnual - irpfAutonomo.cuotaTotal;

  // === SL ===
  // Gastos SL: gastos operativos + salario admin + SS admin
  const ssAdminAnual = CUOTA_ADMIN_SOCIETARIO * 12;
  const gastosSL = gastosDeducibles + salarioAdmin + ssAdminAnual;
  const baseIS = Math.max(0, ingresosBrutos - gastosSL);
  const impuestoSociedades = baseIS * TIPO_IS_GENERAL;
  const beneficioNeto = baseIS - impuestoSociedades;

  // Dividendos: el admin se reparte todo el beneficio
  const dividendos = beneficioNeto;
  const irpfDividendos = calcularIRPFAhorro(dividendos);

  // IRPF del salario del administrador
  const irpfSalario = calcularIRPF(Math.max(0, salarioAdmin - ssAdminAnual), ccaa);

  const netoSL =
    salarioAdmin -
    ssAdminAnual -
    irpfSalario.cuotaTotal +
    dividendos -
    irpfDividendos.cuota;

  const diferencia = netoSL - netoAutonomo;

  return {
    autonomo: {
      ingresosBrutos,
      gastos: gastosDeducibles,
      rendimientoNeto,
      cuotaRETAAnual: cuotaAutonomo.cuotaAnual,
      baseIRPF: Math.max(0, baseIRPFAutonomo),
      irpf: irpfAutonomo.cuotaTotal,
      netoFinal: netoAutonomo,
      tipoEfectivo: ingresosBrutos > 0
        ? (ingresosBrutos - gastosDeducibles - netoAutonomo) / (ingresosBrutos - gastosDeducibles)
        : 0,
    },
    sl: {
      ingresosBrutos,
      gastos: gastosDeducibles,
      salarioAdmin,
      baseIS,
      impuestoSociedades,
      beneficioNeto,
      dividendos,
      impuestoDividendos: irpfDividendos.cuota,
      cuotaSSAdmin: ssAdminAnual,
      irpfSalario: irpfSalario.cuotaTotal,
      netoFinal: netoSL,
      tipoEfectivo: ingresosBrutos > 0
        ? (ingresosBrutos - gastosDeducibles - netoSL) / (ingresosBrutos - gastosDeducibles)
        : 0,
    },
    diferencia,
    recomendacion: netoSL > netoAutonomo ? 'sl' : 'autonomo',
  };
}
