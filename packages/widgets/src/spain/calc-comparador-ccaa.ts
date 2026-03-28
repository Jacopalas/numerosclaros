/**
 * calc-comparador-ccaa — Compara la carga fiscal entre comunidades autónomas.
 * IRPF autonómico + ITP + Patrimonio + Sucesiones.
 */
import { CalcBase } from './base.js';
import {
  calcularIRPF,
  CCAA_LIST,
  CCAA_DATA,
  calcularProgresivo,
  type ComunidadId,
} from '@numerosclaros/core';

interface ResultadoCCAA {
  id: ComunidadId;
  nombre: string;
  irpf: number;
  itp: number;
  patrimonio: number;
  sucesiones: number;
  total: number;
}

export class CalcComparadorCCAA extends CalcBase {
  protected render(): void {
    this.container.innerHTML = `
      <h2>Comparador fiscal por CCAA</h2>
      <p class="nc-subtitle">Ranking de carga fiscal total entre comunidades autónomas</p>

      ${this.fieldNum('salario', 'Salario bruto anual (€)', 'Ej: 50000', '50000')}

      <div class="nc-row">
        ${this.fieldNum('patrimonio', 'Patrimonio neto (€)', 'Ej: 500000', '500000')}
        ${this.fieldNum('vivienda', 'Valor vivienda a comprar (€)', 'Para ITP. 0 si no aplica', '250000')}
      </div>

      ${this.fieldNum('herencia', 'Herencia esperada (€)', 'De padres a hijo. 0 si no aplica', '200000')}

      <button class="nc-btn" id="calcular">Comparar comunidades</button>

      <div id="resultados" class="nc-hidden"></div>
    `;
  }

  protected setupListeners(): void {
    this.qs('#calcular')?.addEventListener('click', () => this.calcular());
  }

  private calcular(): void {
    const salario = this.numVal('salario');
    const patrimonio = this.numVal('patrimonio');
    const vivienda = this.numVal('vivienda');
    const herencia = this.numVal('herencia');

    if (salario <= 0) return;

    const resultados: ResultadoCCAA[] = [];

    for (const [id, nombre] of CCAA_LIST) {
      const datos = CCAA_DATA[id];

      // IRPF
      const irpfResult = calcularIRPF(salario, id);
      const irpf = irpfResult.cuotaTotal;

      // ITP (si compra vivienda)
      const itp = vivienda > 0 ? vivienda * datos.itpGeneral : 0;

      // Patrimonio
      let patrimonioImpuesto = 0;
      if (patrimonio > datos.patrimonioMinExento) {
        const basePatrimonio = patrimonio - datos.patrimonioMinExento;
        patrimonioImpuesto = calcularProgresivo(basePatrimonio, datos.patrimonioTramos);
      }

      // Sucesiones (simplificado: grupo II, hijo > 21 años)
      let sucesiones = 0;
      if (herencia > 0) {
        // Base imponible = herencia - reducción grupo II (15.956,87€ estatal)
        const reduccion = 15956.87;
        const baseSucesiones = Math.max(0, herencia - reduccion);
        // Tarifa estatal simplificada de sucesiones
        const cuotaSucesiones = this.calcularSucesionesBase(baseSucesiones);
        // Aplicar bonificación autonómica
        sucesiones = cuotaSucesiones * (1 - datos.sucesionesBonificacion);
      }

      const total = irpf + itp + patrimonioImpuesto + sucesiones;

      resultados.push({
        id,
        nombre,
        irpf,
        itp,
        patrimonio: patrimonioImpuesto,
        sucesiones,
        total,
      });
    }

    // Ordenar por total (menor carga = mejor)
    resultados.sort((a, b) => a.total - b.total);

    const div = this.qs('#resultados')!;
    div.classList.remove('nc-hidden');

    const best = resultados[0];
    const worst = resultados[resultados.length - 1];

    div.innerHTML = `
      <div class="nc-results">
        <h3>Ranking fiscal por CCAA</h3>
        ${this.resultRow('Más favorable', best.nombre + ' (' + this.fmtEur(best.total) + ')', true)}
        ${this.resultRow('Menos favorable', worst.nombre + ' (' + this.fmtEur(worst.total) + ')')}
        ${this.resultRow('Diferencia máxima', this.fmtEur(worst.total - best.total))}
      </div>

      <div class="nc-results" style="margin-top:1rem">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>CCAA</th>
              <th>IRPF</th>
              ${vivienda > 0 ? '<th>ITP</th>' : ''}
              ${patrimonio > 0 ? '<th>Patrim.</th>' : ''}
              ${herencia > 0 ? '<th>Suces.</th>' : ''}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${resultados.map((r, i) => `
              <tr${i === 0 ? ' style="background:rgba(5,150,105,0.1);font-weight:600"' : ''}>
                <td>${i + 1}</td>
                <td>${r.nombre}</td>
                <td>${this.fmtEur(r.irpf)}</td>
                ${vivienda > 0 ? `<td>${this.fmtEur(r.itp)}</td>` : ''}
                ${patrimonio > 0 ? `<td>${this.fmtEur(r.patrimonio)}</td>` : ''}
                ${herencia > 0 ? `<td>${this.fmtEur(r.sucesiones)}</td>` : ''}
                <td>${this.fmtEur(r.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <p class="nc-note">
          Comparativa simplificada. IRPF: cuota total (estatal + autonómica).
          ITP: tipo general de transmisiones onerosas.
          Patrimonio: tarifa autonómica (algunas CCAA lo han bonificado al 100%).
          Sucesiones: grupo II (hijo > 21), con bonificación autonómica.
          Navarra y País Vasco tienen régimen foral propio.
          Datos 2025. Fuente: normativa fiscal de cada CCAA.
        </p>
      </div>
    `;
  }

  /**
   * Tarifa estatal de Sucesiones (art. 21 LISD).
   * Escala simplificada.
   */
  private calcularSucesionesBase(base: number): number {
    const tramos = [
      { hasta: 7993.46,   tipo: 0.0765 },
      { hasta: 15980.91,  tipo: 0.0850 },
      { hasta: 23968.36,  tipo: 0.0935 },
      { hasta: 31955.81,  tipo: 0.1020 },
      { hasta: 39943.26,  tipo: 0.1105 },
      { hasta: 47930.72,  tipo: 0.1190 },
      { hasta: 55918.17,  tipo: 0.1275 },
      { hasta: 63905.62,  tipo: 0.1360 },
      { hasta: 71893.07,  tipo: 0.1445 },
      { hasta: 79880.52,  tipo: 0.1530 },
      { hasta: 119820.77, tipo: 0.1615 },
      { hasta: 159757.03, tipo: 0.1870 },
      { hasta: 239636.53, tipo: 0.2125 },
      { hasta: 398940.88, tipo: 0.2550 },
      { hasta: 797814.33, tipo: 0.2975 },
      { hasta: Infinity,  tipo: 0.3400 },
    ];

    return calcularProgresivo(base, tramos);
  }
}

customElements.define('calc-comparador-ccaa', CalcComparadorCCAA);
