# Fórmulas Matemáticas -- NumerosClaros

Referencia completa de las 25 fórmulas utilizadas en las calculadoras. Cada fórmula incluye la expresión matemática, las variables, un ejemplo numérico y la fuente.

---

## Universales

### 1. Hipoteca (Sistema Francés)

**Fórmula:**

```
M = P x [r(1+r)^n] / [(1+r)^n - 1]
```

**Variables:**
- `M` -- Cuota mensual
- `P` -- Principal (importe del préstamo)
- `r` -- Tipo de interés mensual (tipo anual / 12)
- `n` -- Número total de cuotas (años x 12)

**Ejemplo:**
Préstamo de 200.000 EUR a 25 años al 2,5% anual.

```
r = 0,025 / 12 = 0,002083
n = 25 x 12 = 300
M = 200.000 x [0,002083 x (1,002083)^300] / [(1,002083)^300 - 1]
M = 200.000 x [0,002083 x 1,8631] / [1,8631 - 1]
M = 200.000 x 0,003882 / 0,8631
M = 899,58 EUR/mes
```

Total pagado: 269.874 EUR. Intereses totales: 69.874 EUR.

**Fuente:** Formula estándar de amortización francesa. Banco de España -- Portal del Cliente Bancario.

---

### 2. Interés Compuesto

**Fórmula:**

```
A = P x (1 + r/n)^(n x t)
```

**Variables:**
- `A` -- Valor final
- `P` -- Capital inicial
- `r` -- Tipo de interés anual (decimal)
- `n` -- Frecuencia de capitalización por año (12 = mensual, 4 = trimestral, 1 = anual)
- `t` -- Número de años

**Ejemplo:**
10.000 EUR al 5% anual durante 20 años, capitalización mensual.

```
A = 10.000 x (1 + 0,05/12)^(12 x 20)
A = 10.000 x (1,004167)^240
A = 10.000 x 2,7126
A = 27.126,40 EUR
```

Ganancia neta: 17.126,40 EUR.

**Fuente:** Formula estándar de interés compuesto. Cualquier manual de matematica financiera.

---

### 3. Amortización (Cuadro de Amortización)

**Sistema Francés (cuota constante):**

```
Cuota = P x [r(1+r)^n] / [(1+r)^n - 1]
Intereses_k = Saldo_pendiente_(k-1) x r
Capital_k = Cuota - Intereses_k
Saldo_k = Saldo_(k-1) - Capital_k
```

**Sistema Americaño (solo intereses + devolución final):**

```
Cuota periódica = P x r
Ultima cuota = P x r + P
```

**Variables:**
- `k` -- Número de cuota
- `Intereses_k` -- Parte de intereses de la cuota k
- `Capital_k` -- Parte de amortización de capital de la cuota k
- `Saldo_k` -- Capital pendiente tras la cuota k

**Ejemplo (Frances):**
Préstamo 100.000 EUR, 3% anual, 10 años. Cuota mensual: 965,61 EUR.

```
Cuota 1:  Intereses = 100.000 x 0,0025 = 250,00 | Capital = 715,61 | Saldo = 99.284,39
Cuota 2:  Intereses = 99.284,39 x 0,0025 = 248,21 | Capital = 717,40 | Saldo = 98.566,99
...
Cuota 120: Intereses = 2,41 | Capital = 963,20 | Saldo = 0,00
```

**Fuente:** Banco de España -- Portal del Cliente Bancario.

---

### 4. Préstamo Personal

**Fórmula:**

Identica a la hipoteca (sistema frances), con parámetros típicos diferentes.

```
M = P x [r(1+r)^n] / [(1+r)^n - 1]
```

**Parámetros típicos:**
- Importe: 1.000 - 60.000 EUR
- Plazo: 1 - 8 años
- Tipo de interés: 5% - 12% TAE
- Sin garantía hipotecaria

**Ejemplo:**
Préstamo de 15.000 EUR a 5 años al 7,5% TAE.

```
r = 0,075 / 12 = 0,00625
n = 5 x 12 = 60
M = 15.000 x [0,00625 x (1,00625)^60] / [(1,00625)^60 - 1]
M = 15.000 x [0,00625 x 1,4533] / [1,4533 - 1]
M = 15.000 x 0,009083 / 0,4533
M = 300,57 EUR/mes
```

Total pagado: 18.034,20 EUR. Intereses: 3.034,20 EUR.

**Fuente:** Banco de España -- Portal del Cliente Bancario. Ley 16/2011 de contratos de crédito al consumo.

---

### 5. Ahorro (Valor Futuro con Aportaciónes Periodicas)

**Fórmula:**

```
FV = PMT x [((1+r)^n - 1) / r] x (1+r)   (si aportación al inicio del periodo)
FV = PMT x [((1+r)^n - 1) / r]              (si aportación al final del periodo)
```

Con capital inicial:

```
FV = P x (1+r)^n + PMT x [((1+r)^n - 1) / r]
```

