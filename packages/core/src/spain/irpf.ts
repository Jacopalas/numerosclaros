/**
 * Motor de cálculo IRPF — España 2025/2026.
 *
 * Sistema dual: parte estatal + parte autonómica.
 * Para régimen foral (Navarra, País Vasco) se usan tramos propios.
 *
 * Fuente: Ley 35/2006 del IRPF, art. 63-66.
 * Tramos estatales: art. 63.1 (actualizados PGE 2023).
 * Tramos ahorro: art. 66, modificado Ley 31/2022.
 */

import {
  IRPF_ESTATAL,
  AHORRO_TRAMOS,
  CCAA_DATA,
  CCAA_FORALES,
  MINIMO_PERSONAL,
  calcularProgresivo,
  tipoMarginal,
  type ComunidadId,
  type Tramo,
} from './ccaa.js';

export interface ResultadoIRPF {
  baseImponible: number;
  cuotaEstatal: number;
  cuotaAutonomica: number;
  cuotaTotal: number;
  tipoEfectivo: number;
  tipoMarginal: number;
  tramosDetalle: TramoDetalle[];
}

export interface TramoDetalle {
  desde: number;
  hasta: number;
  tipoEstatal: number;
  tipoAutonomico: number;
  tipoTotal: number;
  cuota: number;
}

/**
 * Calcula IRPF para rentas del trabajo.
 * @param baseImponible Base imponible general (después de reducciones)
 * @param ccaa Comunidad autónoma
 * @param minimoPersonal Mínimo personal y familiar (default: 5.550€)
 */
export function calcularIRPF(
  baseImponible: number,
  ccaa: ComunidadId,
  minimoPersonal = MINIMO_PERSONAL
): ResultadoIRPF {
  if (baseImponible <= 0) {
    return {
      baseImponible: 0,
      cuotaEstatal: 0,
      cuotaAutonomica: 0,
      cuotaTotal: 0,
      tipoEfectivo: 0,
      tipoMarginal: 0,
      tramosDetalle: [],
    };
  }

  const datosCCAA = CCAA_DATA[ccaa];
  const esForal = CCAA_FORALES.includes(ccaa);
  const tramosAutonomicos = datosCCAA.irpfTramos;

  // Base liquidable = base imponible - mínimo personal
  const baseLiquidable = Math.max(0, baseImponible - minimoPersonal);

  let cuotaEstatal: number;
  let cuotaAutonomica: number;
  let marginalEst: number;
  let marginalAut: number;

  if (esForal) {
    // Régimen foral: solo tramos propios, no hay split
    cuotaEstatal = 0;
    cuotaAutonomica = calcularProgresivo(baseLiquidable, tramosAutonomicos);
    marginalEst = 0;
    marginalAut = tipoMarginal(baseLiquidable, tramosAutonomicos);
  } else {
    // Régimen común: estatal + autonómico
    cuotaEstatal = calcularProgresivo(baseLiquidable, IRPF_ESTATAL);
    cuotaAutonomica = calcularProgresivo(baseLiquidable, tramosAutonomicos);

    // Restar cuota del mínimo personal
    const minEstatal = calcularProgresivo(minimoPersonal, IRPF_ESTATAL);
    const minAutonomico = calcularProgresivo(minimoPersonal, tramosAutonomicos);
    cuotaEstatal = Math.max(0, cuotaEstatal - minEstatal);
    // Recalcular: la cuota es sobre base imponible, no liquidable, para mínimo
    cuotaEstatal = calcularProgresivo(baseLiquidable, IRPF_ESTATAL);
    cuotaAutonomica = calcularProgresivo(baseLiquidable, tramosAutonomicos);

    marginalEst = tipoMarginal(baseLiquidable, IRPF_ESTATAL);
    marginalAut = tipoMarginal(baseLiquidable, tramosAutonomicos);
  }

  const cuotaTotal = cuotaEstatal + cuotaAutonomica;
  const tipoEfectivo = baseImponible > 0 ? cuotaTotal / baseImponible : 0;

  // Generar detalle de tramos combinados
  const tramosDetalle = generarDetalleTramos(
    baseLiquidable,
    esForal ? [] : IRPF_ESTATAL,
    tramosAutonomicos,
    esForal
  );

  return {
    baseImponible,
    cuotaEstatal,
    cuotaAutonomica,
    cuotaTotal,
    tipoEfectivo,
    tipoMarginal: esForal ? marginalAut : marginalEst + marginalAut,
    tramosDetalle,
  };
}

