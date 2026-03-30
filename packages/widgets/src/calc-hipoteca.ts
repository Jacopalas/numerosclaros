import { CalcBase } from './calc-base.js';
import { calculateMortgage } from '@numerosclaros/core';

export class CalcHipoteca extends CalcBase {
  protected getTitle(): string {
    return 'Calculadora de Hipoteca';
  }

  protected getTemplate(): string {
    return `
      <div class="nc-grid">
        <div class="nc-field">
          <label for="principal">Importe del préstamo (€)</label>
          <input id="principal" type="number" value="200000" min="0" step="1000">
        </div>
        <div class="nc-field">
          <label for="rate">Tipo de interés anual (%)</label>
          <input id="rate" type="number" value="3" min="0" max="30" step="0.1">
        </div>
        <div class="nc-field">
          <label for="years">Plazo (años)</label>
          <input id="years" type="number" value="25" min="1" max="50" step="1">
        </div>
      </div>
      <div class="nc-results">
        <div class="nc-result-row">
          <span class="nc-result-label">Cuota mensual</span>
          <span class="nc-result-value nc-highlight" id="monthly"></span>
        </div>
        <div class="nc-result-row">
          <span class="nc-result-label">Total a pagar</span>
          <span class="nc-result-value" id="total"></span>
        </div>
        <div class="nc-result-row">
          <span class="nc-result-label">Total intereses</span>
          <span class="nc-result-value" id="interest"></span>
        </div>
      </div>
      <div class="nc-chart" id="chart"></div>
      <div class="nc-table-scroll" id="tableContainer" style="margin-top:1rem"></div>
    `;
  }

  protected calculate(): void {
    const principal = this.getInput('principal');
    const rate = this.getInput('rate');
    const years = this.getInput('years');

    if (principal <= 0 || years <= 0) return;

    const result = calculateMortgage({ principal, annualRate: rate, years });

    this.setText('monthly', this.formatCurrency(result.monthlyPayment));
    this.setText('total', this.formatCurrency(result.totalPayment));
    this.setText('interest', this.formatCurrency(result.totalInterest));

    // Stacked area chart: interest vs capital over time (smooth curves with gradients)
    const step = Math.max(1, Math.floor(result.amortization.length / 60));
    const sampled = result.amortization.filter((_, i) => i % step === 0 || i === result.amortization.length - 1);

    if (sampled.length < 2) return;

    const capitalSeries = sampled.map((row) => row.principal);
    const interestSeries = sampled.map((row) => row.interest);

    const xLabels = sampled.map((row) => {
      if (row.month % 12 === 0) return `${row.month / 12}a`;
      return '';
    }).filter((_, i) => i === 0 || i === sampled.length - 1 || sampled[i].month % 12 === 0);

    this.setHtml('chart', this.createStackedAreaChart({
      topSeries: capitalSeries,
      bottomSeries: interestSeries,
      topColor: '#1a56db',
      bottomColor: '#e02424',
      topLabel: 'Capital amortizado',
      bottomLabel: 'Intereses',
      height: 180,
    }));

    // Amortization table (show yearly summary)
    const yearlyRows: { year: number; interest: number; principal: number; balance: number }[] = [];
    let yearInterest = 0;
    let yearPrincipal = 0;

    for (const row of result.amortization) {
      yearInterest += row.interest;
      yearPrincipal += row.principal;
      if (row.month % 12 === 0) {
        yearlyRows.push({
          year: row.month / 12,
          interest: yearInterest,
          principal: yearPrincipal,
          balance: row.balance,
        });
        yearInterest = 0;
        yearPrincipal = 0;
      }
    }

    const tableHtml = `
      <table class="nc-table">
        <thead><tr>
          <th>Año</th><th>Capital</th><th>Intereses</th><th>Saldo</th>
        </tr></thead>
        <tbody>
          ${yearlyRows.map((r) => `<tr>
            <td>${r.year}</td>
            <td>${this.formatCurrency(r.principal)}</td>
            <td>${this.formatCurrency(r.interest)}</td>
            <td>${this.formatCurrency(r.balance)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    `;
    this.setHtml('tableContainer', tableHtml);
  }
}

customElements.define('calc-hipoteca', CalcHipoteca);
