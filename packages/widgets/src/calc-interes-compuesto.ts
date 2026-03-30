import { CalcBase } from './calc-base.js';
import { calculateCompound } from '@numerosclaros/core';

export class CalcInteresCompuesto extends CalcBase {
  protected getTitle(): string {
    return 'Calculadora de Interés Compuesto';
  }

  protected getTemplate(): string {
    return `
      <div class="nc-grid">
        <div class="nc-field">
          <label for="principal">Capital inicial (€)</label>
          <input id="principal" type="number" value="10000" min="0" step="1000">
        </div>
        <div class="nc-field">
          <label for="rate">Rentabilidad anual (%)</label>
          <input id="rate" type="number" value="7" min="0" max="50" step="0.1">
        </div>
        <div class="nc-field">
          <label for="years">Años</label>
          <input id="years" type="number" value="20" min="1" max="100" step="1">
        </div>
        <div class="nc-field">
          <label for="monthly">Aportación mensual (€)</label>
          <input id="monthly" type="number" value="200" min="0" step="50">
        </div>
      </div>
      <div class="nc-results">
        <div class="nc-result-row">
          <span class="nc-result-label">Balance final</span>
          <span class="nc-result-value nc-highlight" id="finalBalance"></span>
        </div>
        <div class="nc-result-row">
          <span class="nc-result-label">Total aportado</span>
          <span class="nc-result-value" id="totalContrib"></span>
        </div>
        <div class="nc-result-row">
          <span class="nc-result-label">Intereses ganados</span>
          <span class="nc-result-value nc-accent" id="totalInterest"></span>
        </div>
      </div>
      <div class="nc-chart" id="chart"></div>
    `;
  }

  protected calculate(): void {
    const principal = this.getInput('principal');
    const rate = this.getInput('rate');
    const years = this.getInput('years');
    const monthly = this.getInput('monthly');

    if (years <= 0) return;

    const result = calculateCompound({
      principal,
      annualRate: rate,
      years,
      monthlyContribution: monthly,
    });

    this.setText('finalBalance', this.formatCurrency(result.finalBalance));
    this.setText('totalContrib', this.formatCurrency(result.totalContributions));
    this.setText('totalInterest', this.formatCurrency(result.totalInterest));

    // Stacked area chart: contributions vs total balance (smooth curves with gradients)
    const n = result.yearByYear.length;
    if (n < 2) return;

    const balanceSeries = result.yearByYear.map((r) => r.balance);
    const contribSeries = result.yearByYear.map((r) => r.totalContributions);

    this.setHtml('chart', this.createStackedAreaChart({
      topSeries: balanceSeries,
      bottomSeries: contribSeries,
      topColor: '#0e9f6e',
      bottomColor: '#1a56db',
      topLabel: 'Balance total (con intereses)',
      bottomLabel: 'Aportaciones',
      height: 190,
      xLabels: result.yearByYear.map((r) => `${r.year}`),
    }));
  }
}

customElements.define('calc-interes-compuesto', CalcInteresCompuesto);
