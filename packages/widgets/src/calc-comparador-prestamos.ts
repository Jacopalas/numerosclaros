import { CalcBase } from './calc-base.js';
import { compareLoans } from '@numerosclaros/core';

export class CalcComparadorPrestamos extends CalcBase {
  protected getTitle(): string {
    return 'Comparador de Préstamos';
  }

  protected getTemplate(): string {
    return `
      <div style="display:flex;flex-direction:column;gap:1rem">
        <div style="display:flex;align-items:center;gap:0.5rem">
          <span class="nc-badge nc-badge-primary">Préstamo A</span>
        </div>
        <div class="nc-grid">
          <div class="nc-field">
            <label for="a-principal">Importe A (€)</label>
            <input id="a-principal" type="number" value="200000" min="0" step="1000">
          </div>
          <div class="nc-field">
            <label for="a-rate">Interés A (%)</label>
            <input id="a-rate" type="number" value="2.5" min="0" step="0.1">
          </div>
          <div class="nc-field">
            <label for="a-years">Plazo A (años)</label>
            <input id="a-years" type="number" value="25" min="1" step="1">
          </div>
        </div>
        <div class="nc-separator"></div>
        <div style="display:flex;align-items:center;gap:0.5rem">
          <span class="nc-badge nc-badge-accent">Préstamo B</span>
        </div>
        <div class="nc-grid">
          <div class="nc-field">
            <label for="b-principal">Importe B (€)</label>
            <input id="b-principal" type="number" value="200000" min="0" step="1000">
          </div>
          <div class="nc-field">
            <label for="b-rate">Interés B (%)</label>
            <input id="b-rate" type="number" value="3" min="0" step="0.1">
          </div>
          <div class="nc-field">
            <label for="b-years">Plazo B (años)</label>
            <input id="b-years" type="number" value="30" min="1" step="1">
          </div>
        </div>
      </div>
      <div class="nc-results" id="results"></div>
      <div class="nc-chart" id="chart"></div>
    `;
  }

  protected calculate(): void {
    const loans = [
      {
        name: 'Préstamo A',
        principal: this.getInput('a-principal'),
        annualRate: this.getInput('a-rate'),
        years: this.getInput('a-years'),
      },
      {
        name: 'Préstamo B',
        principal: this.getInput('b-principal'),
        annualRate: this.getInput('b-rate'),
        years: this.getInput('b-years'),
      },
    ];

    if (loans.some((l) => l.principal <= 0 || l.years <= 0)) return;

    const result = compareLoans(loans);
    const colors = ['var(--nc-primary)', 'var(--nc-accent)'];

    const html = result.loans
      .map((loan, i) => {
        const isCheapest = i === result.cheapestIndex;
        return `
          <div style="margin-bottom:${i < result.loans.length - 1 ? '0.75rem' : '0'};
                      padding:0.75rem;border-radius:var(--nc-radius);
                      ${isCheapest ? 'border:2px solid var(--nc-accent);' : 'border:1px solid var(--nc-border);'}">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
              <strong style="color:${colors[i]}">${loan.name}</strong>
              ${isCheapest ? '<span class="nc-badge nc-badge-accent">Más barato</span>' : ''}
            </div>
            <div class="nc-result-row">
              <span class="nc-result-label">Cuota mensual</span>
              <span class="nc-result-value">${this.formatCurrency(loan.monthlyPayment)}</span>
            </div>
            <div class="nc-result-row">
              <span class="nc-result-label">Total a pagar</span>
              <span class="nc-result-value">${this.formatCurrency(loan.totalPayment)}</span>
            </div>
            <div class="nc-result-row">
              <span class="nc-result-label">Total intereses</span>
              <span class="nc-result-value">${this.formatCurrency(loan.totalInterest)}</span>
            </div>
          </div>
        `;
      })
      .join('');

    const savings = Math.abs(result.loans[0].totalPayment - result.loans[1].totalPayment);
    this.setHtml('results', html + `
      <div style="text-align:center;margin-top:0.75rem;font-size:0.9rem;color:var(--nc-muted)">
        Diferencia total: <strong style="color:var(--nc-accent)">${this.formatCurrency(savings)}</strong>
      </div>
    `);

    // Bar chart comparison
    const chartData = result.loans.map((loan, i) => ({
      label: loan.name,
      value: loan.totalPayment,
      color: colors[i],
    }));
    this.setHtml('chart', this.createBarChart(chartData, 120));
  }
}

customElements.define('calc-comparador-prestamos', CalcComparadorPrestamos);
