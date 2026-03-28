/**
 * calc-fire-espana — Calculadora FIRE adaptada a España.
 * SWR 3.0-3.25% (no 4%), pensión pública, sanidad gratuita,
 * fiscalidad rentas del ahorro (19-28%), inflación europea.
 */
import { CalcBase } from './base.js';
import { calcularIRPFAhorro } from '@numerosclaros/core';

/** Safe withdrawal rate para España: 3.0-3.25% */
const SWR_DEFAULT = 0.0325;
/** Inflación media eurozona largo plazo */
const INFLACION_DEFAULT = 0.025;
/** Rentabilidad media cartera diversificada (nominal) */
const RENTABILIDAD_DEFAULT = 0.07;

export class CalcFireEspana extends CalcBase {
  protected render(): void {
    this.container.innerHTML = `
      <h2>Calculadora FIRE España</h2>
      <p class="nc-subtitle">Independencia financiera adaptada a la realidad fiscal española</p>

      <div class="nc-row">
        ${this.fieldNum('edad', 'Edad actual', '', '35')}
        ${this.fieldNum('edad_fire', 'Edad FIRE objetivo', '', '50')}
      </div>

      ${this.fieldNum('gastos', 'Gastos anuales actuales (€)', 'Ej: 24000', '24000')}

      <div class="nc-row">
        ${this.fieldNum('patrimonio', 'Patrimonio invertido actual (€)', '', '50000')}
        ${this.fieldNum('aportacion', 'Aportación mensual (€)', '', '1000')}
      </div>

      <div class="nc-row">
        ${this.fieldNum('pension', 'Pensión pública estimada (€/mes)', 'Ej: 1200', '1200')}
        ${this.fieldNum('edad_pension', 'Edad jubilación', '', '67')}
      </div>

      <button class="nc-btn" id="calcular">Calcular FIRE</button>

      <div id="resultados" class="nc-hidden"></div>
    `;
  }

  protected setupListeners(): void {
    this.qs('#calcular')?.addEventListener('click', () => this.calcular());
  }

  private calcular(): void {
    const edad = this.numVal('edad');
    const edadFire = this.numVal('edad_fire');
    const gastosAnuales = this.numVal('gastos');
    const patrimonio = this.numVal('patrimonio');
    const aportacionMensual = this.numVal('aportacion');
    const pensionMensual = this.numVal('pension');
    const edadPension = this.numVal('edad_pension') || 67;

    if (gastosAnuales <= 0 || edad <= 0) return;

    const aniosHastaFire = Math.max(0, edadFire - edad);
    const aniosHastaPension = Math.max(0, edadPension - edadFire);
    const rentReal = RENTABILIDAD_DEFAULT - INFLACION_DEFAULT; // ~4.5% real

    // Fase de acumulación: patrimonio futuro
    let patrimonioFire = patrimonio;
    for (let i = 0; i < aniosHastaFire * 12; i++) {
      patrimonioFire = patrimonioFire * (1 + rentReal / 12) + aportacionMensual;
    }

    // Gastos ajustados a inflación en el momento FIRE
    const gastosFireAnuales = gastosAnuales * Math.pow(1 + INFLACION_DEFAULT, aniosHastaFire);

    // Fiscalidad: al retirar del ahorro, se pagan impuestos sobre ganancias
    // Estimamos 50% de la retirada son ganancias (el resto es principal)
    const proporcionGanancia = 0.5;
    const gananciaAnual = gastosFireAnuales * proporcionGanancia;
    const impuestoAhorro = calcularIRPFAhorro(gananciaAnual);
    const gastosBrutosNecesarios = gastosFireAnuales + impuestoAhorro.cuota;

    // Número FIRE: patrimonio necesario con SWR español
    const numeroFire = gastosBrutosNecesarios / SWR_DEFAULT;

    // Pensión pública: reduce la necesidad de patrimonio tras jubilación
    const pensionAnual = pensionMensual * 14;
    const gastosCubiertoPension = Math.min(pensionAnual, gastosFireAnuales);

    // Patrimonio necesario considerando pensión
    // Antes de la pensión: necesitas cubrir todo
    // Después de la pensión: solo la diferencia
    const gastosPostPension = Math.max(0, gastosBrutosNecesarios - pensionAnual);
    const patrimonioPostPension = gastosPostPension / SWR_DEFAULT;

    // Progreso actual
    const progreso = Math.min(1, patrimonioFire / numeroFire);

    // ¿Cuántos años faltan con aportación actual?
    let aniosFaltan = 0;
    let p = patrimonio;
    while (p < numeroFire && aniosFaltan < 80) {
      p = p * (1 + rentReal) + aportacionMensual * 12;
      aniosFaltan++;
    }
    const edadFireEstimada = edad + aniosFaltan;

    const div = this.qs('#resultados')!;
    div.classList.remove('nc-hidden');

    div.innerHTML = `
      <div class="nc-results">
        <h3>Tu plan FIRE España</h3>
        ${this.resultRow('Número FIRE (antes de pensión)', this.fmtEur(numeroFire), true)}
        ${this.resultRow('Patrimonio proyectado a los ' + edadFire + ' años', this.fmtEur(patrimonioFire))}
        ${this.resultRow('Progreso al objetivo', this.fmtPercent(progreso))}

        <div class="nc-divider"></div>
        <h3>Retiro seguro</h3>
        ${this.resultRow('Gastos anuales (ajustados inflación)', this.fmtEur(gastosFireAnuales))}
        ${this.resultRow('Impuestos sobre retiradas (ahorro)', this.fmtEur(impuestoAhorro.cuota))}
        ${this.resultRow('Retirada bruta necesaria/año', this.fmtEur(gastosBrutosNecesarios))}
        ${this.resultRow('Tasa de retirada segura (SWR)', '3,25%')}

        <div class="nc-divider"></div>
        <h3>Efecto pensión pública</h3>
        ${this.resultRow('Pensión estimada (14 pagas)', this.fmtEur(pensionAnual) + '/año')}
        ${this.resultRow('Patrimonio necesario post-jubilación', this.fmtEur(patrimonioPostPension))}
        ${this.resultRow('Ahorro por pensión pública', this.fmtEur(numeroFire - patrimonioPostPension))}

        <div class="nc-divider"></div>
        <h3>Proyección</h3>
        ${this.resultRow('Años hasta FIRE (ritmo actual)', aniosFaltan >= 80 ? '+80 años' : aniosFaltan + ' años')}
        ${this.resultRow('Edad FIRE estimada', aniosFaltan >= 80 ? 'Inalcanzable' : edadFireEstimada + ' años')}

        <p class="nc-note">
          SWR español: 3,25% (más conservador que el 4% americano por menor crecimiento histórico europeo).
          Ventajas España: sanidad pública gratuita, pensión pública, menor coste de vida.
          Rentabilidad nominal 7%, inflación 2,5%. Fiscalidad ahorro: 19-28%.
        </p>
      </div>
    `;
  }
}

customElements.define('calc-fire-espana', CalcFireEspana);
