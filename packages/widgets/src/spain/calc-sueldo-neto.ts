/**
 * calc-sueldo-neto — Bruto anual → neto mensual.
 * Incluye: SS trabajador, IRPF, pagas extra (12/14).
 */
import { CalcBase } from '../base.js';
import {
  calcularIRPF,
  estimarRetencion,
  CCAA_LIST,
  MINIMO_PERSONAL,
  type ComunidadId,
} from '../../../core/src/spain/index.js';

/**
 * Cotización SS trabajador 2025 (contrato indefinido).
 * Contingencias comunes: 4.70%
 * Desempleo (indefinido): 1.55%
 * Formación profesional: 0.10%
 * MEI (Mecanismo Equidad Intergeneracional): 0.13%
 * TOTAL: 6.48%
 *
 * Fuente: Art. 109 LGSS, Orden PJC/51/2025.
 */
const SS_TRABAJADOR = 0.0648;
/** Cotización SS empresa (para coste empresa): ~30.5% aprox (incluye CC, desempleo, FP, FOGASA, MEI) */
const SS_EMPRESA = 0.305;
/** Base cotización máxima 2025 */
const BASE_COT_MAX = 4909.50 * 12;

export class CalcSueldoNeto extends CalcBase {
  protected render(): void {
    this.container.innerHTML = `
      <h2>Calculadora Sueldo Neto</h2>
      <p class="nc-subtitle">De bruto anual a neto mensual con detalle de retenciones</p>

      ${this.fieldNum('bruto', 'Salario bruto anual (€)', 'Ej: 30000', '30000')}

      <div class="nc-row">
        ${this.fieldSelect('pagas', 'Pagas anuales', [['12', '12 pagas'], ['14', '14 pagas']])}
        ${this.fieldSelect('ccaa', 'Comunidad Autónoma', CCAA_LIST)}
      </div>

      <button class="nc-btn" id="calcular">Calcular neto</button>

      <div id="resultados" class="nc-hidden"></div>
    `;
  }

  protected setupListeners(): void {
    this.qs('#calcular')?.addEventListener('click', () => this.calcular());
    this.qs('#bruto')?.addEventListener('keydown', (e: Event) => {
      if ((e as KeyboardEvent).key === 'Enter') this.calcular();
    });
  }

  private calcular(): void {
    const bruto = this.numVal('bruto');
    const pagas = parseInt(this.strVal('pagas')) || 14;
    const ccaa = this.strVal('ccaa') as ComunidadId;

    if (bruto <= 0) return;

    // SS trabajador (con tope de base cotización)
    const baseCotizable = Math.min(bruto, BASE_COT_MAX);
    const ssAnual = baseCotizable * SS_TRABAJADOR;

    // Reducción por rendimientos del trabajo (art. 20 LIRPF)
    let reduccion = 0;
    if (bruto <= 14852) reduccion = 6498;
    else if (bruto <= 17673.52) reduccion = 6498 - 1.14 * (bruto - 14852);
    else reduccion = 2000;

    // Base imponible IRPF
    const baseIRPF = Math.max(0, bruto - ssAnual - reduccion);

    // IRPF
    const resultado = calcularIRPF(baseIRPF, ccaa);
    const irpfAnual = resultado.cuotaTotal;

    // Netos
    const netoAnual = bruto - ssAnual - irpfAnual;
    const netoMensual = netoAnual / pagas;
    const retencionPct = bruto > 0 ? irpfAnual / bruto : 0;

    // Coste empresa
    const ssEmpresa = baseCotizable * SS_EMPRESA;
    const costeEmpresa = bruto + ssEmpresa;

    const div = this.qs('#resultados')!;
    div.classList.remove('nc-hidden');

    div.innerHTML = `
      <div class="nc-results">
        <h3>Tu sueldo neto</h3>
        ${this.resultRow('Neto mensual (' + pagas + ' pagas)', this.fmtEur(netoMensual), true)}
        ${this.resultRow('Neto anual', this.fmtEur(netoAnual))}

        <div class="nc-divider"></div>
        <h3>Desglose anual</h3>
        ${this.resultRow('Salario bruto', this.fmtEur(bruto))}
        ${this.resultRow('Seguridad Social (6,48%)', '- ' + this.fmtEur(ssAnual))}
        ${this.resultRow('IRPF (' + this.fmtPercent(retencionPct) + ')', '- ' + this.fmtEur(irpfAnual))}
        ${this.resultRow('Neto anual', this.fmtEur(netoAnual), true)}

        <div class="nc-divider"></div>
        <h3>Tipos impositivos</h3>
        ${this.resultRow('Retención IRPF efectiva', this.fmtPercent(retencionPct))}
        ${this.resultRow('Tipo marginal IRPF', this.fmtPercent(resultado.tipoMarginal))}
        ${this.resultRow('Tipo efectivo total (IRPF+SS)', this.fmtPercent((ssAnual + irpfAnual) / bruto))}

        <div class="nc-divider"></div>
        <h3>Coste para la empresa</h3>
        ${this.resultRow('SS empresa (~30,4%)', this.fmtEur(ssEmpresa))}
        ${this.resultRow('Coste total empresa', this.fmtEur(costeEmpresa), true)}

        <p class="nc-note">
          Cálculo simplificado con mínimo personal de ${this.fmtEur(MINIMO_PERSONAL)}.
          No incluye deducciones autonómicas ni situación familiar.
          Datos fiscales 2025. Fuente: AEAT, Seguridad Social.
        </p>
      </div>
    `;
  }
}

customElements.define('calc-sueldo-neto', CalcSueldoNeto);
