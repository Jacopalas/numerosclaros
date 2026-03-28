/**
 * calc-gastos-vivienda — Gastos REALES de comprar vivienda en España.
 * ITP/IVA por CCAA, notaría, registro, gestoría, tasación.
 */
import { CalcBase } from '../base.js';
import {
  calcularGastosVivienda,
  CCAA_LIST,
  type ComunidadId,
} from '../../../core/src/spain/index.js';

export class CalcGastosVivienda extends CalcBase {
  protected render(): void {
    this.container.innerHTML = `
      <h2>Gastos de compra de vivienda</h2>
      <p class="nc-subtitle">Calcula el coste REAL de comprar una vivienda en España</p>

      ${this.fieldNum('precio', 'Precio de la vivienda (€)', 'Ej: 250000', '250000')}

      <div class="nc-row">
        ${this.fieldSelect('ccaa', 'Comunidad Autónoma', CCAA_LIST)}
        ${this.fieldSelect('tipo', 'Tipo de vivienda', [
          ['segunda', 'Segunda mano'],
          ['nueva', 'Obra nueva'],
          ['vpo', 'VPO (obra nueva)'],
        ])}
      </div>

      ${this.fieldNum('hipoteca', 'Importe hipoteca (€, 0 si sin hipoteca)', '0', '200000')}

      <button class="nc-btn" id="calcular">Calcular gastos</button>

      <div id="resultados" class="nc-hidden"></div>
    `;
  }

  protected setupListeners(): void {
    this.qs('#calcular')?.addEventListener('click', () => this.calcular());
  }

  private calcular(): void {
    const precio = this.numVal('precio');
    const ccaa = this.strVal('ccaa') as ComunidadId;
    const tipo = this.strVal('tipo');
    const hipoteca = this.numVal('hipoteca');

    if (precio <= 0) return;

    const esNueva = tipo === 'nueva' || tipo === 'vpo';
    const esVPO = tipo === 'vpo';
    const r = calcularGastosVivienda(precio, ccaa, esNueva, hipoteca, esVPO);

    const div = this.qs('#resultados')!;
    div.classList.remove('nc-hidden');

    div.innerHTML = `
      <div class="nc-results">
        <h3>Coste total de la compra</h3>
        ${this.resultRow('Precio vivienda', this.fmtEur(r.precioVivienda))}
        ${this.resultRow('Total gastos e impuestos', this.fmtEur(r.totalCoste), true)}
        ${this.resultRow('Desembolso total', this.fmtEur(r.precioVivienda + r.totalCoste), true)}
        ${this.resultRow('% sobre precio', this.fmtPercent(r.porcentajeSobrePrecio))}

        <div class="nc-divider"></div>
        <h3>Impuestos</h3>
        ${this.resultRow(r.nombreImpuesto + ' (' + this.fmtPercent(r.tipoTransmision) + ')', this.fmtEur(r.impuestoTransmision))}
        ${r.ajd > 0 ? this.resultRow('AJD (' + this.fmtPercent(r.tipoAJD) + ')', this.fmtEur(r.ajd)) : ''}
        ${this.resultRow('Total impuestos', this.fmtEur(r.totalImpuestos))}

        <div class="nc-divider"></div>
        <h3>Gastos</h3>
        ${this.resultRow('Notaría', this.fmtEur(r.notaria))}
        ${this.resultRow('Registro de la propiedad', this.fmtEur(r.registro))}
        ${this.resultRow('Gestoría', this.fmtEur(r.gestoria))}
        ${r.tasacion > 0 ? this.resultRow('Tasación', this.fmtEur(r.tasacion)) : ''}
        ${r.notariaHipoteca > 0 ? this.resultRow('Notaría hipoteca (tu parte)', this.fmtEur(r.notariaHipoteca)) : ''}
        ${this.resultRow('Total gastos', this.fmtEur(r.totalGastos))}

        ${hipoteca > 0 ? `
          <div class="nc-divider"></div>
          <h3>Ahorro necesario</h3>
          ${this.resultRow('Entrada (precio - hipoteca)', this.fmtEur(precio - hipoteca))}
          ${this.resultRow('Gastos e impuestos', this.fmtEur(r.totalCoste))}
          ${this.resultRow('Total ahorro necesario', this.fmtEur((precio - hipoteca) + r.totalCoste), true)}
        ` : ''}

        <p class="nc-note">
          ${esNueva ? 'Obra nueva: IVA ' + (esVPO ? '4%' : '10%') + ' + AJD.' : 'Segunda mano: ITP (varía por CCAA).'}
          Desde 2019 el AJD de la hipoteca lo paga el banco.
          Gastos notariales y registrales son estimaciones según aranceles oficiales.
          Datos 2025. Fuente: AEAT, aranceles RD 1426/1989 y RD 1427/1989.
        </p>
      </div>
    `;
  }
}

customElements.define('calc-gastos-vivienda', CalcGastosVivienda);
