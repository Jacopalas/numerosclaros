# NumerosClaros — Documentación de Fórmulas

Todas las fórmulas usan funciones nativas de Google Sheets. No se requiere Apps Script.

---

## Convenciones

- **Celdas amarillas** (`#FFF9C4`): datos de entrada del usuario
- **Celdas verdes** (`#E8F5E9`): resultados calculados (protegidas)
- Los tipos de interés se introducen como número (ej: `3` para 3%) y se dividen internamente
- Todas las cantidades en euros (€)
- Formato numérico: `es-ES`

---

## 1. Hipoteca

### Cuota mensual (sistema francés)
```
Tipo mensual:     =C6/100/12
Nº cuotas:        =C7*12
Cuota mensual:    =IF(C11=0, C10/C12, C10*C11*(1+C11)^C12/((1+C11)^C12-1))
```

Fórmula matemática: `M = P × r(1+r)^n / ((1+r)^n - 1)`

### Tabla de amortización (360 filas)
```
Mes 1:
  Interés:          =ROUND(Capital_pendiente * Tipo_mensual, 2)
  Capital:          =ROUND(Cuota - Interés, 2)
  Capital pendiente: =ROUND(Capital_anterior - Capital_amortizado, 2)
  % Amortizado:     =Capital_amortizado / Préstamo_total

Mes N:
  Interés:          =ROUND(E{N-1} * $C$11, 2)
  Capital:          =ROUND(B{N} - C{N}, 2)
  Capital pendiente: =ROUND(E{N-1} - D{N}, 2)
```

---

## 2. Interés Compuesto

### Capital final
```
=IF(C6=0,
  C4 + C5*12*C7,
  C4*(1+C6/100/12)^(C7*12) + C5*((1+C6/100/12)^(C7*12)-1)/(C6/100/12))
```

Fórmula matemática: `A = P(1+r/n)^(nt) + PMT × ((1+r/n)^(nt) - 1) / (r/n)`

### Tabla año a año
```
Balance año Y: =C4*(1+C6/100/12)^(Y*12) + C5*((1+C6/100/12)^(Y*12)-1)/(C6/100/12)
Aportado:      =C4 + C5*12*Y
Intereses:     =Balance - Aportado
```

---

## 3. Comparador Préstamos

Misma fórmula de cuota francesa aplicada 3 veces:
```
Cuota = IF(tipo=0, importe/cuotas, importe*r*(1+r)^n/((1+r)^n-1))
Total = Cuota * Nº cuotas
Intereses = Total - Importe
Mejor = IF(Total_A = MIN(Total_A, Total_B, Total_C), "✓ MEJOR", "")
```

---

## 4. ROI

```
Beneficio:       =Valor_final - Inversión_inicial
ROI total:       =(Valor_final - Inversión) / Inversión
ROI anualizado:  =(Valor_final / Inversión)^(1/años) - 1     ← CAGR
Multiplicador:   =Valor_final / Inversión
```

---

## 5. Inflación

```
Poder adquisitivo futuro:  =Cantidad / (1 + inflación/100)^años
Pérdida:                   =Cantidad - Poder_adquisitivo
% pérdida:                 =Pérdida / Cantidad
Necesitarás:               =Cantidad * (1 + inflación/100)^años
```

---

## 6. Snowball vs Avalanche

```
Orden Snowball:  Menor saldo primero  → IF(AND(B6<=C6, B6<=D6...), B5, ...)
Orden Avalanche: Mayor interés primero → IF(AND(B7>=C7, B7>=D7...), B5, ...)
Recomendación:   =IF(COUNTIF(B7:E7,">"&18)>0, "AVALANCHE", "SNOWBALL")
```

---

## 7. Presupuesto 50/30/20

```
Necesidades: =Ingresos * 0.50
Deseos:      =Ingresos * 0.30
Ahorro:      =Ingresos * 0.20
Estado:      =IF(Gasto_real <= Presupuesto, "✓ OK", "⚠ Exceso")
```

---

## 8. Fondo Emergencia

```
Objetivo:           =Gastos_mensuales * Meses_cobertura
Brecha:             =MAX(0, Objetivo - Ahorros_actuales)
Progreso:           =MIN(1, Ahorros / Objetivo)
Meses para completar: =IF(Brecha=0, 0, ROUNDUP(Brecha / Capacidad_ahorro, 0))
Fecha estimada:     =IF(Meses=0, "¡Ya lo tienes!", EDATE(TODAY(), Meses))
```

---

## 9. Meta Ahorro

### Ahorro mensual con interés (PMT inverso)
```
=IF(tasa=0,
  Brecha/Meses,
  (Objetivo - Ahorros*(1+r)^n) * r / ((1+r)^n - 1))

donde r = tasa/100/12, n = meses
```

---

## 10. IRPF

