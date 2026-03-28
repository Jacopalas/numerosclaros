/**
 * calc-pension — Calculadora de pensión de jubilación Seguridad Social.
 * Sistema dual 2025: dos fórmulas, se aplica la más favorable.
 */
import { CalcBase } from '../base.js';
import {
  calcularPension,
  edadLegalJubilacion,
  PENSION_MAX_2025,
  BASE_COTIZACION_MAX_2025,
} from '../../../core/src/spain/index.js';

export class CalcPension extends CalcBase {
  protected render(): void {
    this.container.innerHTML = `
      <h2>Calculadora de Pensión</h2>
      <p class="nc-subtitle">Estima tu pensión de jubilación de la Seguridad Social</p>

      <div class="nc-row">
        ${this.fieldNum('anios', 'Años cotizados', 'Ej: 35', '35')}
        ${this.fieldNum('edad', 'Edad de jubilación', 'Ej: 65', '65')}
      </div>

      ${this.fieldNum('base_cot', 'Base de cotización media mensual (€)', 'Ej: 2500', '2500')}
      ${this.fieldNum('ultimo_sueldo', 'Último sueldo bruto mensual (€)', 'Para tasa de sustitución', '3000')}

      <button class="nc-btn" id="calcular">Calcular pensión</button>

      <div id="resultados" class="nc-hidden"></div>
    `;
  }

  protected setupListeners(): void {
    this.qs('#calcular')?.addEventListener('click', () => this.calcular());
  }

  private calcular(): void {
    const anios = this.numVal('anios');
    const edad = this.numVal('edad');
    const baseCot = this.numVal('base_cot');
    const ultimoSueldo = this.numVal('ultimo_sueldo');

    if (anios <= 0 || baseCot <= 0) return;

    const r = calcularPension(baseCot, anios, edad, ultimoSueldo);
    const edadLegal = edadLegalJubilacion(anios);

    const div = this.qs('#resultados')!;
    div.classList.remove('nc-hidden');

    div.innerHTML = `
      <div class="nc-results">
        <h3>Tu pensión estimada</h3>
        ${this.resultRow('Pensión mensual', this.fmtEur(r.pensionMensual), true)}
        ${this.resultRow('Pensión anual (14 pagas)', this.fmtEur(r.pensionAnual))}
        ${ultimoSueldo > 0 ? this.resultRow('Tasa de sustitución', this.fmtPercent(r.tasaSustitucion)) : ''}

        <div class="nc-divider"></div>
        <h3>Cálculo detallado</h3>
        ${this.resultRow('Base reguladora (Fórmula ' + r.formulaAplicada + ')', this.fmtEur(r.baseReguladora))}
        ${this.resultRow('Fórmula A (25 años)', this.fmtEur(r.baseReguladoraFormulaA))}
        ${this.resultRow('Fórmula B (29 años - 2 peores)', this.fmtEur(r.baseReguladoraFormulaB))}
        ${this.resultRow('% por años cotizados (' + anios + ' años)', this.fmtPercent(r.porcentajePorAnios))}
        ${this.resultRow('Coeficiente por edad', (r.coeficienteEdad * 100).toFixed(1) + '%')}

        <div class="nc-divider"></div>
        <h3>Información</h3>
        ${this.resultRow('Edad legal jubilación', edadLegal + ' años' + (anios >= 38.25 ? ' (38+ años cotizados)' : ''))}
        ${r.coeficienteEdad < 1
          ? this.resultRow('Penalización jubilación anticipada', this.fmtPercent(1 - r.coeficienteEdad))
          : r.coeficienteEdad > 1
            ? this.resultRow('Bonus jubilación demorada', '+' + this.fmtPercent(r.coeficienteEdad - 1))
            : ''}
        ${this.resultRow('Pensión máxima 2025', this.fmtEur(PENSION_MAX_2025))}
        ${this.resultRow('Base cotización máxima', this.fmtEur(BASE_COTIZACION_MAX_2025) + '/mes')}

        <p class="nc-note">
          Sistema dual 2025: la SS calcula con 2 fórmulas y aplica la más favorable.
          Fórmula A: últimos 25 años / 350. Fórmula B: últimos 29 años menos los 2 peores / 350.
          15 años mínimo para tener derecho a pensión. 36,5 años para el 100%.
          Fuente: LGSS art. 209-210, Ley 21/2021 de reforma de pensiones.
        </p>
      </div>
    `;
  }
}

customElements.define('calc-pension', CalcPension);
