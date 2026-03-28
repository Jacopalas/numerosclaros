import { CalcBase } from '../base.js';
import { calcPayoffVsInvest } from '../../../core/src/decisions/payoff-vs-invest.js';

class CalcAmortizarVsInvertir extends CalcBase {
  render() {
    return `
      <div class="card">
        <div class="title">Amortizar hipoteca vs Invertir</div>
        <div class="subtitle">Descubre qué te conviene más con tu dinero extra</div>

        <div class="form-grid">
          <div class="form-group">
            <label for="deudaPendiente">Deuda pendiente (€)</label>
            <input type="number" id="deudaPendiente" value="150000" min="0" step="1000">
          </div>
          <div class="form-group">
            <label for="tipoInteres">Tipo de interés (%)</label>
            <input type="number" id="tipoInteres" value="2.5" min="0" step="0.1">
          </div>
          <div class="form-group">
            <label for="anosRestantes">Años restantes</label>
            <input type="number" id="anosRestantes" value="20" min="1" step="1">
          </div>
          <div class="form-group">
            <label for="cantidadExtra">Cantidad extra (€)</label>
            <input type="number" id="cantidadExtra" value="20000" min="0" step="1000">
          </div>
          <div class="form-group">
            <label for="rentabilidadEsperada">Rentabilidad esperada (%)</label>
            <input type="number" id="rentabilidadEsperada" value="7" min="0" step="0.1">
          </div>
          <div class="form-group" style="justify-content: flex-end;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="deduccionFiscal">
              Deducción vivienda habitual (compra pre-2013)
            </label>
          </div>
        </div>

        <button class="btn btn-primary" id="btnComparar">Comparar</button>

        <div class="results" id="results"></div>
      </div>
    `;
  }

  setupListeners() {
    this.$('#btnComparar').addEventListener('click', () => {
      const deudaPendiente = this.getVal('deudaPendiente');
      const tipoInteres = this.getVal('tipoInteres') / 100;
      const anosRestantes = this.getVal('anosRestantes');
      const cantidadExtra = this.getVal('cantidadExtra');
      const rentabilidadEsperada = this.getVal('rentabilidadEsperada') / 100;
      const deduccionFiscal = this.$('#deduccionFiscal').checked;

      const result = calcPayoffVsInvest({
        deudaPendiente,
        tipoInteres,
        anosRestantes,
        cantidadExtra,
        rentabilidadEsperada,
        deduccionFiscal,
      });

      const resultsEl = this.$('#results');
      resultsEl.classList.add('visible');

      const anosLabel = Math.floor(result.amortizacion.nuevoPlazo / 12);
      const mesesLabel = result.amortizacion.nuevoPlazo % 12;
      const nuevoPlazoStr = anosLabel > 0
        ? `${anosLabel} años${mesesLabel > 0 ? ` y ${mesesLabel} meses` : ''}`
        : `${mesesLabel} meses`;

      // Chart data
      const labels = result.datosAnuales.map(d => `Año ${d.ano}`);
      const chartHtml = this.renderLineChart({
        series: [
          { name: 'Beneficio amortizar', data: result.datosAnuales.map(d => d.beneficioAmortizar) },
          { name: 'Beneficio invertir', data: result.datosAnuales.map(d => d.beneficioInvertir) },
        ],
        labels,
        title: 'Beneficio acumulado a lo largo del tiempo',
      });

      resultsEl.innerHTML = `
        <div class="comparison">
          <div class="option-card option-a">
            <div class="option-header">Amortizar</div>
            <div class="option-value">${this.formatEur(result.amortizacion.ahorroIntereses)}</div>
            <div class="option-label">Ahorro en intereses</div>
            <div class="stat-row">
              <span class="stat-label">Meses ahorrados</span>
              <span class="stat-value">${result.amortizacion.mesesAhorrados} meses</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Nuevo plazo</span>
              <span class="stat-value">${nuevoPlazoStr}</span>
            </div>
            ${result.amortizacion.ahorroFiscal > 0 ? `
            <div class="stat-row">
              <span class="stat-label">Ahorro fiscal</span>
              <span class="stat-value">${this.formatEur(result.amortizacion.ahorroFiscal)}</span>
            </div>` : ''}
          </div>

          <div class="option-card option-b">
            <div class="option-header">Invertir</div>
            <div class="option-value">${this.formatEur(result.inversion.gananciaReal)}</div>
            <div class="option-label">Ganancia neta de inversión</div>
            <div class="stat-row">
              <span class="stat-label">Valor bruto</span>
              <span class="stat-value">${this.formatEur(result.inversion.valorFinal)}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Impuestos</span>
              <span class="stat-value">-${this.formatEur(result.inversion.impuestos)}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Valor neto</span>
              <span class="stat-value">${this.formatEur(result.inversion.valorNeto)}</span>
            </div>
          </div>
        </div>

        <div class="card" style="background: var(--nc-bg-subtle); border: 1px solid var(--nc-border); margin: 24px 0; padding: 16px;">
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--nc-muted); margin-bottom: 8px;">Punto de equilibrio</div>
          <div style="font-size: 1.2rem; font-weight: 700; color: var(--nc-text);">
            Rentabilidad necesaria: ${this.formatPct(result.rentabilidadEquilibrio)}
          </div>
          <div style="font-size: 0.85rem; color: var(--nc-muted); margin-top: 4px;">
            Por encima de este porcentaje, invertir supera a amortizar
          </div>
        </div>

        ${chartHtml}

        ${this.renderVerdict(result.veredicto)}

        ${this.renderWhy(result.explicacion)}
      `;

      this.setupWhyToggle();
    });
  }
}

customElements.define('calc-amortizar-vs-invertir', CalcAmortizarVsInvertir);
