import { CalcBase } from '../base.js';
import { calcPensionVsFund } from '../../../core/src/decisions/pension-vs-fund.js';

class CalcPensionVsFondo extends CalcBase {
  render() {
    return `
      <div class="card">
        <div class="title">Plan de Pensiones vs Fondo Indexado</div>
        <div class="subtitle">Compara la ventaja fiscal real de cada opción para tu situación</div>

        <div class="form-grid">
          <div class="form-group">
            <label for="aportacionAnual">Aportación anual (€)</label>
            <input type="number" id="aportacionAnual" value="3000" min="0" step="100">
          </div>

          <div class="form-group">
            <label for="anosHastaJubilacion">Años hasta jubilación</label>
            <input type="number" id="anosHastaJubilacion" value="25" min="1" max="50">
          </div>

          <div class="form-group">
            <label for="tipoMarginalActual">Tipo marginal actual</label>
            <select id="tipoMarginalActual">
              <option value="0.19">19%</option>
              <option value="0.24">24%</option>
              <option value="0.30" selected>30%</option>
              <option value="0.37">37%</option>
              <option value="0.45">45%</option>
              <option value="0.47">47%</option>
            </select>
          </div>

          <div class="form-group">
            <label for="tipoMarginalJubilacion">Tipo marginal en jubilación</label>
            <select id="tipoMarginalJubilacion">
              <option value="0.19" selected>19%</option>
              <option value="0.24">24%</option>
              <option value="0.30">30%</option>
              <option value="0.37">37%</option>
              <option value="0.45">45%</option>
              <option value="0.47">47%</option>
            </select>
          </div>

          <div class="form-group">
            <label for="rentabilidadAnual">Rentabilidad anual estimada (%)</label>
            <input type="number" id="rentabilidadAnual" value="7" min="0" max="30" step="0.5">
          </div>
        </div>

        <button class="btn btn-primary" id="btnComparar">Comparar</button>

        <div class="results" id="results"></div>
      </div>
    `;
  }

  setupListeners() {
    this.$('#btnComparar').addEventListener('click', () => this.calcular());
  }

  calcular() {
    const aportacionAnual = this.getVal('aportacionAnual');
    const anosHastaJubilacion = this.getVal('anosHastaJubilacion');
    const tipoMarginalActual = parseFloat(this.$('#tipoMarginalActual').value);
    const tipoMarginalJubilacion = parseFloat(this.$('#tipoMarginalJubilacion').value);
    const rentabilidadAnual = this.getVal('rentabilidadAnual') / 100;

    const result = calcPensionVsFund({
      aportacionAnual,
      anosHastaJubilacion,
      tipoMarginalActual,
      tipoMarginalJubilacion,
      rentabilidadAnual,
    });

    const { pension, fondo, mixto, datosAnuales, veredicto, explicacion } = result;

    // Build chart data
    const labels = datosAnuales.map(d => `Año ${d.ano}`);
    const chartHtml = this.renderLineChart({
      series: [
        { name: 'Plan de Pensiones', data: datosAnuales.map(d => d.valorPension) },
        { name: 'Fondo Indexado', data: datosAnuales.map(d => d.valorFondo) },
      ],
      labels,
      title: 'Valor acumulado a lo largo del tiempo',
    });

    // Mixto note
    let mixtoHtml = '';
    if (mixto) {
      mixtoHtml = `
        <div class="card" style="margin-top: 16px; background: var(--nc-bg-subtle);">
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--nc-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
            Estrategia mixta recomendada
          </div>
          <div style="font-size: 0.9rem; color: var(--nc-muted); line-height: 1.6;">
            Combinando plan de pensiones (hasta el máximo legal) + fondo indexado con el exceso:
          </div>
          <div style="margin-top: 12px;">
            <div class="stat-row">
              <span class="stat-label">Valor bruto combinado</span>
              <span class="stat-value">${this.formatEur(mixto.valorBruto)}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Impuestos totales</span>
              <span class="stat-value">${this.formatEur(mixto.impuestos)}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Valor neto combinado</span>
              <span class="stat-value" style="color: var(--nc-success);">${this.formatEur(mixto.valorNeto)}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Ahorro fiscal total</span>
              <span class="stat-value">${this.formatEur(mixto.ahorroFiscalTotal)}</span>
            </div>
          </div>
        </div>
      `;
    }

    const resultsHtml = `
      <div class="comparison">
        <div class="option-card option-a">
          <div class="option-header">Plan de Pensiones</div>
          <div class="option-value">${this.formatEur(pension.valorNeto)}</div>
          <div class="option-label">Valor neto tras impuestos</div>
          <div class="stat-row">
            <span class="stat-label">Valor bruto</span>
            <span class="stat-value">${this.formatEur(pension.valorBruto)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Impuestos al rescate</span>
            <span class="stat-value" style="color: var(--nc-danger);">-${this.formatEur(pension.impuestoRescate)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Valor neto</span>
            <span class="stat-value">${this.formatEur(pension.valorNeto)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Ahorro fiscal acumulado</span>
            <span class="stat-value" style="color: var(--nc-success);">${this.formatEur(pension.ahorroFiscalTotal)}</span>
          </div>
        </div>

        <div class="option-card option-b">
          <div class="option-header">Fondo Indexado</div>
          <div class="option-value">${this.formatEur(fondo.valorNeto)}</div>
          <div class="option-label">Valor neto tras impuestos</div>
          <div class="stat-row">
            <span class="stat-label">Valor bruto</span>
            <span class="stat-value">${this.formatEur(fondo.valorBruto)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Impuestos sobre ganancias</span>
            <span class="stat-value" style="color: var(--nc-danger);">-${this.formatEur(fondo.impuestoVenta)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Valor neto</span>
            <span class="stat-value">${this.formatEur(fondo.valorNeto)}</span>
          </div>
        </div>
      </div>

      ${mixtoHtml}

      ${chartHtml}

      ${this.renderVerdict(veredicto)}

      ${this.renderWhy(explicacion)}
    `;

    const resultsEl = this.$('#results');
    resultsEl.innerHTML = resultsHtml;
    resultsEl.classList.add('visible');

    this.setupWhyToggle();
  }
}

customElements.define('calc-pension-vs-fondo', CalcPensionVsFondo);
