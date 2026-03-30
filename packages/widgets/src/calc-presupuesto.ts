import { CalcBase } from './calc-base.js';
import { calculateBudget } from '@numerosclaros/core';

export class CalcPresupuesto extends CalcBase {
  protected getTitle(): string {
    return 'Calculadora de Presupuesto 50/30/20';
  }

  protected getTemplate(): string {
    return `
      <div class="nc-grid">
        <div class="nc-field">
          <label for="income">Ingresos mensuales netos (€)</label>
          <input id="income" type="number" value="2500" min="0" step="100">
        </div>
      </div>
      <div class="nc-results">
        <div class="nc-result-row">
          <span class="nc-result-label">🏠 Necesidades (50%)</span>
          <span class="nc-result-value" id="needs"></span>
        </div>
        <div class="nc-result-row">
          <span class="nc-result-label">🎯 Deseos (30%)</span>
          <span class="nc-result-value" id="wants"></span>
        </div>
        <div class="nc-result-row">
          <span class="nc-result-label">💰 Ahorro (20%)</span>
          <span class="nc-result-value nc-accent" id="savings"></span>
        </div>
        <div class="nc-separator"></div>
        <div class="nc-result-row">
          <span class="nc-result-label">Ahorro anual</span>
          <span class="nc-result-value nc-highlight" id="yearlySavings"></span>
        </div>
      </div>
      <div class="nc-chart" id="chart" style="display:flex;justify-content:center"></div>
    `;
  }

  protected calculate(): void {
    const income = this.getInput('income');
    if (income <= 0) return;

    const result = calculateBudget({ monthlyIncome: income });

    this.setText('needs', this.formatCurrency(result.needs));
    this.setText('wants', this.formatCurrency(result.wants));
    this.setText('savings', this.formatCurrency(result.savings));
    this.setText('yearlySavings', this.formatCurrency(result.yearly.savings));

    // Donut chart (larger, with percentage labels and centered total)
    this.setHtml('chart', this.createDonutChart([
      { label: 'Necesidades', value: result.needs, color: '#1a56db' },
      { label: 'Deseos', value: result.wants, color: '#f59e0b' },
      { label: 'Ahorro', value: result.savings, color: '#059669' },
    ], 220));
  }
}

customElements.define('calc-presupuesto', CalcPresupuesto);
