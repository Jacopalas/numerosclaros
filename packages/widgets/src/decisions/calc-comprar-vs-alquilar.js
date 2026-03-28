import { CalcBase } from '../base.js';
import { calcBuyVsRent } from '../../../core/src/decisions/buy-vs-rent.js';

class CalcComprarVsAlquilar extends CalcBase {
  render() {
    return `
      <div class="card">
        <div class="title">Comprar vs Alquilar</div>
        <div class="subtitle">Compara el coste real y patrimonio acumulado de ambas opciones</div>

        <div class="form-grid">
          <div class="form-group">
            <label for="precioVivienda">Precio de la vivienda (€)</label>
            <input type="number" id="precioVivienda" value="250000" min="0" step="1000">
          </div>
          <div class="form-group">
            <label for="alquilerMensual">Alquiler mensual (€)</label>
            <input type="number" id="alquilerMensual" value="900" min="0" step="50">
          </div>
          <div class="form-group">
            <label for="ahorroDisponible">Ahorro disponible (€)</label>
            <input type="number" id="ahorroDisponible" value="50000" min="0" step="1000">
          </div>
          <div class="form-group">
            <label for="anosHorizonte">Horizonte temporal (años)</label>
            <input type="number" id="anosHorizonte" value="20" min="1" max="30" step="1">
          </div>
          <div class="form-group">
            <label for="revalorizacionAnual">Revalorización anual (%)</label>
            <input type="number" id="revalorizacionAnual" value="2" min="0" max="20" step="0.1">
          </div>
          <div class="form-group">
            <label for="euribor">Euríbor (%)</label>
            <input type="number" id="euribor" value="3.5" min="0" max="15" step="0.1">
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
    const precioVivienda = this.getVal('precioVivienda');
    const alquilerMensual = this.getVal('alquilerMensual');
    const ahorroDisponible = this.getVal('ahorroDisponible');
    const anosHorizonte = this.getVal('anosHorizonte');
    const revalorizacionAnual = this.getVal('revalorizacionAnual') / 100;
    const euribor = this.getVal('euribor') / 100;

    const resultado = calcBuyVsRent({
      precioVivienda,
      alquilerMensual,
      ahorroDisponible,
      anosHorizonte,
      revalorizacionAnual,
      euribor,
    });

    const idxHorizonte = Math.min(anosHorizonte, resultado.datosAnuales.length) - 1;
    const dato = resultado.datosAnuales[idxHorizonte];

    const resumenHorizonte = resultado.resumenes.find(r => r.anos === anosHorizonte)
      || resultado.resumenes[resultado.resumenes.length - 1];

    const resultsEl = this.$('#results');
    resultsEl.innerHTML = `
      <div class="comparison">
        <div class="option-card option-a">
          <div class="option-header">Comprar</div>
          <div class="option-value">${this.formatEur(dato.patrimonioCompra)}</div>
          <div class="option-label">Patrimonio en ${anosHorizonte} años</div>
          <div class="stat-row">
            <span class="stat-label">Cuota hipoteca</span>
            <span class="stat-value">${this.formatEur(resultado.cuotaMensualHipoteca)}/mes</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Entrada + gastos</span>
            <span class="stat-value">${this.formatEur(resultado.entrada + resultado.gastosIniciales)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Coste total acumulado</span>
            <span class="stat-value">${this.formatEur(dato.costeCompra)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Cuota mes ${anosHorizonte * 12}</span>
            <span class="stat-value">${this.formatEur(dato.cuotaCompra)}/mes</span>
          </div>
        </div>

        <div class="option-card option-b">
          <div class="option-header">Alquilar</div>
          <div class="option-value">${this.formatEur(dato.patrimonioAlquiler)}</div>
          <div class="option-label">Patrimonio en ${anosHorizonte} años</div>
          <div class="stat-row">
            <span class="stat-label">Alquiler inicial</span>
            <span class="stat-value">${this.formatEur(alquilerMensual)}/mes</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Ahorro invertido</span>
            <span class="stat-value">${this.formatEur(ahorroDisponible)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Coste total acumulado</span>
            <span class="stat-value">${this.formatEur(dato.costeAlquiler)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Alquiler mes ${anosHorizonte * 12}</span>
            <span class="stat-value">${this.formatEur(dato.cuotaAlquiler)}/mes</span>
          </div>
        </div>
      </div>

      ${this.renderLineChart({
        series: [
          { name: 'Patrimonio Comprar', data: resultado.datosAnuales.map(d => d.patrimonioCompra) },
          { name: 'Patrimonio Alquilar', data: resultado.datosAnuales.map(d => d.patrimonioAlquiler) },
        ],
        labels: resultado.datosAnuales.map(d => `Año ${d.ano}`),
        title: 'Evolución del patrimonio neto',
      })}

      ${this.renderVerdict(resultado.veredicto)}

      ${this.renderWhy(resultado.explicacion)}
    `;

    resultsEl.classList.add('visible');
    this.setupWhyToggle();
  }
}

customElements.define('calc-comprar-vs-alquilar', CalcComprarVsAlquilar);
