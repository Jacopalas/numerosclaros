// Motor de decisión: Amortizar anticipadamente vs Invertir
// Compara el ahorro de amortizar con la ganancia de invertir

export function calcPayoffVsInvest({
  deudaPendiente,
  tipoInteres,
  anosRestantes,
  cantidadExtra,
  rentabilidadEsperada = 0.07,
  deduccionFiscal = false,
  tipoMarginalIRPF = 0.30,
  maxDeduccion = 9040,
}) {
  const n = anosRestantes * 12;
  const r = tipoInteres / 12;

  // Cuota actual
  const cuotaActual = calcCuota(deudaPendiente, r, n);
  const costeTotalSinAmortizar = cuotaActual * n;
  const interesesTotalSinAmortizar = costeTotalSinAmortizar - deudaPendiente;

  // --- OPCIÓN A: Amortizar anticipadamente ---
  // Amortizar reduce capital → menos intereses. Simular reducción de plazo.
  const amortResult = simularAmortizacion(deudaPendiente, r, n, cantidadExtra, cuotaActual);

  // Ahorro fiscal por amortización (si aplica, pre-2013)
  let ahorroFiscalAmort = 0;
  if (deduccionFiscal) {
    const aportacionAnual = Math.min(cantidadExtra, maxDeduccion);
    ahorroFiscalAmort = aportacionAnual * 0.15; // 15% deducción vivienda habitual
  }

  // --- OPCIÓN B: Invertir ---
  const investResult = simularInversion(cantidadExtra, rentabilidadEsperada, anosRestantes);

  // Fiscalidad de la inversión al rescatar (19-23% sobre ganancias)
  const gananciaInversion = investResult.valorFinal - cantidadExtra;
  const impuestoInversion = calcImpuestoAhorro(gananciaInversion);
  const valorNetoInversion = investResult.valorFinal - impuestoInversion;

  // Comparación
  const beneficioAmortizar = amortResult.ahorroIntereses + (ahorroFiscalAmort * anosRestantes);
  const beneficioInvertir = valorNetoInversion - cantidadExtra;

  // Punto de equilibrio: ¿a partir de qué rentabilidad invertir gana?
  let rentabilidadEquilibrio = buscarEquilibrio(deudaPendiente, r, n, cantidadExtra, cuotaActual, anosRestantes);

  // Datos anuales para gráfico
  const datosAnuales = [];
  const rInv = Math.pow(1 + rentabilidadEsperada, 1 / 12) - 1;
  let acumuladoInversion = 0;
  for (let ano = 1; ano <= anosRestantes; ano++) {
    acumuladoInversion = cantidadExtra * Math.pow(1 + rentabilidadEsperada, ano);
    const ganancias = acumuladoInversion - cantidadExtra;
    const impuesto = calcImpuestoAhorro(ganancias);
    datosAnuales.push({
      ano,
      beneficioAmortizar: amortResult.ahorroInteresesAnual[ano - 1] || amortResult.ahorroIntereses,
      beneficioInvertir: acumuladoInversion - impuesto - cantidadExtra,
      valorInversion: acumuladoInversion - impuesto,
    });
  }

  // Veredicto
  let opcion, texto;
  if (beneficioInvertir > beneficioAmortizar) {
    const diff = beneficioInvertir - beneficioAmortizar;
    opcion = 'INVERTIR';
    texto = `Matemáticamente, invertir te genera ${formatEur(diff)} más que amortizar. Pero recuerda: amortizar es rentabilidad segura al ${(tipoInteres * 100).toFixed(2)}%, invertir tiene riesgo.`;
  } else {
    const diff = beneficioAmortizar - beneficioInvertir;
    opcion = 'AMORTIZAR';
    texto = `Amortizar te ahorra ${formatEur(diff)} más que invertir al ${(rentabilidadEsperada * 100).toFixed(1)}% esperado. Además, es riesgo cero: reduces deuda garantizadamente.`;
  }

  return {
    cuotaActual,
    amortizacion: {
      ahorroIntereses: amortResult.ahorroIntereses,
      mesesAhorrados: amortResult.mesesAhorrados,
      nuevoPlazo: amortResult.nuevosPlazoMeses,
      ahorroFiscal: ahorroFiscalAmort * anosRestantes,
    },
    inversion: {
      valorFinal: investResult.valorFinal,
      impuestos: impuestoInversion,
      valorNeto: valorNetoInversion,
      gananciaReal: beneficioInvertir,
    },
    rentabilidadEquilibrio,
    datosAnuales,
    veredicto: { opcion, texto },
    explicacion: [
      `Deuda: ${formatEur(deudaPendiente)} al ${(tipoInteres * 100).toFixed(2)}%, quedan ${anosRestantes} años. Cuota: ${formatEur(cuotaActual)}/mes.`,
      `Amortizar ${formatEur(cantidadExtra)} te ahorra ${formatEur(amortResult.ahorroIntereses)} en intereses y ${amortResult.mesesAhorrados} meses de hipoteca.`,
      `Invertir ${formatEur(cantidadExtra)} al ${(rentabilidadEsperada * 100).toFixed(1)}% anual genera ${formatEur(investResult.valorFinal)} brutos en ${anosRestantes} años.`,
      `Tras impuestos sobre ganancias (19-23%), te quedan ${formatEur(valorNetoInversion)} netos. Ganancia real: ${formatEur(beneficioInvertir)}.`,
      `Punto de equilibrio: necesitas una rentabilidad > ${(rentabilidadEquilibrio * 100).toFixed(2)}% anual para que invertir supere a amortizar.`,
      deduccionFiscal ? `Con deducción por vivienda habitual (pre-2013), amortizar tiene un ahorro fiscal extra de ${formatEur(ahorroFiscalAmort)}/año.` : `No aplica deducción fiscal por vivienda habitual.`,
    ],
  };
}

