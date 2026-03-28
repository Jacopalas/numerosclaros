/**
 * calc-irpf — Calculadora IRPF 2025/2026 con tramos estatales y autonómicos.
 * Web Component embeddable.
 */
import { CalcBase } from './base.js';
import {
  calcularIRPF,
  CCAA_LIST,
  CCAA_DATA,
  CCAA_FORALES,
  IRPF_ESTATAL,
  type ComunidadId,
} from '@numerosclaros/core';

export class CalcIRPF extends CalcBase {
  protected render(): void {
    const ccaaOpts = CCAA_LIST.map(([id, nombre]) =>
      `<option value="${id}">${nombre}</option>`
    ).join('');

    this.container.innerHTML = `
      <h2>Calculadora IRPF 2025</h2>
      <p class="nc-subtitle">Calcula tu IRPF con tramos estatales y autonómicos</p>

      ${this.fieldNum('base', 'Base imponible general (€)', 'Ej: 35000', '35000')}

      ${this.fieldSelect('ccaa', 'Comunidad Autónoma', CCAA_LIST)}

      <button class="nc-btn" id="calcular">Calcular IRPF</button>

      <div id="resultados" class="nc-hidden"></div>
    `;
  }

  protected setupListeners(): void {
    this.qs('#calcular')?.addEventListener('click', () => this.calcular());
    this.qs('#base')?.addEventListener('keydown', (e: Event) => {
      if ((e as KeyboardEvent).key === 'Enter') this.calcular();
    });
  }

  private calcular(): void {
    const base = this.numVal('base');
    const ccaa = this.strVal('ccaa') as ComunidadId;

    if (base <= 0) return;

    const result = calcularIRPF(base, ccaa);
    const datos = CCAA_DATA[ccaa];
    const esForal = CCAA_FORALES.includes(ccaa);

    const div = this.qs('#resultados')!;
    div.classList.remove('nc-hidden');

    let tramosHTML = '';
    if (result.tramosDetalle.length > 0) {
      tramosHTML = `
        <table>
          <thead>
            <tr>
              <th>Tramo</th>
              ${esForal ? '' : '<th>Estatal</th><th>Auton.</th>'}
              <th>Total</th>
              <th>Cuota</th>
            </tr>
          </thead>
          <tbody>
            ${result.tramosDetalle.map(t => `
              <tr>
                <td>${this.fmtInt.format(t.desde)} - ${this.fmtInt.format(t.hasta)} €</td>
                ${esForal ? '' : `<td>${this.fmtPercent(t.tipoEstatal)}</td><td>${this.fmtPercent(t.tipoAutonomico)}</td>`}
                <td>${this.fmtPercent(t.tipoTotal)}</td>
                <td>${this.fmtEur(t.cuota)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    div.innerHTML = `
      <div class="nc-results">
        <h3>Resultado IRPF — ${datos.nombre}</h3>
        ${this.resultRow('Base imponible', this.fmtEur(result.baseImponible))}
        ${esForal ? '' : this.resultRow('Cuota estatal', this.fmtEur(result.cuotaEstatal))}
        ${this.resultRow(esForal ? 'Cuota íntegra' : 'Cuota autonómica', this.fmtEur(result.cuotaAutonomica))}
        ${esForal ? '' : this.resultRow('Cuota total', this.fmtEur(result.cuotaTotal))}
        <div class="nc-divider"></div>
        ${this.resultRow('Tipo efectivo', this.fmtPercent(result.tipoEfectivo), true)}
        ${this.resultRow('Tipo marginal', this.fmtPercent(result.tipoMarginal), true)}
        ${tramosHTML}
        <p class="nc-note">
          ${esForal
            ? `${datos.nombre} tiene régimen foral con tramos propios.`
            : 'El IRPF se reparte entre la cuota estatal y la autonómica. Los tramos varían según tu comunidad.'}
          Datos fiscales 2025. Fuente: AEAT, BOE.
        </p>
      </div>
    `;
  }
}

customElements.define('calc-irpf', CalcIRPF);
