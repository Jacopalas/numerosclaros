// CalcBase: Clase base para todos los Web Components decisores de NumerosClaros

export class CalcBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._fmt = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
    this._fmtDec = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
    this._pctFmt = new Intl.NumberFormat('es-ES', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 2 });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `<style>${this.baseStyles()}</style>${this.render()}`;
    this.setupListeners();
  }

  formatEur(n) { return this._fmt.format(n); }
  formatEurDec(n) { return this._fmtDec.format(n); }
  formatPct(n) { return this._pctFmt.format(n); }

  $(sel) { return this.shadowRoot.querySelector(sel); }
  $$(sel) { return this.shadowRoot.querySelectorAll(sel); }

  getVal(id) {
    const el = this.$(`#${id}`);
    return el ? parseFloat(el.value) || 0 : 0;
  }

  baseStyles() {
    return `
      :host {
        --nc-primary: #1a56db;
        --nc-bg: #ffffff;
        --nc-text: #111827;
        --nc-border: #e5e7eb;
        --nc-accent: #059669;
        --nc-option-a: #1a56db;
        --nc-option-b: #9333ea;
        --nc-danger: #dc2626;
        --nc-warning: #d97706;
        --nc-success: #059669;
        --nc-muted: #6b7280;
        --nc-bg-subtle: #f9fafb;
        --nc-radius: 12px;
        --nc-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
        --nc-shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);

        display: block;
        font-family: system-ui, -apple-system, sans-serif;
        color: var(--nc-text);
        background: var(--nc-bg);
        max-width: 900px;
        margin: 0 auto;
      }

      * { box-sizing: border-box; margin: 0; padding: 0; }

      .card {
        background: var(--nc-bg);
        border: 1px solid var(--nc-border);
        border-radius: var(--nc-radius);
        padding: 24px;
        box-shadow: var(--nc-shadow);
      }

      .title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--nc-text);
        margin-bottom: 4px;
      }

      .subtitle {
        font-size: 0.95rem;
        color: var(--nc-muted);
        margin-bottom: 24px;
      }

      /* Form inputs */
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 24px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .form-group.full { grid-column: 1 / -1; }

      label {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--nc-muted);
      }

      input, select {
        padding: 10px 12px;
        border: 1px solid var(--nc-border);
        border-radius: 8px;
        font-size: 1rem;
        font-family: inherit;
        color: var(--nc-text);
        background: var(--nc-bg);
        transition: border-color 0.15s;
      }

      input:focus, select:focus {
        outline: none;
        border-color: var(--nc-primary);
        box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.1);
      }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: all 0.15s;
      }

      .btn-primary {
        background: var(--nc-primary);
        color: white;
      }
      .btn-primary:hover { opacity: 0.9; }

      /* Two-column comparison layout */
      .comparison {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin: 24px 0;
      }

      .option-card {
        border-radius: var(--nc-radius);
        padding: 20px;
        border: 2px solid;
      }

      .option-a {
        border-color: var(--nc-option-a);
        background: rgba(26, 86, 219, 0.03);
      }

      .option-b {
        border-color: var(--nc-option-b);
        background: rgba(147, 51, 234, 0.03);
      }

      .option-header {
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 12px;
      }

      .option-a .option-header { color: var(--nc-option-a); }
      .option-b .option-header { color: var(--nc-option-b); }

      .option-value {
        font-size: 1.8rem;
        font-weight: 800;
        margin-bottom: 4px;
      }

      .option-a .option-value { color: var(--nc-option-a); }
      .option-b .option-value { color: var(--nc-option-b); }

      .option-label {
        font-size: 0.85rem;
        color: var(--nc-muted);
        margin-bottom: 12px;
      }

      .stat-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid var(--nc-border);
        font-size: 0.9rem;
      }

      .stat-row:last-child { border-bottom: none; }
      .stat-label { color: var(--nc-muted); }
      .stat-value { font-weight: 600; }

      /* Verdict bar */
      .verdict {
        background: linear-gradient(135deg, #059669, #047857);
        color: white;
        border-radius: var(--nc-radius);
        padding: 24px;
        margin: 24px 0;
        box-shadow: var(--nc-shadow-lg);
      }

      .verdict-label {
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        opacity: 0.85;
        margin-bottom: 8px;
      }

      .verdict-option {
        font-size: 1.5rem;
        font-weight: 800;
        margin-bottom: 8px;
      }

      .verdict-text {
        font-size: 1.05rem;
        line-height: 1.5;
        opacity: 0.95;
      }

      /* Why section (collapsible) */
      .why-section {
        margin-top: 16px;
      }

      .why-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        background: none;
        border: 1px solid var(--nc-border);
        border-radius: 8px;
        padding: 10px 16px;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--nc-muted);
        cursor: pointer;
        font-family: inherit;
        width: 100%;
        text-align: left;
      }

      .why-toggle:hover { background: var(--nc-bg-subtle); }

      .why-toggle .arrow {
        transition: transform 0.2s;
        font-size: 0.7rem;
      }

      .why-toggle.open .arrow { transform: rotate(90deg); }

      .why-content {
        display: none;
        padding: 16px;
        margin-top: 8px;
        background: var(--nc-bg-subtle);
        border-radius: 8px;
        font-size: 0.9rem;
        line-height: 1.6;
        color: var(--nc-muted);
      }

      .why-content.open { display: block; }

      .why-content p {
        margin-bottom: 8px;
      }

      .why-content p:last-child { margin-bottom: 0; }

      /* Chart area */
      .chart-container {
        margin: 24px 0;
        padding: 16px;
        background: var(--nc-bg-subtle);
        border-radius: var(--nc-radius);
        overflow-x: auto;
      }

      .chart-container svg {
        width: 100%;
        height: auto;
      }

      .chart-title {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--nc-muted);
        margin-bottom: 12px;
      }

      /* Results hidden initially */
      .results { display: none; }
      .results.visible { display: block; }

      /* Responsive */
      @media (max-width: 640px) {
        .form-grid { grid-template-columns: 1fr; }
        .comparison { grid-template-columns: 1fr; }
        .option-value { font-size: 1.4rem; }
        .verdict-option { font-size: 1.2rem; }
        .card { padding: 16px; }
      }
    `;
  }

  // Override in subclasses
  render() { return ''; }
  setupListeners() {}

  // SVG line chart helper
  renderLineChart({ series, labels, width = 800, height = 300, title = '' }) {
    const pad = { top: 30, right: 20, bottom: 40, left: 70 };
    const w = width - pad.left - pad.right;
    const h = height - pad.top - pad.bottom;

    // Find ranges
    const allValues = series.flatMap(s => s.data);
    const maxVal = Math.max(...allValues) * 1.1;
    const minVal = Math.min(0, Math.min(...allValues));
    const range = maxVal - minVal || 1;
    const numPoints = labels.length;

    const x = i => pad.left + (i / Math.max(1, numPoints - 1)) * w;
    const y = v => pad.top + h - ((v - minVal) / range) * h;

    // Grid lines
    const gridLines = 5;
    let gridSvg = '';
    for (let i = 0; i <= gridLines; i++) {
      const val = minVal + (range * i) / gridLines;
      const yPos = y(val);
      gridSvg += `<line x1="${pad.left}" y1="${yPos}" x2="${width - pad.right}" y2="${yPos}" stroke="#e5e7eb" stroke-width="1"/>`;
      gridSvg += `<text x="${pad.left - 8}" y="${yPos + 4}" text-anchor="end" fill="#6b7280" font-size="11">${this.formatEur(val)}</text>`;
    }

    // X axis labels
    let xLabels = '';
    const step = Math.max(1, Math.floor(numPoints / 10));
    for (let i = 0; i < numPoints; i += step) {
      xLabels += `<text x="${x(i)}" y="${height - 8}" text-anchor="middle" fill="#6b7280" font-size="11">${labels[i]}</text>`;
    }

    // Lines
    const colors = ['#1a56db', '#9333ea', '#059669', '#dc2626', '#d97706'];
    let linesSvg = '';
    let legendSvg = '';

    series.forEach((s, si) => {
      const color = colors[si % colors.length];
      const points = s.data.map((v, i) => `${x(i)},${y(v)}`).join(' ');
      linesSvg += `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;

      // Legend
      const lx = pad.left + si * 180;
      legendSvg += `<rect x="${lx}" y="8" width="12" height="12" rx="2" fill="${color}"/>`;
      legendSvg += `<text x="${lx + 16}" y="18" fill="#374151" font-size="12" font-weight="500">${s.name}</text>`;
    });

    return `
      <div class="chart-container">
        ${title ? `<div class="chart-title">${title}</div>` : ''}
        <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
          ${gridSvg}
          ${linesSvg}
          ${xLabels}
          ${legendSvg}
        </svg>
      </div>
    `;
  }

  // Verdict HTML helper
  renderVerdict(veredicto) {
    return `
      <div class="verdict">
        <div class="verdict-label">Nuestro veredicto</div>
        <div class="verdict-option">${veredicto.opcion}</div>
        <div class="verdict-text">${veredicto.texto}</div>
      </div>
    `;
  }

  // Why section HTML helper
  renderWhy(explicacion) {
    const items = Array.isArray(explicacion) ? explicacion : [explicacion];
    return `
      <div class="why-section">
        <button class="why-toggle" data-toggle="why">
          <span class="arrow">&#9654;</span> ¿Por qué? — Explicación matemática detallada
        </button>
        <div class="why-content" data-content="why">
          ${items.map(t => `<p>${t}</p>`).join('')}
        </div>
      </div>
    `;
  }

  // Setup collapsible why section
  setupWhyToggle() {
    const toggle = this.$('[data-toggle="why"]');
    const content = this.$('[data-content="why"]');
    if (toggle && content) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('open');
        content.classList.toggle('open');
      });
    }
  }
}
