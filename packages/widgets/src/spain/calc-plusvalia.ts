/**
 * calc-plusvalia — Plusvalía municipal (IIVTNU).
 * Método objetivo vs método real, el contribuyente elige el más favorable.
 */
import { CalcBase } from './base.js';
import { calcularPlusvalia, COEFICIENTES_PLUSVALIA } from '@numerosclaros/core';

export class CalcPlusvalia extends CalcBase {
  protected render(): void {
    this.container.innerHTML = `
      <h2>Calculadora Plusvalía Municipal</h2>
      <p class="nc-subtitle">IIVTNU — elige el método más favorable</p>

      <div class="nc-row">
        ${this.fieldNum('vc_suelo', 'Valor catastral del suelo (€)', 'Ej: 50000', '50000')}
        ${this.fieldNum('vc_total', 'Valor catastral total (€)', 'Ej: 120000', '120000')}
      </div>

      <div class="nc-row">
        ${this.fieldNum('compra', 'Precio de compra (€)', 'Ej: 180000', '180000')}
        ${this.fieldNum('venta', 'Precio de venta (€)', 'Ej: 250000', '250000')}
      </div>

      <div class="nc-row">
        ${this.fieldNum('anios', 'Años de propiedad', 'Ej: 10', '10')}
        ${this.fieldNum('tipo_municipal', 'Tipo municipal (%)', 'Max 30%', '30')}
      </div>

      <button class="nc-btn" id="calcular">Calcular plusvalía</button>

      <div id="resultados" class="nc-hidden"></div>
    `;
  }

  protected setupListeners(): void {
    this.qs('#calcular')?.addEventListener('click', () => this.calcular());
  }

  private calcular(): void {
    const vcSuelo = this.numVal('vc_suelo');
    const vcTotal = this.numVal('vc_total');
    const compra = this.numVal('compra');
    const venta = this.numVal('venta');
    const anios = this.numVal('anios');
    const tipoMunicipal = this.numVal('tipo_municipal') / 100;

    if (vcSuelo <= 0 || anios <= 0) return;

    const r = calcularPlusvalia(vcSuelo, anios, tipoMunicipal, compra, venta, vcTotal);
    const aniosInt = Math.max(1, Math.min(20, Math.floor(anios)));
    const coef = COEFICIENTES_PLUSVALIA[aniosInt] || 0;

    const div = this.qs('#resultados')!;
    div.classList.remove('nc-hidden');

    div.innerHTML = `
      <div class="nc-results">
        ${r.sinPlusvalia ? `
          <h3>Sin plusvalía — no hay que pagar</h3>
          <p class="nc-note">Si no hay ganancia patrimonial, no se genera plusvalía municipal (STC 59/2017).</p>
        ` : `
          <h3>Plusvalía a pagar</h3>
          ${this.resultRow('Método elegido', r.metodoElegido === 'objetivo' ? 'Objetivo (más favorable)' : 'Real (más favorable)')}
          ${this.resultRow('Cuota a pagar', this.fmtEur(r.cuotaFinal), true)}
        `}

        <div class="nc-divider"></div>
        <h3>Método objetivo</h3>
        ${this.resultRow('Valor catastral suelo', this.fmtEur(vcSuelo))}
        ${this.resultRow('Coeficiente (' + aniosInt + ' años)', coef.toFixed(2))}
        ${this.resultRow('Base imponible', this.fmtEur(r.metodoObjetivo.baseImponible))}
        ${this.resultRow('Tipo municipal', this.fmtPercent(r.metodoObjetivo.tipoAplicado))}
        ${this.resultRow('Cuota objetivo', this.fmtEur(r.metodoObjetivo.cuota))}

        <div class="nc-divider"></div>
        <h3>Método real</h3>
        ${this.resultRow('Ganancia patrimonial', this.fmtEur(r.metodoReal.gananciaReal))}
        ${this.resultRow('Proporción suelo', this.fmtPercent(r.metodoReal.proporcionSuelo))}
        ${this.resultRow('Base imponible', this.fmtEur(r.metodoReal.baseImponible))}
        ${this.resultRow('Tipo municipal', this.fmtPercent(r.metodoReal.tipoAplicado))}
        ${this.resultRow('Cuota real', this.fmtEur(r.metodoReal.cuota))}

        <p class="nc-note">
          El contribuyente elige el método más favorable (RDL 26/2021).
          Coeficientes vigentes: RDL 8/2023 (LPGE). Tipo municipal máximo: 30%.
          Si no hay ganancia real, no hay obligación de pago (STC 59/2017, STC 182/2021).
        </p>
      </div>
    `;
  }
}

customElements.define('calc-plusvalia', CalcPlusvalia);
