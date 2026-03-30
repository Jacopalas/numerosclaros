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
          <rect x="${x}%" y="${y}" width="${w}%" height="${barH}" fill="${d.color}" rx="4" opacity="0.85"/>
          <rect x="${x}%" y="${y}" width="${w}%" height="3" fill="${d.color}" rx="1.5"/>
          <text x="${x + (barWidth - padding * 2) / 2 + padding}%" y="${height - 10}"
                text-anchor="middle" font-size="11" fill="var(--nc-muted)">${d.label}</text>
        `;
      })
      .join('');

    return `<svg viewBox="0 0 100 ${height}" preserveAspectRatio="none" class="nc-bar-chart"
                 style="width:100%;height:${height}px">${bars}</svg>`;
  }

  /** Create smooth SVG path using cubic bezier curves (tension-based) */
  private smoothPath(coords: { x: number; y: number }[]): string {
    if (coords.length < 2) return '';
    if (coords.length === 2) {
      return `M ${coords[0].x} ${coords[0].y} L ${coords[1].x} ${coords[1].y}`;
    }
    const tension = 0.3;
    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[Math.max(0, i - 1)];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[Math.min(coords.length - 1, i + 2)];
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }

  /** Generate horizontal grid lines for chart area */
  private gridLines(width: number, height: number, padding: number, count = 4): string {
    const lines: string[] = [];
    for (let i = 0; i <= count; i++) {
      const y = padding + ((height - padding * 2) / count) * i;
      lines.push(`<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="var(--nc-border)" stroke-width="0.5" opacity="0.6"/>`);
    }
    return lines.join('');
  }

  /** Create SVG gradient definition */
  protected createGradientDef(id: string, color: string, topOpacity = 0.4, bottomOpacity = 0.02): string {
    return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${color}" stop-opacity="${topOpacity}"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="${bottomOpacity}"/>
    </linearGradient>`;
  }

  /** Create an area/line chart as SVG — enhanced with smooth curves, gradients, and grid */
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
    const pad = 10;
    const step = width / (points.length - 1);

    const coords = points.map((v, i) => ({
      x: i * step,
      y: height - pad - ((v - min) / range) * (height - pad * 2),
    }));

    const pathD = this.smoothPath(coords);
    const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height - pad} L 0 ${height - pad} Z`;

    const gradId = `lg-${Math.random().toString(36).slice(2, 8)}`;

    return `
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"
           style="width:100%;height:${height}px">
        <defs>${this.createGradientDef(gradId, color, fillOpacity * 2.5, 0.01)}</defs>
        ${this.gridLines(width, height, pad)}
        <path d="${areaD}" fill="url(#${gradId})"/>
        <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="${coords[coords.length - 1].x}" cy="${coords[coords.length - 1].y}"
                r="3.5" fill="${color}" stroke="var(--nc-bg)" stroke-width="2"/>
      </svg>
    `;
  }

  /** Create a stacked area chart (two series) with smooth curves and gradient fills */
  protected createStackedAreaChart(opts: {
    topSeries: number[];
    bottomSeries: number[];
    topColor: string;
    bottomColor: string;
    topLabel: string;
    bottomLabel: string;
    width?: number;
    height?: number;
    xLabels?: string[];
  }): string {
    const {
      topSeries, bottomSeries,
      topColor, bottomColor,
      topLabel, bottomLabel,
      width = 400, height = 180,
      xLabels,
    } = opts;
    const n = topSeries.length;
    if (n < 2) return '';
    const pad = 10;
    const legendH = 30;
    const xLabelH = xLabels ? 20 : 0;
    const chartH = height;
    const totalH = chartH + legendH + xLabelH;

    const max = Math.max(...topSeries, ...bottomSeries, 1);
    const xStep = width / (n - 1);

    const topCoords = topSeries.map((v, i) => ({
      x: i * xStep,
      y: chartH - pad - (v / max) * (chartH - pad * 2),
    }));
    const bottomCoords = bottomSeries.map((v, i) => ({
      x: i * xStep,
      y: chartH - pad - (v / max) * (chartH - pad * 2),
    }));

    const topPath = this.smoothPath(topCoords);
    const bottomPath = this.smoothPath(bottomCoords);
    const topArea = `${topPath} L ${topCoords[n - 1].x} ${chartH - pad} L 0 ${chartH - pad} Z`;
    const bottomArea = `${bottomPath} L ${bottomCoords[n - 1].x} ${chartH - pad} L 0 ${chartH - pad} Z`;

    const gTop = `sa-t-${Math.random().toString(36).slice(2, 8)}`;
    const gBot = `sa-b-${Math.random().toString(36).slice(2, 8)}`;

    let xLabelsSvg = '';
    if (xLabels && xLabels.length > 0) {
      const maxLabels = 6;
      const labelStep = Math.max(1, Math.floor(n / maxLabels));
      xLabelsSvg = xLabels
        .filter((_, i) => i % labelStep === 0 || i === n - 1)
        .map((label, idx) => {
          const origIdx = idx === Math.ceil(n / labelStep) ? n - 1 : idx * labelStep;
          return `<text x="${origIdx * xStep}" y="${chartH + xLabelH - 2}" text-anchor="middle"
                        font-size="10" fill="var(--nc-muted)">${label}</text>`;
        })
        .join('');
    }

    return `
      <svg viewBox="0 0 ${width} ${totalH}" style="width:100%;height:auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          ${this.createGradientDef(gTop, topColor, 0.5, 0.03)}
          ${this.createGradientDef(gBot, bottomColor, 0.5, 0.03)}
        </defs>
        ${this.gridLines(width, chartH, pad)}
        <path d="${topArea}" fill="url(#${gTop})"/>
        <path d="${topPath}" fill="none" stroke="${topColor}" stroke-width="2.5" stroke-linecap="round"/>
        <path d="${bottomArea}" fill="url(#${gBot})"/>
        <path d="${bottomPath}" fill="none" stroke="${bottomColor}" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="${topCoords[n - 1].x}" cy="${topCoords[n - 1].y}" r="3" fill="${topColor}" stroke="var(--nc-bg)" stroke-width="1.5"/>
        <circle cx="${bottomCoords[n - 1].x}" cy="${bottomCoords[n - 1].y}" r="3" fill="${bottomColor}" stroke="var(--nc-bg)" stroke-width="1.5"/>
        ${xLabelsSvg}
        <rect x="0" y="${chartH + xLabelH + 4}" width="12" height="12" rx="3" fill="${topColor}" opacity="0.8"/>
        <text x="16" y="${chartH + xLabelH + 14}" font-size="11" fill="var(--nc-muted)">${topLabel}</text>
        <rect x="${width * 0.45}" y="${chartH + xLabelH + 4}" width="12" height="12" rx="3" fill="${bottomColor}" opacity="0.8"/>
        <text x="${width * 0.45 + 16}" y="${chartH + xLabelH + 14}" font-size="11" fill="var(--nc-muted)">${bottomLabel}</text>
      </svg>
    `;
  }

  /** Create a dual-line comparison chart with filled areas */
  protected createDualLineChart(opts: {
    seriesA: number[];
    seriesB: number[];
    colorA: string;
    colorB: string;
    labelA: string;
    labelB: string;
    width?: number;
    height?: number;
  }): string {
    const {
      seriesA, seriesB,
      colorA, colorB,
      labelA, labelB,
      width = 400, height = 160,
    } = opts;
    const n = Math.max(seriesA.length, seriesB.length);
    if (n < 2) return '';

    const pad = 10;
    const legendH = 30;
    const chartH = height;
    const totalH = chartH + legendH;
    const max = Math.max(...seriesA, ...seriesB, 1);
    const xStep = width / (n - 1);

    const coordsA = seriesA.map((v, i) => ({
      x: i * xStep,
      y: chartH - pad - (v / max) * (chartH - pad * 2),
    }));
    const coordsB = seriesB.map((v, i) => ({
      x: i * xStep,
      y: chartH - pad - (v / max) * (chartH - pad * 2),
    }));

    const pathA = this.smoothPath(coordsA);
    const pathB = this.smoothPath(coordsB);
    const areaA = `${pathA} L ${coordsA[coordsA.length - 1].x} ${chartH - pad} L 0 ${chartH - pad} Z`;
    const areaB = `${pathB} L ${coordsB[coordsB.length - 1].x} ${chartH - pad} L 0 ${chartH - pad} Z`;

    const gA = `dl-a-${Math.random().toString(36).slice(2, 8)}`;
    const gB = `dl-b-${Math.random().toString(36).slice(2, 8)}`;

    return `
      <svg viewBox="0 0 ${width} ${totalH}" style="width:100%;height:auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          ${this.createGradientDef(gA, colorA, 0.2, 0.01)}
          ${this.createGradientDef(gB, colorB, 0.2, 0.01)}
        </defs>
        ${this.gridLines(width, chartH, pad)}
        <path d="${areaA}" fill="url(#${gA})"/>
        <path d="${pathA}" fill="none" stroke="${colorA}" stroke-width="2.5" stroke-linecap="round"/>
        <path d="${areaB}" fill="url(#${gB})"/>
        <path d="${pathB}" fill="none" stroke="${colorB}" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="${coordsA[coordsA.length - 1].x}" cy="${coordsA[coordsA.length - 1].y}" r="3" fill="${colorA}" stroke="var(--nc-bg)" stroke-width="1.5"/>
        <circle cx="${coordsB[coordsB.length - 1].x}" cy="${coordsB[coordsB.length - 1].y}" r="3" fill="${colorB}" stroke="var(--nc-bg)" stroke-width="1.5"/>
        <rect x="0" y="${chartH + 8}" width="12" height="12" rx="3" fill="${colorA}" opacity="0.8"/>
        <text x="16" y="${chartH + 18}" font-size="11" fill="var(--nc-muted)">${labelA}</text>
        <rect x="${width * 0.45}" y="${chartH + 8}" width="12" height="12" rx="3" fill="${colorB}" opacity="0.8"/>
        <text x="${width * 0.45 + 16}" y="${chartH + 18}" font-size="11" fill="var(--nc-muted)">${labelB}</text>
      </svg>
    `;
  }

  /** Create a donut chart as SVG — enhanced with percentage labels and cleaner look */
  protected createDonutChart(
    segments: { label: string; value: number; color: string }[],
    size = 200
  ): string {
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    if (total === 0) return '';
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.36;
    const strokeWidth = size * 0.18;
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
                transform="rotate(-90 ${cx} ${cy})"
                style="transition:stroke-dasharray 0.4s ease,stroke-dashoffset 0.4s ease"/>`;
    });

    // Percentage labels positioned on each arc
    let labelOffset = 0;
    const pctLabels = segments.map((seg) => {
      const pct = seg.value / total;
      if (pct < 0.05) { labelOffset += pct * circumference; return ''; }
      const midAngle = ((labelOffset + pct * circumference / 2) / circumference) * 2 * Math.PI - Math.PI / 2;
      labelOffset += pct * circumference;
      const lx = cx + Math.cos(midAngle) * r;
      const ly = cy + Math.sin(midAngle) * r;
      return `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central"
                    font-size="${size * 0.065}" font-weight="700" fill="var(--nc-bg)"
                    style="text-shadow:0 1px 2px rgba(0,0,0,0.3)">${Math.round(pct * 100)}%</text>`;
    });

    // Center text
    const centerText = `
      <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="${size * 0.06}" fill="var(--nc-muted)">Total</text>
      <text x="${cx}" y="${cy + size * 0.085}" text-anchor="middle" font-size="${size * 0.085}" font-weight="700" fill="var(--nc-text)">${this.formatCurrency(total)}</text>
    `;

    const legendY = size + 14;
    const legendColWidth = size / 2;
    const legends = segments.map((seg, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const lx = col * legendColWidth;
      const ly = legendY + row * 22;
      const pct = Math.round((seg.value / total) * 100);
      return `
        <rect x="${lx}" y="${ly}" width="10" height="10" rx="3" fill="${seg.color}"/>
        <text x="${lx + 14}" y="${ly + 10}" font-size="11" fill="var(--nc-text)">
          ${seg.label} · ${this.formatCurrency(seg.value)} (${pct}%)
        </text>
      `;
    });

    const legendRows = Math.ceil(segments.length / 2);
    const totalHeight = size + 20 + legendRows * 22;
    return `
      <svg viewBox="0 0 ${size} ${totalHeight}" style="width:${size}px;max-width:100%;height:auto">
        ${paths.join('')}
        ${pctLabels.join('')}
        ${centerText}
        ${legends.join('')}
      </svg>
    `;
  }
}
