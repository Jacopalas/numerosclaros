# 🧮 NumerosClaros

> Calculadoras financieras open source para España. Web Components embeddables + Google Sheets + lógica fiscal española.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/numerosclaros)](https://www.npmjs.com/package/numerosclaros)

---

## ¿Qué es NumerosClaros?

Suite de **24 calculadoras financieras** diseñadas para España. Cada calculadora es un Web Component estándar que puedes pegar en cualquier web con una línea de HTML. También disponible como funciones para Google Sheets.

**Para quién:**
- Desarrolladores que necesitan widgets financieros embeddables
- Bloggers y medios financieros que quieren calculadoras en sus artículos
- Asesores fiscales que usan Google Sheets
- Cualquiera que necesite hacer cálculos financieros con la fiscalidad española

**Por qué es diferente:**
- 🇪🇸 **Hecho para España**: IRPF, autónomos, pensiones, plusvalía... con los tramos y reglas vigentes
- 🧩 **Web Components estándar**: funciona en cualquier web, framework o CMS
- 📊 **Google Sheets**: las mismas fórmulas como funciones de hoja de cálculo
- 🔓 **Open source (MIT)**: úsalo gratis, modifícalo, contribuye
- ⚡ **Cero dependencias**: vanilla JS, <5KB por componente
- 📱 **Responsive**: se adapta a cualquier pantalla

## Inicio rápido

### CDN (la más fácil)

```html
<script src="https://cdn.jsdelivr.net/npm/numerosclaros@latest/dist/numerosclaros.min.js"></script>
<nc-hipoteca></nc-hipoteca>
```

### npm

```bash
npm install numerosclaros
```

```js
import 'numerosclaros'
// Usa <nc-hipoteca></nc-hipoteca> en tu HTML
```

### Google Sheets

```
=NC_HIPOTECA(200000, 25, 2.5)
```

[Abrir plantilla de Google Sheets](#)

## Calculadoras

### Universales (9)

| Calculadora | Componente | Sheets | Estado |
|---|---|---|---|
| Hipoteca | `<nc-hipoteca>` | `NC_HIPOTECA()` | 🔨 En desarrollo |
| Interés compuesto | `<nc-interes-compuesto>` | `NC_INTERES_COMPUESTO()` | 🔨 En desarrollo |
| Amortización | `<nc-amortizacion>` | `NC_AMORTIZACION()` | 🔨 En desarrollo |
| Préstamo personal | `<nc-prestamo-personal>` | `NC_PRESTAMO_PERSONAL()` | 🔨 En desarrollo |
| Ahorro | `<nc-ahorro>` | `NC_AHORRO()` | 🔨 En desarrollo |
| Inflación | `<nc-inflacion>` | `NC_INFLACION()` | 🔨 En desarrollo |
| TIR / VAN | `<nc-tir>` | `NC_TIR()` | 🔨 En desarrollo |
| Conversor de divisas | `<nc-divisas>` | `NC_DIVISAS()` | 🔨 En desarrollo |
| ROI | `<nc-roi>` | `NC_ROI()` | 🔨 En desarrollo |

### España (10)

| Calculadora | Componente | Sheets | Estado |
|---|---|---|---|
| IRPF | `<nc-irpf>` | `NC_IRPF()` | 🔨 En desarrollo |
| Autónomos | `<nc-autonomos>` | `NC_AUTONOMOS()` | 🔨 En desarrollo |
| IVA | `<nc-iva>` | `NC_IVA()` | 🔨 En desarrollo |
| Pensión | `<nc-pension>` | `NC_PENSION()` | 🔨 En desarrollo |
| Nómina | `<nc-nomina>` | `NC_NOMINA()` | 🔨 En desarrollo |
| Plusvalía municipal | `<nc-plusvalia>` | `NC_PLUSVALIA()` | 🔨 En desarrollo |
| Sucesiones | `<nc-sucesiones>` | `NC_SUCESIONES()` | 🔨 En desarrollo |
| Patrimonio | `<nc-patrimonio>` | `NC_PATRIMONIO()` | 🔨 En desarrollo |
| Sociedades | `<nc-sociedades>` | `NC_SOCIEDADES()` | 🔨 En desarrollo |
| Retenciones | `<nc-retenciones>` | `NC_RETENCIONES()` | 🔨 En desarrollo |

### Decisores (5)

| Calculadora | Componente | Sheets | Estado |
|---|---|---|---|
| ¿Comprar o alquilar? | `<nc-comprar-alquilar>` | `NC_COMPRAR_ALQUILAR()` | 🔨 En desarrollo |
| ¿Fija o variable? | `<nc-fijo-variable>` | `NC_FIJO_VARIABLE()` | 🔨 En desarrollo |
| ¿Invertir o amortizar? | `<nc-invertir-amortizar>` | `NC_INVERTIR_AMORTIZAR()` | 🔨 En desarrollo |
| ¿Autónomo o SL? | `<nc-autonomo-sl>` | `NC_AUTONOMO_SL()` | 🔨 En desarrollo |
| Rescate plan pensiones | `<nc-rescate-plan>` | `NC_RESCATE_PLAN()` | 🔨 En desarrollo |

## Documentación

- [Fórmulas matemáticas](FORMULAS.md)
- [Web de demo y docs](https://jacopalas.github.io/numerosclaros/)
- [Cómo contribuir](CONTRIBUTING.md)

## Contribuir

¡Las contribuciones son bienvenidas! Lee [CONTRIBUTING.md](CONTRIBUTING.md) para empezar.

## Licencia

[MIT](LICENSE) — Úsalo como quieras.

---

# 🇬🇧 English

## What is NumerosClaros?

A suite of **24 open source financial calculators** designed for Spain. Each calculator is a standard Web Component you can embed in any website with a single line of HTML. Also available as Google Sheets functions.

**Who it's for:**
- Developers needing embeddable financial widgets
- Financial bloggers wanting calculators in their articles
- Tax advisors using Google Sheets
- Anyone needing financial calculations with Spanish tax rules

**Why it's different:**
- 🇪🇸 **Built for Spain**: IRPF, self-employed tax, pensions, capital gains... with current brackets and rules
- 🧩 **Standard Web Components**: works in any website, framework, or CMS
- 📊 **Google Sheets**: same formulas available as spreadsheet functions
- 🔓 **Open source (MIT)**: use it for free, modify it, contribute
- ⚡ **Zero dependencies**: vanilla JS, <5KB per component
- 📱 **Responsive**: adapts to any screen size

## Quick Start

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/numerosclaros@latest/dist/numerosclaros.min.js"></script>
<nc-hipoteca></nc-hipoteca>
```

### npm

```bash
npm install numerosclaros
```

```js
import 'numerosclaros'
// Use <nc-hipoteca></nc-hipoteca> in your HTML
```

### Google Sheets

```
=NC_HIPOTECA(200000, 25, 2.5)
```

[Open Google Sheets template](#)

## Calculators

See the [full calculator list](#calculadoras) above (Spanish section). All 24 calculators work identically in both Spanish and English interfaces.

## Documentation

- [Mathematical formulas](FORMULAS.md)
- [Demo website](https://jacopalas.github.io/numerosclaros/)
- [Contributing guide](CONTRIBUTING.md)

## License

[MIT](LICENSE)
