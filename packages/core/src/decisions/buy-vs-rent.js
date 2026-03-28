// Motor de decisión: Comprar vs Alquilar
// Compara el coste total y patrimonio acumulado de ambas opciones

export function calcBuyVsRent({
  precioVivienda,
  alquilerMensual,
  ahorroDisponible,
  anosHorizonte,
  revalorizacionAnual = 0.02,
  euribor = 0.035,
  diferencialHipoteca = 0.01,
  anosHipoteca = 30,
  gastosCompra = 0.10,
  ibi = 0.005,
  mantenimientoAnual = 0.01,
  seguroHogar = 600,
  comunidad = 100,
  incrementoAlquilerAnual = 0.03,
  rentabilidadInversion = 0.06,
}) {
  const tipoHipoteca = euribor + diferencialHipoteca;
  const entradaMinima = precioVivienda * 0.20;
  const entrada = Math.max(ahorroDisponible, entradaMinima);
  const gastosIniciales = precioVivienda * gastosCompra;
  const importeHipoteca = precioVivienda - entrada;

  // Cuota mensual hipoteca (sistema francés)
  const r = tipoHipoteca / 12;
  const n = anosHipoteca * 12;
  const cuotaMensual = importeHipoteca * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  const periodos = [10, 20, 30].filter(p => p <= Math.max(anosHorizonte, 30));
  if (!periodos.includes(anosHorizonte) && anosHorizonte <= 30) {
    periodos.push(anosHorizonte);
    periodos.sort((a, b) => a - b);
  }

  // Simular mes a mes
  const maxMeses = Math.max(...periodos) * 12;
  const comprar = { costeMensual: [], patrimonioMensual: [], costeTotalAcumulado: [] };
  const alquilar = { costeMensual: [], patrimonioMensual: [], costeTotalAcumulado: [] };

  let comprarCosteTotal = entrada + gastosIniciales;
  let alquilarCosteTotal = 0;

  let capitalPendiente = importeHipoteca;
  let valorVivienda = precioVivienda;
  let alquilarInversion = ahorroDisponible; // El inquilino invierte su ahorro
  let alquilarExtraAhorro = 0;

  let alquilerActual = alquilerMensual;

  // Datos anuales para el gráfico
  const datosAnuales = [];

  for (let mes = 1; mes <= maxMeses; mes++) {
    const ano = Math.ceil(mes / 12);

    // --- COMPRAR ---
    let gastoMensualCompra = 0;
    if (capitalPendiente > 0 && mes <= n) {
      const interesMes = capitalPendiente * r;
      const amortizacion = cuotaMensual - interesMes;
      capitalPendiente = Math.max(0, capitalPendiente - amortizacion);
      gastoMensualCompra += cuotaMensual;
    }
    // Gastos fijos mensuales
    gastoMensualCompra += (precioVivienda * ibi) / 12;
    gastoMensualCompra += (precioVivienda * mantenimientoAnual) / 12;
    gastoMensualCompra += seguroHogar / 12;
    gastoMensualCompra += comunidad;

    comprarCosteTotal += gastoMensualCompra;

    // Revalorización de la vivienda (mensual)
    if (mes % 12 === 0) {
      valorVivienda *= (1 + revalorizacionAnual);
    }

    const patrimonioCompra = valorVivienda - capitalPendiente;

    comprar.costeMensual.push(gastoMensualCompra);
    comprar.patrimonioMensual.push(patrimonioCompra);
    comprar.costeTotalAcumulado.push(comprarCosteTotal);

    // --- ALQUILAR ---
    if (mes % 12 === 1 && mes > 1) {
      alquilerActual *= (1 + incrementoAlquilerAnual);
    }

    const gastoMensualAlquiler = alquilerActual;
    alquilarCosteTotal += gastoMensualAlquiler;

    // La diferencia entre lo que pagaría comprando y alquilando se invierte
    const diferencia = gastoMensualCompra - gastoMensualAlquiler;
    if (diferencia > 0) {
      alquilarExtraAhorro += diferencia;
    }

    // Rentabilidad mensual de las inversiones
    const rentMensual = Math.pow(1 + rentabilidadInversion, 1 / 12) - 1;
    alquilarInversion *= (1 + rentMensual);
    alquilarExtraAhorro *= (1 + rentMensual);

    const patrimonioAlquiler = alquilarInversion + alquilarExtraAhorro;

    alquilar.costeMensual.push(gastoMensualAlquiler);
    alquilar.patrimonioMensual.push(patrimonioAlquiler);
    alquilar.costeTotalAcumulado.push(alquilarCosteTotal);

    // Guardar dato anual
    if (mes % 12 === 0) {
      datosAnuales.push({
        ano,
        patrimonioCompra,
        patrimonioAlquiler,
        costeCompra: comprarCosteTotal,
        costeAlquiler: alquilarCosteTotal,
        cuotaCompra: gastoMensualCompra,
        cuotaAlquiler: gastoMensualAlquiler,
      });
    }
  }

  // Encontrar punto de cruce
  let puntoCruce = null;
  for (let i = 0; i < datosAnuales.length; i++) {
    const d = datosAnuales[i];
    if (d.patrimonioCompra > d.patrimonioAlquiler) {
      puntoCruce = d.ano;
      break;
    }
  }

  // Resúmenes por periodo
  const resumenes = periodos.map(p => {
    const idx = p - 1;
    if (idx >= datosAnuales.length) return null;
    const d = datosAnuales[idx];
    return {
      anos: p,
      patrimonioCompra: d.patrimonioCompra,
      patrimonioAlquiler: d.patrimonioAlquiler,
      costeCompra: d.costeCompra,
      costeAlquiler: d.costeAlquiler,
      mejorOpcion: d.patrimonioCompra > d.patrimonioAlquiler ? 'COMPRAR' : 'ALQUILAR',
      diferencia: Math.abs(d.patrimonioCompra - d.patrimonioAlquiler),
    };
  }).filter(Boolean);

  // Veredicto principal (al horizonte del usuario)
  const idxHorizonte = Math.min(anosHorizonte, datosAnuales.length) - 1;
  const datoHorizonte = datosAnuales[idxHorizonte];

  let veredicto;
  if (!datoHorizonte) {
    veredicto = { opcion: 'ALQUILAR', texto: 'No hay suficientes datos para el horizonte indicado.' };
  } else if (datoHorizonte.patrimonioCompra > datoHorizonte.patrimonioAlquiler) {
    const diff = datoHorizonte.patrimonioCompra - datoHorizonte.patrimonioAlquiler;
    veredicto = {
      opcion: 'COMPRAR',
      texto: puntoCruce
        ? `Con estos números, COMPRAR te sale mejor a partir del año ${puntoCruce}. En ${anosHorizonte} años acumulas ${formatEur(diff)} más de patrimonio comprando.`
        : `Con estos números, COMPRAR es mejor. En ${anosHorizonte} años acumulas ${formatEur(diff)} más de patrimonio.`,
    };
  } else {
    const diff = datoHorizonte.patrimonioAlquiler - datoHorizonte.patrimonioCompra;
    veredicto = {
      opcion: 'ALQUILAR',
      texto: puntoCruce
        ? `Con estos números, ALQUILAR es mejor hasta el año ${puntoCruce}. En ${anosHorizonte} años, alquilar e invertir te deja ${formatEur(diff)} más de patrimonio.`
        : `Con estos números, ALQUILAR e invertir la diferencia te deja ${formatEur(diff)} más de patrimonio en ${anosHorizonte} años.`,
    };
  }

  return {
    cuotaMensualHipoteca: cuotaMensual,
    entrada,
    gastosIniciales,
    importeHipoteca,
    puntoCruce,
    resumenes,
    datosAnuales,
    veredicto,
    explicacion: generarExplicacion({ entrada, gastosIniciales, cuotaMensual, alquilerMensual, tipoHipoteca, rentabilidadInversion, revalorizacionAnual, puntoCruce, anosHorizonte }),
  };
}

function generarExplicacion({ entrada, gastosIniciales, cuotaMensual, alquilerMensual, tipoHipoteca, rentabilidadInversion, revalorizacionAnual, puntoCruce, anosHorizonte }) {
  return [
    `La entrada + gastos iniciales suman ${formatEur(entrada + gastosIniciales)}. Ese dinero, si no compras, se invierte al ${(rentabilidadInversion * 100).toFixed(1)}% anual.`,
    `La cuota hipotecaria es ${formatEur(cuotaMensual)}/mes al ${(tipoHipoteca * 100).toFixed(2)}% (Euríbor + diferencial). El alquiler empieza en ${formatEur(alquilerMensual)}/mes.`,
    `La vivienda se revaloriza al ${(revalorizacionAnual * 100).toFixed(1)}% anual. La diferencia mensual entre cuota e alquiler se invierte.`,
    puntoCruce
      ? `El punto de cruce donde comprar supera a alquilar es el año ${puntoCruce}.`
      : `En el horizonte de ${anosHorizonte} años, no se alcanza un punto de cruce.`,
    `Estos cálculos no incluyen deducciones fiscales por vivienda habitual ni posibles subidas del Euríbor.`,
  ];
}

function formatEur(n) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}