function calcCuota(capital, rMensual, n) {
  if (rMensual === 0) return capital / n;
  return capital * (rMensual * Math.pow(1 + rMensual, n)) / (Math.pow(1 + rMensual, n) - 1);
}

function simularAmortizacion(deuda, rMensual, totalMeses, cantidadExtra, cuotaActual) {
  // Tras amortizar, el capital se reduce
  const nuevaDeuda = deuda - cantidadExtra;
  if (nuevaDeuda <= 0) {
    return {
      ahorroIntereses: (cuotaActual * totalMeses) - deuda,
      mesesAhorrados: totalMeses,
      nuevosPlazoMeses: 0,
      ahorroInteresesAnual: [],
    };
  }

  // Mantenemos cuota → se reduce plazo
  let capital = nuevaDeuda;
  let meses = 0;
  let interesesTotal = 0;
  const ahorroAnual = [];
  let interesesAnuales = 0;

  while (capital > 0 && meses < totalMeses) {
    const interes = capital * rMensual;
    const amortizacion = cuotaActual - interes;
    if (amortizacion <= 0) break;
    capital = Math.max(0, capital - amortizacion);
    interesesTotal += interes;
    interesesAnuales += interes;
    meses++;

    if (meses % 12 === 0) {
      ahorroAnual.push(interesesAnuales);
      interesesAnuales = 0;
    }
  }

  // Intereses sin amortizar
  let capitalOrig = deuda;
  let interesesOrig = 0;
  for (let i = 0; i < totalMeses; i++) {
    const interes = capitalOrig * rMensual;
    const amort = cuotaActual - interes;
    capitalOrig = Math.max(0, capitalOrig - amort);
    interesesOrig += interes;
  }

  // Acumular ahorro anual
  const ahorroInteresesAnual = [];
  let acum = 0;
  for (let i = 0; i < ahorroAnual.length; i++) {
    acum = interesesOrig * ((i + 1) / (totalMeses / 12)) - ahorroAnual.slice(0, i + 1).reduce((a, b) => a + b, 0);
    ahorroInteresesAnual.push(Math.max(0, interesesOrig - interesesTotal) * ((i + 1) / Math.ceil(meses / 12)));
  }

  return {
    ahorroIntereses: interesesOrig - interesesTotal,
    mesesAhorrados: totalMeses - meses,
    nuevosPlazoMeses: meses,
    ahorroInteresesAnual,
  };
}

function simularInversion(cantidad, rentabilidadAnual, anos) {
  const valorFinal = cantidad * Math.pow(1 + rentabilidadAnual, anos);
  return { valorFinal };
}

function calcImpuestoAhorro(ganancia) {
  if (ganancia <= 0) return 0;
  let impuesto = 0;
  const tramos = [
    { hasta: 6000, tipo: 0.19 },
    { hasta: 50000, tipo: 0.21 },
    { hasta: 200000, tipo: 0.23 },
    { hasta: 300000, tipo: 0.27 },
    { hasta: Infinity, tipo: 0.28 },
  ];
  let restante = ganancia;
  let acum = 0;
  for (const tramo of tramos) {
    const base = Math.min(restante, tramo.hasta - acum);
    impuesto += base * tramo.tipo;
    restante -= base;
    acum += base;
    if (restante <= 0) break;
  }
  return impuesto;
}

function buscarEquilibrio(deuda, rMensual, totalMeses, cantidadExtra, cuotaActual, anos) {
  const amort = simularAmortizacion(deuda, rMensual, totalMeses, cantidadExtra, cuotaActual);
  const objetivo = amort.ahorroIntereses + cantidadExtra;

  // Búsqueda binaria
  let lo = 0, hi = 0.30;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    const valorFinal = cantidadExtra * Math.pow(1 + mid, anos);
    const ganancia = valorFinal - cantidadExtra;
    const impuesto = calcImpuestoAhorro(ganancia);
    const neto = valorFinal - impuesto;
    if (neto < objetivo) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function formatEur(n) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}
