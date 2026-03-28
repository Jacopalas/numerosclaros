import { describe, it, expect } from 'vitest';
import { calcBuyVsRent } from '../src/decisions/buy-vs-rent.js';
import { calcFixedVsVariable } from '../src/decisions/fixed-vs-variable.js';
import { calcPayoffVsInvest } from '../src/decisions/payoff-vs-invest.js';
import { calcSnowballVsAvalanche } from '../src/decisions/snowball-vs-avalanche.js';
import { calcPensionVsFund } from '../src/decisions/pension-vs-fund.js';

// ─── BUY VS RENT ─────────────────────────────────────────────────────────────

describe('calcBuyVsRent', () => {
  const baseInput = {
    precioVivienda: 250000,
    alquilerMensual: 900,
    ahorroDisponible: 50000,
    anosHorizonte: 25,
    revalorizacionAnual: 0.02,
    euribor: 0.035,
    diferencialHipoteca: 0.01,
    anosHipoteca: 30,
    gastosCompra: 0.10,
    ibi: 0.005,
    mantenimientoAnual: 0.01,
    seguroHogar: 600,
    comunidad: 100,
    incrementoAlquilerAnual: 0.03,
    rentabilidadInversion: 0.06,
  };

  it('computes monthly mortgage payment with French amortization formula', () => {
    const result = calcBuyVsRent(baseInput);
    // importeHipoteca = 250000 - 50000 = 200000
    // r = 0.045/12 = 0.00375, n = 360
    // PMT = 200000 * (0.00375 * 1.00375^360) / (1.00375^360 - 1)
    const r = 0.045 / 12;
    const n = 360;
    const expectedPMT = 200000 * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    expect(result.cuotaMensualHipoteca).toBeCloseTo(expectedPMT, 2);
    expect(result.cuotaMensualHipoteca).toBeCloseTo(1013.37, 0);
  });

  it('calculates initial costs correctly', () => {
    const result = calcBuyVsRent(baseInput);
    expect(result.entrada).toBe(50000);
    expect(result.gastosIniciales).toBe(25000); // 10% of 250000
    expect(result.importeHipoteca).toBe(200000);
  });

  it('returns annual data with property appreciation over time', () => {
    const result = calcBuyVsRent(baseInput);
    // After 1 year property worth 250000 * 1.02 = 255000
    expect(result.datosAnuales[0].patrimonioCompra).toBeGreaterThan(0);
    // Property value at year 10 = 250000 * 1.02^10
    const expectedValue10 = 250000 * Math.pow(1.02, 10);
    // patrimonioCompra = valorVivienda - capitalPendiente, so just check it's growing
    expect(result.datosAnuales[9].patrimonioCompra).toBeGreaterThan(
      result.datosAnuales[0].patrimonioCompra,
    );
  });

  it('buy wins at long horizons with reasonable parameters', () => {
    const result = calcBuyVsRent({
      ...baseInput,
      anosHorizonte: 25,
      alquilerMensual: 1000,
      rentabilidadInversion: 0.04, // low investment return favors buying
    });
    // With a long horizon and low investment returns, buying should win
    expect(result.veredicto.opcion).toBe('COMPRAR');
  });

  it('rent wins at short horizons due to high upfront costs', () => {
    const result = calcBuyVsRent({
      ...baseInput,
      anosHorizonte: 3,
      alquilerMensual: 700,
      rentabilidadInversion: 0.08,
    });
    // 3 years is too short to recover entrada + gastos
    expect(result.veredicto.opcion).toBe('ALQUILAR');
  });

  it('returns crossing point when buying eventually wins', () => {
    const result = calcBuyVsRent(baseInput);
    if (result.puntoCruce !== null) {
      expect(result.puntoCruce).toBeGreaterThan(0);
      expect(result.puntoCruce).toBeLessThanOrEqual(30);
    }
    // Summaries should include the horizon year
    expect(result.resumenes.length).toBeGreaterThan(0);
  });
});

// ─── FIXED VS VARIABLE ──────────────────────────────────────────────────────