**Variables:**
- `FV` -- Valor futuro acumulado
- `PMT` -- Aportación periódica
- `P` -- Capital inicial (opciónal)
- `r` -- Tipo de interés por periodo
- `n` -- Número total de periodos

**Ejemplo:**
Capital inicial 5.000 EUR, aportación mensual de 200 EUR, 4% anual, 15 años.

```
r = 0,04 / 12 = 0,003333
n = 15 x 12 = 180
FV = 5.000 x (1,003333)^180 + 200 x [((1,003333)^180 - 1) / 0,003333]
FV = 5.000 x 1,8194 + 200 x 245,82
FV = 9.097 + 49.164
FV = 58.261 EUR
```

Capital aportado: 5.000 + 36.000 = 41.000 EUR. Intereses generados: 17.261 EUR.

**Fuente:** Formula estándar de anualidad. Cualquier manual de matematica financiera.

---

### 6. Inflación (Valor Real)

**Fórmula:**

```
Valor_real = Valor_nóminal / (1 + i)^t
```

Formula inversa (cuánto necesitarás en el futuro):

```
Valor_futuro_necesario = Valor_actual x (1 + i)^t
```

**Variables:**
- `i` -- Tasa de inflación anual (decimal)
- `t` -- Número de años

**Ejemplo:**
Cuánto valdrán 50.000 EUR dentro de 10 años con inflación del 3% anual?

```
Valor_real = 50.000 / (1 + 0,03)^10
Valor_real = 50.000 / 1,3439
Valor_real = 37.205 EUR (en poder adquisitivo actual)
```

Es decir, 50.000 EUR dentro de 10 años comprarán lo que hoy compran 37.205 EUR.

Para mantener el poder adquisitivo:

```
Valor_futuro_necesario = 50.000 x (1,03)^10 = 67.196 EUR
```

**Fuente:** INE -- Índice de Precios al Consumo (IPC).

---

### 7. TIR / VAN

**Valor Actual Neto (VAN):**

```
VAN = -I_0 + SUM(t=1..n) [CF_t / (1+r)^t]
```

**Tasa Interna de Retorno (TIR):**

La TIR es el valor de `r` que hace VAN = 0:

```
0 = -I_0 + SUM(t=1..n) [CF_t / (1+TIR)^t]
```

Se resuelve por método iterativo (Newton-Raphson).

**Variables:**
- `I_0` -- Inversión inicial
- `CF_t` -- Flujo de caja en el periodo t
- `r` -- Tasa de descuento
- `n` -- Número de periodos

**Ejemplo:**
Inversión de 100.000 EUR. Flujos anuales: 30.000, 35.000, 40.000, 45.000. Tasa de descuento: 8%.

```
VAN = -100.000 + 30.000/(1,08)^1 + 35.000/(1,08)^2 + 40.000/(1,08)^3 + 45.000/(1,08)^4
VAN = -100.000 + 27.778 + 30.006 + 31.753 + 33.075
VAN = 22.612 EUR
```

TIR (por iteración): 17,8%. Como TIR > 8%, la inversión es rentable.

**Fuente:** Formula estándar de valoración de inversiónes. Principios de finanzas corporativas (Brealey, Myers & Allen).

---

### 8. Conversor de Divisas

**Fórmula:**

```
Cantidad_destino = Cantidad_origen x Tipo_cambio
```

**Variables:**
- `Cantidad_origen` -- Importe en la moneda de origen
- `Tipo_cambio` -- Tipo de cambio (unidades de destino por unidad de origen)

**Ejemplo:**
Convertir 1.000 EUR a USD con tipo de cambio 1,08.

```
Cantidad_USD = 1.000 x 1,08 = 1.080 USD
```

**Fuente:** Banco Central Europeo -- Tipos de cambio de referencia del euro.

---

### 9. ROI (Retorno sobre la Inversión)

**Fórmula:**

```
ROI = [(Valor_final - Coste) / Coste] x 100
```

ROI anualizado:

```
ROI_anual = [(1 + ROI/100)^(1/t) - 1] x 100
```

**Variables:**
- `Valor_final` -- Valor obtenido de la inversión (incluye plusvalías y dividendos/rentas)
- `Coste` -- Coste total de la inversión
- `t` -- Anos de la inversión

**Ejemplo:**
Compra de un inmueble por 150.000 EUR, venta a los 8 años por 210.000 EUR.

```
ROI = [(210.000 - 150.000) / 150.000] x 100 = 40%
ROI_anual = [(1 + 0,40)^(1/8) - 1] x 100 = 4,35% anual
```

**Fuente:** Métrica estándar de rentabilidad financiera.

---

## España

### 10. IRPF (Impuesto sobre la Renta de las Personas Físicas)

**Fórmula:**

El IRPF se calcula aplicando tramos progresivos a la base liquidable general:

```
Cuota = SUM(k=1..n) [min(Base_restante, Tramo_k) x Tipo_k]
```

**Tramos estatales + autonómicos 2025 (parte general):**

