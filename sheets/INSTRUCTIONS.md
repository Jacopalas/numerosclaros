# NumerosClaros Sheets — Instrucciones de Uso

## Copia tu propio Sheets

### Opción A: Generación automática (recomendado)

1. Instala las dependencias:
   ```bash
   pip install gspread google-auth google-auth-oauthlib
   ```

2. Configura las credenciales de Google:
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Crea un proyecto o selecciona uno existente
   - Habilita la **Google Sheets API** y la **Google Drive API**
   - Ve a **APIs & Services > Credentials**
   - Crea credenciales **OAuth 2.0 Client ID** (tipo "Desktop app")
   - Descarga el JSON y guárdalo como `credentials.json` en la raíz del proyecto

3. Ejecuta el script:
   ```bash
   python sheets/create_sheets.py
   ```

4. Se abrirá el navegador para autenticarte con Google. Acepta los permisos.

5. El script creará el Sheets completo y te dará la URL.

### Opción B: Copia manual

Si prefieres crear las pestañas manualmente, consulta el archivo `FORMULAS.md` para todas las fórmulas exactas de cada pestaña.

---

## Cómo usar las calculadoras

### Código de colores

| Color | Significado |
|-------|-------------|
| **Amarillo claro** | Celda de entrada — introduce tus datos aquí |
| **Verde claro** | Resultado calculado — no modificar |
| **Azul oscuro** | Cabecera de sección |
| **Azul claro** | Título de subsección |

### Celdas con notas

Muchas celdas tienen una **nota explicativa** (triángulo negro en la esquina). Pasa el ratón por encima para ver qué dato introducir.

### Protección de celdas

Las celdas de fórmula están protegidas con aviso. Si intentas editarlas, Google Sheets te mostrará un aviso. **No las modifiques** a menos que sepas lo que haces.

---

## Guía por pestaña

### Universales

| # | Pestaña | Qué introduce el usuario | Qué obtiene |
|---|---------|--------------------------|-------------|
| 1 | Hipoteca | Precio, entrada, tipo, plazo | Cuota mensual, tabla amortización, gráfico interés vs capital |
| 2 | Interés Compuesto | Capital, aportación, tasa, años | Capital final, tabla año a año, gráfico exponencial |
| 3 | Comparador Préstamos | 3 préstamos (importe, tipo, plazo) | Cuota, total, intereses de cada uno; mejor opción |
| 4 | ROI | Inversión, valor final, años | ROI %, CAGR, multiplicador |
| 5 | Inflación | Cantidad, tasa inflación, años | Poder adquisitivo futuro, gráfico |
| 6 | Snowball vs Avalanche | Hasta 4 deudas con saldo/tipo/mínimo | Recomendación de estrategia |
| 7 | Presupuesto 50/30/20 | Ingresos netos mensuales | Distribución + gráfico donut |
| 8 | Fondo Emergencia | Gastos, meses cobertura, ahorros | Objetivo, brecha, fecha estimada |
| 9 | Meta Ahorro | Objetivo, ahorros, plazo, rentabilidad | Ahorro mensual necesario |

### España

| # | Pestaña | Qué introduce el usuario | Qué obtiene |
|---|---------|--------------------------|-------------|
| 10 | IRPF | Base imponible | Cuota por tramos, tipo efectivo y marginal |
| 11 | Sueldo Neto | Bruto anual, pagas, tipo contrato | Desglose SS + IRPF, neto mensual |
| 12 | FIRE España | Gastos, ingresos, patrimonio, rentabilidad | Número FIRE, años hasta FIRE, gráfico |
| 13 | Autónomo vs SL | Facturación, gastos | Neto como autónomo vs SL, recomendación |
| 14 | Pensión Jubilación | Edad, salario, ahorros, aportación | Pensión estimada, patrimonio, balance mensual |
| 15 | Gastos Compra Vivienda | Precio, tipo vivienda, CCAA | ITP/IVA, notaría, registro, total |
| 16 | Plusvalía Municipal | Catastral, compra, venta, años | Método objetivo vs real, cuál es menor |
| 17 | Cuota Autónomos | Ingresos, gastos | Cuota mensual según tramos 2025-2026 |
| 18 | Rescate Plan Pensiones | Valor plan, otros ingresos, años | IRPF golpe vs repartido, ahorro fiscal |
| 19 | Comparador CCAA | (tabla de referencia) | IRPF, ITP, AJD por comunidad |

### Decisores

| # | Pestaña | Qué introduce el usuario | Qué obtiene |
|---|---------|--------------------------|-------------|
| 20 | Comprar o Alquilar | Precio, entrada, alquiler, rentabilidad | Patrimonio a 10-20-30 años, veredicto |
| 21 | Fijo o Variable | Importe, tipo fijo, diferencial | Cuota en 3 escenarios Euribor |
| 22 | Amortizar o Invertir | Capital pendiente, cantidad, rentabilidad | Ahorro intereses vs ganancia inversión |
| 23 | Snowball o Avalanche | 4 preguntas Sí/No | Recomendación personalizada |
| 24 | Plan Pensiones vs Fondo | Aportación, tipos, comisiones | Neto de cada opción con inversión del ahorro fiscal |

---

## Datos fiscales incluidos

- **IRPF 2025-2026**: Tramos estatales combinados (19%-47%)
- **Seguridad Social**: Cotizaciones trabajador (6.48% contrato indefinido)
- **Cuota Autónomos**: 15 tramos por rendimientos netos (200-590 €/mes)
- **ITP por CCAA**: Tipos generales (6%-13%)
- **AJD por CCAA**: Tipos generales (0.5%-1.5%)
- **Plusvalía Municipal**: Coeficientes máximos 2025 (RDL 8/2023)
- **Escala del ahorro**: 19%-30% (dividendos y ganancias patrimoniales)
- **IS**: 25% tipo general

---

## Limitaciones

1. **Cálculo IRPF simplificado**: Usa tramos combinados por defecto. No incluye deducciones personales/familiares ni mínimo personal.
2. **Cuota autónomos**: Usa los tramos generales. No contempla bases de cotización opcionales.
3. **ITP**: Tipos generales. Algunas CCAA tienen tipos progresivos según valor.
4. **Pensión jubilación**: Estimación simplificada (70% último salario). La pensión real depende de bases de cotización de los últimos 25 años.
5. **Snowball/Avalanche**: Sin simulación mes a mes (limitación de Sheets sin iteración). Usa la web de NumerosClaros para simulación completa.

---

## Actualizaciones

Los datos fiscales corresponden a **2025-2026**. Si cambian los tramos o tipos, actualiza las fórmulas en las pestañas correspondientes.

Fuentes de datos:
- [Agencia Tributaria](https://www.agenciatributaria.es/)
- [Seguridad Social](https://www.seg-social.es/)
- [BOE](https://www.boe.es/)

---

## Soporte

- Repositorio: [github.com/Jacopalas/numerosclaros](https://github.com/Jacopalas/numerosclaros)
- Web: NumerosClaros.com