describe('calcFixedVsVariable', () => {
  const baseInput = {
    importeHipoteca: 200000,
    anosHipoteca: 25,
    tipoFijo: 0.03,
    euriborActual: 0.035,
    diferencialVariable: 0.008,
  };

  it('computes fixed monthly payment with standard PMT formula', () => {
    const result = calcFixedVsVariable(baseInput);
    const r = 0.03 / 12;
    const n = 300;
    const expectedPMT = 200000 * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    expect(result.cuotaFija).toBeCloseTo(expectedPMT, 2);
    expect(result.cuotaFija).toBeCloseTo(948.42, 0);
  });

  it('total fixed cost equals monthly payment times number of months', () => {
    const result = calcFixedVsVariable(baseInput);
    expect(result.costeTotalFijo).toBeCloseTo(result.cuotaFija * 300, 2);
  });

  it('generates three Euribor scenarios: sube, estable, baja', () => {
    const result = calcFixedVsVariable(baseInput);
    expect(result.resultadosVariable).toHaveLength(3);
    const nombres = result.resultadosVariable.map(r => r.nombre);
    expect(nombres).toContain('Euríbor sube');
    expect(nombres).toContain('Euríbor estable');
    expect(nombres).toContain('Euríbor baja');
  });

  it('Euribor-baja scenario costs less than stable, which costs less than sube', () => {
    const result = calcFixedVsVariable(baseInput);
    const sube = result.resultadosVariable.find(r => r.nombre === 'Euríbor sube')!;
    const estable = result.resultadosVariable.find(r => r.nombre === 'Euríbor estable')!;
    const baja = result.resultadosVariable.find(r => r.nombre === 'Euríbor baja')!;
    expect(sube.costeTotal).toBeGreaterThan(estable.costeTotal);
    expect(estable.costeTotal).toBeGreaterThan(baja.costeTotal);
  });

  it('recommends FIJO when initial variable rate is higher than fixed', () => {
    // euribor 3.5% + differential 0.8% = 4.3% vs fixed 3%
    const result = calcFixedVsVariable(baseInput);
    expect(result.veredicto.opcion).toBe('FIJO');
  });
});

// ─── PAYOFF VS INVEST ────────────────────────────────────────────────────────

describe('calcPayoffVsInvest', () => {
  const baseInput = {
    deudaPendiente: 100000,
    tipoInteres: 0.025,
    anosRestantes: 20,
    cantidadExtra: 10000,
    rentabilidadEsperada: 0.07,
    deduccionFiscal: false,
    tipoMarginalIRPF: 0.30,
  };

  it('computes current monthly payment correctly', () => {
    const result = calcPayoffVsInvest(baseInput);
    const r = 0.025 / 12;
    const n = 240;
    const expectedPMT = 100000 * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    expect(result.cuotaActual).toBeCloseTo(expectedPMT, 2);
    expect(result.cuotaActual).toBeCloseTo(529.52, 0);
  });

  it('prepaying reduces interest paid and shortens term', () => {
    const result = calcPayoffVsInvest(baseInput);
    expect(result.amortizacion.ahorroIntereses).toBeGreaterThan(0);
    expect(result.amortizacion.mesesAhorrados).toBeGreaterThan(0);
    expect(result.amortizacion.nuevoPlazo).toBeLessThan(240);
  });

  it('investment value follows compound interest formula', () => {
    const result = calcPayoffVsInvest(baseInput);
    // valorFinal = 10000 * (1.07)^20
    const expectedValue = 10000 * Math.pow(1.07, 20);
    expect(result.inversion.valorFinal).toBeCloseTo(expectedValue, 0);
    expect(result.inversion.valorFinal).toBeCloseTo(38696.84, 0);
  });

  it('investment taxes use Spanish progressive brackets (19-28%)', () => {
    const result = calcPayoffVsInvest(baseInput);
    // Gain = 38696.84 - 10000 = 28696.84
    // First 6000 at 19% = 1140, remaining 22696.84 at 21% = 4766.34
    const gain = 10000 * Math.pow(1.07, 20) - 10000;
    const expectedTax = 6000 * 0.19 + (gain - 6000) * 0.21;
    expect(result.inversion.impuestos).toBeCloseTo(expectedTax, 0);
  });

  it('break-even return rate is between debt rate and expected return', () => {
    const result = calcPayoffVsInvest(baseInput);
    // The equilibrium rate should be above the mortgage rate (since taxes erode gains)
    expect(result.rentabilidadEquilibrio).toBeGreaterThan(baseInput.tipoInteres);
    expect(result.rentabilidadEquilibrio).toBeLessThan(0.30);
  });

  it('with high expected return, verdict is INVERTIR', () => {
    const result = calcPayoffVsInvest({
      ...baseInput,
      rentabilidadEsperada: 0.10,
    });
    expect(result.veredicto.opcion).toBe('INVERTIR');
  });

  it('fiscal deduction adds annual savings when enabled', () => {
    const result = calcPayoffVsInvest({
      ...baseInput,
      deduccionFiscal: true,
    });
    // Ahorro fiscal = min(10000, 9040) * 0.15 = 1356/year * 20 years = 27120
    const expectedFiscal = Math.min(10000, 9040) * 0.15 * 20;
    expect(result.amortizacion.ahorroFiscal).toBeCloseTo(expectedFiscal, 0);
  });
});

