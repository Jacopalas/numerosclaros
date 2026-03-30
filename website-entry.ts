// Entry point for the website build — includes ALL calculators (widgets + decisions)
export * from './packages/widgets/src/index.js';

// Decision calculators (plain JS web components)
import './packages/widgets/src/decisions/calc-comprar-vs-alquilar.js';
import './packages/widgets/src/decisions/calc-fijo-vs-variable.js';
import './packages/widgets/src/decisions/calc-amortizar-vs-invertir.js';
import './packages/widgets/src/decisions/calc-snowball-vs-avalanche.js';
import './packages/widgets/src/decisions/calc-pension-vs-fondo.js';
