import { CalcBase } from '../base.js';
import { calcSnowballVsAvalanche } from '../../../core/src/decisions/snowball-vs-avalanche.js';

const DEFAULT_DEBTS = [
  { nombre: 'Tarjeta VISA', saldo: 3000, tipoInteres: 22, cuotaMinima: 60 },
  { nombre: 'Préstamo coche', saldo: 8000, tipoInteres: 7, cuotaMinima: 200 },
  { nombre: 'Préstamo personal', saldo: 5000, tipoInteres: 12, cuotaMinima: 150 },
];

class CalcSnowballVsAvalanche extends CalcBase {
  render() {
    const debtRows = DEFAULT_DEBTS.map((d, i) => this._debtRowHTML(i, d)).join('');

    return `
      <div class="card">
        <div class="title">Snowball vs Avalanche</div>
        <div class="subtitle">Compara las dos estrategias más populares para liquidar deudas y descubre cuál te conviene más.</div>

        <div class="debts-section">
          <label style="display:block; margin-bottom:8px;">Tus deudas</label>
          <div id="debt-list">
            ${debtRows}
          </div>
          <button class="btn" id="btn-add-debt" style="margin-top:8px; padding:8px 16px; font-size:0.85rem; background:var(--nc-bg-subtle); color:var(--nc-primary); border:1px solid var(--nc-border);">
            + Añadir deuda
          </button>
        </div>

        <div class="form-grid" style="margin-top:24px;">
          <div class="form-group">
            <label for="pagoExtraMensual">Pago extra mensual</label>
            <input type="number" id="pagoExtraMensual" value="300" min="0" step="50">
          </div>
        </div>

        <button class="btn btn-primary" id="btn-calc" style="width:100%;">Comparar</button>

        <div class="results" id="results"></div>
      </div>
    `;
  }

  _debtRowHTML(index, data = {}) {
    const { nombre = '', saldo = '', tipoInteres = '', cuotaMinima = '' } = data;
    return `
      <div class="debt-row form-grid" style="margin-bottom:8px; align-items:end;" data-index="${index}">
        <div class="form-group">
          <label>Nombre</label>
          <input type="text" class="debt-nombre" value="${nombre}" placeholder="Nombre de la deuda">
        </div>
        <div class="form-group">
          <label>Saldo</label>
          <input type="number" class="debt-saldo" value="${saldo}" min="0" step="100" placeholder="0">
        </div>
        <div class="form-group">
          <label>Tipo interés (%)</label>
          <input type="number" class="debt-interes" value="${tipoInteres}" min="0" step="0.1" placeholder="0">
        </div>
        <div class="form-group">
          <label>Cuota mínima</label>
          <input type="number" class="debt-cuota" value="${cuotaMinima}" min="0" step="10" placeholder="0">
        </div>
      </div>
    `;
  }

  setupListeners() {
    this.$('#btn-add-debt').addEventListener('click', () => {
      const list = this.$('#debt-list');
      const index = this.$$('.debt-row').length;
      const div = document.createElement('div');
      div.innerHTML = this._debtRowHTML(index);
      list.appendChild(div.firstElementChild);
    });

    this.$('#btn-calc').addEventListener('click', () => this._calculate());
  }

  _readDebts() {
    const rows = this.$$('.debt-row');
    const deudas = [];
    rows.forEach(row => {
      const nombre = row.querySelector('.debt-nombre').value.trim();
      const saldo = parseFloat(row.querySelector('.debt-saldo').value) || 0;
      const tipoInteres = (parseFloat(row.querySelector('.debt-interes').value) || 0) / 100;
      const cuotaMinima = parseFloat(row.querySelector('.debt-cuota').value) || 0;
      if (nombre && saldo > 0) {
        deudas.push({ nombre, saldo, tipoInteres, cuotaMinima });
      }
    });
    return deudas;
  }

  _calculate() {
    const deudas = this._readDebts();
    const pagoExtraMensual = this.getVal('pagoExtraMensual');

    if (deudas.length === 0) {
      const results = this.$('#results');
      results.innerHTML = `
        <div class="verdict" style="background:var(--nc-warning); margin-top:24px;">
          <div class="verdict-text">Introduce al menos una deuda con nombre y saldo para comparar.</div>
        </div>
      `;
      results.classList.add('visible');
      return;
    }

    const r = calcSnowballVsAvalanche({ deudas, pagoExtraMensual });

    if (!r.snowball) {
      const results = this.$('#results');
      results.innerHTML = this.renderVerdict(r.veredicto);
      results.classList.add('visible');
      return;
    }

    const { snowball, avalanche, datosAnuales, veredicto, explicacion } = r;

    // Build chart data
    const labels = datosAnuales.map(d => `Mes ${d.mes}`);
    const chartHTML = this.renderLineChart({
      series: [
        { name: 'Snowball', data: datosAnuales.map(d => d.restanteSnowball) },
        { name: 'Avalanche', data: datosAnuales.map(d => d.restanteAvalanche) },
      ],
      labels,
      title: 'Deuda restante a lo largo del tiempo',
    });

    const html = `
      <div class="comparison">
        <div class="option-card option-a">
          <div class="option-header">Snowball</div>
          <div class="option-value">${this.formatEur(snowball.totalIntereses)}</div>
          <div class="option-label">Total intereses pagados</div>
          <div class="stat-row">
            <span class="stat-label">Meses hasta libre de deuda</span>
            <span class="stat-value">${snowball.mesesTotal}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Primera deuda liquidada</span>
            <span class="stat-value">Mes ${snowball.primeraDeudaLiquidada}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Orden de pago</span>
            <span class="stat-value" style="text-align:right;">${snowball.ordenPago.join(' → ')}</span>
          </div>
        </div>
        <div class="option-card option-b">
          <div class="option-header">Avalanche</div>
          <div class="option-value">${this.formatEur(avalanche.totalIntereses)}</div>
          <div class="option-label">Total intereses pagados</div>
          <div class="stat-row">
            <span class="stat-label">Meses hasta libre de deuda</span>
            <span class="stat-value">${avalanche.mesesTotal}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Primera deuda liquidada</span>
            <span class="stat-value">Mes ${avalanche.primeraDeudaLiquidada}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Orden de pago</span>
            <span class="stat-value" style="text-align:right;">${avalanche.ordenPago.join(' → ')}</span>
          </div>
        </div>
      </div>

      ${chartHTML}
      ${this.renderVerdict(veredicto)}
      ${this.renderWhy(explicacion)}
    `;

    const results = this.$('#results');
    results.innerHTML = html;
    results.classList.add('visible');

    this.setupWhyToggle();
  }
}

customElements.define('calc-snowball-vs-avalanche', CalcSnowballVsAvalanche);