// ─── SNOWBALL VS AVALANCHE ───────────────────────────────────────────────────

describe('calcSnowballVsAvalanche', () => {
  const threeDebts = {
    deudas: [
      { nombre: 'Tarjeta', saldo: 3000, tipoInteres: 0.20, cuotaMinima: 100 },
      { nombre: 'Coche', saldo: 8000, tipoInteres: 0.06, cuotaMinima: 250 },
      { nombre: 'Personal', saldo: 5000, tipoInteres: 0.10, cuotaMinima: 150 },
    ],
    pagoExtraMensual: 200,
  };

  it('snowball orders debts by smallest balance first', () => {
    const result = calcSnowballVsAvalanche(threeDebts);
    // Smallest balance: Tarjeta(3000), then Personal(5000), then Coche(8000)
    expect(result.snowball.ordenPago[0]).toBe('Tarjeta');
    expect(result.snowball.ordenPago[1]).toBe('Personal');
    expect(result.snowball.ordenPago[2]).toBe('Coche');
  });

  it('avalanche orders debts by highest rate first', () => {
    const result = calcSnowballVsAvalanche(threeDebts);
    // Highest rate: Tarjeta(20%), then Personal(10%), then Coche(6%)
    expect(result.avalanche.ordenPago[0]).toBe('Tarjeta');
    expect(result.avalanche.ordenPago[1]).toBe('Personal');
    expect(result.avalanche.ordenPago[2]).toBe('Coche');
  });

  it('avalanche pays equal or less total interest than snowball', () => {
    const result = calcSnowballVsAvalanche(threeDebts);
    expect(result.avalanche.totalIntereses).toBeLessThanOrEqual(
      result.snowball.totalIntereses + 0.01,
    );
  });

  it('both strategies eventually pay off all debts', () => {
    const result = calcSnowballVsAvalanche(threeDebts);
    expect(result.snowball.mesesTotal).toBeGreaterThan(0);
    expect(result.avalanche.mesesTotal).toBeGreaterThan(0);
    expect(result.snowball.mesesTotal).toBeLessThan(600);
    expect(result.avalanche.mesesTotal).toBeLessThan(600);
  });

  it('snowball liquidates first debt faster when smallest balance differs from highest rate', () => {
    const differentOrder = {
      deudas: [
        { nombre: 'Pequena', saldo: 1000, tipoInteres: 0.05, cuotaMinima: 50 },
        { nombre: 'Grande', saldo: 20000, tipoInteres: 0.18, cuotaMinima: 400 },
        { nombre: 'Mediana', saldo: 5000, tipoInteres: 0.10, cuotaMinima: 100 },
      ],
      pagoExtraMensual: 300,
    };
    const result = calcSnowballVsAvalanche(differentOrder);
    // Snowball targets Pequena first (1000), avalanche targets Grande first (18%)
    expect(result.snowball.ordenPago[0]).toBe('Pequena');
    expect(result.avalanche.ordenPago[0]).toBe('Grande');
    // Snowball liquidates first debt sooner
    expect(result.snowball.primeraDeudaLiquidada).toBeLessThanOrEqual(
      result.avalanche.primeraDeudaLiquidada,
    );
  });

  it('handles empty debts array', () => {
    const result = calcSnowballVsAvalanche({ deudas: [], pagoExtraMensual: 100 });
    expect(result.veredicto.opcion).toBe('N/A');
  });
});