/**
 * Calcula IRPF sobre rentas del ahorro (dividendos, ganancias patrimoniales).
 * Fuente: art. 66 LIRPF.
 */
export function calcularIRPFAhorro(baseAhorro: number): {
  cuota: number;
  tipoEfectivo: number;
  tipoMarginal: number;
} {
  if (baseAhorro <= 0) return { cuota: 0, tipoEfectivo: 0, tipoMarginal: 0 };
  const cuota = calcularProgresivo(baseAhorro, AHORRO_TRAMOS);
  return {
    cuota,
    tipoEfectivo: cuota / baseAhorro,
    tipoMarginal: tipoMarginal(baseAhorro, AHORRO_TRAMOS),
  };
}

/**
 * Tabla de retención IRPF simplificada para nóminas.
 * Dado un salario bruto anual, estima la retención.
 */
export function estimarRetencion(
  brutoAnual: number,
  ccaa: ComunidadId,
  situacionFamiliar: 'soltero' | 'casado_1_perceptor' | 'casado_2_perceptores' = 'soltero',
  numHijos = 0
): number {
  let minimo = MINIMO_PERSONAL;
  if (situacionFamiliar === 'casado_1_perceptor') minimo += 3400;
  if (numHijos >= 1) minimo += 2400;
  if (numHijos >= 2) minimo += 2700;
  if (numHijos >= 3) minimo += 4000;
  if (numHijos >= 4) minimo += 4500;

  // Reducción por rendimientos del trabajo (art. 20 LIRPF)
  let reduccion = 0;
  if (brutoAnual <= 14852) reduccion = 6498;
  else if (brutoAnual <= 17673.52) reduccion = 6498 - 1.14 * (brutoAnual - 14852);
  else reduccion = 2000;

  // Gastos deducibles SS (estimación 6.47%)
  const ss = brutoAnual * 0.0647;

  const baseImponible = Math.max(0, brutoAnual - ss - reduccion);
  const resultado = calcularIRPF(baseImponible, ccaa, minimo);
  return resultado.cuotaTotal;
}

function generarDetalleTramos(
  base: number,
  tramosEst: Tramo[],
  tramosAut: Tramo[],
  esForal: boolean
): TramoDetalle[] {
  if (esForal) {
    // Solo tramos autonómicos
    const detalle: TramoDetalle[] = [];
    let prevHasta = 0;
    let restante = base;
    for (const t of tramosAut) {
      if (restante <= 0) break;
      const anchura = t.hasta === Infinity ? restante : t.hasta - prevHasta;
      const enTramo = Math.min(restante, anchura);
      detalle.push({
        desde: prevHasta,
        hasta: prevHasta + enTramo,
        tipoEstatal: 0,
        tipoAutonomico: t.tipo,
        tipoTotal: t.tipo,
        cuota: enTramo * t.tipo,
      });
      restante -= enTramo;
      prevHasta = t.hasta === Infinity ? prevHasta + enTramo : t.hasta;
    }
    return detalle;
  }

  // Combinar puntos de corte de ambas escalas
  const cortes = new Set<number>();
  cortes.add(0);
  let prev = 0;
  for (const t of tramosEst) {
    if (t.hasta !== Infinity && t.hasta <= base) cortes.add(t.hasta);
  }
  for (const t of tramosAut) {
    if (t.hasta !== Infinity && t.hasta <= base) cortes.add(t.hasta);
  }
  cortes.add(base);

  const sortedCortes = [...cortes].sort((a, b) => a - b);
  const detalle: TramoDetalle[] = [];

  for (let i = 0; i < sortedCortes.length - 1; i++) {
    const desde = sortedCortes[i];
    const hasta = sortedCortes[i + 1];
    const mid = (desde + hasta) / 2;
    const tipoE = tipoMarginal(mid, tramosEst);
    const tipoA = tipoMarginal(mid, tramosAut);
    detalle.push({
      desde,
      hasta,
      tipoEstatal: tipoE,
      tipoAutonomico: tipoA,
      tipoTotal: tipoE + tipoA,
      cuota: (hasta - desde) * (tipoE + tipoA),
    });
  }

  return detalle;
}
