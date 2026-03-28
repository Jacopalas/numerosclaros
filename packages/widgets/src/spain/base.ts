/**
 * CalcBaseSpain — Base class for Spain-specific calculator widgets.
 *
 * Provides: Shadow DOM, container, form helpers, formatting, result row helpers.
 */

const spainStyles = `
  :host {
    --nc-primary: #1a56db;
    --nc-bg: #ffffff;
    --nc-text: #111827;
    --nc-border: #e5e7eb;
    --nc-accent: #059669;
    --nc-error: #dc2626;
    --nc-surface: #f9fafb;
    --nc-muted: #6b7280;
    --nc-radius: 8px;
    --nc-shadow: 0 1px 3px rgba(0,0,0,0.1);

    display: block;
    font-family: system-ui, -apple-system, sans-serif;
    color: var(--nc-text);
    background: var(--nc-bg);
    border: 1px solid var(--nc-border);
    border-radius: var(--nc-radius);
    padding: 1.5rem;
    box-sizing: border-box;
    line-height: 1.5;
  }

  :host([theme="dark"]) {
    --nc-bg: #1f2937;
    --nc-text: #f9fafb;
    --nc-border: #374151;
    --nc-surface: #111827;
    --nc-muted: #9ca3af;
    --nc-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }

  * { box-sizing: border-box; }

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 0.25rem 0;
    color: var(--nc-primary);
  }

  h3 {
    font-size: 1.05rem;
    font-weight: 700;
    margin: 0.75rem 0 0.5rem;
    color: var(--nc-text);
  }

  .nc-subtitle {
    font-size: 0.9rem;
    color: var(--nc-muted);
    margin: 0 0 1rem 0;
  }

  .nc-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  @media (max-width: 480px) {
    .nc-row { grid-template-columns: 1fr; }
  }

  .nc-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 0.75rem;
  }

  .nc-field label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--nc-muted);
  }

  .nc-field input, .nc-field select {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--nc-border);
    border-radius: var(--nc-radius);
    font-size: 1rem;
    background: var(--nc-bg);
    color: var(--nc-text);
    transition: border-color 0.15s;
  }

  .nc-field input:focus, .nc-field select:focus {
    outline: none;
    border-color: var(--nc-primary);
    box-shadow: 0 0 0 3px rgba(26,86,219,0.15);
  }

  .nc-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.6rem 1.5rem;
    background: var(--nc-primary);
    color: white;
    border: none;
    border-radius: var(--nc-radius);
    font-size: 1rem;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    margin: 0.5rem 0;
    transition: opacity 0.15s;
  }

  .nc-btn:hover { opacity: 0.9; }

  .nc-hidden { display: none !important; }

  .nc-results {
    margin-top: 1rem;
    padding: 1rem;
    background: var(--nc-surface);
    border-radius: var(--nc-radius);
    border: 1px solid var(--nc-border);
  }

  .nc-result-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.4rem 0;
    border-bottom: 1px solid var(--nc-border);
  }

  .nc-result-row:last-child { border-bottom: none; }

  .nc-result-label {
    font-size: 0.85rem;
    color: var(--nc-muted);
  }

  .nc-result-value {
    font-size: 1rem;
    font-weight: 700;
    color: var(--nc-text);
  }

  .nc-result-row.nc-highlight .nc-result-value {
    color: var(--nc-primary);
    font-size: 1.2rem;
  }

  .nc-divider {
    height: 1px;
    background: var(--nc-border);
    margin: 0.75rem 0;
  }

  .nc-note {
    font-size: 0.8rem;
    color: var(--nc-muted);
    margin-top: 1rem;
    line-height: 1.5;
  }

  .nc-badge {
    display: inline-block;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    background: rgba(26,86,219,0.1);
    color: var(--nc-primary);
    margin-left: 0.5rem;
  }

  .nc-comparison {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin: 1rem 0;
  }

  @media (max-width: 480px) {
    .nc-comparison { grid-template-columns: 1fr; }
  }

  .nc-comparison-col {
    padding: 1rem;
    border: 1px solid var(--nc-border);
    border-radius: var(--nc-radius);
    background: var(--nc-bg);
  }

  .nc-comparison-col.nc-winner {
    border-color: var(--nc-accent);
    background: rgba(5,150,105,0.03);
  }

  .nc-comparison-col h4 {
    font-size: 1rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    color: var(--nc-text);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
    margin-top: 0.75rem;
  }

  th {
    text-align: left;
    padding: 0.5rem;
    border-bottom: 2px solid var(--nc-border);
    color: var(--nc-muted);
    font-weight: 600;
    font-size: 0.75rem;
    text-transform: uppercase;
  }

  td {
    padding: 0.4rem 0.5rem;
    border-bottom: 1px solid var(--nc-border);
  }

  tbody tr:hover {
    background: var(--nc-surface);
  }
`;

export class CalcBase extends HTMLElement {
  protected shadow: ShadowRoot;
  protected container: HTMLElement;
  protected fmtInt: Intl.NumberFormat;
  private _eurFmt: Intl.NumberFormat;
  private _pctFmt: Intl.NumberFormat;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.fmtInt = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 });
    this._eurFmt = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    this._pctFmt = new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // Create container
    const style = document.createElement('style');
    style.textContent = spainStyles;
    this.container = document.createElement('div');
    this.shadow.appendChild(style);
    this.shadow.appendChild(this.container);
  }

  connectedCallback(): void {
    this.render();
    this.setupListeners();
  }

  /** Override in subclasses to set container innerHTML */
  protected render(): void {}

  /** Override in subclasses to attach event listeners */
  protected setupListeners(): void {}

  /** Query selector within shadow DOM */
  protected qs(selector: string): HTMLElement | null {
    return this.shadow.querySelector(selector);
  }

  /** Get numeric value from an input by id */
  protected numVal(id: string): number {
    const el = this.shadow.getElementById(id) as HTMLInputElement | null;
    if (!el) return 0;
    const val = parseFloat(el.value);
    return isNaN(val) ? 0 : val;
  }

  /** Get string value from an input/select by id */
  protected strVal(id: string): string {
    const el = this.shadow.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
    return el?.value ?? '';
  }

  /** Format number as EUR currency */
  protected fmtEur(n: number): string {
    return this._eurFmt.format(n);
  }

  /** Format number as percentage (0.15 → "15,00%") */
  protected fmtPercent(n: number): string {
    return this._pctFmt.format(n * 100) + '%';
  }

  /** Generate numeric input field HTML */
  protected fieldNum(id: string, label: string, placeholder: string, defaultValue: string): string {
    return `
      <div class="nc-field">
        <label for="${id}">${label}</label>
        <input type="number" id="${id}" placeholder="${placeholder}" value="${defaultValue}">
      </div>
    `;
  }

  /** Generate select field HTML */
  protected fieldSelect(id: string, label: string, options: [string, string][]): string {
    const opts = options
      .map(([value, text]) => `<option value="${value}">${text}</option>`)
      .join('');
    return `
      <div class="nc-field">
        <label for="${id}">${label}</label>
        <select id="${id}">${opts}</select>
      </div>
    `;
  }

  /** Generate result row HTML */
  protected resultRow(label: string, value: string, highlight = false): string {
    return `
      <div class="nc-result-row${highlight ? ' nc-highlight' : ''}">
        <span class="nc-result-label">${label}</span>
        <span class="nc-result-value">${value}</span>
      </div>
    `;
  }
}