| Base liquidable (EUR) | Tipo estatal | Tipo autonomico (*) | Tipo total |
|---|---|---|---|
| 0 - 12.450 | 9,50% | 9,50% | 19,00% |
| 12.450 - 20.200 | 12,00% | 12,00% | 24,00% |
| 20.200 - 35.200 | 15,00% | 15,00% | 30,00% |
| 35.200 - 60.000 | 18,50% | 18,50% | 37,00% |
| 60.000 - 300.000 | 22,50% | 22,50% | 45,00% |
| Más de 300.000 | 24,50% | 22,50% | 47,00% |

(*) Los tipos autonómicos son los genericos. Cada comunidad autónoma puede modificarlos.

**Variables adicionales:**
- Mínimo personal y familiar: 5.550 EUR (contribuyente), 2.400 EUR (primer hijo), 2.700 EUR (segundo)...
- Reducciónes: rendimientos del trabajo, planes de pensiónes, etc.

**Ejemplo:**
Salario bruto: 40.000 EUR. Sin hijos, sin deducciónes especiales. Reducción por rendimientos del trabajo: 2.000 EUR. Base liquidable: 40.000 - 2.000 - 5.550 = 32.450 EUR.

```
Tramo 1: 12.450 x 19% = 2.365,50
Tramo 2: 7.750 x 24% = 1.860,00
Tramo 3: 12.250 x 30% = 3.675,00
Total IRPF = 7.900,50 EUR
Tipo efectivo = 7.900,50 / 40.000 = 19,75%
```

**Fuente:** Agencia Tributaria -- Ley 35/2006 del IRPF. Tablas actualizadas en art. 63 y 74 LIRPF. BOE-A-2006-20764.

---

### 11. Cuota de Autónomos (Sistema 2025)

**Fórmula:**

Desde 2023, la cuota de autónomos se calcula por tramos de rendimientos netos:

```
Cuota_mensual = Base_cotización x Tipo_cotización
```

Donde la base de cotización depende del tramo de rendimientos netos.

**Tramos de rendimientos netos mensuales 2025:**

| Rendimiento neto mensual (EUR) | Base mínima (EUR) | Cuota mínima aprox. (EUR) |
|---|---|---|
| <= 670 | 653,59 | 200 |
| 670 - 900 | 718,95 | 220 |
| 900 - 1.166,70 | 849,67 | 260 |
| 1.166,70 - 1.300 | 950,98 | 291 |
| 1.300 - 1.500 | 960,78 | 294 |
| 1.500 - 1.700 | 960,78 | 294 |
| 1.700 - 1.850 | 1.143,79 | 350 |
| 1.850 - 2.030 | 1.209,15 | 370 |
| 2.030 - 2.330 | 1.274,51 | 390 |
| 2.330 - 2.760 | 1.356,21 | 415 |
| 2.760 - 3.190 | 1.437,91 | 440 |
| 3.190 - 3.620 | 1.519,61 | 465 |
| 3.620 - 4.050 | 1.601,31 | 490 |
| 4.050 - 6.000 | 1.732,03 | 530 |
| > 6.000 | 1.928,10 | 590 |

Tipo de cotización general: 30,6% (incluye contingencias comunes, profesionales, cese de actividad y formación).

**Cálculo de rendimientos netos:**

```
Rendimiento_neto = Ingresos - Gastos_deducibles
Rendimiento_neto_mensual = Rendimiento_neto / 12
```

Deducción genérica por gastos de dificil justificacion: 7% (autónomos persona fisica) o 3% (societarios).

**Ejemplo:**
Autónomo con ingresos anuales de 36.000 EUR y gastos de 6.000 EUR.

```
Rendimiento neto = 36.000 - 6.000 = 30.000 EUR
Deducción 7% = 30.000 x 0,07 = 2.100 EUR
Rendimiento neto ajustado = 27.900 EUR
Rendimiento mensual = 27.900 / 12 = 2.325 EUR
Tramo: 2.030 - 2.330 EUR --> Base mínima 1.274,51 EUR
Cuota mensual = 1.274,51 x 0,306 = 390 EUR aprox.
Cuota anual = 390 x 12 = 4.680 EUR
```

**Fuente:** Real Decreto-ley 13/2022. Seguridad Social -- Sistema de cotización por ingresos reales. BOE-A-2022-12482.

---

### 12. IVA (Impuesto sobre el Valor Añadido)

**Fórmula:**

```
Importe_con_IVA = Base_imponible x (1 + tipo_IVA)
Cuota_IVA = Base_imponible x tipo_IVA
```

**Tipos vigentes:**

| Tipo | Porcentaje | Aplicación |
|---|---|---|
| General | 21% | La mayoría de bienes y servicios |
| Reducido | 10% | Alimentos, transporte, hostelería, vivienda nueva |
| Superreducido | 4% | Pan, leche, frutas, verduras, libros, medicamentos |

**Ejemplo:**
Factura de servicios profesionales por 1.500 EUR (tipo general).

