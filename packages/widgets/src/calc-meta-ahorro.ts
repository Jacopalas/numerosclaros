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

    // Progress line chart with goal line
    const points = result.timeline.map((r) => r.balance);
    if (points.length > 1) {
      // Use createLineChart for the smooth curve, then overlay goal line
      const w = 400;
      const h = 150;
      const max = Math.max(...points, goal);
      const pad = 10;
      const goalY = h - pad - (goal / max) * (h - pad * 2);

      const baseChart = this.createLineChart(points.map(p => p), w, h, 'var(--nc-primary)', 0.15);
      // Inject goal line before </svg>
      const goalLine = `
        <line x1="0" y1="${goalY}" x2="${w}" y2="${goalY}"
              stroke="var(--nc-accent)" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.8"/>
        <rect x="${w - 48}" y="${goalY - 16}" width="44" height="16" rx="4" fill="var(--nc-accent)" opacity="0.15"/>
        <text x="${w - 26}" y="${goalY - 5}" text-anchor="middle" font-size="10"
              font-weight="600" fill="var(--nc-accent)">Meta</text>
      `;
      this.setHtml('chart', baseChart.replace('</svg>', goalLine + '</svg>'));
    }

    // Progress bar based on final month (enhanced with gradient)
    const lastPct = points.length > 0
      ? Math.min(100, (points[points.length - 1] / goal) * 100)
      : 0;
    const barColor = lastPct >= 100 ? '#059669' : '#1a56db';
    this.setHtml('progressBar', `
      <div style="position:relative">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:0.7rem;color:var(--nc-muted)">
          <span>0%</span><span>50%</span><span>Meta</span>
        </div>
        <div style="background:var(--nc-surface);border:1px solid var(--nc-border);border-radius:999px;height:24px;overflow:hidden;position:relative">
          <div style="background:linear-gradient(90deg, ${barColor}dd, ${barColor});height:100%;width:${lastPct}%;border-radius:999px;
                      transition:width 0.4s ease;min-width:${lastPct > 0 ? '2rem' : '0'}"></div>
          <span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
                       font-size:0.75rem;font-weight:700;color:${lastPct > 45 ? '#fff' : 'var(--nc-text)'}">
            ${this.formatPercent(lastPct)}
          </span>
        </div>
      </div>
    `);
  }
}

customElements.define('calc-meta-ahorro', CalcMetaAhorro);
