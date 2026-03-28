/**
 * calc-autonomo-vs-sl — Compara autónomo persona física vs Sociedad Limitada.
 */
import { CalcBase } from '../base.js';
import {
  compararAutonomoVsSL,
  CCAA_LIST,
  type ComunidadId,
} from '../../../core/src/spain/index.js';

export class CalcAutonomoVsSL extends CalcBase {
  protected render(): void {
    this.container.innerHTML = `
      <h2>Autónomo vs Sociedad Limitada</h2>
      <p class="nc-subtitle">Compara cuánto te queda en cada forma jurídica</p>

      ${this.fieldNum('ingresos', 'Ingresos brutos anuales (€)', 'Ej: 80000', '80000')}
      ${this.fieldNum('gastos', 'Gastos deducibles anuales (€)', 'Ej: 15000', '15000')}

      <div class="nc-row">
        ${this.fieldSelect('ccaa', 'Comunidad Autónoma', CCAA_LIST)}
        ${this.fieldNum('salario_admin', 'Salario administrador SL (€/año)', '24000', '24000')}
      </div>

      <button class="nc-btn" id="calcular">Comparar</button>

      <div id="resultados" class="nc-hidden"></div>
    `;
  }

  protected setupListeners(): void {
    this.qs('#calcular')?.addEventListener('click', () => this.calcular());
  }

  private calcular(): void {
    const ingresos = this.numVal('ingresos');
    const gastos = this.numVal('gastos');
    const ccaa = this.strVal('ccaa') as ComunidadId;
    const salarioAdmin = this.numVal('salario_admin') || 24000;

    if (ingresos <= 0) return;

    const r = compararAutonomoVsSL(ingresos, gastos, ccaa, salarioAdmin);
    const isAut = r.recomendacion === 'autonomo';

    const div = this.qs('#resultados')!;
    div.classList.remove('nc-hidden');

    div.innerHTML = `
      <div class="nc-results">
        <h3>Resultado: ${isAut ? 'Autónomo más favorable' : 'SL más favorable'}
          <span class="nc-badge">${isAut ? 'Autónomo' : 'SL'}</span>
        </h3>
        ${this.resultRow('Diferencia anual', this.fmtEur(Math.abs(r.diferencia)), true)}
      </div>

      <div class="nc-comparison">
        <div class="nc-comparison-col ${isAut ? 'nc-winner' : ''}">
          <h4>Autónomo ${isAut ? '✓' : ''}</h4>
          ${this.resultRow('Ingresos brutos', this.fmtEur(r.autonomo.ingresosBrutos))}
          ${this.resultRow('Gastos deducibles', '- ' + this.fmtEur(r.autonomo.gastos))}
          ${this.resultRow('Rendimiento neto', this.fmtEur(r.autonomo.rendimientoNeto))}
          ${this.resultRow('Cuota RETA', '- ' + this.fmtEur(r.autonomo.cuotaRETAAnual))}
          ${this.resultRow('IRPF', '- ' + this.fmtEur(r.autonomo.irpf))}
          <div class="nc-divider"></div>
          ${this.resultRow('Neto final', this.fmtEur(r.autonomo.netoFinal), true)}
          ${this.resultRow('Tipo efectivo', this.fmtPercent(r.autonomo.tipoEfectivo))}
        </div>

        <div class="nc-comparison-col ${!isAut ? 'nc-winner' : ''}">
          <h4>SL ${!isAut ? '✓' : ''}</h4>
          ${this.resultRow('Ingresos brutos', this.fmtEur(r.sl.ingresosBrutos))}
          ${this.resultRow('Gastos deducibles', '- ' + this.fmtEur(r.sl.gastos))}
          ${this.resultRow('Salario admin', this.fmtEur(r.sl.salarioAdmin))}
          ${this.resultRow('IS (25%)', '- ' + this.fmtEur(r.sl.impuestoSociedades))}
          ${this.resultRow('SS admin', '- ' + this.fmtEur(r.sl.cuotaSSAdmin))}
          ${this.resultRow('IRPF salario', '- ' + this.fmtEur(r.sl.irpfSalario))}
          ${this.resultRow('Dividendos', this.fmtEur(r.sl.dividendos))}
          ${this.resultRow('IRPF dividendos', '- ' + this.fmtEur(r.sl.impuestoDividendos))}
          <div class="nc-divider"></div>
          ${this.resultRow('Neto final', this.fmtEur(r.sl.netoFinal), true)}
          ${this.resultRow('Tipo efectivo', this.fmtPercent(r.sl.tipoEfectivo))}
        </div>
      </div>

      <p class="nc-note">
        SL: IS 25% + dividendos al 19-28%. Autónomo: IRPF hasta 47% + cuota RETA por tramos.
        La SL tiene costes de gestoría y constitución no incluidos (~3.000-5.000€ anuales).
        Datos 2025. Fuentes: AEAT, Seguridad Social.
      </p>
    `;
  }
}

customElements.define('calc-autonomo-vs-sl', CalcAutonomoVsSL);
