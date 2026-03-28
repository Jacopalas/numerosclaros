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
 * Coeficientes máximos por años de tenencia — método objetivo.
 * Fuente: RDL 8/2023, art. 107.4 TRLHL (coeficientes para devengos desde 2024).
 * VIGENTES en 2025/2026: los RDL 9/2024 (para 2025) y RDL 16/2025 (para 2026)
 * fueron DEROGADOS por el Congreso, por lo que siguen aplicándose los de 2024.
 * Se aplican al valor catastral del suelo.
 */
export const COEFICIENTES_PLUSVALIA: Record<number, number> = {
  1:  0.15,
  2:  0.14,
  3:  0.14,
  4:  0.14,
  5:  0.18,
  6:  0.19,
  7:  0.20,
  8:  0.19,
  9:  0.15,
  10: 0.12,
  11: 0.10,
  12: 0.09,
  13: 0.09,
  14: 0.09,
  15: 0.09,
  16: 0.10,
  17: 0.13,
  18: 0.17,
  19: 0.23,
  20: 0.40,
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
