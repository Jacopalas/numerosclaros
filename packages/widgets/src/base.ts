/**
 * CalcBase — Clase base para todas las calculadoras NumerosClaros.
 * Shadow DOM con estilos encapsulados, responsive mobile-first.
 */
export abstract class CalcBase extends HTMLElement {
  protected shadow: ShadowRoot;
  protected container: HTMLDivElement;

  /** Formateador de números al estilo español */
  protected fmt = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  protected fmtInt = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  protected fmtPct = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'percent',
  });

  /** Formatear como moneda EUR */
  protected fmtEur(n: number): string {
    return this.fmt.format(n) + ' €';
  }

  /** Formatear como porcentaje */
  protected fmtPercent(n: number): string {
    return this.fmt.format(n * 100) + ' %';
  }

  static get observedAttributes() {
    return ['theme', 'lang'];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.container = document.createElement('div');
    this.container.classList.add('nc-calc');
    this.shadow.appendChild(this.createStyles());
    this.shadow.appendChild(this.container);
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
  }

  attributeChangedCallback(_name: string, _old: string, _val: string) {
    if (_name === 'theme') {
      this.container.setAttribute('data-theme', _val);
    }
  }

  /** Cada calculadora implementa su UI */
  protected abstract render(): void;

  /** Cada calculadora conecta sus event listeners */
  protected abstract setupListeners(): void;

  /** Helper: crear un elemento con HTML interno */
  protected el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    attrs?: Record<string, string>,
    html?: string
  ): HTMLElementTagNameMap[K] {
    const e = document.createElement(tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    if (html) e.innerHTML = html;
    return e;
  }

  /** Helper: query dentro del shadow DOM */
  protected qs<T extends Element = HTMLElement>(sel: string): T | null {
    return this.shadow.querySelector<T>(sel);
  }

  /** Helper: query all dentro del shadow DOM */
  protected qsa<T extends Element = HTMLElement>(sel: string): NodeListOf<T> {
    return this.shadow.querySelectorAll<T>(sel);
  }

  private createStyles(): HTMLStyleElement {
    const style = document.createElement('style');
    style.textContent = `
      :host {
        --nc-primary: #1a56db;
        --nc-bg: #ffffff;
        --nc-text: #111827;
        --nc-border: #e5e7eb;
        --nc-accent: #059669;
        --nc-error: #dc2626;
        --nc-muted: #6b7280;
        --nc-surface: #f9fafb;
        --nc-radius: 8px;
        display: block;
        font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
        color: var(--nc-text);
        line-height: 1.5;
      }

      :host([theme="dark"]) {
        --nc-bg: #1f2937;
        --nc-text: #f9fafb;
        --nc-border: #374151;
        --nc-surface: #111827;
        --nc-muted: #9ca3af;
      }

      .nc-calc {
        background: var(--nc-bg);
        border: 1px solid var(--nc-border);
        border-radius: var(--nc-radius);
        padding: 1.5rem;
        max-width: 640px;
        margin: 0 auto;
      }

      h2 {
        margin: 0 0 0.25rem;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--nc-text);
      }

      .nc-subtitle {
        margin: 0 0 1.25rem;
        font-size: 0.875rem;
        color: var(--nc-muted);
      }

      .nc-field {
        margin-bottom: 1rem;
      }

      label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 0.25rem;
        color: var(--nc-text);
      }

      input[type="number"],
      input[type="text"],
      select {
        width: 100%;
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--nc-border);
        border-radius: var(--nc-radius);
        font-size: 1rem;
        font-family: inherit;
        background: var(--nc-bg);
        color: var(--nc-text);
        box-sizing: border-box;
        transition: border-color 0.15s;
      }

      input:focus, select:focus {
        outline: none;
        border-color: var(--nc-primary);
        box-shadow: 0 0 0 3px rgba(26,86,219,0.15);
      }

      .nc-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      @media (max-width: 480px) {
        .nc-row {
          grid-template-columns: 1fr;
        }
        .nc-calc {
          padding: 1rem;
        }
      }

      .nc-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.625rem 1.25rem;
        background: var(--nc-primary);
        color: #fff;
        border: none;
        border-radius: var(--nc-radius);
        font-size: 0.9375rem;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: background 0.15s;
        width: 100%;
        margin-top: 0.5rem;
      }

      .nc-btn:hover {
        background: #1e40af;
      }

      .nc-results {
        margin-top: 1.25rem;
        padding: 1rem;
        background: var(--nc-surface);
        border: 1px solid var(--nc-border);
        border-radius: var(--nc-radius);
      }

      .nc-results h3 {
        margin: 0 0 0.75rem;
        font-size: 1rem;
        font-weight: 600;
      }

      .nc-result-row {
        display: flex;
        justify-content: space-between;
        padding: 0.375rem 0;
        border-bottom: 1px solid var(--nc-border);
        font-size: 0.9375rem;
      }

      .nc-result-row:last-child {
        border-bottom: none;
      }

      .nc-result-row .nc-label {
        color: var(--nc-muted);
      }

      .nc-result-row .nc-value {
        font-weight: 600;
        text-align: right;
      }

      .nc-result-row.nc-highlight {
        padding: 0.5rem 0;
        font-size: 1.0625rem;
      }

      .nc-result-row.nc-highlight .nc-value {
        color: var(--nc-accent);
        font-size: 1.125rem;
      }

      .nc-divider {
        height: 1px;
        background: var(--nc-border);
        margin: 0.75rem 0;
      }

      .nc-note {
        font-size: 0.8125rem;
        color: var(--nc-muted);
        margin-top: 0.75rem;
        line-height: 1.4;
      }

      .nc-tabs {
        display: flex;
        gap: 0;
        border-bottom: 2px solid var(--nc-border);
        margin-bottom: 1rem;
      }

      .nc-tab {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        font-weight: 500;
        border: none;
        background: none;
        color: var(--nc-muted);
        cursor: pointer;
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
        font-family: inherit;
      }

      .nc-tab.active {
        color: var(--nc-primary);
        border-bottom-color: var(--nc-primary);
      }

      .nc-comparison {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-top: 1rem;
      }

      .nc-comparison-col {
        padding: 1rem;
        background: var(--nc-surface);
        border: 1px solid var(--nc-border);
        border-radius: var(--nc-radius);
      }

      .nc-comparison-col h4 {
        margin: 0 0 0.75rem;
        font-size: 0.9375rem;
        font-weight: 600;
      }

      @media (max-width: 480px) {
        .nc-comparison {
          grid-template-columns: 1fr;
        }
      }

      .nc-winner {
        border-color: var(--nc-accent);
        background: rgba(5,150,105,0.05);
      }

      .nc-badge {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.125rem 0.5rem;
        border-radius: 999px;
        background: var(--nc-accent);
        color: #fff;
        margin-left: 0.5rem;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
        margin-top: 0.5rem;
      }

      th, td {
        padding: 0.5rem;
        text-align: left;
        border-bottom: 1px solid var(--nc-border);
      }

      th {
        font-weight: 600;
        color: var(--nc-muted);
        font-size: 0.8125rem;
      }

      td:last-child, th:last-child {
        text-align: right;
      }

      .nc-hidden {
        display: none;
      }

      .nc-slider-container {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      input[type="range"] {
        flex: 1;
        accent-color: var(--nc-primary);
      }

      .nc-slider-value {
        min-width: 4rem;
        text-align: right;
        font-weight: 600;
        font-size: 0.875rem;
      }
    `;
    return style;
  }

  /** Helper: generar filas de resultado */
  protected resultRow(label: string, value: string, highlight = false): string {
    return `<div class="nc-result-row${highlight ? ' nc-highlight' : ''}">
      <span class="nc-label">${label}</span>
      <span class="nc-value">${value}</span>
    </div>`;
  }

  /** Helper: generar campo de input numérico */
  protected fieldNum(id: string, label: string, placeholder = '', value = ''): string {
    return `<div class="nc-field">
      <label for="${id}">${label}</label>
      <input type="number" id="${id}" placeholder="${placeholder}" value="${value}" step="any">
    </div>`;
  }

  /** Helper: generar campo select */
  protected fieldSelect(id: string, label: string, options: [string, string][]): string {
    const opts = options.map(([v, t]) => `<option value="${v}">${t}</option>`).join('');
    return `<div class="nc-field">
      <label for="${id}">${label}</label>
      <select id="${id}">${opts}</select>
    </div>`;
  }

  /** Helper: obtener valor numérico de un input */
  protected numVal(id: string): number {
    const el = this.qs<HTMLInputElement>(`#${id}`);
    return el ? parseFloat(el.value) || 0 : 0;
  }

  /** Helper: obtener valor string de un select/input */
  protected strVal(id: string): string {
    const el = this.qs<HTMLInputElement | HTMLSelectElement>(`#${id}`);
    return el ? el.value : '';
  }
}
