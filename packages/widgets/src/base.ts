import { sharedStyles } from './styles.js';

/**
 * CalcBase — Base class for all NumerosClaros calculator widgets.
 *
 * Features:
 * - Shadow DOM with encapsulated styles
 * - CSS variables for theming
 * - Responsive (mobile-first)
 * - lang attribute (es/en)
 * - theme attribute (light/dark)
 * - Real-time recalculation on input
 * - Number formatting with Intl.NumberFormat
 */
export abstract class CalcBase extends HTMLElement {
  protected shadow: ShadowRoot;
  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;

  static get observedAttributes(): string[] {
    return ['lang', 'theme'];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    if (!this.hasAttribute('lang')) {
      this.setAttribute('lang', 'es');
    }
    if (!this.hasAttribute('theme')) {
      this.setAttribute('theme', 'light');
    }
    this.render();
    this.attachInputListeners();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) {
      this.render();
      this.attachInputListeners();
    }
  }

  /** Override in subclasses to return the inner HTML */
  protected abstract getTemplate(): string;

  /** Override in subclasses to run calculation and update results */
  protected abstract calculate(): void;

  /** Get the title for this calculator */
  protected abstract getTitle(): string;

  /** Render the component */
  protected render(): void {
    this.shadow.innerHTML = `
      <style>${sharedStyles}</style>
      <h2 class="nc-title"><slot name="title">${this.getTitle()}</slot></h2>
      ${this.getTemplate()}
    `;
    this.calculate();
  }

  /** Auto-attach input listeners for real-time calculation */
  private attachInputListeners(): void {
    const inputs = this.shadow.querySelectorAll('input, select');
    inputs.forEach((input) => {
      input.addEventListener('input', () => this.debouncedCalculate());
      input.addEventListener('change', () => this.debouncedCalculate());
    });
  }

  /** Debounced calculate to avoid excessive recalculation */
  private debouncedCalculate(): void {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => this.calculate(), 50);
  }

  /** Get numeric value from an input by id */
  protected getInput(id: string): number {
    const el = this.shadow.getElementById(id) as HTMLInputElement | null;
    if (!el) return 0;
    const val = parseFloat(el.value);
    return isNaN(val) ? 0 : val;
  }

  /** Get string value from input/select */
  protected getInputString(id: string): string {
    const el = this.shadow.getElementById(id) as HTMLInputElement | null;
    return el?.value ?? '';
  }

  /** Set text content of an element by id */
  protected setText(id: string, text: string): void {
    const el = this.shadow.getElementById(id);
    if (el) el.textContent = text;
  }

  /** Set innerHTML of an element by id */
  protected setHtml(id: string, html: string): void {
    const el = this.shadow.getElementById(id);
    if (el) el.innerHTML = html;
  }

  /** Format a number as currency (€) using es-ES locale */
  protected formatCurrency(n: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  }

  /** Format a number with locale */
  protected formatNumber(n: number, decimals = 2): string {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(n);
  }

  /** Format percentage */
  protected formatPercent(n: number): string {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n) + '%';
  }

  /** Create a simple bar chart as SVG */
  protected createBarChart(
    data: { label: string; value: number; color: string }[],
    height = 200
  ): string {
    if (data.length === 0) return '';
    const max = Math.max(...data.map((d) => d.value), 1);
    const barWidth = 100 / data.length;
    const padding = barWidth * 0.15;

    const bars = data
      .map((d, i) => {
        const barH = (d.value / max) * (height - 40);
        const x = i * barWidth + padding;
        const w = barWidth - padding * 2;
        const y = height - 30 - barH;
        return `
          <rect x="${x}%" y="${y}" width="${w}%" height="${barH}" fill="${d.color}" rx="3"/>
          <text x="${x + (barWidth - padding * 2) / 2 + padding}%" y="${height - 10}"
                text-anchor="middle" font-size="11" fill="var(--nc-muted)">${d.label}</text>
        `;
      })
      .join('');

    return `<svg viewBox="0 0 100 ${height}" preserveAspectRatio="none" class="nc-bar-chart"
                 style="width:100%;height:${height}px">${bars}</svg>`;
  }

  /** Create an area/line chart as SVG */
  protected createLineChart(
    points: number[],
    width = 400,
    height = 150,
    color = 'var(--nc-primary)',
    fillOpacity = 0.15
  ): string {
    if (points.length < 2) return '';
    const max = Math.max(...points, 1);
    const min = Math.min(...points, 0);
    const range = max - min || 1;
    const step = width / (points.length - 1);

    const coords = points.map((v, i) => ({
      x: i * step,
      y: height - 10 - ((v - min) / range) * (height - 20),
    }));

    const pathD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
    const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height - 10} L 0 ${height - 10} Z`;

    return `
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"
           style="width:100%;height:${height}px">
        <path d="${areaD}" fill="${color}" opacity="${fillOpacity}"/>
        <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2"/>
      </svg>
    `;
  }

  /** Create a donut chart as SVG */
  protected createDonutChart(
    segments: { label: string; value: number; color: string }[],
    size = 180
  ): string {
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    if (total === 0) return '';
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.38;
    const strokeWidth = size * 0.15;
    const circumference = 2 * Math.PI * r;

    let offset = 0;
    const paths = segments.map((seg) => {
      const pct = seg.value / total;
      const dashLength = pct * circumference;
      const dashOffset = -offset;
      offset += dashLength;
      return `<circle cx="${cx}" cy="${cy}" r="${r}"
                fill="none" stroke="${seg.color}" stroke-width="${strokeWidth}"
                stroke-dasharray="${dashLength} ${circumference - dashLength}"
                stroke-dashoffset="${dashOffset}"
                transform="rotate(-90 ${cx} ${cy})"/>`;
    });

    const legendY = size + 10;
    const legends = segments.map((seg, i) => {
      return `
        <rect x="0" y="${legendY + i * 20}" width="12" height="12" rx="2" fill="${seg.color}"/>
        <text x="18" y="${legendY + i * 20 + 11}" font-size="12" fill="var(--nc-text)">
          ${seg.label}: ${this.formatCurrency(seg.value)}
        </text>
      `;
    });

    const totalHeight = size + 15 + segments.length * 20;
    return `
      <svg viewBox="0 0 ${size} ${totalHeight}" style="width:${size}px;max-width:100%;height:auto">
        ${paths.join('')}
        ${legends.join('')}
      </svg>
    `;
  }
}