```
Cuota IVA = 1.500 x 0,21 = 315 EUR
Total factura = 1.500 + 315 = 1.815 EUR
```

Para un autónomo, liquidación trimestral:

```
IVA repercutido (ventas) = 6.300 EUR
IVA soportado (compras) = 2.100 EUR
IVA a ingresar = 6.300 - 2.100 = 4.200 EUR
```

**Fuente:** Agencia Tributaria -- Ley 37/1992 del IVA. BOE-A-1992-28740.

---

### 13. Pensión de Jubilación

**Fórmula:**

```
Pensión_mensual = Base_reguladora x Porcentaje_años
```

**Base reguladora:**

```
Base_reguladora = SUM(bases_cotización últimos 300 meses) / 350
```

Se toman los últimos 25 años (300 meses) de cotización, divididos entre 350 (para distribuir 25 años en 14 pagas).

**Porcentaje según años cotizados:**
- 15 años: 50%
- 15 a 25 años: 50% + 0,21% por cada mes adicional entre 15 y 25 años
- 25 a 37 años: segun meses adicionales desde el año 25
- 37 años o mas: 100%

**Pensión máxima 2025:** 3.267,40 EUR/mes (14 pagas) = 45.743,60 EUR/ano.
**Pensión mínima 2025 (con cónyuge a cargo):** 1.033,20 EUR/mes (14 pagas).

**Ejemplo:**
Base reguladora de 2.200 EUR/mes, 35 años cotizados.

```
Porcentaje para 35 años: aprox. 97,32%
Pensión = 2.200 x 0,9732 = 2.141,04 EUR/mes
Pensión anual (14 pagas) = 2.141,04 x 14 = 29.974,56 EUR
```

**Fuente:** Seguridad Social -- Art. 209 y 210 del Real Decreto Legislativo 8/2015 (Ley General de la Seguridad Social). BOE-A-2015-11724.

---

### 14. Nómina (Salario Neto)

**Fórmula:**

```
Salario_neto = Salario_bruto - SS_trabajador - Retención_IRPF
```

**Cotizaciónes del trabajador a la Seguridad Social:**

| Concepto | Porcentaje |
|---|---|
| Contingencias comunes | 4,70% |
| Desempleo (contrato indefinido) | 1,55% |
| Formación profesional | 0,10% |
| MEI (Mecanismo de Equidad Intergeneracional) | 0,13% |
| **Total trabajador** | **6,48%** |

**Ejemplo:**
Salario bruto anual: 30.000 EUR (12 pagas + 2 extras).

```
Salario bruto mensual = 30.000 / 14 = 2.142,86 EUR (con extras prorrateadas: 2.500 EUR/mes)

SS trabajador mensual = 2.500 x 6,48% = 162,00 EUR
Base IRPF anual = 30.000 - (162 x 12) = 28.056 EUR (aprox.)
Retención IRPF estimada = 14% --> 30.000 x 14% / 12 = 350 EUR/mes

Neto mensual (12 pagas) = 2.500 - 162 - 350 = 1.988 EUR
Neto anual = 30.000 - 1.944 - 4.200 = 23.856 EUR
```

**Fuente:** Agencia Tributaria -- Reglamento del IRPF (RD 439/2007). Seguridad Social -- bases y tipos de cotización.

---

### 15. Plusvalía Municipal (IIVTNU)

Desde la reforma de 2021, el contribuyente puede elegir entre dos métodos:

**Método 1: Estimación objetiva (coeficientes)**

```
Base_imponible = Valor_catastral_suelo x Coeficiente
Cuota = Base_imponible x Tipo_impositivo
```

**Coeficientes por periodo de tenencia (2025):**

| Anos | Coeficiente |
|---|---|
| 1 | 0,14 |
| 2 | 0,13 |
| 3 | 0,15 |
| 4 | 0,17 |
| 5 | 0,17 |
| 6 | 0,16 |
| 7 | 0,12 |
| 8 | 0,10 |
| 9 | 0,09 |
| 10 | 0,08 |
| 11 | 0,08 |
| 12 | 0,08 |
| 13 | 0,08 |
| 14 | 0,10 |
| 15 | 0,12 |
| 16 | 0,16 |
| 17 | 0,20 |
| 18 | 0,26 |
| 19 | 0,36 |
| 20+ | 0,45 |

**Método 2: Plusvalía real**

```
Plusvalía_real = Precio_venta_suelo - Precio_compra_suelo
Base_imponible = Plusvalía_real
Cuota = Base_imponible x Tipo_impositivo
```

El tipo impositivo máximo es del 30% (cada ayuntamiento fija el suyo).

Se aplica el método más favorable para el contribuyente.

**Ejemplo:**
Venta de inmueble tras 10 años. Valor catastral del suelo: 50.000 EUR. Tipo municipal: 25%.