### Cálculo progresivo por tramos
```
Tramo 1: =MIN(12450, MAX(0, Base)) * 0.19
Tramo 2: =MIN(7750,  MAX(0, Base-12450)) * 0.24
Tramo 3: =MIN(15000, MAX(0, Base-20200)) * 0.30
Tramo 4: =MIN(24800, MAX(0, Base-35200)) * 0.37
Tramo 5: =MIN(240000,MAX(0, Base-60000)) * 0.45
Tramo 6: =MAX(0, Base-300000) * 0.47

Total = SUM(todos los tramos)
Tipo efectivo = Total / Base
Tipo marginal = IF(Base>300000, 47%, IF(Base>60000, 45%, ...))
```

Tramos 2025-2026 (combinados estatal + autonómico por defecto):
| Desde | Hasta | Tipo |
|-------|-------|------|
| 0 | 12.450 | 19% |
| 12.450 | 20.200 | 24% |
| 20.200 | 35.200 | 30% |
| 35.200 | 60.000 | 37% |
| 60.000 | 300.000 | 45% |
| 300.000 | ∞ | 47% |

---

## 11. Sueldo Neto

### Seguridad Social trabajador
```
Contingencias comunes:   =Bruto * 0.047
Desempleo (indefinido):  =Bruto * 0.0155
Desempleo (temporal):    =Bruto * 0.016
Formación profesional:   =Bruto * 0.001
MEI:                     =Bruto * 0.0013
Total SS:                =SUM(todas)  → ~6.48%
```

### Base imponible y IRPF
```
Base imponible = Bruto - SS
IRPF = cálculo progresivo (ver pestaña 10)
Neto anual = Bruto - SS - IRPF
Neto mensual = Neto_anual / Nº_pagas
```

---

## 12. FIRE España

```
Número FIRE:       =Gastos_anuales / (SWR/100)
Ahorro anual:      =Ingresos - Gastos
Tasa de ahorro:    =Ahorro / Ingresos

Evolución patrimonial año Y:
  Patrimonio[Y] = Patrimonio[Y-1] * (1 + rentabilidad/100) + Ahorro_anual

Años hasta FIRE:
  =IFERROR(MATCH(TRUE, INDEX(B17:B67 >= Número_FIRE, 0), 0) - 1, ">50 años")
```

SWR España: **3.25%** (vs 4% USA, por menor rentabilidad histórica y costes sanitarios).

---

## 13. Autónomo vs SL

### Autónomo
```
Rendimiento neto:                  =Facturación - Gastos
Reducción gastos difícil justif.:  =Rend_neto * 0.05
Cuota autónomos:                   =LOOKUP por tramos (ver tabla tramos)
Base imponible IRPF:               =Rend_neto_reducido - Cuota_autónomos
IRPF:                              =cálculo progresivo
Neto:                              =Facturación - Gastos - Cuota - IRPF
```

### Sociedad Limitada
```
Beneficio:          =Facturación - Gastos
IS (25%):           =Beneficio * 0.25
Beneficio neto IS:  =Beneficio - IS
Salario admin:      =[dato usuario]
SS trabajador:      =Salario * 6.48%
SS empresa:         =Salario * 30.57%
IRPF salario:       =cálculo progresivo
Dividendos:         =Beneficio_neto_IS - Salario - SS_empresa
IRPF dividendos:    =escala ahorro (19-23%)
Cuota autón. societ.: =424 * 12
Neto SL:            =Salario - SS_trabajador - IRPF_salario + Dividendos - IRPF_dividendos - Cuota_societ
```

---

## 14. Pensión Jubilación

```
Salario al jubilarse:    =Salario_actual * (1 + crecimiento)^años
Pensión pública estimada: =Salario_jubilación * 0.70 / 12   (estimación 70%)
Patrimonio al jubilarse:  =Ahorros*(1+r)^n + Aportación*12*((1+r)^n-1)/r
Renta ahorro privado:    =Patrimonio * 0.03 / 12   (retiro 3% anual)
Balance mensual:         =Pensión + Renta_ahorro - Gastos
```

---

## 15. Gastos Compra Vivienda

```
ITP (2ª mano):    =Precio * tipo_CCAA   (6-13% según CCAA)
IVA (nueva):      =Precio * 0.10
AJD (nueva):      =Precio * tipo_CCAA_AJD (0.5-1.5%)
Notaría:          =Precio * 0.003
Registro:         =Precio * 0.0018
Gestoría:         =400 (fijo)
Tasación:         =350 (si hipoteca)
Total:            =Precio + Impuestos + Gastos
```

---

## 16. Plusvalía Municipal

### Método objetivo
```
Coeficiente = LOOKUP por años de propiedad (tabla RDL 8/2023)
Base imponible = Valor_catastral_suelo * Coeficiente
Cuota = Base * Tipo_impositivo_municipal / 100
```

### Método real
```
Ganancia = Precio_venta - Precio_compra
% suelo = Valor_catastral_suelo / Precio_compra
Plusvalía suelo = Ganancia * %_suelo
Cuota = Plusvalía_suelo * Tipo / 100
```

**Se paga la MENOR de ambas.** Si no hay ganancia real, no se paga (STC 182/2021).

