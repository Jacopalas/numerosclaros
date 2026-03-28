/**
 * Motor de cálculo de gastos de compra de vivienda — España 2025/2026.
 *
 * Incluye: ITP/IVA, AJD, notaría, registro, gestoría, tasación.
 * Los tipos de ITP y AJD varían por Comunidad Autónoma.
 *
 * Fuente: Art. 10 RDL 1/1993 (ITP), normativa de cada CCAA.
 * Aranceles notariales: RD 1426/1989.
 * Aranceles registrales: RD 1427/1989.
 */

import { CCAA_DATA, type ComunidadId } from './ccaa.js';

/** IVA vivienda nueva: 10% (general), 4% VPO en algunos casos */
export const IVA_VIVIENDA_NUEVA = 0.10;
export const IVA_VPO = 0.04;

export interface GastosVivienda {
  precioVivienda: number;
  esNueva: boolean;
  ccaa: ComunidadId;

  // Impuestos
  impuestoTransmision: number; // ITP (segunda mano) o IVA (nueva)
  tipoTransmision: number;
  nombreImpuesto: string; // "ITP" o "IVA"
  ajd: number;
  tipoAJD: number;

  // Gastos
  notaria: number;
  registro: number;
  gestoria: number;
  tasacion: number;

  // Hipoteca (gastos extra si hay hipoteca)
  gastoHipoteca: number; // AJD de la hipoteca (desde 2019 lo paga el banco, pero incluimos notaría)
  notariaHipoteca: number;

  // Totales
  totalImpuestos: number;
  totalGastos: number;
  totalCoste: number;
  porcentajeSobrePrecio: number;
}

/**
 * Arancel notarial estimado según precio.
 * Fuente: RD 1426/1989, arancel 1.
 * Escala simplificada.
 */
export function calcularNotaria(precio: number): number {
  if (precio <= 0) return 0;

  // Escala arancelaria simplificada
  let arancel = 0;
  if (precio <= 6010.12) {
    arancel = 90;
  } else if (precio <= 30050.61) {
    arancel = 90 + (precio - 6010.12) * 0.0045;
  } else if (precio <= 60101.21) {
    arancel = 90 + 108.18 + (precio - 30050.61) * 0.0015;
  } else if (precio <= 150253.03) {
    arancel = 90 + 108.18 + 45.08 + (precio - 60101.21) * 0.001;
  } else if (precio <= 601012.10) {
    arancel = 90 + 108.18 + 45.08 + 90.15 + (precio - 150253.03) * 0.0005;
  } else {
    arancel = 90 + 108.18 + 45.08 + 90.15 + 225.38 + (precio - 601012.10) * 0.00025;
  }

  // Mínimo ~600€, típico para escritura de compraventa
  return Math.max(600, Math.round(arancel * 100) / 100);
}

/**
 * Arancel registral estimado según precio.
 * Fuente: RD 1427/1989.
 * Escala simplificada.
 */
export function calcularRegistro(precio: number): number {
  if (precio <= 0) return 0;

  let arancel = 0;
  if (precio <= 6010.12) {
    arancel = 24.04;
  } else if (precio <= 30050.61) {
    arancel = 24.04 + (precio - 6010.12) * 0.00175;
  } else if (precio <= 60101.21) {
    arancel = 24.04 + 42.07 + (precio - 30050.61) * 0.00125;
  } else if (precio <= 150253.03) {
    arancel = 24.04 + 42.07 + 37.56 + (precio - 60101.21) * 0.00075;
  } else if (precio <= 601012.10) {
    arancel = 24.04 + 42.07 + 37.56 + 67.61 + (precio - 150253.03) * 0.0003;
  } else {
    arancel = 24.04 + 42.07 + 37.56 + 67.61 + 135.23;
  }

  return Math.max(300, Math.round(arancel * 100) / 100);
}

/**
 * Calcula todos los gastos de compra de vivienda.
 *
 * @param precio Precio de compraventa
 * @param ccaa Comunidad autónoma
 * @param esNueva true = obra nueva (IVA), false = segunda mano (ITP)
 * @param importeHipoteca Importe de la hipoteca (0 si compra sin hipoteca)
 * @param esVPO true si es Vivienda de Protección Oficial
 */
export function calcularGastosVivienda(
  precio: number,
  ccaa: ComunidadId,
  esNueva = false,
  importeHipoteca = 0,
  esVPO = false
): GastosVivienda {
  const datos = CCAA_DATA[ccaa];

  // Impuesto principal
  let impuestoTransmision: number;
  let tipoTransmision: number;
  let nombreImpuesto: string;
  let ajd: number;
  let tipoAJD: number;

  if (esNueva) {
    // Obra nueva: IVA + AJD
    tipoTransmision = esVPO ? IVA_VPO : IVA_VIVIENDA_NUEVA;
    impuestoTransmision = precio * tipoTransmision;
    nombreImpuesto = 'IVA';
    tipoAJD = datos.ajd;
    ajd = precio * tipoAJD;
  } else {
    // Segunda mano: ITP (no AJD)
    tipoTransmision = datos.itpGeneral;
    impuestoTransmision = precio * tipoTransmision;
    nombreImpuesto = 'ITP';
    tipoAJD = 0;
    ajd = 0;
  }

  // Gastos fijos
  const notaria = calcularNotaria(precio);
  const registro = calcularRegistro(precio);
  const gestoria = 400;
  const tasacion = importeHipoteca > 0 ? 350 : 0;

  // Gastos de hipoteca (desde 2019 el AJD lo paga el banco)
  const notariaHipoteca = importeHipoteca > 0 ? calcularNotaria(importeHipoteca) * 0.5 : 0;
  const gastoHipoteca = notariaHipoteca; // Tasación ya incluida arriba

  // Totales
  const totalImpuestos = impuestoTransmision + ajd;
  const totalGastos = notaria + registro + gestoria + tasacion + gastoHipoteca;
  const totalCoste = totalImpuestos + totalGastos;

  return {
    precioVivienda: precio,
    esNueva,
    ccaa,
    impuestoTransmision,
    tipoTransmision,
    nombreImpuesto,
    ajd,
    tipoAJD,
    notaria,
    registro,
    gestoria,
    tasacion,
    gastoHipoteca,
    notariaHipoteca,
    totalImpuestos,
    totalGastos,
    totalCoste,
    porcentajeSobrePrecio: precio > 0 ? totalCoste / precio : 0,
  };
}
