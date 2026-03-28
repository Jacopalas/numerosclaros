/**
 * calc-rescate-pensiones — Optimizador de rescate de planes de pensiones.
 * Minimiza el tipo marginal de IRPF distribuyendo el rescate en varios años.
 * Incluye la novedad del rescate a los 10 años (desde 2025).
 */
import { CalcBase } from '../base.js';
import {
  calcularIRPF,
  tipoMarginal,
  IRPF_ESTATAL,
  CCAA_DATA,
  CCAA_LIST,
  CCAA_FORALES,
  type ComunidadId,
  type Tramo,
} from '../../../core/src/spain/index.js';

interface AnioRescate {
  anio: number;
  rescate: number;
  otrosIngresos: number;
  baseTotal: number;
  irpfTotal: number;
  irpfSinRescate: number;
  irpfRescate: number;
  tipoMarginalRescate: number;
}

export class CalcRescatePensiones extends CalcBase {
  protected render(): void {
    this.container.innerHTML = `
      <h2>Optimizador Rescate Plan de Pensiones</h2>
      <p class="nc-subtitle">Minimiza tu IRPF distribuyendo el rescate en varios años</p>

      ${this.fieldNum('saldo', 'Saldo del plan de pensiones (€)', 'Ej: 100000', '100000')}
      ${this.fieldNum('otros_ingresos', 'Otros ingresos anuales (€)', 'Salario, pensión, etc.', '25000')}

      <div class="nc-row">
        ${this.fieldNum('anios_rescate', 'Años para el rescate', 'Ej: 5', '5')}
        ${this.fieldSelect('ccaa', 'Comunidad Autónoma', CCAA_LIST)}
      </div>

      <button class="nc-btn" id="calcular">Optimizar rescate</button>

      <div id="resultados" class="nc-hidden"></div>
    `;
  }

  protected setupListeners(): void {
    this.qs('#calcular')?.addEventListener('click', () => this.calcular());
  }