// ─── PENSION VS FUND ─────────────────────────────────────────────────────────

describe('calcPensionVsFund', () => {
  const baseInput = {
    aportacionAnual: 5000,
    anosHastaJubilacion: 20,
    tipoMarginalActual: 0.30,
    tipoMarginalJubilacion: 0.19,
    rentabilidadAnual: 0.07,
    maxAportacionPension: 1500,
  };

  it('caps pension contribution at legal maximum', () => {
    const result = calcPensionVsFund(baseInput);
    expect(result.pension.aportacionEfectiva).toBe(1500);
    expect(result.fondo.aportacionEfectiva).toBe(5000);
  });

  it('pension tax deduction equals contribution times marginal rate', () => {
    const result = calcPensionVsFund(baseInput);
    // Annual deduction = 1500 * 0.30 = 450/year
    expect(result.pension.ahorroFiscalAnual).toBeCloseTo(450, 2);
    // Total = 450 * 20 = 9000
    expect(result.pension.ahorroFiscalTotal).toBeCloseTo(9000, 0);
  });

  it('fund compound growth uses future value of annuity formula', () => {
    const result = calcPensionVsFund(baseInput);
    // FV = 5000 * ((1.07^20 - 1) / 0.07) * 1.07
    const expectedFV = 5000 * ((Math.pow(1.07, 20) - 1) / 0.07) * 1.07;
    expect(result.fondo.valorBruto).toBeCloseTo(expectedFV, 0);
    expect(result.fondo.valorBruto).toBeCloseTo(219325.88, -1);
  });

  it('pension gross value uses same annuity formula on capped amount', () => {
    const result = calcPensionVsFund(baseInput);
    const expectedFV = 1500 * ((Math.pow(1.07, 20) - 1) / 0.07) * 1.07;
    expect(result.pension.valorBruto).toBeCloseTo(expectedFV, 0);
  });

  it('fund taxes follow Spanish progressive savings brackets', () => {
    const result = calcPensionVsFund(baseInput);
    // totalAportado = 5000 * 20 = 100000
    // ganancia = valorBruto - 100000
    const ganancia = result.fondo.valorBruto - 100000;
    // First 6000 at 19%, next 44000 at 21%, rest at 23%
    const expectedTax = 6000 * 0.19 + 44000 * 0.21 + (ganancia - 50000) * 0.23;
    expect(result.fondo.impuestoVenta).toBeCloseTo(expectedTax, 0);
  });

  it('pension rescue tax equals gross value times retirement marginal rate', () => {
    const result = calcPensionVsFund(baseInput);
    const expectedTax = result.pension.valorBruto * 0.19;
    expect(result.pension.impuestoRescate).toBeCloseTo(expectedTax, 0);
  });

  it('recommends pension when marginal rate drops significantly in retirement', () => {
    const result = calcPensionVsFund(baseInput);
    // 30% now vs 19% in retirement = clear advantage
    expect(result.veredicto.opcion).toBe('PLAN DE PENSIONES');
  });

  it('recommends fund when marginal rate stays same or increases in retirement', () => {
    const result = calcPensionVsFund({
      ...baseInput,
      tipoMarginalActual: 0.24,
      tipoMarginalJubilacion: 0.24,
    });
    expect(result.veredicto.opcion).toBe('FONDO INDEXADO');
  });

  it('creates mixed strategy when contribution exceeds pension max', () => {
    const result = calcPensionVsFund(baseInput);
    expect(result.mixto).not.toBeNull();
    // Excess: 5000 - 1500 = 3500 goes to fund
    expect(result.mixto!.valorBruto).toBeGreaterThan(result.pension.valorBruto);
  });
});