```
Método 1: Base = 50.000 x 0,08 = 4.000 EUR. Cuota = 4.000 x 25% = 1.000 EUR
Método 2: Si plusvalía real de venta es 20.000 EUR (proporción suelo 40%) = 8.000 EUR.
           Cuota = 8.000 x 25% = 2.000 EUR

Resultado: Se aplica Método 1 (más favorable) = 1.000 EUR
```

**Fuente:** Real Decreto-ley 26/2021 que modifica el TRLRHL. BOE-A-2021-17800.

---

### 16. Impuesto de Sucesiones y Donaciónes

**Formula general:**

```
Base_liquidable = Masa_hereditaria_individual - Reducciónes
Cuota_integra = Aplicar tarifa progresiva a Base_liquidable
Cuota_tributaria = Cuota_integra x Coeficiente_multiplicador
```

**Tarifa estatal (referencia):**

| Base liquidable (EUR) | Tipo marginal |
|---|---|
| 0 - 7.993,46 | 7,65% |
| 7.993,46 - 15.980,91 | 8,50% |
| 15.980,91 - 23.968,36 | 9,35% |
| 23.968,36 - 31.955,81 | 10,20% |
| 31.955,81 - 39.943,26 | 11,05% |
| 39.943,26 - 47.930,72 | 11,90% |
| 47.930,72 - 55.918,17 | 12,75% |
| 55.918,17 - 63.905,62 | 13,60% |
| 63.905,62 - 71.893,07 | 14,45% |
| 71.893,07 - 79.880,52 | 15,30% |
| 79.880,52 - 119.757,67 | 16,15% |
| 119.757,67 - 159.634,83 | 18,70% |
| 159.634,83 - 239.389,13 | 21,25% |
| 239.389,13 - 398.777,54 | 25,50% |
| 398.777,54 - 797.555,08 | 29,75% |
| Más de 797.555,08 | 34,00% |

**Reducciónes por grupo de parentesco:**
- Grupo I (descendientes menores de 21): 15.956,87 EUR + 3.990,72 EUR/año menor de 21
- Grupo II (cónyuge, descendientes 21+, ascendientes): 15.956,87 EUR
- Grupo III (colaterales 2o y 3er grado, ascendientes/descendientes por afinidad): 7.993,46 EUR
- Grupo IV (colaterales 4o grado y mas, extraños): 0 EUR

**Coeficientes multiplicadores (segun patrimonio preexistente y parentesco):**
- Grupos I y II: 1,0000 a 1,2000
- Grupo III: 1,5882 a 1,9059
- Grupo IV: 2,0000 a 2,4000

**Nota importante:** Las comunidades autonomás tienen competencia normativa y la mayoría aplican bonificaciones del 95-99% para herencias entre padres e hijos y cónyuges.

**Ejemplo:**
Herencia de 200.000 EUR para un hijo mayor de 21 años (Grupo II) en comunidad sin bonificacion propia.

```
Base imponible = 200.000 EUR
Reducción Grupo II = 15.956,87 EUR
Base liquidable = 200.000 - 15.956,87 = 184.043,13 EUR

Cuota integra (aplicando tarifa por tramos) = aprox. 31.104 EUR
Coeficiente multiplicador (Grupo II, patrimonio preexistente < 402.678 EUR) = 1,0000
Cuota tributaria = 31.104 x 1,0000 = 31.104 EUR
```

**Fuente:** Ley 29/1987 del Impuesto sobre Sucesiones y Donaciónes. BOE-A-1987-28141. Real Decreto 1629/1991 (Reglamento).

---

### 17. Impuesto sobre el Patrimonio

**Fórmula:**

```
Base_imponible = Valor_bienes_y_derechos - Deudas
Base_liquidable = Base_imponible - Mínimo_exento
Cuota = Aplicar tarifa progresiva a Base_liquidable
```

**Mínimo exento estatal:** 700.000 EUR.
**Vivienda habitual exenta:** hasta 300.000 EUR.

**Tarifa estatal:**

| Base liquidable (EUR) | Tipo marginal |
|---|---|
| 0 - 167.129,45 | 0,20% |
| 167.129,45 - 334.252,88 | 0,30% |
| 334.252,88 - 668.499,75 | 0,50% |
| 668.499,75 - 1.336.999,51 | 0,90% |
| 1.336.999,51 - 2.673.999,01 | 1,30% |
| 2.673.999,01 - 5.347.998,03 | 1,70% |
| 5.347.998,03 - 10.695.996,06 | 2,10% |
| Más de 10.695.996,06 | 3,50% |

**Ejemplo:**
Patrimonio total: 1.500.000 EUR. Vivienda habitual: 350.000 EUR (exenta hasta 300.000). Deudas: 100.000 EUR.

```
Bienes = 1.500.000 - 300.000 (exención vivienda) = 1.200.000
Base imponible = 1.200.000 - 100.000 (deudas) = 1.100.000
Base liquidable = 1.100.000 - 700.000 (mínimo exento) = 400.000

Tramo 1: 167.129,45 x 0,20% = 334,26
Tramo 2: 167.123,43 x 0,30% = 501,37
Tramo 3: 65.747,12 x 0,50% = 328,74
Total = 1.164,37 EUR
```

