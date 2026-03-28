/**
 * calc-cuota-autonomos — Cuota de autónomos 2025 por tramos de rendimientos netos.
 */
import { CalcBase } from './base.js';
import {
  calcularCuotaAutonomo,
  TRAMOS_AUTONOMOS_2025,
} from '@numerosclaros/core';

export class CalcCuotaAutonomos extends CalcBase {
  protected render(): void {
    this.container.innerHTML = `
      <h2>Cuota de Autónomos 2025</h2>
      <p class="nc-subtitle">Sistema por tramos de rendimientos netos</p>

      ${this.fieldNum('rendimiento', 'Rendimiento neto anual (€)', 'Ingresos - gastos deducibles', '30000')}

      <button class="nc-btn" id="calcular">Calcular cuota</button>

      <div id="resultados" class="nc-hidden"></div>
    `;
  }

  protected setupListeners(): void {
    this.qs('#calcular')?.addEventListener('click', () => this.calcular());
    this.qs('#rendimiento')?.addEventListener('keydown', (e: Event) => {
      if ((e as KeyboardEvent).key === 'Enter') this.calcular();
    });
  }

  private calcular(): void {
    const rendimiento = this.numVal('rendimiento');
    if (rendimiento <= 0) return;

    const r = calcularCuotaAutonomo(rendimiento);

    // Tabla de todos los tramos
    const tramosHTML = TRAMOS_AUTONOMOS_2025.map(t => {
      const esActual = r.rendimientoNetoMensual >= t.rendimientoMin &&
        r.rendimientoNetoMensual < t.rendimientoMax;
      return `<tr${esActual ? ' style="background:rgba(5,150,105,0.1);font-weight:600"' : ''}>
        <td>${this.fmtInt.format(t.rendimientoMin)} - ${t.rendimientoMax === Infinity ? '∞' : this.fmtInt.format(t.rendimientoMax)} €</td>
        <td>${this.fmtEur(t.cuotaMinima)}</td>
        <td>${this.fmtEur(t.baseCotizacion)}</td>
      </tr>`;
    }).join('');

    const div = this.qs('#resultados')!;
    div.classList.remove('nc-hidden');

    div.innerHTML = `
      <div class="nc-results">
        <h3>Tu cuota de autónomos</h3>
        ${this.resultRow('Rendimiento neto mensual', this.fmtEur(r.rendimientoNetoMensual))}
        ${this.resultRow('Cuota mensual', this.fmtEur(r.cuotaMensual), true)}
        ${this.resultRow('Cuota anual', this.fmtEur(r.cuotaAnual))}
        ${this.resultRow('Base de cotización', this.fmtEur(r.baseCotizacion))}
        ${this.resultRow('Tramo', r.tramo)}
      </div>

      <div class="nc-results" style="margin-top:1rem">
        <h3>Tabla completa de tramos 2025</h3>
        <table>
          <thead>
            <tr>
              <th>Rendimiento neto/mes</th>
              <th>Cuota mín.</th>
              <th>Base cotiz.</th>
            </tr>
          </thead>
          <tbody>${tramosHTML}</tbody>
        </table>
        <p class="nc-note">
          Sistema de cotización por ingresos reales (RDL 13/2022).
          Rendimiento neto = ingresos - gastos deducibles.
          Los tramos se revisan anualmente. Datos 2025.
          Fuente: Seguridad Social, disposición transitoria 1ª RDL 13/2022.
        </p>
      </div>
    `;
  }
}

customElements.define('calc-cuota-autonomos', CalcCuotaAutonomos);