---

## 17. Cuota Autónomos

```
Rendimiento neto mensual = (Ingresos - Gastos) / 12
Cuota = LOOKUP en tabla de 15 tramos

Tabla 2025-2026:
  ≤670€/mes  → 200€    |  1700-1850  → 350€
  670-900    → 225€    |  1850-2030  → 370€
  900-1167   → 250€    |  2030-2330  → 396€
  1167-1300  → 267€    |  2330-2760  → 423€
  1300-1500  → 280€    |  2760-3190  → 456€
  1500-1700  → 294€    |  3190-3620  → 480€
                        |  3620-4050  → 490€
                        |  4050-6000  → 504€
                        |  >6000     → 590€

Tarifa plana nuevos: 80€/mes × 12 meses
```

---

## 18. Rescate Plan Pensiones

### Rescate de golpe vs en N años
```
IRPF golpe:      =cálculo_progresivo(Plan + Otros_ingresos) - cálculo_progresivo(Otros_ingresos)
IRPF repartido:  =(cálculo_progresivo(Plan/N + Otros) - cálculo_progresivo(Otros)) * N
Ahorro fiscal:   =IRPF_golpe - IRPF_repartido
```

---

## 19. Comparador CCAA

Tabla de referencia con datos estáticos:
- IRPF marginal máximo (combinado)
- ITP tipo general
- AJD tipo general
- Observaciones

---

## 20. Comprar o Alquilar

### Escenario compra
```
Cuota hipoteca:         =fórmula francesa
Valor vivienda año Y:   =Precio * (1 + revalorización)^Y
```

### Escenario alquiler + inversión
```
Diferencia mensual:     =MAX(0, Cuota_hipoteca - Alquiler)
Patrimonio inversión:   =Entrada*(1+r)^Y + Diferencia*12*((1+r)^Y-1)/r
Total alquiler pagado:  =Alquiler*12*((1+subida)^Y-1)/(subida)
```

### Veredicto
```
Patrimonio compra:  =Valor_vivienda_Y - Intereses_pagados_proporción
Patrimonio alquiler: =Inversión_Y - Alquiler_total_Y
Mejor: =IF(P_compra > P_alquiler, "COMPRAR", "ALQUILAR")
```

---

## 21. Tipo Fijo o Variable

```
Tipo total variable = Euribor + Diferencial
Cuota variable:     =fórmula francesa con tipo_total_variable
Cuota fija:         =fórmula francesa con tipo_fijo
Diferencia:         =Cuota_fija - Cuota_variable
Coste total:        =Cuota * Plazo * 12
```

3 escenarios: Euribor bajo (1.5%), medio (2.5%), alto (4.0%).

---

## 22. Amortizar o Invertir

### Amortizar
```
Nueva cuota (reduciendo cuota): =fórmula francesa con Capital_pendiente - Amortización
Ahorro total intereses:         =Intereses_sin_amortizar - Intereses_tras_amortizar
Deducción fiscal:               =IF(Vivienda_habitual_pre2013, MIN(Cantidad, 9040) * Tipo_marginal, 0)
```

### Invertir
```
Valor inversión:     =Cantidad * (1 + rentabilidad)^años
Ganancia:            =Valor - Cantidad
Impuestos (ahorro):  =escala_ahorro(Ganancia)  → 19-23%
Ganancia neta:       =Ganancia - Impuestos
```

---

## 23. Snowball o Avalanche

Sistema de puntos basado en respuestas Sí/No:
```
Puntos Avalanche: =deudas_caras + disciplina + diferencia_significativa
Puntos Snowball:  =deudas_baratas + muchas_deudas + necesita_motivación + diferencia_pequeña
Recomendación:    =IF(P_avalanche > P_snowball, "AVALANCHE", "SNOWBALL")
```

---

## 24. Plan Pensiones vs Fondo Indexado

### Plan de pensiones
```
Ahorro fiscal anual:     =Aportación * Tipo_marginal
Rentabilidad neta:       =Rentabilidad - Comisión_plan
Capital acumulado:       =Aportación * ((1+r_neto)^n - 1) / r_neto
IRPF al rescatar:        =Capital * Tipo_marginal_jubilación
Inversión ahorro fiscal: =Ahorro_fiscal * ((1+r)^n - 1) / r
Total neto:              =Capital - IRPF_rescate + Inversión_ahorro
```

### Fondo indexado
```
Rentabilidad neta:    =Rentabilidad - Comisión_fondo
Capital acumulado:    =Aportación * ((1+r_neto)^n - 1) / r_neto
Ganancia:             =Capital - Aportaciones_totales
Impuestos (ahorro):   =escala_ahorro(Ganancia)  → 19-23%
Neto:                 =Capital - Impuestos
```

### Escala del ahorro (dividendos/ganancias patrimoniales)
```
Hasta 6.000€:          19%
6.000 - 50.000€:       21%
50.000 - 200.000€:     23%
200.000 - 300.000€:    27%
> 300.000€:            30%
```
