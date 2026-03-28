import { CalcBase } from './calc-base.js';
import { calculateSavings } from '@numerosclaros/core';

export class CalcMetaAhorro extends CalcBase {
  protected getTitle(): string {
    return 'Calculadora de Meta de Ahorro';
  }

  protected getTemplate(): string {
    return `
      <div class="nc-grid">
        <div class="nc-field">
          <label for="goal">Meta de ahorro (€)</label>
          <input id="goal" type="number" value="15000" min="0" step="1000">
        </div>
        <div class="nc-field">
          <label for="months">Plazo (meses)</label>
          <input id="months" type="number" value="24" min="1" max="600" step="1">
        </div>
        <div class="nc-field">
          <label for="current">Ahorro actual (€)</label>
          <input id="current" type="number" value="2000" min="0" step="500">
        </div>
        <div class="nc-field">
          <label for="return">Rentabilidad anual (%)</label>
          <input id="return" type="number" value="3" min="0" max="30" step="0.5">
        </div>
      </div>
      <div class="nc-results">
        <div class="nc-result-row">
          <span class="nc-result-label">Aportación mensual necesaria</span>
          <span class="nc-result-value nc-highlight" id="monthly"></span>
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
      <div id="progressBar" style="margin-top:0.75rem"></div>
    `;
  }

  protected calculate(): void {
    const goal = this.getInput('goal');
    const months = this.getInput('months');
    const current = this.getInput('current');
    const annualReturn = this.getInput('return');

    if (goal <= 0 || months <= 0) return;

    const result = calculateSavings({ goal, months, currentSavings: current, annualReturn });

    this.setText('monthly', this.formatCurrency(result.monthlyContribution));
    this.setText('totalContrib', this.formatCurrency(result.totalContributed + current));
    this.setText('totalInterest', this.formatCurrency(result.totalInterest));

    // Progress line chart
    const points = result.timeline.map((r) => r.balance);
    if (points.length > 1) {
      const w = 400;
      const h = 130;
      const max = Math.max(...points, goal);
      const xStep = w / (points.length - 1);

      const pathD = points.map((v, i) =>
        `${i === 0 ? 'M' : 'L'} ${i * xStep} ${h - 10 - (v / max) * (h - 20)}`
      ).join(' ');

      const goalY = h - 10 - (goal / max) * (h - 20);

      this.setHtml('chart', `
        <svg viewBox="0 0 ${w} ${h + 25}" style="width:100%;height:${h + 25}px">
          <line x1="0" y1="${goalY}" x2="${w}" y2="${goalY}"
                stroke="var(--nc-accent)" stroke-width="1" stroke-dasharray="5,5"/>
          <text x="${w - 5}" y="${goalY - 5}" text-anchor="end" font-size="10"
                fill="var(--nc-accent)">Meta</text>
          <path d="${pathD} L ${(points.length - 1) * xStep} ${h - 10} L 0 ${h - 10} Z"
                fill="var(--nc-primary)" opacity="0.12"/>
          <path d="${pathD}" fill="none" stroke="var(--nc-primary)" stroke-width="2"/>
        </svg>
      `);
    }

    // Progress bar based on final month
    const lastPct = points.length > 0
      ? Math.min(100, (points[points.length - 1] / goal) * 100)
      : 0;
    this.setHtml('progressBar', `
      <div style="background:var(--nc-border);border-radius:999px;height:20px;overflow:hidden;position:relative">
        <div style="background:var(--nc-primary);height:100%;width:${lastPct}%;border-radius:999px;
                    transition:width 0.3s ease"></div>
        <span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
                     font-size:0.7rem;font-weight:700;color:${lastPct > 50 ? '#fff' : 'var(--nc-text)'}">
          ${this.formatPercent(lastPct)}
        </span>
      </div>
    `);
  }
}

customElements.define('calc-meta-ahorro', CalcMetaAhorro);