  private calcular(): void {
    const saldo = this.numVal('saldo');
    const otrosIngresos = this.numVal('otros_ingresos');
    const aniosRescate = Math.max(1, Math.min(30, Math.floor(this.numVal('anios_rescate'))));
    const ccaa = this.strVal('ccaa') as ComunidadId;

    if (saldo <= 0) return;

    // Estrategia 1: rescate uniforme
    const uniforme = this.simularRescate(saldo, otrosIngresos, aniosRescate, ccaa, 'uniforme');

    // Estrategia 2: rescate optimizado (rellenar hasta el siguiente tramo)
    const optimizado = this.simularRescate(saldo, otrosIngresos, aniosRescate, ccaa, 'optimizado');

    // Estrategia 3: todo de golpe
    const golpe = this.simularRescate(saldo, otrosIngresos, 1, ccaa, 'uniforme');

    const div = this.qs('#resultados')!;
    div.classList.remove('nc-hidden');

    const mejorEstrategia = optimizado.totalIRPF <= uniforme.totalIRPF ? optimizado : uniforme;
    const ahorro = golpe.totalIRPF - mejorEstrategia.totalIRPF;

    div.innerHTML = `
      <div class="nc-results">
        <h3>Resultado optimizado</h3>
        ${this.resultRow('Saldo del plan', this.fmtEur(saldo))}
        ${this.resultRow('IRPF rescatando todo de golpe', this.fmtEur(golpe.totalIRPF))}
        ${this.resultRow('IRPF rescate optimizado (' + aniosRescate + ' años)', this.fmtEur(mejorEstrategia.totalIRPF), true)}
        ${this.resultRow('Ahorro fiscal por distribuir', this.fmtEur(ahorro), true)}
      </div>

      <div class="nc-results" style="margin-top:1rem">
        <h3>Plan de rescate año a año</h3>
        <table>
          <thead>
            <tr>
              <th>Año</th>
              <th>Rescate</th>
              <th>Base total</th>
              <th>IRPF rescate</th>
              <th>Marginal</th>
            </tr>
          </thead>
          <tbody>
            ${mejorEstrategia.anios.map((a, i) => `
              <tr>
                <td>Año ${i + 1}</td>
                <td>${this.fmtEur(a.rescate)}</td>
                <td>${this.fmtEur(a.baseTotal)}</td>
                <td>${this.fmtEur(a.irpfRescate)}</td>
                <td>${this.fmtPercent(a.tipoMarginalRescate)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="nc-divider"></div>
        <h3>Comparativa de estrategias</h3>
        ${this.resultRow('Todo de golpe (1 año)', this.fmtEur(golpe.totalIRPF))}
        ${this.resultRow('Uniforme (' + aniosRescate + ' años)', this.fmtEur(uniforme.totalIRPF))}
        ${this.resultRow('Optimizado (' + aniosRescate + ' años)', this.fmtEur(optimizado.totalIRPF))}

        <p class="nc-note">
          Los planes de pensiones tributan como rendimientos del trabajo al rescatarlos (no como ahorro).
          Desde 2025, se pueden rescatar aportaciones con más de 10 años de antigüedad.
          Distribuir el rescate en varios años puede reducir significativamente el IRPF al evitar los tramos más altos.
          Datos 2025. Fuente: Art. 17.2.a.3ª y DT 22ª LIRPF.
        </p>
      </div>
    `;
  }

  private simularRescate(
    saldo: number,
    otrosIngresos: number,
    anios: number,
    ccaa: ComunidadId,
    estrategia: 'uniforme' | 'optimizado'
  ): { anios: AnioRescate[]; totalIRPF: number } {
    const resultAnios: AnioRescate[] = [];
    let saldoRestante = saldo;
    let totalIRPFRescate = 0;

    const esForal = CCAA_FORALES.includes(ccaa);
    const datosCCAA = CCAA_DATA[ccaa];

    for (let i = 0; i < anios && saldoRestante > 0; i++) {
      let rescateAnio: number;

      if (estrategia === 'uniforme') {
        rescateAnio = saldo / anios;
      } else {
        // Optimizado: buscar el punto donde el tipo marginal sube
        // Intentar rellenar hasta el siguiente tramo sin saltar al siguiente tipo
        const tramos = esForal ? datosCCAA.irpfTramos : this.combinarTramos(IRPF_ESTATAL, datosCCAA.irpfTramos);
        let techoTramo = 0;
        let prevHasta = 0;
        for (const t of tramos) {
          if (otrosIngresos < t.hasta) {
            techoTramo = t.hasta === Infinity ? otrosIngresos + saldoRestante / (anios - i) : t.hasta;
            break;
          }
          prevHasta = t.hasta;
        }
        rescateAnio = Math.min(saldoRestante, Math.max(techoTramo - otrosIngresos, saldoRestante / (anios - i)));
      }

      rescateAnio = Math.min(rescateAnio, saldoRestante);

      // IRPF sin rescate
      const irpfSin = calcularIRPF(otrosIngresos, ccaa);
      // IRPF con rescate
      const irpfCon = calcularIRPF(otrosIngresos + rescateAnio, ccaa);
      const irpfRescate = irpfCon.cuotaTotal - irpfSin.cuotaTotal;

      resultAnios.push({
        anio: i + 1,
        rescate: rescateAnio,
        otrosIngresos,
        baseTotal: otrosIngresos + rescateAnio,
        irpfTotal: irpfCon.cuotaTotal,
        irpfSinRescate: irpfSin.cuotaTotal,
        irpfRescate,
        tipoMarginalRescate: irpfCon.tipoMarginal,
      });

      totalIRPFRescate += irpfRescate;
      saldoRestante -= rescateAnio;
    }

    return { anios: resultAnios, totalIRPF: totalIRPFRescate };
  }

  private combinarTramos(est: Tramo[], aut: Tramo[]): Tramo[] {
    // Crear tramos combinados simplificados
    const cortes = new Set<number>();
    for (const t of est) if (t.hasta !== Infinity) cortes.add(t.hasta);
    for (const t of aut) if (t.hasta !== Infinity) cortes.add(t.hasta);

    const sorted = [...cortes].sort((a, b) => a - b);
    sorted.push(Infinity);

    const combinados: Tramo[] = [];
    for (const hasta of sorted) {
      const mid = hasta === Infinity ? (sorted[sorted.length - 2] || 0) + 1 : hasta - 1;
      const tipoE = tipoMarginal(mid, est);
      const tipoA = tipoMarginal(mid, aut);
      combinados.push({ hasta, tipo: tipoE + tipoA });
    }
    return combinados;
  }
}

customElements.define('calc-rescate-pensiones', CalcRescatePensiones);
