import { CalcBase } from './calc-base.js';
import { calculateDebt } from '@numerosclaros/core';

export class CalcDeuda extends CalcBase {
  protected getTitle(): string {
    return 'Calculadora de Deuda: Snowball vs Avalanche';
  }

  protected getTemplate(): string {
    return `
      <div style="margin-bottom:1rem">
        <div class="nc-grid" id="debts-grid">
          <div class="nc-field">
            <label for="d1-name">Deuda 1</label>
            <input id="d1-name" type="text" value="Tarjeta A" placeholder="Nombre">
          </div>
          <div class="nc-field">
            <label for="d1-balance">Saldo (€)</label>
            <input id="d1-balance" type="number" value="5000" min="0" step="100">
          </div>
          <div class="nc-field">
            <label for="d1-rate">Interés (%)</label>
            <input id="d1-rate" type="number" value="20" min="0" step="0.5">
          </div>
          <div class="nc-field">
            <label for="d1-min">Pago mínimo (€)</label>
            <input id="d1-min" type="number" value="100" min="0" step="10">
          </div>

          <div class="nc-field">
            <label for="d2-name">Deuda 2</label>
            <input id="d2-name" type="text" value="Tarjeta B" placeholder="Nombre">
          </div>
          <div class="nc-field">
            <label for="d2-balance">Saldo (€)</label>
            <input id="d2-balance" type="number" value="3000" min="0" step="100">
          </div>
          <div class="nc-field">
            <label for="d2-rate">Interés (%)</label>
            <input id="d2-rate" type="number" value="15" min="0" step="0.5">
          </div>
          <div class="nc-field">
            <label for="d2-min">Pago mínimo (€)</label>
            <input id="d2-min" type="number" value="75" min="0" step="10">
          </div>

          <div class="nc-field">
            <label for="d3-name">Deuda 3</label>
            <input id="d3-name" type="text" value="Préstamo" placeholder="Nombre">
          </div>
          <div class="nc-field">
            <label for="d3-balance">Saldo (€)</label>
            <input id="d3-balance" type="number" value="10000" min="0" step="100">
          </div>
          <div class="nc-field">
            <label for="d3-rate">Interés (%)</label>
            <input id="d3-rate" type="number" value="8" min="0" step="0.5">
          </div>
          <div class="nc-field">
            <label for="d3-min">Pago mínimo (€)</label>
            <input id="d3-min" type="number" value="200" min="0" step="10">
          </div>
        </div>
        <div class="nc-separator"></div>
        <div class="nc-field" style="max-width:250px">
          <label for="budget">Presupuesto mensual total (€)</label>
          <input id="budget" type="number" value="600" min="0" step="50">
        </div>
      </div>
      <div class="nc-results" id="results"></div>
      <div class="nc-chart" id="chart"></div>
    `;
  }

  protected calculate(): void {
    const debts = [];
    for (let i = 1; i <= 3; i++) {
      const balance = this.getInput(`d${i}-balance`);
      if (balance > 0) {
        debts.push({
          name: this.getInputString(`d${i}-name`) || `Deuda ${i}`,
          balance,
          annualRate: this.getInput(`d${i}-rate`),
          minimumPayment: this.getInput(`d${i}-min`),
        });
      }
    }

    const budget = this.getInput('budget');
    if (debts.length === 0 || budget <= 0) return;

    const result = calculateDebt(debts, budget);
    const s = result.snowball;
    const a = result.avalanche;

    this.setHtml('results', `
      <div class="nc-columns">
        <div style="padding:0.75rem;border-radius:var(--nc-radius);border:1px solid var(--nc-border);
                    ${result.recommended === 'snowball' ? 'border-color:var(--nc-accent);border-width:2px' : ''}">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
            <strong style="color:var(--nc-primary)">❄️ Snowball</strong>
            ${result.recommended === 'snowball' ? '<span class="nc-badge nc-badge-accent">Recomendado</span>' : ''}
          </div>
          <div class="nc-result-row">
            <span class="nc-result-label">Meses</span>
            <span class="nc-result-value">${s.totalMonths}</span>
          </div>
          <div class="nc-result-row">
            <span class="nc-result-label">Total pagado</span>
            <span class="nc-result-value">${this.formatCurrency(s.totalPaid)}</span>
          </div>
          <div class="nc-result-row">
            <span class="nc-result-label">Intereses</span>
            <span class="nc-result-value">${this.formatCurrency(s.totalInterest)}</span>
          </div>
        </div>
        <div style="padding:0.75rem;border-radius:var(--nc-radius);border:1px solid var(--nc-border);
                    ${result.recommended === 'avalanche' ? 'border-color:var(--nc-accent);border-width:2px' : ''}">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
            <strong style="color:var(--nc-accent)">🏔️ Avalanche</strong>
            ${result.recommended === 'avalanche' ? '<span class="nc-badge nc-badge-accent">Recomendado</span>' : ''}
          </div>
          <div class="nc-result-row">
            <span class="nc-result-label">Meses</span>
            <span class="nc-result-value">${a.totalMonths}</span>
          </div>
          <div class="nc-result-row">
            <span class="nc-result-label">Total pagado</span>
            <span class="nc-result-value">${this.formatCurrency(a.totalPaid)}</span>
          </div>
          <div class="nc-result-row">
            <span class="nc-result-label">Intereses</span>
            <span class="nc-result-value">${this.formatCurrency(a.totalInterest)}</span>
          </div>
        </div>
      </div>
      ${result.savings > 0 ? `
        <div style="text-align:center;margin-top:0.75rem;font-size:0.9rem;color:var(--nc-muted)">
          Ahorras <strong style="color:var(--nc-accent)">${this.formatCurrency(result.savings)}</strong>
          con ${result.recommended === 'avalanche' ? 'Avalanche' : 'Snowball'}
        </div>
      ` : ''}
    `);

    // Timeline chart - show both strategies
    const maxMonths = Math.max(s.totalMonths, a.totalMonths);
    const step = Math.max(1, Math.floor(maxMonths / 50));
    const sPoints = s.timeline.filter((_, i) => i % step === 0).map((t) => t.totalBalance);
    const aPoints = a.timeline.filter((_, i) => i % step === 0).map((t) => t.totalBalance);

    // Normalize to same length
    const len = Math.max(sPoints.length, aPoints.length);
    while (sPoints.length < len) sPoints.push(0);
    while (aPoints.length < len) aPoints.push(0);

    const max = Math.max(...sPoints, ...aPoints, 1);
    const w = 400;
    const h = 130;
    const xStep = w / (len - 1 || 1);

    const makePath = (pts: number[]) =>
      pts.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * xStep} ${h - 10 - (v / max) * (h - 20)}`).join(' ');

    this.setHtml('chart', `
      <svg viewBox="0 0 ${w} ${h + 25}" style="width:100%;height:${h + 25}px">
        <path d="${makePath(sPoints)}" fill="none" stroke="var(--nc-primary)" stroke-width="2"/>
        <path d="${makePath(aPoints)}" fill="none" stroke="var(--nc-accent)" stroke-width="2"/>
        <text x="10" y="${h + 20}" font-size="11" fill="var(--nc-muted)">
          <tspan fill="var(--nc-primary)">■</tspan> Snowball
          <tspan dx="10" fill="var(--nc-accent)">■</tspan> Avalanche
        </text>
      </svg>
    `);
  }
}

customElements.define('calc-deuda', CalcDeuda);