**Fuente:** Ley 19/1991 del Impuesto sobre el Patrimonio. BOE-A-1991-14392.

---

### 18. Impuesto de Sociedades

**Fórmula:**

```
Base_imponible = Resultado_contable +/- Ajustes_fiscales
Cuota_integra = Base_imponible x Tipo_impositivo
Cuota_liquida = Cuota_integra - Deducciónes - Bonificaciones
```

**Tipos impositivos 2025:**

| Tipo de entidad | Tipo |
|---|---|
| General | 25% |
| Empresas con cifra de negocios < 1 millon EUR | 23% |
| Entidades de nueva creacion (2 primeros ejercicios con base positiva) | 15% |
| Cooperativas fiscalmente protegidas | 20% |

**Ejemplo:**
SL con resultado contable de 80.000 EUR, cifra de negocios de 500.000 EUR, sin ajustes significativos.

```
Base imponible = 80.000 EUR
Tipo = 23% (facturación < 1 millon)
Cuota integra = 80.000 x 23% = 18.400 EUR
```

Si la misma empresa factura 2.000.000 EUR:

```
Tipo = 25% (general)
Cuota integra = 80.000 x 25% = 20.000 EUR
```

**Fuente:** Ley 27/2014 del Impuesto sobre Sociedades. BOE-A-2014-12328. Art. 29.

---

### 19. Retenciónes (IRPF en Facturas)

**Fórmula:**

```
Total_factura = Base_imponible + IVA - Retención_IRPF
Retención_IRPF = Base_imponible x Tipo_retención
```

**Tipos de retención:**

| Actividad | Retención |
|---|---|
| Actividades profesionales (general) | 15% |
| Nuevos autónomos profesionales (primeros 3 años) | 7% |
| Actividades artisticas | 15% |
| Actividades agricolas y ganaderas | 2% |
| Actividades forestales | 2% |
| Cesion derechos de imagen | 24% |

**Ejemplo:**
Factura de un disenador freelance (profesional, más de 3 años).

```
Base imponible = 2.000 EUR
IVA (21%) = 420 EUR
Retención IRPF (15%) = 300 EUR

Total factura = 2.000 + 420 - 300 = 2.120 EUR
```

El cliente ingresa los 300 EUR de retención a Hacienda en nombre del profesional.

**Fuente:** Agencia Tributaria -- Art. 95 y 101 del Reglamento del IRPF (RD 439/2007). BOE-A-2007-6820.

---

## Decisores

### 20. Comprar o Alquilar

**Fórmula:**

Se compara el coste total de cada opción a lo largo de N años:

**Coste total de comprar:**

```
Coste_compra = Entrada + SUM(cuotas_hipoteca) + Gastos_compra + SUM(IBI + Comunidad + Seguros + Mantenimiento) - Valor_venta_estimado + Plusvalía_municipal
```

Donde:
- `Entrada` -- Ahorro inicial destinado a la compra (tipicamente 20-30% del precio)
- `Gastos_compra` -- ITP/IVA + notaria + registro + gestoria (aprox. 10-12% del precio)
- `Valor_venta_estimado` -- Precio estimado de venta al final del periodo

**Coste total de alquilar:**

```
Coste_alquilar = SUM(alquiler_mensual x (1 + subida_anual)^ano) - Rendimiento_invertir_diferencia
```

Donde el ahorro que no se destina a la entrada se invierte a un tipo de interés.

**Ejemplo:**
Piso de 250.000 EUR. Alquiler equivalente: 900 EUR/mes. Horizonte: 20 años.

```
COMPRAR:
Entrada (20%) = 50.000 EUR
Gastos compra (10%) = 25.000 EUR
Hipoteca 200.000 EUR, 25 años, 2,5% = 899,58 EUR/mes x 240 meses = 215.899 EUR
IBI + comunidad + seguros = 250 EUR/mes x 240 = 60.000 EUR
Valor venta estimado (revalorización 2%/ano) = 250.000 x 1,02^20 = 371.486 EUR
Coste neto compra = 50.000 + 25.000 + 215.899 + 60.000 - 371.486 = -20.587 EUR (ganancia)

ALQUILAR:
Alquiler (subida 3%/ano) = total aprox. 290.000 EUR en 20 años
Inversión de 75.000 EUR (entrada + gastos) al 5% = 198.997 EUR
Coste neto alquiler = 290.000 - 198.997 = 91.003 EUR

En este escenario, comprar sale más rentable por aprox. 111.590 EUR.
```

**Fuente:** Modelo comparativo estándar. Banco de España -- "Guia de acceso al préstamo hipotecario".

---

### 21. Hipoteca Fija o Variable

**Fórmula:**

Se simula el coste total bajo distintos escenarios de evolucion del Euribor:

```
Coste_fijo = Cuota_fija x n_meses
Coste_variable = SUM(k=1..n) [Cuota_variable(Euribor_k + diferencial)]
```

