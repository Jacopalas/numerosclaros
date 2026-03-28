import { CalcBase } from './base.js';
import { calculateRoi } from '@numerosclaros/core';

export class CalcRoi extends CalcBase {
  protected getTitle(): string {
    return 'Calculadora de ROI';
  }

  protected getTemplate(): string {
    return `
      <div class="nc-grid">
        <div class="nc-field">
          <label for="initial">Inversión inicial (€)</label>
          <input id="initial" type="number" value="10000" min="0" step="1000">
        </div>
        <div class="nc-field">
          <label for="final">Valor final (€)</label>
          <input id="final" type="number" value="15000" min="0" step="1000">
        </div>
        <div class="nc-field">
          <label for="years">Período (años)</label>
          <input id="years" type="number" value="3" min="0.1" step="0.5">
        </div>
      </div>
      <div class="nc-results">
        <div class="nc-result-row">
          <span class="nc-result-label">ROI Total</span>
          <span class="nc-result-value nc-highlight" id="totalRoi"></span>
        </div>
        <div class="nc-result-row">
          <span class="nc-result-label">ROI Anualizado (CAGR)</span>
          <span class="nc-result-value nc-accent" id="annualRoi"></span>
        </div>
        <div class="nc-result-row">
          <span class="nc-result-label">Beneficio neto</span>
          <span class="nc-result-value" id="profit"></span>
        </div>
      </div>
      <div class="nc-chart" id="chart"></div>
    `;
  }

  protected calculate(): void {
    const initial = this.getInput('initial');
    const final_ = this.getInput('final');
    const years = this.getInput('years');

    if (initial <= 0 || years <= 0) return;

    const result = calculateRoi({
      initialInvestment: initial,
      finalValue: final_,
      years,
    });

    this.setText('totalRoi', this.formatPercent(result.totalRoi));
    this.setText('annualRoi', this.formatPercent(result.annualizedRoi));
    this.setText('profit', this.formatCurrency(result.netProfit));

    // Growth visualization: CAGR curve
    const points: number[] = [];
    for (let y = 0; y <= Math.ceil(years); y++) {
      points.push(initial * Math.pow(1 + result.annualizedRoi / 100, y));
    }
    this.setHtml('chart', this.createLineChart(points, 400, 130, 'var(--nc-primary)', 0.15));
  }
}

customElements.define('calc-roi', CalcRoi);
