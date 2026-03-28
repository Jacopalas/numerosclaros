import { CalcBase } from './calc-base.js';
import { calculateInflation } from '@numerosclaros/core';

export class CalcInflacion extends CalcBase {
  protected getTitle(): string {
    return 'Calculadora de Inflación';
  }

  protected getTemplate(): string {
    return `
      <div class="nc-grid">
        <div class="nc-field">
          <label for="amount">Cantidad original (€)</label>
          <input id="amount" type="number" value="100" min="0" step="10">
        </div>
        <div class="nc-field">
          <label for="inflation">Inflación anual (%)</label>
          <input id="inflation" type="number" value="3" min="0" max="50" step="0.1">
        </div>
        <div class="nc-field">
          <label for="years">Años</label>
          <input id="years" type="number" value="10" min="1" max="100" step="1">
        </div>
      </div>
      <div class="nc-results">
        <div class="nc-result-row">
          <span class="nc-result-label" id="explanation"></span>
          <span class="nc-result-value nc-highlight" id="adjusted"></span>
        </div>
        <div class="nc-result-row">
          <span class="nc-result-label">Poder adquisitivo perdido</span>
          <span class="nc-result-value" style="color:var(--nc-error)" id="lost"></span>
        </div>
      </div>
      <div class="nc-chart" id="chart"></div>
    `;
  }

  protected calculate(): void {
    const amount = this.getInput('amount');
    const inflation = this.getInput('inflation');
    const years = this.getInput('years');

    if (amount <= 0 || years <= 0) return;

    const result = calculateInflation({ amount, annualInflation: inflation, years });

    this.setText('explanation',
      `${this.formatCurrency(amount)} de hace ${years} años equivalen hoy a`);
    this.setText('adjusted', this.formatCurrency(result.adjustedAmount));
    this.setText('lost', this.formatPercent(result.purchasingPowerLost));

    // Line chart showing value needed over time
    const points = [amount, ...result.yearByYear.map((r) => r.value)];
    this.setHtml('chart', this.createLineChart(points, 400, 130, '#dc2626', 0.1));
  }
}

customElements.define('calc-inflacion', CalcInflacion);