La cuota variable se recalcula tipicamente cada 12 meses segun el Euribor vigente.

**Escenarios típicos de simulación:**
- Optimista: Euribor baja 0,5% gradualmente
- Neutro: Euribor se mantiene estable
- Pesimista: Euribor sube 1-2% gradualmente

**Ejemplo:**
Hipoteca 200.000 EUR, 25 años. Oferta fija: 2,80%. Oferta variable: Euribor + 0,80%.

```
FIJA:
Cuota = 926,17 EUR/mes (constante)
Total pagado = 926,17 x 300 = 277.851 EUR

VARIABLE (Euribor medio al 2,5% durante los 25 años):
Tipo medio = 2,5% + 0,8% = 3,30%
Cuota media = 979,07 EUR/mes
Total pagado = 979,07 x 300 = 293.721 EUR

VARIABLE (Euribor medio al 1,5%):
Tipo medio = 1,5% + 0,8% = 2,30%
Cuota media = 876,85 EUR/mes
Total pagado = 876,85 x 300 = 263.055 EUR

Conclusion: Si el Euribor medio se mantiene por debajo del 2,0%, la variable es mejor.
             Si supera el 2,0% de media, la fija es mejor.
```

**Fuente:** Banco de España -- Estadisticas del Euribor. Ley 5/2019 reguladora de los contratos de crédito inmobiliario.

---

### 22. Invertir o Amortizar Hipoteca

**Fórmula:**

Se compara el ahorro de intereses por amortización anticipada con el rendimiento esperado de la inversión:

**Ahorro por amortización:**

```
Ahorro_intereses = Intereses_sin_amortizar - Intereses_con_amortización
```

Puede reducir cuota (mismo plazo, menos cuota) o reducir plazo (misma cuota, menos años).

**Rendimiento por invertir:**

```
Rendimiento_inversión = Capital x [(1 + r)^t - 1]
Rendimiento_neto = Rendimiento_inversión x (1 - tipo_impositivo_ahorro)
```

Tipos del ahorro (2025): 19% (0-6.000 EUR), 21% (6.000-50.000), 23% (50.000-200.000), 27% (200.000-300.000), 28% (>300.000).

**Ejemplo:**
Hipoteca pendiente: 150.000 EUR al 2,5%, le quedan 20 años. Capital disponible: 20.000 EUR. Alternativa: invertir al 6% anual.

```
AMORTIZAR (reduciendo plazo):
Nuevo plazo: aprox. 16,5 años
Ahorro en intereses totales: aprox. 12.800 EUR

INVERTIR:
Rendimiento bruto 20 años = 20.000 x [(1,06)^20 - 1] = 44.143 EUR
Impuestos (21% medio) = 44.143 x 0,21 = 9.270 EUR
Rendimiento neto = 34.873 EUR

Conclusion: Invertir genera 34.873 EUR netos vs 12.800 EUR de ahorro en intereses.
             En este caso, invertir es mejor siempre que se mantenga un 6% de rentabilidad media.
```

**Nota:** Si el tipo de la hipoteca supera el 4-5%, amortizar suele ser mejor opción.

**Fuente:** Banco de España -- Portal del Cliente Bancario. Agencia Tributaria -- tipos impositivos del ahorro.

---

### 23. Autónomo o Sociedad Limitada

**Fórmula:**

Se compara la carga fiscal total en ambos régimenes para el mismo nivel de ingresos:

**Como autónomo:**

```
Carga_autónomo = Cuota_autónomos + IRPF(Rendimiento_neto)
Neto_autónomo = Ingresos - Gastos - Cuota_autónomos - IRPF
```

**Como SL + nómina del administrador:**

```
Carga_SL = IS(Beneficio_SL) + IRPF(Nómina_administrador) + SS_administrador
Beneficio_SL = Ingresos - Gastos - Nómina_administrador - SS_empresa
Neto_SL = Nómina_neta + Dividendos_netos
Dividendos_netos = (Beneficio_SL - IS) x (1 - tipo_ahorro)
```

**Ejemplo:**
Facturacion: 80.000 EUR. Gastos: 15.000 EUR.

```
AUTONOMO:
Rendimiento neto = 80.000 - 15.000 = 65.000 EUR
Cuota autónomos = aprox. 530 EUR/mes = 6.360 EUR/ano
Base IRPF = 65.000 - 6.360 = 58.640 EUR
IRPF (aplicando tramos) = aprox. 14.500 EUR
Total impuestos + cuotas = 6.360 + 14.500 = 20.860 EUR
Neto = 65.000 - 20.860 = 44.140 EUR

SL (nómina administrador 30.000 EUR):
SS administrador (autónomo societario) = aprox. 4.500 EUR/ano
Beneficio SL = 80.000 - 15.000 - 30.000 - 4.500 = 30.500 EUR
IS (23%) = 7.015 EUR
Beneficio despues IS = 23.485 EUR
Dividendos brutos = 23.485 EUR
IRPF dividendos (19-21%) = aprox. 4.750 EUR
Neto dividendos = 18.735 EUR
Nómina neta admin = 30.000 - 1.944 (SS trab.) - 4.200 (IRPF aprox.) = 23.856 EUR
Total neto = 23.856 + 18.735 = 42.591 EUR

En este caso, las cargas son similares. La SL suele compensar a partir de 50.000-60.000 EUR de beneficio
por la capacidad de diferir la tributación de dividendos y mayor facilidad de deducción de gastos.
```

