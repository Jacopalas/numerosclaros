// Motor de decisión: Plan de Pensiones vs Fondo Indexado
// Comparativa fiscal española completa

export function calcPensionVsFund({
  aportacionAnual,
  anosHastaJubilacion,
  tipoMarginalActual,
  tipoMarginalJubilacion,
  rentabilidadAnual = 0.07,
  maxAportacionPension = 1500,
}) {
  // Plan de Pensiones: desgrava ahora, tributa al rescate como renta del trabajo
  const pension = simularPension({
    aportacionAnual: Math.min(aportacionAnual, maxAportacionPension),
    anos: anosHastaJubilacion,
    tipoMarginalActual,
    tipoMarginalJubilacion,
    rentabilidad: rentabilidadAnual,
  });

  // Fondo Indexado: no desgrava, tributa como ahorro (19-28%), traspasos sin tributar
  const fondo = simularFondo({
    aportacionAnual,
    anos: anosHastaJubilacion,
    rentabilidad: rentabilidadAnual,
  });

  // Si la aportación supera el máximo de pensiones, el exceso va a fondo
  const exceso = Math.max(0, aportacionAnual - maxAportacionPension);
  let mixto = null;
  if (exceso > 0) {
    const fondoExceso = simularFondo({
      aportacionAnual: exceso,
      anos: anosHastaJubilacion,
      rentabilidad: rentabilidadAnual,
    });
    mixto = {
      valorBruto: pension.valorBruto + fondoExceso.valorBruto,
      impuestos: pension.impuestoRescate + fondoExceso.impuestoVenta,
      valorNeto: pension.valorNeto + fondoExceso.valorNeto,
      ahorroFiscalTotal: pension.ahorroFiscalTotal,
    };
  }

  // Datos anuales para gráfico
  const datosAnuales = [];
  for (let ano = 1; ano <= anosHastaJubilacion; ano++) {
    const valorPension = calcValorAcumulado(Math.min(aportacionAnual, maxAportacionPension), rentabilidadAnual, ano);
    const valorFondo = calcValorAcumulado(aportacionAnual, rentabilidadAnual, ano);
    const ahorroPension = Math.min(aportacionAnual, maxAportacionPension) * tipoMarginalActual * ano;

    datosAnuales.push({
      ano,
      valorPension,
      valorFondo,
      ahorroFiscalPension: ahorroPension,
    });
  }

  // Veredicto
  const ventajaPension = pension.valorNeto + pension.ahorroFiscalReinvertido - fondo.valorNeto;
  let opcion, texto;

  if (tipoMarginalActual > tipoMarginalJubilacion + 0.05) {
    // Clara ventaja fiscal
    opcion = 'PLAN DE PENSIONES';
    texto = `Tu tipo marginal baja del ${pct(tipoMarginalActual)} al ${pct(tipoMarginalJubilacion)} en jubilación. `;
    texto += `El plan de pensiones te ahorra ${formatEur(pension.ahorroFiscalTotal)} en impuestos durante la fase de ahorro. `;
    texto += `Neto, el plan te deja ${formatEur(pension.valorNeto)} vs ${formatEur(fondo.valorNeto)} del fondo. `;
    if (aportacionAnual > maxAportacionPension) {
      texto += `Aporta ${formatEur(maxAportacionPension)}/año al plan (máximo legal) y el resto (${formatEur(exceso)}/año) a un fondo indexado.`;
    }
  } else if (tipoMarginalActual <= tipoMarginalJubilacion) {
    opcion = 'FONDO INDEXADO';
    texto = `Tu tipo marginal no baja en jubilación (${pct(tipoMarginalActual)} → ${pct(tipoMarginalJubilacion)}). `;
    texto += `El plan de pensiones desgrava ahora pero tributas igual o más al rescatar. `;
    texto += `El fondo indexado tributa como ahorro (19-28%) en vez de como renta del trabajo. `;
    texto += `Neto, el fondo te deja ${formatEur(fondo.valorNeto)} vs ${formatEur(pension.valorNeto)} del plan.`;
  } else {
    // Diferencia marginal
    if (ventajaPension > 0) {
      opcion = 'PLAN DE PENSIONES';
      texto = `Por poco margen, el plan de pensiones gana: tu tipo baja del ${pct(tipoMarginalActual)} al ${pct(tipoMarginalJubilacion)}. `;
      texto += `Ventaja neta: ${formatEur(Math.abs(ventajaPension))}. Pero la diferencia es ajustada.`;
      if (aportacionAnual > maxAportacionPension) {
        texto += ` Combina: ${formatEur(maxAportacionPension)}/año al plan + ${formatEur(exceso)}/año a fondo indexado.`;
      }
    } else {
      opcion = 'FONDO INDEXADO';
      texto = `Aunque el plan desgrava, la tributación al rescate como renta del trabajo reduce la ventaja. `;
      texto += `El fondo indexado te deja ${formatEur(Math.abs(ventajaPension))} más neto gracias a la tributación como ahorro.`;
    }
  }

  return {
    pension: {
      aportacionEfectiva: Math.min(aportacionAnual, maxAportacionPension),
      valorBruto: pension.valorBruto,
      ahorroFiscalTotal: pension.ahorroFiscalTotal,
      ahorroFiscalAnual: pension.ahorroFiscalAnual,
      impuestoRescate: pension.impuestoRescate,
      valorNeto: pension.valorNeto,
    },
    fondo: {
      aportacionEfectiva: aportacionAnual,
      valorBruto: fondo.valorBruto,
      totalAportado: fondo.totalAportado,
      ganancia: fondo.ganancia,
      impuestoVenta: fondo.impuestoVenta,
      valorNeto: fondo.valorNeto,
    },
    mixto,
    datosAnuales,
    veredicto: { opcion, texto },
    explicacion: [
      `Aportación anual: ${formatEur(aportacionAnual)}. Horizonte: ${anosHastaJubilacion} años. Rentabilidad estimada: ${pct(rentabilidadAnual)}.`,
      `PLAN DE PENSIONES: máximo deducible ${formatEur(maxAportacionPension)}/año. Desgrava al ${pct(tipoMarginalActual)} → ahorro de ${formatEur(pension.ahorroFiscalAnual)}/año (${formatEur(pension.ahorroFiscalTotal)} total).`,
      `Al rescatar, tributa como renta del trabajo al ${pct(tipoMarginalJubilacion)} → impuestos de ${formatEur(pension.impuestoRescate)}. Valor neto: ${formatEur(pension.valorNeto)}.`,
      `FONDO INDEXADO: ${formatEur(aportacionAnual)}/año sin deducción. Valor bruto: ${formatEur(fondo.valorBruto)}. Ganancias: ${formatEur(fondo.ganancia)}.`,
      `Tributación como ahorro (19-28%): ${formatEur(fondo.impuestoVenta)} en impuestos. Valor neto: ${formatEur(fondo.valorNeto)}.`,
      `Ventaja clave del fondo: los traspasos entre fondos no tributan en España (diferimiento fiscal).`,
      aportacionAnual > maxAportacionPension ? `Como aportas más del máximo de pensiones, la estrategia óptima puede ser combinar ambos.` : '',
    ].filter(Boolean),
  };
}

