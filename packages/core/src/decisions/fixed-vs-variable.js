// Motor de decisión: Hipoteca Fija vs Variable
// Simula 3 escenarios de Euríbor y recomienda

export function calcFixedVsVariable({
  importeHipoteca,
  anosHipoteca,
  tipoFijo,
  euriborActual,
  diferencialVariable,
}) {
  const n = anosHipoteca * 12;

  // Cuota fija
  const cuotaFija = calcCuota(importeHipoteca, tipoFijo / 12, n);
  const costeTotalFijo = cuotaFija * n;

  // Escenarios Euríbor
  const escenarios = [
    { nombre: 'Euríbor sube', trayectoria: generarTrayectoria(euriborActual, 0.005, anosHipoteca) },
    { nombre: 'Euríbor estable', trayectoria: generarTrayectoria(euriborActual, 0, anosHipoteca) },
    { nombre: 'Euríbor baja', trayectoria: generarTrayectoria(euriborActual, -0.003, anosHipoteca) },
  ];

  const resultadosVariable = escenarios.map(esc => {
    return simularVariable(importeHipoteca, n, esc.trayectoria, diferencialVariable, esc.nombre);
  });

  // Datos anuales para gráficos
  const datosAnuales = [];
  for (let ano = 1; ano <= anosHipoteca; ano++) {
    const entry = { ano, costeFijo: cuotaFija * ano * 12 };
    resultadosVariable.forEach(r => {
      entry[`coste_${r.nombre}`] = r.costeAcumuladoAnual[ano - 1];
      entry[`cuota_${r.nombre}`] = r.cuotasAnuales[ano - 1];
    });
    datosAnuales.push(entry);
  }

  // Veredicto
  const escEstable = resultadosVariable.find(r => r.nombre === 'Euríbor estable');
  const escSube = resultadosVariable.find(r => r.nombre === 'Euríbor sube');
  const escBaja = resultadosVariable.find(r => r.nombre === 'Euríbor baja');

  const difEstable = escEstable.costeTotal - costeTotalFijo;
  const difSube = escSube.costeTotal - costeTotalFijo;
  const riesgoSubida = escSube.cuotaMaxima - cuotaFija;

  let opcion, texto;

  if (difEstable > 0 && difSube > 0) {
    opcion = 'FIJO';
    texto = `El tipo fijo te sale más barato incluso con Euríbor estable. Te ahorras ${formatEur(Math.abs(difEstable))} y evitas el riesgo de subidas donde perderías ${formatEur(difSube)}.`;
  } else if (difEstable < 0 && difSube < 0) {
    opcion = 'VARIABLE';
    texto = `El variable te ahorra ${formatEur(Math.abs(difEstable))} con Euríbor estable. Incluso si sube, pagas ${formatEur(Math.abs(difSube))} menos en total. Ventaja clara.`;
  } else {
    // Caso mixto: variable más barato si estable, pero más caro si sube
    const ahorro = Math.abs(difEstable);
    const riesgo = Math.abs(difSube);

    if (riesgo > ahorro * 2) {
      opcion = 'FIJO';
      texto = `El fijo te cuesta ${formatEur(ahorro)} más si el Euríbor se mantiene, pero te protege de subidas donde perderías ${formatEur(riesgo)}. La cuota variable podría subir ${formatEur(riesgoSubida)}/mes. Recomendamos FIJO por seguridad.`;
    } else {
      opcion = 'VARIABLE';
      texto = `El variable te ahorra ${formatEur(ahorro)} si el Euríbor se mantiene. El riesgo de subida es de ${formatEur(riesgo)} en el peor caso. La diferencia de cuota máxima es ${formatEur(riesgoSubida)}/mes. Si puedes absorber esa subida, el VARIABLE tiene mejor expectativa.`;
    }
  }

  return {
    cuotaFija,
    costeTotalFijo,
    tipoFijo,
    resultadosVariable,
    datosAnuales,
    veredicto: { opcion, texto },
    explicacion: [
      `Hipoteca de ${formatEur(importeHipoteca)} a ${anosHipoteca} años.`,
      `Tipo fijo: ${(tipoFijo * 100).toFixed(2)}% → cuota fija de ${formatEur(cuotaFija)}/mes. Coste total: ${formatEur(costeTotalFijo)}.`,
      `Variable: Euríbor ${(euriborActual * 100).toFixed(2)}% + diferencial ${(diferencialVariable * 100).toFixed(2)}% = ${((euriborActual + diferencialVariable) * 100).toFixed(2)}% inicial.`,
      `Escenario sube: Euríbor sube ~0.5% anual. Cuota máxima: ${formatEur(escSube.cuotaMaxima)}/mes. Coste total: ${formatEur(escSube.costeTotal)}.`,
      `Escenario estable: Euríbor se mantiene. Coste total: ${formatEur(escEstable.costeTotal)}.`,
      `Escenario baja: Euríbor baja ~0.3% anual. Coste total: ${formatEur(escBaja.costeTotal)}.`,
    ],
  };
}

function calcCuota(capital, rMensual, n) {
  if (rMensual === 0) return capital / n;
  return capital * (rMensual * Math.pow(1 + rMensual, n)) / (Math.pow(1 + rMensual, n) - 1);
}

function generarTrayectoria(euriborInicial, cambioAnual, anos) {
  const trayectoria = [];
  for (let i = 0; i < anos; i++) {
    const euribor = Math.max(0, euriborInicial + cambioAnual * i);
    trayectoria.push(euribor);
  }
  return trayectoria;
}

function simularVariable(importeHipoteca, totalMeses, trayectoriaEuribor, diferencial, nombre) {
  let capitalPendiente = importeHipoteca;
  let costeTotal = 0;
  let cuotaMaxima = 0;
  const cuotasAnuales = [];
  const costeAcumuladoAnual = [];
  let costeAcumulado = 0;

  for (let mes = 0; mes < totalMeses; mes++) {
    const ano = Math.floor(mes / 12);
    const euribor = trayectoriaEuribor[Math.min(ano, trayectoriaEuribor.length - 1)];
    const tipo = euribor + diferencial;
    const r = tipo / 12;
    const mesesRestantes = totalMeses - mes;

    const cuota = calcCuota(capitalPendiente, r, mesesRestantes);
    const interes = capitalPendiente * r;
    const amortizacion = cuota - interes;

    capitalPendiente = Math.max(0, capitalPendiente - amortizacion);
    costeTotal += cuota;
    costeAcumulado += cuota;
    cuotaMaxima = Math.max(cuotaMaxima, cuota);

    if ((mes + 1) % 12 === 0) {
      cuotasAnuales.push(cuota);
      costeAcumuladoAnual.push(costeAcumulado);
    }
  }

  return { nombre, costeTotal, cuotaMaxima, cuotasAnuales, costeAcumuladoAnual };
}

function formatEur(n) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}