**Fuente:** Agencia Tributaria -- IRPF e IS. Seguridad Social -- régimen de autónomos. Ley 27/2014 IS. Ley 35/2006 IRPF.

---

### 24. Rescate del Plan de Pensiónes

**Fórmula:**

Las prestaciones de planes de pensiónes tributan como rendimientos del trabajo en el IRPF:

```
IRPF_rescate = Aplicar_tramos_IRPF(Otros_rendimientos_trabajo + Rescate)
```

**Modalidades de rescate:**
- **Capital (de golpe):** Se suma todo a la base imponible del ano. Puede disparar el tipo marginal.
- **Renta (periódica):** Se reparte en mensualidades/anualidades. Menor impacto fiscal.
- **Mixto:** Parte en capital + parte en renta.

**Reducción por aportaciónes pre-2007:** 40% de reducción sobre las aportaciónes anteriores a 01/01/2007 si se rescata en capital.

**Ejemplo:**
Plan de pensiónes: 120.000 EUR (40.000 aportados antes de 2007). Salario actual: 35.000 EUR.

```
RESCATE EN CAPITAL (todo de golpe):
Reducción pre-2007 = 40.000 x 40% = 16.000 EUR
Base rescate = 120.000 - 16.000 = 104.000 EUR
Base total IRPF = 35.000 + 104.000 = 139.000 EUR
IRPF total = aprox. 48.500 EUR
IRPF sin rescate = aprox. 5.500 EUR
Coste fiscal del rescate = 43.000 EUR (tipo medio del rescate: 41,3%)

RESCATE EN RENTA (10.000 EUR/año durante 12 años):
Base anual IRPF = 35.000 + 10.000 = 45.000 EUR
IRPF anual = aprox. 8.800 EUR
IRPF sin rescate = 5.500 EUR
Coste fiscal anual del rescate = 3.300 EUR
Coste fiscal total = 3.300 x 12 = 39.600 EUR (tipo medio: 33%)

RESCATE MIXTO (40.000 en capital + 6.667/año durante 12 años):
Ano 1: Base = 35.000 + 24.000 (40.000 - 40% reducción) + 6.667 = 65.667 EUR
Resto años: Base = 35.000 + 6.667 = 41.667 EUR
Coste fiscal total estimado = aprox. 35.800 EUR (tipo medio: 29,8%)

Conclusion: El rescate mixto (aprovechando la reducción del 40%) es el más eficiente fiscalmente.
```

**Fuente:** Agencia Tributaria -- Art. 17.2.a.3 y DT 12a de la Ley 35/2006 del IRPF. BOE-A-2006-20764.

---

### 25. Fijo o Variable (Tipo de Interes en Préstamos)

Este decisor es un alias extendido del numero 21 (Hipoteca Fija o Variable), aplicable tambien a préstamos personales y financiacion empresarial. La formula y métodologia son identicas.

Para mayor detalle, consultar la [seccion 21: Hipoteca Fija o Variable](#21-hipoteca-fija-o-variable).

---

## Notas generales

- Las cifras fiscales corresponden a la normativa estatal vigente en 2025. Las comunidades autonomás pueden modificar tramos, tipos y deducciónes.
- Los ejemplos son orientativos y no constituyen asesoramiento fiscal.
- Los tipos del Euribor, inflación y rentabilidades de inversión son estimaciónes para los ejemplos.
- Para cálculos oficiales, consultar siempre la Agencia Tributaria (www.agenciatributaria.es) y la Seguridad Social (www.seg-social.es).

## Fuentes principales

- **Agencia Tributaria** -- www.agenciatributaria.es
- **Seguridad Social** -- www.seg-social.es
- **Banco de España** -- www.bde.es
- **BOE** -- www.boe.es
- **INE** -- www.ine.es
- **Ley 35/2006 del IRPF** -- BOE-A-2006-20764
- **Ley 37/1992 del IVA** -- BOE-A-1992-28740
- **Ley 27/2014 del Impuesto sobre Sociedades** -- BOE-A-2014-12328
- **Ley 29/1987 del Impuesto sobre Sucesiones** -- BOE-A-1987-28141
- **Ley 19/1991 del Impuesto sobre el Patrimonio** -- BOE-A-1991-14392
- **RDL 8/2015 Ley General de la Seguridad Social** -- BOE-A-2015-11724
- **RDL 13/2022 Sistema de cotización autónomos** -- BOE-A-2022-12482
- **RDL 26/2021 Plusvalía municipal** -- BOE-A-2021-17800
