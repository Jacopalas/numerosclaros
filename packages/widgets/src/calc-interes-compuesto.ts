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

    // Stacked area chart: contributions vs interest
    const w = 400;
    const h = 160;
    const n = result.yearByYear.length;
    if (n < 2) return;

    const max = result.finalBalance;
    const xStep = w / (n - 1);

    const contribCoords = result.yearByYear.map((r, i) => ({
      x: i * xStep,
      y: h - 10 - (r.totalContributions / max) * (h - 20),
    }));
    const balanceCoords = result.yearByYear.map((r, i) => ({
      x: i * xStep,
      y: h - 10 - (r.balance / max) * (h - 20),
    }));

    const balancePath = balanceCoords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
    const contribPath = contribCoords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
    const balanceArea = `${balancePath} L ${balanceCoords[n - 1].x} ${h - 10} L 0 ${h - 10} Z`;
    const contribArea = `${contribPath} L ${contribCoords[n - 1].x} ${h - 10} L 0 ${h - 10} Z`;

    this.setHtml('chart', `
      <svg viewBox="0 0 ${w} ${h + 25}" style="width:100%;height:${h + 25}px">
        <path d="${balanceArea}" fill="var(--nc-primary)" opacity="0.15"/>
        <path d="${balancePath}" fill="none" stroke="var(--nc-primary)" stroke-width="2"/>
        <path d="${contribArea}" fill="var(--nc-accent)" opacity="0.2"/>
        <path d="${contribPath}" fill="none" stroke="var(--nc-accent)" stroke-width="2"/>
        <text x="10" y="${h + 20}" font-size="11" fill="var(--nc-muted)">
          <tspan fill="var(--nc-primary)">■</tspan> Balance total
          <tspan dx="10" fill="var(--nc-accent)">■</tspan> Aportaciones
        </text>
      </svg>
    `);
  }
}

customElements.define('calc-interes-compuesto', CalcInteresCompuesto);
