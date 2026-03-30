import { CalcBase } from './calc-base.js';
import { calculateEmergency } from '@numerosclaros/core';

export class CalcFondoEmergencia extends CalcBase {
  protected getTitle(): string {
    return 'Calculadora de Fondo de Emergencia';
  }

  protected getTemplate(): string {
    return `
      <div class="nc-grid">
        <div class="nc-field">
          <label for="expenses">Gastos mensuales esenciales (€)</label>
          <input id="expenses" type="number" value="1500" min="0" step="100">
        </div>
        <div class="nc-field">
          <label for="months">Meses de colchón</label>
          <input id="months" type="number" value="6" min="1" max="24" step="1">
        </div>
        <div class="nc-field">
          <label for="current">Ahorros actuales (€)</label>
          <input id="current" type="number" value="2000" min="0" step="100">
        </div>
        <div class="nc-field">
          <label for="capacity">Capacidad de ahorro mensual (€)</label>
          <input id="capacity" type="number" value="300" min="0" step="50">
        </div>
      </div>
      <div class="nc-results">
        <div class="nc-result-row">
          <span class="nc-result-label">Objetivo del fondo</span>
          <span class="nc-result-value nc-highlight" id="goal"></span>
        </div>
        <div class="nc-result-row">
          <span class="nc-result-label">Te falta</span>
          <span class="nc-result-value" id="remaining"></span>
        </div>
        <div class="nc-result-row">
          <span class="nc-result-label">Progreso</span>
          <span class="nc-result-value nc-accent" id="percent"></span>
        </div>
        <div class="nc-result-row">
          <span class="nc-result-label">Meses hasta completar</span>
          <span class="nc-result-value" id="monthsToGoal"></span>
        </div>
      </div>
      <div id="progressBar" style="margin-top:1rem"></div>
    `;
  }

  protected calculate(): void {
    const expenses = this.getInput('expenses');
    const months = this.getInput('months');
    const current = this.getInput('current');
    const capacity = this.getInput('capacity');

    if (expenses <= 0 || months <= 0) return;

    const result = calculateEmergency({
      monthlyExpenses: expenses,
      targetMonths: months,
      currentSavings: current,
      monthlySavingsCapacity: capacity,
    });

    this.setText('goal', this.formatCurrency(result.goal));
    this.setText('remaining', this.formatCurrency(result.remaining));
    this.setText('percent', this.formatPercent(result.percentComplete));
    this.setText('monthsToGoal',
      result.monthsToGoal === null ? '—' :
      result.monthsToGoal === 0 ? '¡Completado!' :
      `${result.monthsToGoal} meses`);

    // Progress bar (enhanced with gradient and milestone markers)
    const pct = Math.min(100, result.percentComplete);
    const barColor = pct >= 100 ? '#059669' : pct >= 60 ? '#1a56db' : '#f59e0b';
    this.setHtml('progressBar', `
      <div style="position:relative">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:0.7rem;color:var(--nc-muted)">
          <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
        </div>
        <div style="background:var(--nc-surface);border:1px solid var(--nc-border);border-radius:999px;height:28px;overflow:hidden;position:relative">
          <div style="background:linear-gradient(90deg, ${barColor}dd, ${barColor});height:100%;width:${pct}%;border-radius:999px;
                      transition:width 0.4s ease;min-width:${pct > 0 ? '2.5rem' : '0'}"></div>
          <span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
                       font-size:0.8rem;font-weight:700;color:${pct > 45 ? '#fff' : 'var(--nc-text)'}">
            ${this.formatPercent(result.percentComplete)}
          </span>
        </div>
      </div>
    `);
  }
}

customElements.define('calc-fondo-emergencia', CalcFondoEmergencia);
