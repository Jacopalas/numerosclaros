// Motor de decisión: Snowball vs Avalanche
// Compara ambas estrategias de pago de deudas

export function calcSnowballVsAvalanche({ deudas, pagoExtraMensual }) {
  if (!deudas || deudas.length === 0) {
    return { veredicto: { opcion: 'N/A', texto: 'No hay deudas para comparar.' } };
  }

  const snowball = simularEstrategia(deudas, pagoExtraMensual, 'snowball');
  const avalanche = simularEstrategia(deudas, pagoExtraMensual, 'avalanche');

  const difIntereses = snowball.totalIntereses - avalanche.totalIntereses;
  const difMeses = snowball.mesesTotal - avalanche.mesesTotal;

  // Veredicto
  let opcion, texto;
  if (difIntereses > 100) {
    opcion = 'AVALANCHE';
    texto = `Avalanche te ahorra ${formatEur(difIntereses)} en intereses`;
    if (difMeses > 0) {
      texto += ` y te libera ${difMeses} meses antes`;
    }
    texto += `. Snowball liquida la primera deuda en ${snowball.primeraDeudaLiquidada} meses (motivación extra). `;
    texto += avalanche.totalIntereses < snowball.totalIntereses
      ? `Recomendación: AVALANCHE si puedes mantener la disciplina.`
      : '';
  } else if (difIntereses < -100) {
    opcion = 'SNOWBALL';
    texto = `Sorpresa: Snowball te ahorra ${formatEur(Math.abs(difIntereses))} en intereses en este caso. Además liquida la primera deuda en solo ${snowball.primeraDeudaLiquidada} meses para darte motivación.`;
  } else {
    opcion = 'AMBAS SIMILARES';
    texto = `La diferencia es solo ${formatEur(Math.abs(difIntereses))}. Snowball te da una victoria rápida (primera deuda en ${snowball.primeraDeudaLiquidada} meses), Avalanche es ${difMeses > 0 ? difMeses + ' meses más rápido' : 'igual de rápido'}. Elige la que te motive más.`;
  }

  return {
    snowball: {
      totalIntereses: snowball.totalIntereses,
      totalPagado: snowball.totalPagado,
      mesesTotal: snowball.mesesTotal,
      primeraDeudaLiquidada: snowball.primeraDeudaLiquidada,
      ordenPago: snowball.ordenPago,
      timeline: snowball.timeline,
    },
    avalanche: {
      totalIntereses: avalanche.totalIntereses,
      totalPagado: avalanche.totalPagado,
      mesesTotal: avalanche.mesesTotal,
      primeraDeudaLiquidada: avalanche.primeraDeudaLiquidada,
      ordenPago: avalanche.ordenPago,
      timeline: avalanche.timeline,
    },
    datosAnuales: generarDatosAnuales(snowball, avalanche),
    veredicto: { opcion, texto },
    explicacion: [
      `Tienes ${deudas.length} deudas con un saldo total de ${formatEur(deudas.reduce((s, d) => s + d.saldo, 0))}.`,
      `Pagas ${formatEur(deudas.reduce((s, d) => s + d.cuotaMinima, 0))}/mes en cuotas mínimas + ${formatEur(pagoExtraMensual)} extra.`,
      `SNOWBALL: paga primero la deuda más pequeña. Orden: ${snowball.ordenPago.join(' → ')}.`,
      `AVALANCHE: paga primero la deuda con más interés. Orden: ${avalanche.ordenPago.join(' → ')}.`,
      `Snowball: ${snowball.mesesTotal} meses, ${formatEur(snowball.totalIntereses)} en intereses.`,
      `Avalanche: ${avalanche.mesesTotal} meses, ${formatEur(avalanche.totalIntereses)} en intereses.`,
    ],
  };
}

function simularEstrategia(deudasOrig, pagoExtra, tipo) {
  // Clonar deudas
  let deudas = deudasOrig.map(d => ({ ...d, saldoActual: d.saldo }));

  // Ordenar según estrategia
  const ordenar = () => {
    const activas = deudas.filter(d => d.saldoActual > 0);
    if (tipo === 'snowball') {
      activas.sort((a, b) => a.saldoActual - b.saldoActual);
    } else {
      activas.sort((a, b) => b.tipoInteres - a.tipoInteres);
    }
    return activas;
  };

  const ordenPago = ordenar().map(d => d.nombre);

  let mes = 0;
  let totalIntereses = 0;
  let totalPagado = 0;
  let primeraDeudaLiquidada = null;
  const timeline = []; // { mes, deudas: [{nombre, saldo}] }
  const liquidaciones = []; // { mes, nombre }

  const MAX_MESES = 600; // 50 años máximo

  while (deudas.some(d => d.saldoActual > 0) && mes < MAX_MESES) {
    mes++;
    let extraDisponible = pagoExtra;

    // Aplicar intereses
    for (const d of deudas) {
      if (d.saldoActual <= 0) continue;
      const interes = d.saldoActual * (d.tipoInteres / 12);
      d.saldoActual += interes;
      totalIntereses += interes;
    }

    // Pagar cuotas mínimas
    for (const d of deudas) {
      if (d.saldoActual <= 0) continue;
      const pago = Math.min(d.cuotaMinima, d.saldoActual);
      d.saldoActual -= pago;
      totalPagado += pago;
    }

    // Pagar extra según estrategia
    const activas = ordenar();
    for (const d of activas) {
      if (d.saldoActual <= 0 || extraDisponible <= 0) continue;
      const pago = Math.min(extraDisponible, d.saldoActual);
      d.saldoActual -= pago;
      extraDisponible -= pago;
      totalPagado += pago;
    }

    // Registrar liquidaciones
    for (const d of deudas) {
      if (d.saldoActual <= 0 && !liquidaciones.find(l => l.nombre === d.nombre)) {
        liquidaciones.push({ mes, nombre: d.nombre });
        if (!primeraDeudaLiquidada) primeraDeudaLiquidada = mes;

        // Liberar cuota mínima de deuda liquidada → se convierte en extra
        // Esto ya se maneja naturalmente porque la cuota mínima no se paga si saldo=0
      }
    }

    // Guardar snapshot mensual
    if (mes % 3 === 0 || !deudas.some(d => d.saldoActual > 0)) {
      timeline.push({
        mes,
        deudas: deudas.map(d => ({ nombre: d.nombre, saldo: Math.max(0, d.saldoActual) })),
        totalRestante: deudas.reduce((s, d) => s + Math.max(0, d.saldoActual), 0),
      });
    }
  }

  return {
    totalIntereses,
    totalPagado,
    mesesTotal: mes,
    primeraDeudaLiquidada: primeraDeudaLiquidada || mes,
    ordenPago,
    liquidaciones,
    timeline,
  };
}

function generarDatosAnuales(snowball, avalanche) {
  const maxMeses = Math.max(snowball.mesesTotal, avalanche.mesesTotal);
  const datos = [];

  for (let i = 0; i < snowball.timeline.length && i < avalanche.timeline.length; i++) {
    datos.push({
      mes: snowball.timeline[i].mes,
      restanteSnowball: snowball.timeline[i].totalRestante,
      restanteAvalanche: avalanche.timeline[i]?.totalRestante || 0,
    });
  }

  return datos;
}

function formatEur(n) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}
