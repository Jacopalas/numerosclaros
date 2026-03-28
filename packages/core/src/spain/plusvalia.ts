/**
 * Motor de cálculo de Plusvalía Municipal — España 2025/2026.
 *
 * Impuesto sobre el Incremento de Valor de los Terrenos de Naturaleza Urbana (IIVTNU).
 * Dos métodos: objetivo (valor catastral × coeficientes) y real (ganancia real).
 * El contribuyente elige el más favorable.
 *
 * Fuente: RDL 26/2021 (post STC 182/2021), coeficientes actualizados por LPGE.
 * Coeficientes vigentes: RDL 8/2023, art. 107 TRLHL.
 * Tipo impositivo máximo: 30% (art. 108 TRLHL).
 */

/**
 * Coeficientes por años de tenencia — método objetivo.
 * Fuente: Art. 107.4 TRLHL, actualizado por LPGE 2023/2024.
 * Se aplican al valor catastral del suelo.
 */
export const COEFICIENTES_PLUSVALIA: Record<number, number> = {
  1:  0.14,
  2:  0.13,
  3:  0.15,
  4:  0.17,
  5:  0.17,
  6:  0.16,
  7:  0.12,
  8:  0.10,
  9:  0.09,
  10: 0.08,
  11: 0.08,
  12: 0.08,
  13: 0.08,
  14: 0.10,
  15: 0.12,
  16: 0.16,
  17: 0.20,
  18: 0.26,
  19: 0.36,
  20: 0.45,
};

/** Tipo impositivo máximo municipal: 30% */
export const TIPO_MAX_MUNICIPAL = 0.30;

export interface ResultadoPlusvalia {
  metodoObjetivo: {
    baseImponible: number;
    cuota: number;
    tipoAplicado: number;
  };
  metodoReal: {
    gananciaReal: number;
    proporcionSuelo: number;
    baseImponible: number;
    cuota: number;
    tipoAplicado: number;
  };
  metodoElegido: 'objetivo' | 'real';
  cuotaFinal: number;
  sinPlusvalia: boolean;
}

/**
 * Calcula la plusvalía municipal por ambos métodos.
 *
 * @param valorCatastralSuelo Valor catastral del SUELO (no total)
 * @param aniosTenencia Años de propiedad (se toman completos, max 20)
 * @param tipoMunicipal Tipo impositivo del municipio (0-0.30)
 * @param precioCompra Precio de compra (para método real)
 * @param precioVenta Precio de venta (para método real)
 * @param valorCatastralTotal Valor catastral total (suelo + construcción)
 */
export function calcularPlusvalia(
  valorCatastralSuelo: number,
  aniosTenencia: number,
  tipoMunicipal: number,
  precioCompra: number,
  precioVenta: number,
  valorCatastralTotal?: number
): ResultadoPlusvalia {
  // Limitar años a 1-20
  const anios = Math.max(1, Math.min(20, Math.floor(aniosTenencia)));
  const tipo = Math.min(tipoMunicipal, TIPO_MAX_MUNICIPAL);

  // === MÉTODO OBJETIVO ===
  const coeficiente = COEFICIENTES_PLUSVALIA[anios] || COEFICIENTES_PLUSVALIA[20];
  const baseObjetivo = valorCatastralSuelo * coeficiente;
  const cuotaObjetivo = baseObjetivo * tipo;

  // === MÉTODO REAL ===
  const gananciaReal = precioVenta - precioCompra;

  // Proporción del suelo sobre el valor catastral total
  const vcTotal = valorCatastralTotal || valorCatastralSuelo * 2; // estimación si no se da
  const proporcionSuelo = valorCatastralSuelo / vcTotal;

  // Base imponible real = ganancia × proporción suelo
  const baseReal = gananciaReal > 0 ? gananciaReal * proporcionSuelo : 0;
  const cuotaReal = baseReal * tipo;

  // Sin plusvalía: si no hay ganancia, no se tributa (STC 59/2017)
  const sinPlusvalia = gananciaReal <= 0;

  // Elegir el más favorable (menor cuota)
  let metodoElegido: 'objetivo' | 'real';
  let cuotaFinal: number;

  if (sinPlusvalia) {
    metodoElegido = 'real';
    cuotaFinal = 0;
  } else if (cuotaReal <= cuotaObjetivo) {
    metodoElegido = 'real';
    cuotaFinal = cuotaReal;
  } else {
    metodoElegido = 'objetivo';
    cuotaFinal = cuotaObjetivo;
  }

  return {
    metodoObjetivo: {
      baseImponible: baseObjetivo,
      cuota: cuotaObjetivo,
      tipoAplicado: tipo,
    },
    metodoReal: {
      gananciaReal,
      proporcionSuelo,
      baseImponible: baseReal,
      cuota: cuotaReal,
      tipoAplicado: tipo,
    },
    metodoElegido,
    cuotaFinal,
    sinPlusvalia,
  };
}
