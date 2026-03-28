import { CalcBase } from '../base.js';
import { calcFixedVsVariable } from '../../../core/src/decisions/fixed-vs-variable.js';

class CalcFijoVsVariable extends CalcBase {
  render() {
    return `
      <div class="card">
        <div class="title">Hipoteca: Tipo Fijo vs Variable</div>
        <div class="subtitle">Compara cuotas y coste total en 3 escenarios de Euríbor</div>

        <div class="form-grid">
          <div class="form-group">
            <label for="importeHipoteca">Importe de la hipoteca (€)</label>
            <input type="number" id="importeHipoteca" value="200000" min="0" step="1000">
          </div>
          <div class="form-group">
            <label for="anosHipoteca">Plazo (años)</label>
            <input type="number" id="anosHipoteca" value="25" min="1" max="40">
          </div>
          <div class="form-group">
            <label for="tipoFijo">Tipo fijo ofrecido (%)</label>
            <input type="number" id="tipoFijo" value="2.5" min="0" step="0.01">
          </div>
          <div class="form-group">
            <label for="euriborActual">Euríbor actual (%)</label>
            <input type="number" id="euriborActual" value="3.5" min="0" step="0.01">
          </div>
          <div class="form-group">
            <label for="diferencialVariable">Diferencial variable (%)</label>
            <input type="number" id="diferencialVariable" value="0.80" min="0" step="0.01">
          </div>
        </div>

        <button class="btn btn-primary" id="btnComparar">Comparar</button>

        <div class="results" id="resultados"></div>
      </div>
    `;
  }

  setupListeners() {
    this.$('#btnComparar').addEventListener('click', () => {
      const input = {
        importeHipoteca: this.getVal('importeHipoteca'),
        anosHipoteca: this.getVal('anosHipoteca'),
        tipoFijo: this.getVal('tipoFijo') / 100,
        euriborActual: this.getVal('euriborActual') / 100,
        diferencialVariable: this.getVal('diferencialVariable') / 100,
      };

      const r = calcFixedVsVariable(input);
      this.showResults(r, input.anosHipoteca);
    });
  }

  showResults(r, anosHipoteca) {
    const container = this.$('#resultados');

    // Build scenario rows for the variable card
    const scenarioRows = r.resultadosVariable.map(esc => `
      <div class="stat-row">
        <span class="stat-label">${esc.nombre}</span>
        <span class="stat-value">${this.formatEurDec(esc.cuotasAnuales[0])}/mes</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">&nbsp;&nbsp;Cuota máxima</span>
        <span class="stat-value">${this.formatEurDec(esc.cuotaMaxima)}/mes</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">&nbsp;&nbsp;Coste total</span>
        <span class="stat-value">${this.formatEur(esc.costeTotal)}</span>
      </div>
    `).join('');

    // Comparison cards
    const comparison = `
      <div class="comparison">
        <div class="option-card option-a">
          <div class="option-header">Tipo Fijo</div>
          <div class="option-value">${this.formatEurDec(r.cuotaFija)}</div>
          <div class="option-label">cuota mensual fija</div>
          <div class="stat-row">
            <span class="stat-label">Tipo de interés</span>
            <span class="stat-value">${(r.tipoFijo * 100).toFixed(2)}%</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Coste total</span>
            <span class="stat-value">${this.formatEur(r.costeTotalFijo)}</span>
          </div>
        </div>
        <div class="option-card option-b">
          <div class="option-header">Tipo Variable</div>
          <div class="option-value">${this.formatEurDec(r.resultadosVariable[1].cuotasAnuales[0])}</div>
          <div class="option-label">cuota inicial (Euríbor estable)</div>
          ${scenarioRows}
        </div>
      </div>
    `;

    // Line chart: coste acumulado over years
    const labels = r.datosAnuales.map(d => `Año ${d.ano}`);
    const series = [
      { name: 'Fijo', data: r.datosAnuales.map(d => d.costeFijo) },
      ...r.resultadosVariable.map(esc => ({
        name: esc.nombre,
        data: r.datosAnuales.map(d => d[`coste_${esc.nombre}`]),
      })),
    ];

    const chart = this.renderLineChart({
      series,
      labels,
      title: 'Coste acumulado a lo largo de los años',
    });

    // Verdict + why
    const verdict = this.renderVerdict(r.veredicto);
    const why = this.renderWhy(r.explicacion);

    container.innerHTML = comparison + chart + verdict + why;
    container.classList.add('visible');

    this.setupWhyToggle();
  }
}

customElements.define('calc-fijo-vs-variable', CalcFijoVsVariable);