function simularPension({ aportacionAnual, anos, tipoMarginalActual, tipoMarginalJubilacion, rentabilidad }) {
  const valorBruto = calcValorAcumulado(aportacionAnual, rentabilidad, anos);
  const totalAportado = aportacionAnual * anos;
  const ahorroFiscalAnual = aportacionAnual * tipoMarginalActual;
  const ahorroFiscalTotal = ahorroFiscalAnual * anos;

  // El ahorro fiscal reinvertido al mismo tipo
  const ahorroFiscalReinvertido = calcValorAcumulado(ahorroFiscalAnual, rentabilidad, anos);

  // Tributación al rescate: como renta del trabajo al tipo marginal de jubilación
  // Simplificamos: rescate total tributa al tipo marginal estimado
  const impuestoRescate = valorBruto * tipoMarginalJubilacion;
  const valorNeto = valorBruto - impuestoRescate;

  return { valorBruto, totalAportado, ahorroFiscalAnual, ahorroFiscalTotal, ahorroFiscalReinvertido, impuestoRescate, valorNeto };
}

function simularFondo({ aportacionAnual, anos, rentabilidad }) {
  const valorBruto = calcValorAcumulado(aportacionAnual, rentabilidad, anos);
  const totalAportado = aportacionAnual * anos;
  const ganancia = valorBruto - totalAportado;
  const impuestoVenta = calcImpuestoAhorro(ganancia);
  const valorNeto = valorBruto - impuestoVenta;

  return { valorBruto, totalAportado, ganancia, impuestoVenta, valorNeto };
}

function calcValorAcumulado(aportacionAnual, rentabilidad, anos) {
  // Valor futuro de anualidades
  if (rentabilidad === 0) return aportacionAnual * anos;
  return aportacionAnual * ((Math.pow(1 + rentabilidad, anos) - 1) / rentabilidad) * (1 + rentabilidad);
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

function pct(n) {
  return (n * 100).toFixed(1) + '%';
}

function formatEur(n) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}
