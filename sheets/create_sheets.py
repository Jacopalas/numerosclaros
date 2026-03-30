#!/usr/bin/env python3
"""
NumerosClaros — Suite de Calculadoras Financieras para Google Sheets.

Crea programáticamente un Google Spreadsheet con 25 pestañas de calculadoras
financieras usando fórmulas nativas de Google Sheets.

Requisitos:
    pip install gspread google-auth google-auth-oauthlib

Uso:
    python create_sheets.py
"""

import json
import os
import sys
import time
from pathlib import Path

import gspread
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

# ─── Constantes de diseño ───────────────────────────────────────────────────

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

# Colores (RGB 0-1)
COLOR_INPUT_BG = {"red": 1, "green": 0.976, "blue": 0.769}  # #FFF9C4
COLOR_RESULT_BG = {"red": 0.91, "green": 0.961, "blue": 0.914}  # #E8F5E9
COLOR_HEADER_BG = {"red": 0.102, "green": 0.337, "blue": 0.859}  # #1a56db
COLOR_HEADER_FG = {"red": 1, "green": 1, "blue": 1}  # blanco
COLOR_SECTION_BG = {"red": 0.878, "green": 0.918, "blue": 0.973}  # #E0EAFC
COLOR_WHITE = {"red": 1, "green": 1, "blue": 1}
COLOR_LIGHT_GRAY = {"red": 0.95, "green": 0.95, "blue": 0.95}
COLOR_RED = {"red": 0.957, "green": 0.263, "blue": 0.212}
COLOR_GREEN = {"red": 0.298, "green": 0.686, "blue": 0.314}
COLOR_DARK_TEXT = {"red": 0.13, "green": 0.13, "blue": 0.13}

# Formato EUR
EUR_FORMAT = {"type": "NUMBER", "pattern": '#,##0.00 "€"'}
PCT_FORMAT = {"type": "NUMBER", "pattern": "0.00%"}
PCT_INPUT_FORMAT = {"type": "NUMBER", "pattern": "0.00"}
NUM_FORMAT = {"type": "NUMBER", "pattern": "#,##0.00"}
INT_FORMAT = {"type": "NUMBER", "pattern": "#,##0"}

SPREADSHEET_TITLE = "NumerosClaros — Calculadoras Financieras"


# ─── Autenticación ──────────────────────────────────────────────────────────

def authenticate():
    """Autenticación OAuth2 con Google."""
    creds = None
    base = Path(__file__).resolve().parent.parent
    token_path = base / "token.json"
    creds_path = base / "credentials.json"

    if token_path.exists():
        creds = Credentials.from_authorized_user_file(str(token_path), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not creds_path.exists():
                print("ERROR: No se encontró credentials.json")
                print("Descárgalo desde Google Cloud Console > APIs & Services > Credentials")
                sys.exit(1)
            flow = InstalledAppFlow.from_client_secrets_file(str(creds_path), SCOPES)
            creds = flow.run_local_server(port=0)
        token_path.write_text(creds.to_json())

    return gspread.authorize(creds)


# ─── Helpers ─────────────────────────────────────────────────────────────────

def rate_limit(seconds=2):
    """Pausa para evitar rate limits de la API."""
    time.sleep(seconds)


def retry_on_quota(func, *args, max_retries=3, **kwargs):
    """Reintenta una función si falla por quota exceeded."""
    for attempt in range(max_retries):
        try:
            result = func(*args, **kwargs)
            rate_limit(1)
            return result
        except Exception as e:
            if "429" in str(e) or "Quota exceeded" in str(e):
                wait = (attempt + 1) * 10
                print(f"    ⏳ Rate limit alcanzado, esperando {wait}s...")
                time.sleep(wait)
            else:
                raise
    raise Exception(f"Fallo tras {max_retries} reintentos")


def col_letter(n):
    """Convierte número de columna (1-based) a letra(s)."""
    result = ""
    while n > 0:
        n, rem = divmod(n - 1, 26)
        result = chr(65 + rem) + result
    return result


def set_cell_format(ws, range_str, fmt):
    """Aplica formato a un rango usando la API de gspread."""
    ws.format(range_str, fmt)


def format_header_row(ws, row, cols=10):
    """Formatea una fila como header."""
    end_col = col_letter(cols)
    ws.format(f"A{row}:{end_col}{row}", {
        "backgroundColor": COLOR_HEADER_BG,
        "textFormat": {"foregroundColor": COLOR_HEADER_FG, "bold": True, "fontSize": 11},
        "horizontalAlignment": "CENTER",
        "verticalAlignment": "MIDDLE",
    })


def format_input_cell(ws, cell):
    """Formatea una celda como input del usuario."""
    ws.format(cell, {
        "backgroundColor": COLOR_INPUT_BG,
        "borders": {
            "top": {"style": "SOLID", "color": {"red": 0.8, "green": 0.8, "blue": 0.8}},
            "bottom": {"style": "SOLID", "color": {"red": 0.8, "green": 0.8, "blue": 0.8}},
            "left": {"style": "SOLID", "color": {"red": 0.8, "green": 0.8, "blue": 0.8}},
            "right": {"style": "SOLID", "color": {"red": 0.8, "green": 0.8, "blue": 0.8}},
        },
    })


def format_result_cell(ws, cell):
    """Formatea una celda como resultado."""
    ws.format(cell, {
        "backgroundColor": COLOR_RESULT_BG,
        "textFormat": {"bold": True, "fontSize": 11},
    })


def format_section_title(ws, cell, cols=10):
    """Formatea una celda como título de sección."""
    row = int("".join(filter(str.isdigit, cell)))
    end_col = col_letter(cols)
    ws.format(f"A{row}:{end_col}{row}", {
        "backgroundColor": COLOR_SECTION_BG,
        "textFormat": {"bold": True, "fontSize": 11, "foregroundColor": COLOR_HEADER_BG},
    })


def add_note(ws, cell, note):
    """Añade una nota a una celda."""
    ws.update_note(cell, note)


def protect_range(ws, range_str, description="Fórmula protegida"):
    """Protege un rango para que el usuario no lo modifique."""
    ws.add_protected_range(range_str, warning_only=True, description=description)


def batch_update_values(ws, updates):
    """Actualiza múltiples celdas de una vez. updates = [(cell, value), ...]"""
    # Agrupa en batch para eficiencia
    for cell, value in updates:
        ws.update_acell(cell, value)


def write_block(ws, start_row, start_col, data):
    """Escribe un bloque de datos 2D empezando en (start_row, start_col)."""
    max_cols = max(len(row) for row in data)
    # Normalizar: todas las filas al mismo ancho
    normalized = [row + [""] * (max_cols - len(row)) for row in data]
    end_row = start_row + len(normalized) - 1
    end_col = start_col + max_cols - 1
    range_str = f"{col_letter(start_col)}{start_row}:{col_letter(end_col)}{end_row}"
    ws.update(range_str, normalized, value_input_option="USER_ENTERED")


def create_conditional_format_rule(ws, range_str, condition_type, values, format_dict):
    """Crea una regla de formato condicional."""
    rule = {
        "ranges": [gspread.utils.a1_range_to_grid_range(range_str, ws.id)],
        "booleanRule": {
            "condition": {"type": condition_type, "values": values},
            "format": format_dict,
        },
    }
    return rule


def add_conditional_formatting(spreadsheet, ws, range_str, rules):
    """Añade reglas de formato condicional al worksheet."""
    body = {"requests": []}
    for rule_type, values, fmt in rules:
        grid_range = gspread.utils.a1_range_to_grid_range(range_str, ws.id)
        body["requests"].append({
            "addConditionalFormatRule": {
                "rule": {
                    "ranges": [grid_range],
                    "booleanRule": {
                        "condition": {
                            "type": rule_type,
                            "values": [{"userEnteredValue": v} for v in values],
                        },
                        "format": fmt,
                    },
                },
                "index": 0,
            }
        })
    if body["requests"]:
        spreadsheet.batch_update(body)


def add_chart(spreadsheet, ws, chart_spec):
    """Añade un gráfico embebido al worksheet."""
    body = {
        "requests": [{
            "addChart": {
                "chart": {
                    "position": {
                        "overlayPosition": {
                            "anchorCell": {
                                "sheetId": ws.id,
                                "rowIndex": chart_spec.get("anchor_row", 0),
                                "columnIndex": chart_spec.get("anchor_col", 5),
                            },
                            "offsetXPixels": chart_spec.get("offset_x", 0),
                            "offsetYPixels": chart_spec.get("offset_y", 0),
                            "widthPixels": chart_spec.get("width", 600),
                            "heightPixels": chart_spec.get("height", 400),
                        }
                    },
                    "spec": chart_spec["spec"],
                }
            }
        }]
    }
    spreadsheet.batch_update(body)


def _source_range(ws_id, start_row, end_row, start_col, end_col):
    """Crea el objeto sourceRange interno."""
    return {
        "sourceRange": {
            "sources": [{
                "sheetId": ws_id,
                "startRowIndex": start_row - 1,
                "endRowIndex": end_row,
                "startColumnIndex": start_col - 1,
                "endColumnIndex": end_col,
            }]
        }
    }


def make_source_range(ws_id, start_row, end_row, start_col, end_col):
    """Crea un sourceRange para series de gráficos (compatibilidad)."""
    return _source_range(ws_id, start_row, end_row, start_col, end_col)


def make_domain_range(ws_id, start_row, end_row, start_col, end_col):
    """Crea un domain range para el eje X de gráficos."""
    return {"domain": _source_range(ws_id, start_row, end_row, start_col, end_col)}


# ─── Datos fiscales ─────────────────────────────────────────────────────────

def load_tax_data():
    """Carga los datos fiscales desde el JSON."""
    base = Path(__file__).resolve().parent.parent
    tax_file = base / "tax_data_spain_2025.json"
    with open(tax_file, "r", encoding="utf-8") as f:
        return json.load(f)


CCAA_LIST = [
    "Andalucía", "Aragón", "Asturias", "Baleares", "Canarias",
    "Cantabria", "Castilla-La Mancha", "Castilla y León", "Cataluña",
    "Extremadura", "Galicia", "La Rioja", "Madrid", "Murcia",
    "Comunidad Valenciana", "Navarra", "País Vasco", "Ceuta", "Melilla",
]

CCAA_KEYS = [
    "andalucia", "aragon", "asturias", "baleares", "canarias",
    "cantabria", "castilla_la_mancha", "castilla_y_leon", "cataluna",
    "extremadura", "galicia", "la_rioja", "madrid", "murcia",
    "comunidad_valenciana", "navarra", "pais_vasco", "ceuta", "melilla",
]


# ═══════════════════════════════════════════════════════════════════════════
# PESTAÑAS — cada función crea una pestaña completa
# ═══════════════════════════════════════════════════════════════════════════


# ─── 1. Hipoteca ─────────────────────────────────────────────────────────────

def create_tab_hipoteca(spreadsheet, ws):
    """Calculadora de hipoteca con tabla de amortización."""
    ws.update_title("1. Hipoteca")
    ws.resize(rows=400, cols=12)
    rate_limit()

    # Inputs
    data = [
        ["CALCULADORA DE HIPOTECA", "", "", "", "", ""],
        ["", "", "", "", "", ""],
        ["DATOS DE ENTRADA", "", "VALOR", "", "", ""],
        ["Precio de la vivienda", "", 250000, "", "", ""],
        ["Entrada (ahorro inicial)", "", 50000, "", "", ""],
        ["Tipo de interés anual (%)", "", 3.0, "", "", ""],
        ["Plazo (años)", "", 25, "", "", ""],
        ["", "", "", "", "", ""],
        ["RESULTADOS", "", "", "", "", ""],
        ["Importe del préstamo", "", '=C4-C5', "", "", ""],  # row 10
        ["Tipo mensual", "", '=C6/100/12', "", "", ""],  # row 11
        ["Número de cuotas", "", '=C7*12', "", "", ""],  # row 12
        ["Cuota mensual", "", '=IF(C11=0, C10/C12, C10*C11*(1+C11)^C12/((1+C11)^C12-1))', "", "", ""],  # row 13
        ["Total a pagar", "", '=C13*C12', "", "", ""],  # row 14
        ["Total intereses", "", '=C14-C10', "", "", ""],  # row 15
        ["Ratio intereses/capital", "", '=C15/C10', "", "", ""],  # row 16
        ["", "", "", "", "", ""],
        ["TABLA DE AMORTIZACIÓN", "", "", "", "", ""],
        ["Mes", "Cuota", "Interés", "Capital", "Capital pendiente", "% Amortizado"],
    ]
    write_block(ws, 1, 1, data)
    rate_limit()

    # Fórmulas de amortización (360 filas = 30 años max)
    amort_rows = []
    for i in range(1, 361):
        row = 19 + i
        if i == 1:
            amort_rows.append([
                i,
                '=IF(A20>$C$12,"",ROUND($C$13,2))',
                '=IF(A20>$C$12,"",ROUND($C$10*$C$11,2))',
                '=IF(A20>$C$12,"",ROUND(B20-C20,2))',
                '=IF(A20>$C$12,"",ROUND($C$10-D20,2))',
                '=IF(A20>$C$12,"",D20/$C$10)',
            ])
        else:
            amort_rows.append([
                f'=IF(A{row-1}="","",A{row-1}+1)',
                f'=IF(A{row}>$C$12,"",ROUND($C$13,2))',
                f'=IF(A{row}>$C$12,"",ROUND(E{row-1}*$C$11,2))',
                f'=IF(A{row}>$C$12,"",ROUND(B{row}-C{row},2))',
                f'=IF(A{row}>$C$12,"",ROUND(E{row-1}-D{row},2))',
                f'=IF(A{row}>$C$12,"",D{row}/$C$10)',
            ])

    # Escribir en lotes de 100
    for batch_start in range(0, len(amort_rows), 100):
        batch = amort_rows[batch_start:batch_start + 100]
        write_block(ws, 20 + batch_start, 1, batch)
        rate_limit()

    # Formateo
    format_header_row(ws, 1, 6)
    format_header_row(ws, 19, 6)
    format_section_title(ws, "A3", 6)
    format_section_title(ws, "A9", 6)
    rate_limit()

    for r in [4, 5, 6, 7]:
        format_input_cell(ws, f"C{r}")
    for r in [10, 11, 12, 13, 14, 15, 16]:
        format_result_cell(ws, f"C{r}")
    rate_limit()

    ws.format("C4:C5", {"numberFormat": EUR_FORMAT})
    ws.format("C10", {"numberFormat": EUR_FORMAT})
    ws.format("C13:C15", {"numberFormat": EUR_FORMAT})
    ws.format("C11", {"numberFormat": {"type": "NUMBER", "pattern": "0.000000"}})
    ws.format("C16", {"numberFormat": PCT_FORMAT})
    ws.format("F20:F380", {"numberFormat": PCT_FORMAT})
    ws.format("B20:E380", {"numberFormat": EUR_FORMAT})
    rate_limit()

    # Notas
    add_note(ws, "C4", "Introduce el precio total de la vivienda en euros")
    add_note(ws, "C5", "Introduce la cantidad que aportas como entrada")
    add_note(ws, "C6", "Introduce el tipo de interés anual (ej: 3.0 para 3%)")
    add_note(ws, "C7", "Introduce el plazo en años (ej: 25)")
    rate_limit()

    # Gráfico: Interés vs Capital acumulado
    add_chart(spreadsheet, ws, {
        "anchor_row": 1,
        "anchor_col": 7,
        "width": 600,
        "height": 400,
        "spec": {
            "title": "Interés vs Capital por cuota",
            "basicChart": {
                "chartType": "AREA",
                "stackedType": "STACKED",
                "legendPosition": "BOTTOM_LEGEND",
                "axis": [
                    {"position": "BOTTOM_AXIS", "title": "Mes"},
                    {"position": "LEFT_AXIS", "title": "Euros (€)"},
                ],
                "domains": [make_domain_range(ws.id, 19, 19 + min(int(300), 360), 1, 1)],
                "series": [
                    {"series": make_source_range(ws.id, 19, 19 + min(300, 360), 3, 3),
                     "targetAxis": "LEFT_AXIS", "color": COLOR_RED},
                    {"series": make_source_range(ws.id, 19, 19 + min(300, 360), 4, 4),
                     "targetAxis": "LEFT_AXIS", "color": COLOR_GREEN},
                ],
            },
        },
    })
    rate_limit()

    # Proteger fórmulas
    protect_range(ws, "C10:C16")

    print("  ✓ 1. Hipoteca")


# ─── 2. Interés Compuesto ───────────────────────────────────────────────────

def create_tab_interes_compuesto(spreadsheet, ws):
    """Calculadora de interés compuesto con gráfico exponencial."""
    ws.update_title("2. Interés Compuesto")
    ws.resize(rows=80, cols=10)
    rate_limit()

    data = [
        ["CALCULADORA DE INTERÉS COMPUESTO"],
        [""],
        ["DATOS DE ENTRADA", "", "VALOR"],
        ["Capital inicial (€)", "", 10000],
        ["Aportación mensual (€)", "", 200],
        ["Tasa de interés anual (%)", "", 7],
        ["Período (años)", "", 20],
        [""],
        ["RESULTADOS"],
        ["Capital final", "", '=IF(C6=0, C4+C5*12*C7, C4*(1+C6/100/12)^(C7*12) + C5*((1+C6/100/12)^(C7*12)-1)/(C6/100/12))'],
        ["Total aportado", "", '=C4+C5*12*C7'],
        ["Intereses generados", "", '=C10-C11'],
        ["Rendimiento total (%)", "", '=IF(C11=0,0,C12/C11)'],
        [""],
        ["EVOLUCIÓN AÑO A AÑO"],
        ["Año", "Aportado acumulado", "Balance", "Intereses acumulados"],
    ]
    write_block(ws, 1, 1, data)
    rate_limit()

    # Tabla año a año
    yearly = []
    for y in range(0, 51):
        row = 17 + y
        if y == 0:
            yearly.append([0, '=$C$4', '=$C$4', 0])
        else:
            yearly.append([
                y,
                f'=B{row-1}+$C$5*12',
                f'=IF($C$6=0, $C$4+$C$5*12*A{row}, $C$4*(1+$C$6/100/12)^(A{row}*12) + $C$5*((1+$C$6/100/12)^(A{row}*12)-1)/($C$6/100/12))',
                f'=C{row}-B{row}',
            ])
    write_block(ws, 17, 1, yearly)
    rate_limit()

    # Formateo
    format_header_row(ws, 1, 4)
    format_header_row(ws, 16, 4)
    format_section_title(ws, "A3", 4)
    format_section_title(ws, "A9", 4)
    for r in [4, 5, 6, 7]:
        format_input_cell(ws, f"C{r}")
    for r in [10, 11, 12, 13]:
        format_result_cell(ws, f"C{r}")
    rate_limit()

    ws.format("C4:C5", {"numberFormat": EUR_FORMAT})
    ws.format("C10:C12", {"numberFormat": EUR_FORMAT})
    ws.format("C13", {"numberFormat": PCT_FORMAT})
    ws.format("B17:D67", {"numberFormat": EUR_FORMAT})
    rate_limit()

    add_note(ws, "C4", "Capital con el que empiezas a invertir")
    add_note(ws, "C5", "Cantidad que aportas cada mes")
    add_note(ws, "C6", "Rentabilidad anual esperada (ej: 7 para 7%)")

    # Gráfico exponencial
    add_chart(spreadsheet, ws, {
        "anchor_row": 1, "anchor_col": 5, "width": 650, "height": 400,
        "spec": {
            "title": "Crecimiento del capital",
            "basicChart": {
                "chartType": "AREA",
                "stackedType": "NOT_STACKED",
                "legendPosition": "BOTTOM_LEGEND",
                "axis": [
                    {"position": "BOTTOM_AXIS", "title": "Años"},
                    {"position": "LEFT_AXIS", "title": "Euros (€)"},
                ],
                "domains": [make_domain_range(ws.id, 16, 67, 1, 1)],
                "series": [
                    {"series": make_source_range(ws.id, 16, 67, 2, 2),
                     "targetAxis": "LEFT_AXIS", "color": {"red": 0.6, "green": 0.6, "blue": 0.6}},
                    {"series": make_source_range(ws.id, 16, 67, 3, 3),
                     "targetAxis": "LEFT_AXIS", "color": COLOR_GREEN},
                ],
            },
        },
    })
    rate_limit()
    protect_range(ws, "C10:C13")
    print("  ✓ 2. Interés Compuesto")


# ─── 3. Comparador Préstamos ────────────────────────────────────────────────

def create_tab_comparador_prestamos(spreadsheet, ws):
    """Compara 3 préstamos lado a lado."""
    ws.update_title("3. Comparador Préstamos")
    ws.resize(rows=30, cols=10)
    rate_limit()

    data = [
        ["COMPARADOR DE PRÉSTAMOS", "", "", "", "", "", ""],
        [""],
        ["", "", "PRÉSTAMO A", "", "PRÉSTAMO B", "", "PRÉSTAMO C"],
        ["Nombre", "", "Hipoteca banco A", "", "Hipoteca banco B", "", "Hipoteca banco C"],
        ["Importe (€)", "", 200000, "", 200000, "", 200000],
        ["Tipo interés anual (%)", "", 2.5, "", 3.0, "", 3.5],
        ["Plazo (años)", "", 25, "", 30, "", 20],
        [""],
        ["RESULTADOS"],
        ["Tipo mensual", "",
         '=C6/100/12', "", '=E6/100/12', "", '=G6/100/12'],
        ["Nº cuotas", "",
         '=C7*12', "", '=E7*12', "", '=G7*12'],
        ["Cuota mensual", "",
         '=IF(C10=0,C5/C11, C5*C10*(1+C10)^C11/((1+C10)^C11-1))', "",
         '=IF(E10=0,E5/E11, E5*E10*(1+E10)^E11/((1+E10)^E11-1))', "",
         '=IF(G10=0,G5/G11, G5*G10*(1+G10)^G11/((1+G10)^G11-1))'],
        ["Total a pagar", "",
         '=C12*C11', "", '=E12*E11', "", '=G12*G11'],
        ["Total intereses", "",
         '=C13-C5', "", '=E13-E5', "", '=G13-G5'],
        ["Coste total extra vs mejor", "",
         '=C13-MIN(C13,E13,G13)', "", '=E13-MIN(C13,E13,G13)', "", '=G13-MIN(C13,E13,G13)'],
        [""],
        ["¿MEJOR OPCIÓN?", "",
         '=IF(C13=MIN(C13,E13,G13),"✓ MEJOR","")', "",
         '=IF(E13=MIN(C13,E13,G13),"✓ MEJOR","")', "",
         '=IF(G13=MIN(C13,E13,G13),"✓ MEJOR","")'],
    ]
    write_block(ws, 1, 1, data)
    rate_limit()

    format_header_row(ws, 1, 7)
    format_header_row(ws, 3, 7)
    format_section_title(ws, "A9", 7)
    for col in ["C", "E", "G"]:
        for r in [4, 5, 6, 7]:
            format_input_cell(ws, f"{col}{r}")
        for r in [10, 11, 12, 13, 14, 15, 17]:
            format_result_cell(ws, f"{col}{r}")
    rate_limit()

    ws.format("C5", {"numberFormat": EUR_FORMAT})
    ws.format("E5", {"numberFormat": EUR_FORMAT})
    ws.format("G5", {"numberFormat": EUR_FORMAT})
    ws.format("C12:C15", {"numberFormat": EUR_FORMAT})
    ws.format("E12:E15", {"numberFormat": EUR_FORMAT})
    ws.format("G12:G15", {"numberFormat": EUR_FORMAT})
    rate_limit()

    # Gráfico barras comparación
    add_chart(spreadsheet, ws, {
        "anchor_row": 18, "anchor_col": 1, "width": 700, "height": 350,
        "spec": {
            "title": "Comparación: Total a pagar",
            "basicChart": {
                "chartType": "COLUMN",
                "legendPosition": "BOTTOM_LEGEND",
                "axis": [
                    {"position": "BOTTOM_AXIS", "title": ""},
                    {"position": "LEFT_AXIS", "title": "Euros (€)"},
                ],
                "domains": [make_domain_range(ws.id, 4, 4, 3, 3)],
                "series": [
                    {"series": make_source_range(ws.id, 13, 13, 3, 3), "color": {"red": 0.26, "green": 0.52, "blue": 0.96}},
                    {"series": make_source_range(ws.id, 13, 13, 5, 5), "color": {"red": 0.96, "green": 0.52, "blue": 0.26}},
                    {"series": make_source_range(ws.id, 13, 13, 7, 7), "color": {"red": 0.26, "green": 0.83, "blue": 0.56}},
                ],
            },
        },
    })
    rate_limit()
    protect_range(ws, "C10:C15")
    protect_range(ws, "E10:E15")
    protect_range(ws, "G10:G15")
    print("  ✓ 3. Comparador Préstamos")


# ─── 4. ROI ──────────────────────────────────────────────────────────────────

def create_tab_roi(spreadsheet, ws):
    """Calculadora de ROI."""
    ws.update_title("4. ROI")
    ws.resize(rows=20, cols=6)
    rate_limit()

    data = [
        ["CALCULADORA DE ROI (Retorno sobre Inversión)"],
        [""],
        ["DATOS DE ENTRADA", "", "VALOR"],
        ["Inversión inicial (€)", "", 10000],
        ["Valor final (€)", "", 15000],
        ["Período (años)", "", 3],
        [""],
        ["RESULTADOS"],
        ["Beneficio neto", "", '=C5-C4'],
        ["ROI total (%)", "", '=(C5-C4)/C4'],
        ["ROI anualizado (%)", "", '=IF(C6=0, 0, (C5/C4)^(1/C6)-1)'],
        ["Multiplicador", "", '=C5/C4'],
    ]
    write_block(ws, 1, 1, data)
    rate_limit()

    format_header_row(ws, 1, 3)
    format_section_title(ws, "A3", 3)
    format_section_title(ws, "A8", 3)
    for r in [4, 5, 6]:
        format_input_cell(ws, f"C{r}")
    for r in [9, 10, 11, 12]:
        format_result_cell(ws, f"C{r}")
    rate_limit()

    ws.format("C4:C5", {"numberFormat": EUR_FORMAT})
    ws.format("C9", {"numberFormat": EUR_FORMAT})
    ws.format("C10:C11", {"numberFormat": PCT_FORMAT})
    ws.format("C12", {"numberFormat": {"type": "NUMBER", "pattern": "0.00\"x\""}})

    add_note(ws, "C4", "Cantidad que invertiste inicialmente")
    add_note(ws, "C5", "Valor actual o de venta de la inversión")
    add_note(ws, "C11", "CAGR — Tasa de crecimiento anual compuesto")
    rate_limit()

    # Formato condicional: verde si ROI positivo, rojo si negativo
    add_conditional_formatting(spreadsheet, ws, "C9", [
        ("NUMBER_GREATER", ["0"], {"backgroundColor": COLOR_RESULT_BG}),
        ("NUMBER_LESS", ["0"], {"backgroundColor": {"red": 1, "green": 0.8, "blue": 0.8}}),
    ])

    protect_range(ws, "C9:C12")
    print("  ✓ 4. ROI")


# ─── 5. Inflación ────────────────────────────────────────────────────────────

def create_tab_inflacion(spreadsheet, ws):
    """Poder adquisitivo en el tiempo."""
    ws.update_title("5. Inflación")
    ws.resize(rows=60, cols=8)
    rate_limit()

    data = [
        ["CALCULADORA DE INFLACIÓN — Poder Adquisitivo"],
        [""],
        ["DATOS DE ENTRADA", "", "VALOR"],
        ["Cantidad actual (€)", "", 1000],
        ["Tasa de inflación anual (%)", "", 3],
        ["Años en el futuro", "", 20],
        [""],
        ["RESULTADOS"],
        ["Poder adquisitivo futuro", "", '=C4/(1+C5/100)^C6'],
        ["Pérdida de poder adquisitivo", "", '=C4-C9'],
        ["% de pérdida", "", '=C10/C4'],
        ["Necesitarás para mantener poder", "", '=C4*(1+C5/100)^C6'],
        [""],
        ["EVOLUCIÓN AÑO A AÑO"],
        ["Año", "Valor nominal", "Poder adquisitivo real", "% perdido"],
    ]
    write_block(ws, 1, 1, data)
    rate_limit()

    yearly = []
    for y in range(0, 41):
        row = 16 + y
        if y == 0:
            yearly.append([0, '=$C$4', '=$C$4', 0])
        else:
            yearly.append([
                y,
                '=$C$4',
                f'=$C$4/(1+$C$5/100)^A{row}',
                f'=1-C{row}/$C$4',
            ])
    write_block(ws, 16, 1, yearly)
    rate_limit()

    format_header_row(ws, 1, 4)
    format_header_row(ws, 15, 4)
    format_section_title(ws, "A3", 4)
    format_section_title(ws, "A8", 4)
    for r in [4, 5, 6]:
        format_input_cell(ws, f"C{r}")
    for r in [9, 10, 11, 12]:
        format_result_cell(ws, f"C{r}")
    ws.format("C4", {"numberFormat": EUR_FORMAT})
    ws.format("C9:C10", {"numberFormat": EUR_FORMAT})
    ws.format("C11", {"numberFormat": PCT_FORMAT})
    ws.format("C12", {"numberFormat": EUR_FORMAT})
    ws.format("B16:C56", {"numberFormat": EUR_FORMAT})
    ws.format("D16:D56", {"numberFormat": PCT_FORMAT})
    rate_limit()

    add_chart(spreadsheet, ws, {
        "anchor_row": 1, "anchor_col": 5, "width": 600, "height": 400,
        "spec": {
            "title": "Pérdida de poder adquisitivo",
            "basicChart": {
                "chartType": "LINE",
                "legendPosition": "BOTTOM_LEGEND",
                "axis": [
                    {"position": "BOTTOM_AXIS", "title": "Años"},
                    {"position": "LEFT_AXIS", "title": "Euros (€)"},
                ],
                "domains": [make_domain_range(ws.id, 15, 56, 1, 1)],
                "series": [
                    {"series": make_source_range(ws.id, 15, 56, 2, 2), "color": {"red": 0.5, "green": 0.5, "blue": 0.5}},
                    {"series": make_source_range(ws.id, 15, 56, 3, 3), "color": COLOR_RED},
                ],
            },
        },
    })
    rate_limit()
    protect_range(ws, "C9:C12")
    print("  ✓ 5. Inflación")


# ─── 6. Deuda Snowball vs Avalanche ──────────────────────────────────────────

def create_tab_deuda(spreadsheet, ws):
    """Comparación Snowball vs Avalanche."""
    ws.update_title("6. Snowball vs Avalanche")
    ws.resize(rows=30, cols=10)
    rate_limit()

    data = [
        ["DEUDA: SNOWBALL vs AVALANCHE"],
        [""],
        ["DATOS DE LAS DEUDAS"],
        ["", "Deuda 1", "Deuda 2", "Deuda 3", "Deuda 4"],
        ["Nombre", "Tarjeta crédito", "Préstamo coche", "Préstamo personal", ""],
        ["Saldo pendiente (€)", 3000, 8000, 5000, ""],
        ["Tipo interés anual (%)", 22, 6, 12, ""],
        ["Pago mínimo mensual (€)", 60, 200, 150, ""],
        [""],
        ["Pago extra mensual (€)", "", 100],
        [""],
        ["MÉTODO SNOWBALL (menor saldo primero)"],
        ["Orden de pago:", "", '=IF(B6="","",IF(AND(B6<=C6,B6<=D6,B6<=E6),B5, IF(AND(C6<=B6,C6<=D6,C6<=E6),C5, IF(AND(D6<=B6,D6<=C6,D6<=E6),D5, E5))))'],
        ["Total deuda", "", '=SUM(B6:E6)'],
        ["Total pagos mínimos", "", '=SUM(B8:E8)'],
        ["Presupuesto mensual total", "", '=C15+C10'],
        [""],
        ["MÉTODO AVALANCHE (mayor interés primero)"],
        ["Orden de pago:", "", '=IF(B7="","",IF(AND(B7>=C7,B7>=D7,B7>=E7),B5, IF(AND(C7>=B7,C7>=D7,C7>=E7),C5, IF(AND(D7>=B7,D7>=C7,D7>=E7),D5, E5))))'],
        ["Total deuda", "", '=SUM(B6:E6)'],
        [""],
        ["NOTA: Para una simulación mes a mes completa,"],
        ["usa la calculadora web de NumerosClaros que"],
        ["itera automáticamente. En Sheets, los datos"],
        ["de entrada te ayudan a planificar tu estrategia."],
        [""],
        ["RECOMENDACIÓN"],
        ["", "", '=IF(COUNTIF(B7:E7,">"&18)>0, "AVALANCHE — Tienes deudas con interés alto (>18%). Paga primero la de mayor interés para ahorrar más.", "SNOWBALL — Tus intereses son moderados. Paga primero la menor para ganar motivación.")'],
    ]
    write_block(ws, 1, 1, data)
    rate_limit()

    format_header_row(ws, 1, 5)
    format_header_row(ws, 4, 5)
    format_section_title(ws, "A3", 5)
    format_section_title(ws, "A12", 5)
    format_section_title(ws, "A18", 5)
    format_section_title(ws, "A26", 5)
    for r in [5, 6, 7, 8]:
        for c in ["B", "C", "D", "E"]:
            format_input_cell(ws, f"{c}{r}")
    format_input_cell(ws, "C10")
    for r in [13, 14, 15, 16]:
        format_result_cell(ws, f"C{r}")
    format_result_cell(ws, "C19")
    format_result_cell(ws, "C27")
    rate_limit()

    ws.format("B6:E6", {"numberFormat": EUR_FORMAT})
    ws.format("B8:E8", {"numberFormat": EUR_FORMAT})
    ws.format("C10", {"numberFormat": EUR_FORMAT})
    ws.format("C14:C16", {"numberFormat": EUR_FORMAT})

    add_note(ws, "C10", "Cantidad extra que puedes dedicar cada mes a pagar deuda, por encima de los mínimos")
    add_note(ws, "A12", "Snowball: paga primero la deuda más pequeña. Motivación psicológica.")
    add_note(ws, "A18", "Avalanche: paga primero la de mayor interés. Ahorro matemático.")
    rate_limit()
    print("  ✓ 6. Snowball vs Avalanche")


# ─── 7. Presupuesto 50/30/20 ────────────────────────────────────────────────

def create_tab_presupuesto(spreadsheet, ws):
    """Regla 50/30/20."""
    ws.update_title("7. Presupuesto 50-30-20")
    ws.resize(rows=25, cols=8)
    rate_limit()

    data = [
        ["PRESUPUESTO 50/30/20"],
        [""],
        ["DATOS DE ENTRADA", "", "VALOR"],
        ["Ingresos netos mensuales (€)", "", 2500],
        [""],
        ["DISTRIBUCIÓN MENSUAL"],
        ["Categoría", "Porcentaje", "Mensual", "Anual"],
        ["Necesidades (vivienda, comida, transporte)", "50%", '=C4*0.5', '=C8*12'],
        ["Deseos (ocio, restaurantes, hobbies)", "30%", '=C4*0.3', '=C9*12'],
        ["Ahorro e inversión", "20%", '=C4*0.2', '=C10*12'],
        ["TOTAL", "100%", '=SUM(C8:C10)', '=SUM(D8:D10)'],
        [""],
        ["TUS GASTOS REALES"],
        ["Categoría", "Tu gasto real", "Diferencia", "Estado"],
        ["Necesidades", "", '=C8-B15', '=IF(B15="","",IF(B15<=C8,"✓ OK","⚠ Exceso"))'],
        ["Deseos", "", '=C9-B16', '=IF(B16="","",IF(B16<=C9,"✓ OK","⚠ Exceso"))'],
        ["Ahorro", "", '=C10-B17', '=IF(B17="","",IF(B17>=C10,"✓ OK","⚠ Bajo"))'],
    ]
    write_block(ws, 1, 1, data)
    rate_limit()

    format_header_row(ws, 1, 4)
    format_header_row(ws, 7, 4)
    format_header_row(ws, 14, 4)
    format_section_title(ws, "A3", 4)
    format_section_title(ws, "A6", 4)
    format_section_title(ws, "A13", 4)
    format_input_cell(ws, "C4")
    for r in [15, 16, 17]:
        format_input_cell(ws, f"B{r}")
    for r in [8, 9, 10, 11]:
        format_result_cell(ws, f"C{r}")
        format_result_cell(ws, f"D{r}")
    rate_limit()

    ws.format("C4", {"numberFormat": EUR_FORMAT})
    ws.format("C8:C11", {"numberFormat": EUR_FORMAT})
    ws.format("D8:D11", {"numberFormat": EUR_FORMAT})
    ws.format("B15:C17", {"numberFormat": EUR_FORMAT})

    add_note(ws, "C4", "Tu sueldo neto mensual después de impuestos y seguridad social")

    # Gráfico donut
    add_chart(spreadsheet, ws, {
        "anchor_row": 1, "anchor_col": 5, "width": 400, "height": 350,
        "spec": {
            "title": "Distribución 50/30/20",
            "pieChart": {
                "legendPosition": "LABELED_LEGEND",
                "domain": make_source_range(ws.id, 8, 10, 1, 1),
                "series": make_source_range(ws.id, 8, 10, 3, 3),
                "pieHole": 0.4,
            },
        },
    })
    rate_limit()
    protect_range(ws, "C8:D11")
    print("  ✓ 7. Presupuesto 50/30/20")


# ─── 8. Fondo Emergencia ────────────────────────────────────────────────────

def create_tab_fondo_emergencia(spreadsheet, ws):
    """Calculadora de fondo de emergencia."""
    ws.update_title("8. Fondo Emergencia")
    ws.resize(rows=20, cols=6)
    rate_limit()

    data = [
        ["FONDO DE EMERGENCIA"],
        [""],
        ["DATOS DE ENTRADA", "", "VALOR"],
        ["Gastos mensuales (€)", "", 2000],
        ["Meses de cobertura deseados", "", 6],
        ["Ahorros actuales (€)", "", 3000],
        ["Capacidad de ahorro mensual (€)", "", 300],
        [""],
        ["RESULTADOS"],
        ["Objetivo del fondo", "", '=C4*C5'],
        ["Brecha (lo que te falta)", "", '=MAX(0, C10-C6)'],
        ["Progreso actual (%)", "", '=MIN(1, C6/C10)'],
        ["Meses para completar", "", '=IF(C11=0, 0, ROUNDUP(C11/C7, 0))'],
        ["Fecha estimada", "", '=IF(C13=0, "¡Ya lo tienes!", EDATE(TODAY(), C13))'],
        [""],
        ["ESTADO"],
        ["", "", '=IF(C12>=1, "✅ ¡Fondo completo!", IF(C12>=0.75, "🟡 Casi listo — sigue así", IF(C12>=0.5, "🟠 Buen progreso — a mitad de camino", "🔴 Necesitas ahorrar más")))'],
    ]
    write_block(ws, 1, 1, data)
    rate_limit()

    format_header_row(ws, 1, 3)
    format_section_title(ws, "A3", 3)
    format_section_title(ws, "A9", 3)
    format_section_title(ws, "A16", 3)
    for r in [4, 5, 6, 7]:
        format_input_cell(ws, f"C{r}")
    for r in [10, 11, 12, 13, 14, 17]:
        format_result_cell(ws, f"C{r}")
    ws.format("C4", {"numberFormat": EUR_FORMAT})
    ws.format("C6:C7", {"numberFormat": EUR_FORMAT})
    ws.format("C10:C11", {"numberFormat": EUR_FORMAT})
    ws.format("C12", {"numberFormat": PCT_FORMAT})
    ws.format("C14", {"numberFormat": {"type": "DATE", "pattern": "dd/mm/yyyy"}})
    rate_limit()

    add_note(ws, "C4", "Todos tus gastos fijos y variables mensuales")
    add_note(ws, "C5", "Recomendado: 3-6 meses. Si eres autónomo, 6-12 meses.")
    protect_range(ws, "C10:C14")
    print("  ✓ 8. Fondo Emergencia")


# ─── 9. Meta Ahorro ─────────────────────────────────────────────────────────

def create_tab_meta_ahorro(spreadsheet, ws):
    """Calculadora de meta de ahorro."""
    ws.update_title("9. Meta Ahorro")
    ws.resize(rows=25, cols=6)
    rate_limit()

    data = [
        ["META DE AHORRO"],
        [""],
        ["DATOS DE ENTRADA", "", "VALOR"],
        ["Objetivo (€)", "", 15000],
        ["Ahorros actuales (€)", "", 2000],
        ["Plazo deseado (meses)", "", 24],
        ["Rentabilidad anual esperada (%)", "", 4],
        [""],
        ["RESULTADOS"],
        ["Brecha", "", '=C4-C5'],
        ["Ahorro mensual necesario (sin interés)", "", '=C10/C6'],
        ["Ahorro mensual necesario (con interés)", "", '=IF(C7=0, C11, (C4-C5*(1+C7/100/12)^C6)*(C7/100/12)/((1+C7/100/12)^C6-1))'],
        ["Ahorro que te ahorras por intereses", "", '=C11-C12'],
        ["Total que aportarás", "", '=C12*C6'],
        ["Intereses que ganarás", "", '=C4-C5-C14'],
    ]
    write_block(ws, 1, 1, data)
    rate_limit()

    format_header_row(ws, 1, 3)
    format_section_title(ws, "A3", 3)
    format_section_title(ws, "A9", 3)
    for r in [4, 5, 6, 7]:
        format_input_cell(ws, f"C{r}")
    for r in range(10, 16):
        format_result_cell(ws, f"C{r}")
    ws.format("C4:C5", {"numberFormat": EUR_FORMAT})
    ws.format("C10:C15", {"numberFormat": EUR_FORMAT})
    rate_limit()

    add_note(ws, "C7", "Si no inviertes el dinero, pon 0. Si lo metes en un fondo, pon la rentabilidad esperada.")
    protect_range(ws, "C10:C15")
    print("  ✓ 9. Meta Ahorro")


# ─── 10. IRPF ───────────────────────────────────────────────────────────────

def create_tab_irpf(spreadsheet, ws):
    """Calculadora IRPF con tramos estatales y autonómicos."""
    ws.update_title("10. IRPF")
    ws.resize(rows=50, cols=10)
    rate_limit()

    tax_data = load_tax_data()

    # Escribir tramos estatales en zona de datos (columnas H-J)
    brackets = tax_data["irpf_estatal"]["combined_total_brackets"]["brackets"]
    tramo_data = [["TRAMOS IRPF 2025", "Hasta", "Tipo"]]
    for b in brackets:
        to_val = b["to"] if b["to"] else 9999999
        tramo_data.append([b["from"], to_val, b["rate"] / 100])
    write_block(ws, 1, 8, tramo_data)
    rate_limit()

    data = [
        ["CALCULADORA DE IRPF"],
        [""],
        ["DATOS DE ENTRADA", "", "VALOR"],
        ["Base imponible general (€)", "", 35000],
        ["Comunidad Autónoma", "", "Madrid"],
        [""],
        ["RESULTADO — CUOTA IRPF (tramos generales combinados)"],
        # Cálculo progresivo con tramos combinados estándar
        ["Tramo", "Base", "Tipo", "Cuota"],
        ["0 - 12.450 €", '=MIN(12450, MAX(0, C4))', "19%", '=B9*0.19'],
        ["12.450 - 20.200 €", '=MIN(7750, MAX(0, C4-12450))', "24%", '=B10*0.24'],
        ["20.200 - 35.200 €", '=MIN(15000, MAX(0, C4-20200))', "30%", '=B11*0.30'],
        ["35.200 - 60.000 €", '=MIN(24800, MAX(0, C4-35200))', "37%", '=B12*0.37'],
        ["60.000 - 300.000 €", '=MIN(240000, MAX(0, C4-60000))', "45%", '=B13*0.45'],
        ["> 300.000 €", '=MAX(0, C4-300000)', "47%", '=B14*0.47'],
        [""],
        ["TOTAL CUOTA IRPF", "", "", '=SUM(D9:D14)'],
        ["Tipo efectivo", "", "", '=IF(C4=0, 0, D16/C4)'],
        ["Tipo marginal", "", "", '=IF(C4>300000,0.47, IF(C4>60000,0.45, IF(C4>35200,0.37, IF(C4>20200,0.30, IF(C4>12450,0.24, 0.19)))))'],
        [""],
        ["NOTA: Este cálculo usa los tramos combinados"],
        ["estatal + autonómico por defecto. Para el cálculo"],
        ["exacto de tu CCAA, usa la pestaña \'11. Sueldo Neto\'."],
    ]
    write_block(ws, 1, 1, data)
    rate_limit()

    format_header_row(ws, 1, 4)
    format_header_row(ws, 8, 4)
    format_section_title(ws, "A3", 4)
    format_section_title(ws, "A7", 4)
    format_input_cell(ws, "C4")
    format_input_cell(ws, "C5")
    for r in [16, 17, 18]:
        format_result_cell(ws, f"D{r}")
    rate_limit()

    ws.format("C4", {"numberFormat": EUR_FORMAT})
    ws.format("B9:B14", {"numberFormat": EUR_FORMAT})
    ws.format("D9:D16", {"numberFormat": EUR_FORMAT})
    ws.format("D17:D18", {"numberFormat": PCT_FORMAT})

    # Validación dropdown CCAA
    ws.update_acell("C5", "Madrid")
    rate_limit()

    # Gráfico tramos
    add_chart(spreadsheet, ws, {
        "anchor_row": 1, "anchor_col": 5, "width": 250, "height": 350,
        "spec": {
            "title": "Distribución por tramos",
            "pieChart": {
                "legendPosition": "LABELED_LEGEND",
                "domain": make_source_range(ws.id, 9, 14, 1, 1),
                "series": make_source_range(ws.id, 9, 14, 4, 4),
                "pieHole": 0.3,
            },
        },
    })
    rate_limit()

    add_note(ws, "C4", "Tu base imponible general: salario bruto menos SS y deducciones personales")
    add_note(ws, "C5", "Para cálculo exacto por CCAA, usa la pestaña 'Sueldo Neto'")
    protect_range(ws, "D9:D18")
    print("  ✓ 10. IRPF")


# ─── 11. Sueldo Neto ────────────────────────────────────────────────────────

def create_tab_sueldo_neto(spreadsheet, ws):
    """De bruto a neto con SS + IRPF."""
    ws.update_title("11. Sueldo Neto")
    ws.resize(rows=40, cols=8)
    rate_limit()

    data = [
        ["CALCULADORA SUELDO BRUTO → NETO"],
        [""],
        ["DATOS DE ENTRADA", "", "VALOR"],
        ["Salario bruto anual (€)", "", 35000],
        ["Nº de pagas", "", 14],
        ["Tipo contrato", "", "Indefinido"],
        [""],
        ["SEGURIDAD SOCIAL (trabajador)"],
        ["Contingencias comunes (4,70%)", "", '=C4*0.047'],
        ["Desempleo (1,55% indef / 1,60% temp)", "", '=IF(C6="Indefinido", C4*0.0155, C4*0.016)'],
        ["Formación profesional (0,10%)", "", '=C4*0.001'],
        ["MEI (0,13%)", "", '=C4*0.0013'],
        ["Total Seguridad Social", "", '=SUM(C9:C12)'],
        [""],
        ["BASE IMPONIBLE IRPF"],
        ["Base imponible (bruto - SS)", "", '=C4-C13'],
        [""],
        ["CÁLCULO IRPF (tramos combinados)"],
        ["Tramo 1: 0-12.450 (19%)", "", '=MIN(12450, MAX(0,C16))*0.19'],
        ["Tramo 2: 12.450-20.200 (24%)", "", '=MIN(7750, MAX(0,C16-12450))*0.24'],
        ["Tramo 3: 20.200-35.200 (30%)", "", '=MIN(15000, MAX(0,C16-20200))*0.30'],
        ["Tramo 4: 35.200-60.000 (37%)", "", '=MIN(24800, MAX(0,C16-35200))*0.37'],
        ["Tramo 5: 60.000-300.000 (45%)", "", '=MIN(240000, MAX(0,C16-60000))*0.45'],
        ["Tramo 6: >300.000 (47%)", "", '=MAX(0,C16-300000)*0.47'],
        ["Total IRPF", "", '=SUM(C18:C23)'],
        [""],
        ["RESULTADO"],
        ["Salario bruto anual", "", '=C4'],
        ["Seguridad Social anual", "", '=C13'],
        ["IRPF anual", "", '=C24'],
        ["SUELDO NETO ANUAL", "", '=C4-C13-C24'],
        ["SUELDO NETO MENSUAL", "", '=C30/C5'],
        [""],
        ["Tipo efectivo IRPF", "", '=IF(C4=0,0,C24/C4)'],
        ["Tipo efectivo total (SS+IRPF)", "", '=IF(C4=0,0,(C13+C24)/C4)'],
        ["Lo que te llevas a casa (%)", "", '=IF(C4=0,0,C30/C4)'],
    ]
    write_block(ws, 1, 1, data)
    rate_limit()

    format_header_row(ws, 1, 3)
    format_section_title(ws, "A3", 3)
    format_section_title(ws, "A8", 3)
    format_section_title(ws, "A15", 3)
    format_section_title(ws, "A17", 3)
    format_section_title(ws, "A26", 3)

    for r in [4, 5, 6]:
        format_input_cell(ws, f"C{r}")
    for r in [13, 16, 24, 27, 28, 29, 30, 31, 33, 34, 35]:
        format_result_cell(ws, f"C{r}")
    rate_limit()

    ws.format("C4", {"numberFormat": EUR_FORMAT})
    ws.format("C9:C13", {"numberFormat": EUR_FORMAT})
    ws.format("C16", {"numberFormat": EUR_FORMAT})
    ws.format("C18:C24", {"numberFormat": EUR_FORMAT})
    ws.format("C27:C31", {"numberFormat": EUR_FORMAT})
    ws.format("C33:C35", {"numberFormat": PCT_FORMAT})
    rate_limit()

    # Formato especial para sueldo neto
    ws.format("C30:C31", {
        "backgroundColor": COLOR_RESULT_BG,
        "textFormat": {"bold": True, "fontSize": 14},
        "numberFormat": EUR_FORMAT,
    })

    add_note(ws, "C4", "Tu salario bruto anual total (incluye todas las pagas)")
    add_note(ws, "C5", "12 si cobras en 12 pagas, 14 si tienes pagas extra")
    add_note(ws, "C6", "Escribe 'Indefinido' o 'Temporal'")
    rate_limit()

    protect_range(ws, "C9:C13")
    protect_range(ws, "C16")
    protect_range(ws, "C18:C24")
    protect_range(ws, "C27:C35")
    print("  ✓ 11. Sueldo Neto")


# ─── 12. FIRE España ────────────────────────────────────────────────────────

def create_tab_fire(spreadsheet, ws):
    """Calculadora FIRE adaptada a España."""
    ws.update_title("12. FIRE España")
    ws.resize(rows=70, cols=8)
    rate_limit()

    data = [
        ["FIRE ESPAÑA — Independencia Financiera"],
        [""],
        ["DATOS DE ENTRADA", "", "VALOR"],
        ["Gastos anuales actuales (€)", "", 24000],
        ["Ingresos netos anuales (€)", "", 40000],
        ["Patrimonio invertido actual (€)", "", 50000],
        ["Rentabilidad anual esperada (%)", "", 7],
        ["Tasa de retiro segura - SWR (%)", "", 3.25],
        [""],
        ["RESULTADOS FIRE"],
        ["Número FIRE (patrimonio objetivo)", "", '=C4/(C8/100)'],
        ["Ahorro anual", "", '=C5-C4'],
        ["Tasa de ahorro", "", '=IF(C5=0,0,C12/C5)'],
        ["Brecha patrimonial", "", '=MAX(0, C11-C6)'],
        [""],
        ["EVOLUCIÓN PATRIMONIAL"],
        ["Año", "Patrimonio", "% del objetivo", "¿FIRE?"],
    ]
    write_block(ws, 1, 1, data)
    rate_limit()

    # Tabla año a año
    yearly = []
    for y in range(0, 51):
        row = 17 + y
        if y == 0:
            yearly.append([0, '=$C$6', '=$C$6/$C$11', '=IF(B17>=$C$11,"✓ FIRE","")'])
        else:
            yearly.append([
                y,
                f'=B{row-1}*(1+$C$7/100)+$C$12',
                f'=B{row}/$C$11',
                f'=IF(B{row}>=$C$11,"✓ FIRE","")',
            ])
    write_block(ws, 17, 1, yearly)
    rate_limit()

    # Años hasta FIRE
    ws.update_acell("A15", "Años estimados hasta FIRE")
    ws.update_acell("C15", '=IFERROR(MATCH(TRUE, INDEX(B17:B67>=$C$11,0), 0)-1, ">50 años")')
    rate_limit()

    format_header_row(ws, 1, 4)
    format_header_row(ws, 16, 4)
    format_section_title(ws, "A3", 4)
    format_section_title(ws, "A10", 4)
    for r in [4, 5, 6, 7, 8]:
        format_input_cell(ws, f"C{r}")
    for r in [11, 12, 13, 14, 15]:
        format_result_cell(ws, f"C{r}")
    rate_limit()

    ws.format("C4:C6", {"numberFormat": EUR_FORMAT})
    ws.format("C11:C12", {"numberFormat": EUR_FORMAT})
    ws.format("C13", {"numberFormat": PCT_FORMAT})
    ws.format("C14", {"numberFormat": EUR_FORMAT})
    ws.format("B17:B67", {"numberFormat": EUR_FORMAT})
    ws.format("C17:C67", {"numberFormat": PCT_FORMAT})

    add_note(ws, "C8", "En España se recomienda 3.25% (vs 4% USA) por menor rentabilidad histórica y mayor coste de vida sanitario")
    rate_limit()

    add_chart(spreadsheet, ws, {
        "anchor_row": 1, "anchor_col": 5, "width": 600, "height": 400,
        "spec": {
            "title": "Camino hacia FIRE",
            "basicChart": {
                "chartType": "LINE",
                "legendPosition": "BOTTOM_LEGEND",
                "axis": [
                    {"position": "BOTTOM_AXIS", "title": "Años"},
                    {"position": "LEFT_AXIS", "title": "Patrimonio (€)"},
                ],
                "domains": [make_domain_range(ws.id, 16, 67, 1, 1)],
                "series": [
                    {"series": make_source_range(ws.id, 16, 67, 2, 2), "color": COLOR_GREEN},
                ],
            },
        },
    })
    rate_limit()
    protect_range(ws, "C11:C15")
    print("  ✓ 12. FIRE España")


# ─── 13. Autónomo vs SL ─────────────────────────────────────────────────────

def create_tab_autonomo_vs_sl(spreadsheet, ws):
    """Comparativa fiscal autónomo vs SL."""
    ws.update_title("13. Autónomo vs SL")
    ws.resize(rows=35, cols=8)
    rate_limit()

    data = [
        ["AUTÓNOMO vs SOCIEDAD LIMITADA"],
        [""],
        ["DATOS DE ENTRADA", "", "VALOR"],
        ["Facturación anual (sin IVA) (€)", "", 60000],
        ["Gastos deducibles (€)", "", 10000],
        [""],
        ["ESCENARIO AUTÓNOMO (Estimación Directa Simplificada)"],
        ["Rendimiento neto", "", '=C4-C5'],
        ["Reducción gastos difícil justificación (5%)", "", '=C8*0.05'],
        ["Rendimiento neto reducido", "", '=C8-C9'],
        ["Cuota autónomos anual (aprox.)", "", '=IF(C10/12<=670,200*12, IF(C10/12<=900,225*12, IF(C10/12<=1166.7,250*12, IF(C10/12<=1300,267*12, IF(C10/12<=1500,280*12, IF(C10/12<=1700,294*12, IF(C10/12<=1850,350*12, IF(C10/12<=2030,370*12, IF(C10/12<=2330,396*12, IF(C10/12<=2760,423*12, IF(C10/12<=3190,456*12, IF(C10/12<=3620,480*12, IF(C10/12<=4050,490*12, IF(C10/12<=6000,504*12, 590*12))))))))))))))'],
        ["Base imponible IRPF", "", '=C10-C11'],
        ["IRPF estimado", "", '=MIN(12450,MAX(0,C12))*0.19 + MIN(7750,MAX(0,C12-12450))*0.24 + MIN(15000,MAX(0,C12-20200))*0.30 + MIN(24800,MAX(0,C12-35200))*0.37 + MIN(240000,MAX(0,C12-60000))*0.45 + MAX(0,C12-300000)*0.47'],
        ["NETO AUTÓNOMO", "", '=C4-C5-C11-C13'],
        [""],
        ["ESCENARIO SL"],
        ["Beneficio antes de IS", "", '=C4-C5'],
        ["Impuesto de Sociedades (25%)", "", '=C17*0.25'],
        ["Beneficio después de IS", "", '=C17-C18'],
        ["Salario que te pagas (bruto anual)", "", 24000],
        ["SS trabajador sobre salario", "", '=C20*0.0648'],
        ["SS empresa sobre salario", "", '=C20*(0.236+0.055+0.006+0.002+0.0067)'],
        ["IRPF sobre salario", "", '=MIN(12450,MAX(0,C20-C21))*0.19 + MIN(7750,MAX(0,C20-C21-12450))*0.24 + MIN(15000,MAX(0,C20-C21-20200))*0.30'],
        ["Dividendos (resto beneficio)", "", '=MAX(0, C19-C20-C22)'],
        ["IRPF dividendos (19-23%)", "", '=MIN(6000,MAX(0,C24))*0.19 + MIN(44000,MAX(0,C24-6000))*0.21 + MAX(0,C24-50000)*0.23'],
        ["Cuota autónomos societario", "", '=424*12'],
        ["NETO SL (salario+dividendos-impuestos)", "", '=C20-C21-C23+C24-C25-C26'],
        [""],
        ["COMPARACIÓN"],
        ["Neto Autónomo", "", '=C14'],
        ["Neto SL", "", '=C27'],
        ["Diferencia (positivo = SL mejor)", "", '=C31-C30'],
        ["RECOMENDACIÓN", "", '=IF(C32>0, "SL es más eficiente fiscalmente", IF(C32<-1000, "Autónomo es más eficiente", "Muy similar — valora la responsabilidad limitada de la SL"))'],
    ]
    write_block(ws, 1, 1, data)
    rate_limit()

    format_header_row(ws, 1, 3)
    format_section_title(ws, "A3", 3)
    format_section_title(ws, "A7", 3)
    format_section_title(ws, "A16", 3)
    format_section_title(ws, "A29", 3)
    for r in [4, 5]:
        format_input_cell(ws, f"C{r}")
    format_input_cell(ws, "C20")
    for r in [14, 27, 30, 31, 32, 33]:
        format_result_cell(ws, f"C{r}")
    rate_limit()

    ws.format("C4:C5", {"numberFormat": EUR_FORMAT})
    ws.format("C8:C14", {"numberFormat": EUR_FORMAT})
    ws.format("C17:C27", {"numberFormat": EUR_FORMAT})
    ws.format("C30:C32", {"numberFormat": EUR_FORMAT})

    add_note(ws, "C4", "Tu facturación anual sin IVA")
    add_note(ws, "C5", "Gastos deducibles: alquiler oficina, suministros, etc.")
    add_note(ws, "C20", "El salario que te asignarías como administrador de la SL")
    add_note(ws, "C26", "Base mínima autónomo societario 2025: 1.274,57€/mes")
    rate_limit()

    # Formato condicional
    add_conditional_formatting(spreadsheet, ws, "C32", [
        ("NUMBER_GREATER", ["0"], {"backgroundColor": COLOR_RESULT_BG}),
        ("NUMBER_LESS", ["0"], {"backgroundColor": {"red": 1, "green": 0.9, "blue": 0.8}}),
    ])

    protect_range(ws, "C8:C14")
    protect_range(ws, "C17:C27")
    protect_range(ws, "C30:C33")
    print("  ✓ 13. Autónomo vs SL")


# ─── 14. Pensión Jubilación ──────────────────────────────────────────────────

def create_tab_pension(spreadsheet, ws):
    """Calculadora de pensión de jubilación."""
    ws.update_title("14. Pensión Jubilación")
    ws.resize(rows=35, cols=6)
    rate_limit()

    data = [
        ["PENSIÓN DE JUBILACIÓN — Estimación"],
        [""],
        ["DATOS DE ENTRADA", "", "VALOR"],
        ["Edad actual", "", 35],
        ["Edad jubilación", "", 67],
        ["Esperanza de vida", "", 85],
        ["Salario bruto anual actual (€)", "", 35000],
        ["Crecimiento salarial anual (%)", "", 2],
        ["Ahorros actuales (€)", "", 20000],
        ["Aportación mensual ahorro (€)", "", 300],
        ["Rentabilidad anual inversión (%)", "", 5],
        ["Gasto mensual esperado jubilación (€)", "", 1500],
        [""],
        ["RESULTADOS"],
        ["Años hasta jubilación", "", '=C5-C4'],
        ["Salario estimado al jubilarse", "", '=C7*(1+C8/100)^C15'],
        ["Pensión pública estimada (70% último salario)", "", '=C16*0.7/12'],
        ["Patrimonio al jubilarse (ahorro privado)", "", '=C9*(1+C11/100)^C15 + C10*12*((1+C11/100)^C15-1)/(C11/100)'],
        ["Años de jubilación", "", '=C6-C5'],
        [""],
        ["BALANCE MENSUAL EN JUBILACIÓN"],
        ["Pensión pública estimada", "", '=C17'],
        ["Renta del ahorro privado (retiro 3%/año)", "", '=C18*0.03/12'],
        ["Ingreso mensual total", "", '=C22+C23'],
        ["Gasto mensual", "", '=C12'],
        ["Superávit/Déficit mensual", "", '=C24-C25'],
        [""],
        ["Años que durarán tus ahorros (retiro 3%)", "", '=IF(C23*12>=C12*12, "Indefinido", ROUND(C18/(C12*12-C17*12),1))'],
        ["ESTADO", "", '=IF(C26>=0, "✅ Cubierto: tus ingresos cubren tus gastos", "⚠ Déficit: necesitas ahorrar más o reducir gastos")'],
    ]
    write_block(ws, 1, 1, data)
    rate_limit()

    format_header_row(ws, 1, 3)
    format_section_title(ws, "A3", 3)
    format_section_title(ws, "A14", 3)
    format_section_title(ws, "A21", 3)
    for r in range(4, 13):
        format_input_cell(ws, f"C{r}")
    for r in [15, 16, 17, 18, 19, 22, 23, 24, 25, 26, 28, 29]:
        format_result_cell(ws, f"C{r}")
    rate_limit()

    ws.format("C7", {"numberFormat": EUR_FORMAT})
    ws.format("C9:C10", {"numberFormat": EUR_FORMAT})
    ws.format("C12", {"numberFormat": EUR_FORMAT})
    ws.format("C16:C18", {"numberFormat": EUR_FORMAT})
    ws.format("C22:C26", {"numberFormat": EUR_FORMAT})

    add_note(ws, "C17", "Estimación simplificada: 70% del último salario bruto mensual. La pensión real depende de bases de cotización.")
    add_note(ws, "C5", "Edad legal de jubilación en España: 67 años (o 65 con 38+ años cotizados)")
    rate_limit()

    add_conditional_formatting(spreadsheet, ws, "C26", [
        ("NUMBER_GREATER_EQUAL", ["0"], {"backgroundColor": COLOR_RESULT_BG}),
        ("NUMBER_LESS", ["0"], {"backgroundColor": {"red": 1, "green": 0.8, "blue": 0.8}}),
    ])

    protect_range(ws, "C15:C19")
    protect_range(ws, "C22:C29")
    print("  ✓ 14. Pensión Jubilación")


# ─── 15. Gastos Compra Vivienda ──────────────────────────────────────────────

def create_tab_gastos_vivienda(spreadsheet, ws):
    """Gastos de compra de vivienda por CCAA."""
    ws.update_title("15. Gastos Compra Vivienda")
    ws.resize(rows=35, cols=8)
    rate_limit()

    data = [
        ["GASTOS DE COMPRA DE VIVIENDA EN ESPAÑA"],
        [""],
        ["DATOS DE ENTRADA", "", "VALOR"],
        ["Precio de la vivienda (€)", "", 250000],
        ["Tipo de vivienda", "", "Segunda mano"],
        ["Comunidad Autónoma", "", "Madrid"],
        ["¿Necesitas hipoteca?", "", "Sí"],
        [""],
        ["IMPUESTOS"],
        ["ITP (vivienda segunda mano)", "", '=IF(C5="Segunda mano", IF(C6="Madrid",C4*0.06, IF(C6="Andalucía",C4*0.07, IF(C6="Cataluña",C4*0.10, IF(C6="Comunidad Valenciana",C4*0.10, IF(C6="Canarias",C4*0.065, IF(C6="Navarra",C4*0.06, IF(C6="Galicia",C4*0.08, IF(C6="Murcia",C4*0.08, IF(C6="La Rioja",C4*0.07, IF(C6="Cantabria",C4*0.09, IF(C6="Castilla-La Mancha",C4*0.09, IF(C6="Castilla y León",C4*0.08, IF(C6="País Vasco",C4*0.07, C4*0.08))))))))))))), 0)'],
        ["IVA (vivienda nueva, 10%)", "", '=IF(C5="Nueva", C4*0.10, 0)'],
        ["AJD (vivienda nueva)", "", '=IF(C5="Nueva", IF(C6="Madrid",C4*0.0075, IF(C6="Navarra",C4*0.005, IF(C6="País Vasco",C4*0.005, IF(C6="Canarias",C4*0.01, IF(C6="La Rioja",C4*0.01, C4*0.015))))), 0)'],
        ["Total impuestos", "", '=C10+C11+C12'],
        [""],
        ["GASTOS ADICIONALES"],
        ["Notaría (aprox. 0,3%)", "", '=C4*0.003'],
        ["Registro de la Propiedad (aprox. 0,18%)", "", '=C4*0.0018'],
        ["Gestoría", "", 400],
        ["Tasación (si hipoteca)", "", '=IF(C7="Sí", 350, 0)'],
        ["Total gastos adicionales", "", '=SUM(C16:C19)'],
        [""],
        ["RESUMEN"],
        ["Precio vivienda", "", '=C4'],
        ["Total impuestos", "", '=C13'],
        ["Total gastos", "", '=C20'],
        ["COSTE TOTAL DE COMPRA", "", '=C22+C23+C24'],
        ["% sobre precio", "", '=IF(C4=0,0,(C23+C24)/C4)'],
    ]
    write_block(ws, 1, 1, data)
    rate_limit()

    format_header_row(ws, 1, 3)
    format_section_title(ws, "A3", 3)
    format_section_title(ws, "A9", 3)
    format_section_title(ws, "A15", 3)
    format_section_title(ws, "A22", 3)
    for r in [4, 5, 6, 7]:
        format_input_cell(ws, f"C{r}")
    format_input_cell(ws, "C18")
    for r in [10, 11, 12, 13, 16, 17, 19, 20, 22, 23, 24, 25, 26]:
        format_result_cell(ws, f"C{r}")
    rate_limit()

    ws.format("C4", {"numberFormat": EUR_FORMAT})
    ws.format("C10:C13", {"numberFormat": EUR_FORMAT})
    ws.format("C16:C20", {"numberFormat": EUR_FORMAT})
    ws.format("C22:C25", {"numberFormat": EUR_FORMAT})
    ws.format("C26", {"numberFormat": PCT_FORMAT})

    add_note(ws, "C5", "Escribe 'Nueva' o 'Segunda mano'")
    add_note(ws, "C6", "Escribe el nombre de tu Comunidad Autónoma")
    add_note(ws, "C7", "Escribe 'Sí' o 'No'")
    add_note(ws, "C10", "El ITP varía por CCAA. Aquí están los tipos generales más comunes.")
    rate_limit()

    protect_range(ws, "C10:C13")
    protect_range(ws, "C16:C17")
    protect_range(ws, "C19:C26")
    print("  ✓ 15. Gastos Compra Vivienda")


# ─── 16. Plusvalía Municipal ─────────────────────────────────────────────────

def create_tab_plusvalia(spreadsheet, ws):
    """Plusvalía municipal: método objetivo vs real."""
    ws.update_title("16. Plusvalía Municipal")
    ws.resize(rows=45, cols=8)
    rate_limit()

    data = [
        ["PLUSVALÍA MUNICIPAL (IIVTNU)"],
        [""],
        ["DATOS DE ENTRADA", "", "VALOR"],
        ["Valor catastral del suelo (€)", "", 80000],
        ["Precio de compra (€)", "", 200000],
        ["Precio de venta (€)", "", 280000],
        ["Años de propiedad", "", 10],
        ["Tipo impositivo del municipio (%)", "", 30],
        [""],
        ["MÉTODO OBJETIVO (estimación objetiva)"],
        ["Coeficiente por años", "", '=IF(C7<1,0.15, IF(C7=1,0.15, IF(C7=2,0.14, IF(C7=3,0.14, IF(C7=4,0.16, IF(C7=5,0.18, IF(C7=6,0.19, IF(C7=7,0.20, IF(C7=8,0.19, IF(C7=9,0.15, IF(C7=10,0.12, IF(C7=11,0.10, IF(C7=12,0.09, IF(C7=13,0.09, IF(C7=14,0.09, IF(C7=15,0.09, IF(C7=16,0.10, IF(C7=17,0.13, IF(C7=18,0.17, IF(C7=19,0.23, 0.40))))))))))))))))))))'],
        ["Base imponible objetiva", "", '=C4*C11'],
        ["Cuota plusvalía objetiva", "", '=C12*C8/100'],
        [""],
        ["MÉTODO REAL (plusvalía real)"],
        ["Ganancia patrimonial", "", '=C6-C5'],
        ["% suelo sobre total (usar catastro)", "", '=C4/C5'],
        ["Plusvalía imputable al suelo", "", '=C16*C17'],
        ["Base imponible real", "", '=C18'],
        ["Cuota plusvalía real", "", '=C19*C8/100'],
        [""],
        ["RESULTADO"],
        ["Plusvalía a pagar (la MENOR)", "", '=MIN(C13, C20)'],
        ["Método más favorable", "", '=IF(C13<C20, "Objetivo", "Real")'],
        ["Ahorro por elegir el mejor método", "", '=ABS(C13-C20)'],
        [""],
        ["¿Hay plusvalía real?", "", '=IF(C16<=0, "NO — Si no hay ganancia, NO se paga plusvalía (sentencia TC 182/2021)", "SÍ — Hay ganancia patrimonial")'],
    ]
    write_block(ws, 1, 1, data)
    rate_limit()

    format_header_row(ws, 1, 3)
    format_section_title(ws, "A3", 3)
    format_section_title(ws, "A10", 3)
    format_section_title(ws, "A15", 3)
    format_section_title(ws, "A22", 3)
    for r in [4, 5, 6, 7, 8]:
        format_input_cell(ws, f"C{r}")
    for r in [11, 12, 13, 16, 17, 18, 19, 20, 23, 24, 25, 27]:
        format_result_cell(ws, f"C{r}")
    rate_limit()

    ws.format("C4:C6", {"numberFormat": EUR_FORMAT})
    ws.format("C12:C13", {"numberFormat": EUR_FORMAT})
    ws.format("C16", {"numberFormat": EUR_FORMAT})
    ws.format("C18:C20", {"numberFormat": EUR_FORMAT})
    ws.format("C23", {"numberFormat": EUR_FORMAT})
    ws.format("C25", {"numberFormat": EUR_FORMAT})
    ws.format("C17", {"numberFormat": PCT_FORMAT})

    add_note(ws, "C4", "Lo encuentras en el recibo del IBI o en la web del catastro")
    add_note(ws, "C8", "El máximo legal es 30%. Tu ayuntamiento puede aplicar menos.")
    add_note(ws, "C11", "Coeficientes máximos 2025 según RDL 8/2023")
    rate_limit()

    protect_range(ws, "C11:C13")
    protect_range(ws, "C16:C20")
    protect_range(ws, "C23:C27")
    print("  ✓ 16. Plusvalía Municipal")


# ─── 17. Cuota Autónomos ────────────────────────────────────────────────────

def create_tab_cuota_autonomos(spreadsheet, ws):
    """Cuota de autónomos por tramos 2025-2026."""
    ws.update_title("17. Cuota Autónomos")
    ws.resize(rows=35, cols=8)
    rate_limit()

    data = [
        ["CUOTA DE AUTÓNOMOS 2025-2026"],
        [""],
        ["DATOS DE ENTRADA", "", "VALOR"],
        ["Ingresos anuales previstos (€)", "", 30000],
        ["Gastos deducibles (€)", "", 5000],
        ["¿Nuevo autónomo? (tarifa plana)", "", "No"],
        [""],
        ["CÁLCULO"],
        ["Rendimiento neto anual", "", '=C4-C5'],
        ["Rendimiento neto mensual", "", '=C9/12'],
        [""],
        ["Tu cuota mensual", "", '=IF(C6="Sí", 80, IF(C10<=670,200, IF(C10<=900,225, IF(C10<=1166.7,250, IF(C10<=1300,267, IF(C10<=1500,280, IF(C10<=1700,294, IF(C10<=1850,350, IF(C10<=2030,370, IF(C10<=2330,396, IF(C10<=2760,423, IF(C10<=3190,456, IF(C10<=3620,480, IF(C10<=4050,490, IF(C10<=6000,504, 590)))))))))))))))'],
        ["Tu cuota anual", "", '=C12*12'],
        ["% sobre rendimiento neto", "", '=IF(C9=0,0,C13/C9)'],
        [""],
        ["TABLA DE TRAMOS 2025-2026"],
        ["Rendimiento neto mensual", "Cuota mensual", "Cuota anual"],
        ["Hasta 670 €", 200, '=B18*12'],
        ["670 - 900 €", 225, '=B19*12'],
        ["900 - 1.166,70 €", 250, '=B20*12'],
        ["1.166,70 - 1.300 €", 267, '=B21*12'],
        ["1.300 - 1.500 €", 280, '=B22*12'],
        ["1.500 - 1.700 €", 294, '=B23*12'],
        ["1.700 - 1.850 €", 350, '=B24*12'],
        ["1.850 - 2.030 €", 370, '=B25*12'],
        ["2.030 - 2.330 €", 396, '=B26*12'],
        ["2.330 - 2.760 €", 423, '=B27*12'],
        ["2.760 - 3.190 €", 456, '=B28*12'],
        ["3.190 - 3.620 €", 480, '=B29*12'],
        ["3.620 - 4.050 €", 490, '=B30*12'],
        ["4.050 - 6.000 €", 504, '=B31*12'],
        ["Más de 6.000 €", 590, '=B32*12'],
        [""],
        ["Tarifa plana nuevos autónomos", 80, '=B34*12'],
    ]
    write_block(ws, 1, 1, data)
    rate_limit()

    format_header_row(ws, 1, 3)
    format_header_row(ws, 17, 3)
    format_section_title(ws, "A3", 3)
    format_section_title(ws, "A8", 3)
    format_section_title(ws, "A16", 3)
    for r in [4, 5, 6]:
        format_input_cell(ws, f"C{r}")
    for r in [9, 10, 12, 13, 14]:
        format_result_cell(ws, f"C{r}")
    rate_limit()

    ws.format("C4:C5", {"numberFormat": EUR_FORMAT})
    ws.format("C9:C10", {"numberFormat": EUR_FORMAT})
    ws.format("C12:C13", {"numberFormat": EUR_FORMAT})
    ws.format("C14", {"numberFormat": PCT_FORMAT})
    ws.format("B18:C34", {"numberFormat": EUR_FORMAT})

    ws.format("C12", {
        "backgroundColor": COLOR_RESULT_BG,
        "textFormat": {"bold": True, "fontSize": 14},
        "numberFormat": EUR_FORMAT,
    })

    add_note(ws, "C6", "Escribe 'Sí' si te diste de alta como autónomo por primera vez. Tarifa plana: 80€/mes durante 12 meses.")
    rate_limit()

    protect_range(ws, "C9:C14")
    print("  ✓ 17. Cuota Autónomos")


# ─── 18. Rescate Plan Pensiones ──────────────────────────────────────────────

def create_tab_rescate_pensiones(spreadsheet, ws):
    """Optimizador IRPF para rescate de plan de pensiones."""
    ws.update_title("18. Rescate Plan Pensiones")
    ws.resize(rows=30, cols=8)
    rate_limit()

    data = [
        ["RESCATE PLAN DE PENSIONES — Optimizador IRPF"],
        [""],
        ["DATOS DE ENTRADA", "", "VALOR"],
        ["Valor del plan de pensiones (€)", "", 80000],
        ["Otros ingresos anuales (€)", "", 25000],
        ["Años para rescatar", "", 5],
        [""],
        ["ESCENARIO 1: Rescate de golpe"],
        ["Base imponible total", "", '=C4+C5'],
        ["IRPF total", "", '=MIN(12450,MAX(0,C9))*0.19 + MIN(7750,MAX(0,C9-12450))*0.24 + MIN(15000,MAX(0,C9-20200))*0.30 + MIN(24800,MAX(0,C9-35200))*0.37 + MIN(240000,MAX(0,C9-60000))*0.45 + MAX(0,C9-300000)*0.47'],
        ["IRPF solo otros ingresos", "", '=MIN(12450,MAX(0,C5))*0.19 + MIN(7750,MAX(0,C5-12450))*0.24 + MIN(15000,MAX(0,C5-20200))*0.30 + MIN(24800,MAX(0,C5-35200))*0.37 + MIN(240000,MAX(0,C5-60000))*0.45 + MAX(0,C5-300000)*0.47'],
        ["IRPF imputable al plan", "", '=C10-C11'],
        ["Tipo efectivo sobre el plan", "", '=IF(C4=0,0,C12/C4)'],
        ["Neto del rescate", "", '=C4-C12'],
        [""],
        ["ESCENARIO 2: Rescate en N años"],
        ["Rescate anual", "", '=C4/C6'],
        ["Base imponible anual", "", '=C17+C5'],
        ["IRPF anual total", "", '=MIN(12450,MAX(0,C18))*0.19 + MIN(7750,MAX(0,C18-12450))*0.24 + MIN(15000,MAX(0,C18-20200))*0.30 + MIN(24800,MAX(0,C18-35200))*0.37 + MIN(240000,MAX(0,C18-60000))*0.45 + MAX(0,C18-300000)*0.47'],
        ["IRPF imputable al plan (anual)", "", '=C19-C11'],
        ["IRPF total plan en N años", "", '=C20*C6'],
        ["Tipo efectivo sobre el plan", "", '=IF(C4=0,0,C21/C4)'],
        ["Neto del rescate", "", '=C4-C21'],
        [""],
        ["AHORRO FISCAL"],
        ["Ahorro por repartir en N años", "", '=C14-C23'],
        ["Lo que te ahorras (€)", "", '=C23-C14'],
    ]
    write_block(ws, 1, 1, data)
    rate_limit()

    format_header_row(ws, 1, 3)
    format_section_title(ws, "A3", 3)
    format_section_title(ws, "A8", 3)
    format_section_title(ws, "A16", 3)
    format_section_title(ws, "A25", 3)
    for r in [4, 5, 6]:
        format_input_cell(ws, f"C{r}")
    for r in [9, 10, 12, 13, 14, 17, 18, 19, 20, 21, 22, 23, 26, 27]:
        format_result_cell(ws, f"C{r}")
    rate_limit()

    ws.format("C4:C5", {"numberFormat": EUR_FORMAT})
    ws.format("C9:C14", {"numberFormat": EUR_FORMAT})
    ws.format("C13", {"numberFormat": PCT_FORMAT})
    ws.format("C17:C23", {"numberFormat": EUR_FORMAT})
    ws.format("C22", {"numberFormat": PCT_FORMAT})
    ws.format("C26:C27", {"numberFormat": EUR_FORMAT})

    add_note(ws, "C4", "Valor total acumulado en tu plan de pensiones")
    add_note(ws, "C5", "Tus otros ingresos: pensión, trabajo, alquileres...")
    add_note(ws, "C6", "En cuántos años quieres ir rescatando el plan")
    rate_limit()

    add_conditional_formatting(spreadsheet, ws, "C26", [
        ("NUMBER_GREATER", ["0"], {"backgroundColor": COLOR_RESULT_BG}),
    ])

    protect_range(ws, "C9:C14")
    protect_range(ws, "C17:C27")
    print("  ✓ 18. Rescate Plan Pensiones")


# ─── 19. Comparador CCAA ────────────────────────────────────────────────────

def create_tab_comparador_ccaa(spreadsheet, ws):
    """Comparador fiscal entre CCAA."""
    ws.update_title("19. Comparador CCAA")
    ws.resize(rows=30, cols=12)
    rate_limit()

    data = [
        ["COMPARADOR FISCAL POR COMUNIDAD AUTÓNOMA"],
        [""],
        ["Este comparador muestra los tipos impositivos clave por CCAA."],
        [""],
        ["CCAA", "IRPF marginal máx. (total)", "ITP general", "AJD", "Observaciones"],
        ["Andalucía", "47%", "7%", "1,2%", ""],
        ["Aragón", "49%", "8-10%", "1,5%", "ITP progresivo"],
        ["Asturias", "49,5%", "8-10%", "1,2%", "ITP progresivo"],
        ["Baleares", "49,25%", "8-13%", "1,5%", "ITP muy progresivo"],
        ["Canarias", "49,5%", "6,5%", "1%", "IGIC 7% en vez de IVA"],
        ["Cantabria", "48%", "9%", "1,5%", ""],
        ["Castilla-La Mancha", "47%", "9%", "1,25%", ""],
        ["Castilla y León", "46%", "8-10%", "1,5%", ""],
        ["Cataluña", "50%", "10%", "1,5%", "ITP 11% >1M"],
        ["Extremadura", "49%", "8-11%", "1,2%", "ITP progresivo"],
        ["Galicia", "47%", "8%", "1,5%", ""],
        ["La Rioja", "51,5%", "7%", "1%", ""],
        ["Madrid", "43%", "6%", "0,75%", "La más baja en IRPF e ITP"],
        ["Murcia", "47%", "8%", "1,5%", ""],
        ["C. Valenciana", "54%", "10%", "1,5%", "ITP baja a 9% jun 2026"],
        ["Navarra", "54%", "6%", "0,5%", "Sistema foral propio"],
        ["País Vasco", "47%", "7%", "0,5%", "Sistema foral propio"],
        ["Ceuta", "47%", "6%", "0,5%", "Deducción 60% cuota IRPF"],
        ["Melilla", "47%", "6%", "0,5%", "Deducción 60% cuota IRPF"],
    ]
    write_block(ws, 1, 1, data)
    rate_limit()

    format_header_row(ws, 1, 5)
    format_header_row(ws, 5, 5)

    # Resaltar Madrid como la más baja
    ws.format("A18:E18", {
        "backgroundColor": COLOR_RESULT_BG,
        "textFormat": {"bold": True},
    })
    rate_limit()

    add_note(ws, "B5", "Tipo marginal máximo combinado (estatal + autonómico)")
    add_note(ws, "C5", "Impuesto de Transmisiones Patrimoniales para inmuebles")
    add_note(ws, "D5", "Actos Jurídicos Documentados (vivienda nueva + hipoteca)")
    print("  ✓ 19. Comparador CCAA")


# ─── 20. ¿Comprar o Alquilar? ───────────────────────────────────────────────

def create_tab_comprar_alquilar(spreadsheet, ws):
    """Decisor comprar vs alquilar a 10-20-30 años."""
    ws.update_title("20. Comprar o Alquilar")
    ws.resize(rows=40, cols=10)
    rate_limit()

    data = [
        ["¿COMPRAR O ALQUILAR?"],
        [""],
        ["DATOS DE ENTRADA", "", "VALOR"],
        ["Precio vivienda (€)", "", 250000],
        ["Entrada disponible (€)", "", 50000],
        ["Tipo interés hipoteca (%)", "", 3],
        ["Plazo hipoteca (años)", "", 25],
        ["Gastos compra (% sobre precio)", "", 10],
        ["Revalorización anual vivienda (%)", "", 2],
        [""],
        ["Alquiler mensual (€)", "", 900],
        ["Subida anual alquiler (%)", "", 3],
        ["Rentabilidad inversión alternativa (%)", "", 7],
        [""],
        ["ESCENARIO COMPRA"],
        ["Gastos iniciales compra", "", '=C4*C8/100'],
        ["Préstamo hipotecario", "", '=C4-C5'],
        ["Cuota mensual", "", '=IF(C6=0,C17/(C7*12), C17*(C6/100/12)*(1+C6/100/12)^(C7*12)/((1+C6/100/12)^(C7*12)-1))'],
        ["Total pagado hipoteca (25 años)", "", '=C18*C7*12'],
        ["Total intereses", "", '=C19-C17'],
        ["Coste total compra", "", '=C16+C19'],
        ["Valor vivienda en 10 años", "", '=C4*(1+C9/100)^10'],
        ["Valor vivienda en 20 años", "", '=C4*(1+C9/100)^20'],
        ["Valor vivienda en 30 años", "", '=C4*(1+C9/100)^30'],
        [""],
        ["ESCENARIO ALQUILER + INVERSIÓN"],
        ["Diferencia mensual (lo que invertirías)", "", '=MAX(0, C18-C11)'],
        ["Si inviertes la entrada + diferencia:"],
        ["Patrimonio en 10 años", "", '=C5*(1+C13/100)^10 + IF(C27=0,0, C27*12*((1+C13/100)^10-1)/(C13/100))'],
        ["Patrimonio en 20 años", "", '=C5*(1+C13/100)^20 + IF(C27=0,0, C27*12*((1+C13/100)^20-1)/(C13/100))'],
        ["Patrimonio en 30 años", "", '=C5*(1+C13/100)^30 + IF(C27=0,0, C27*12*((1+C13/100)^30-1)/(C13/100))'],
        ["Total alquiler pagado 10 años", "", '=C11*12*((1+C12/100)^10-1)/(C12/100)'],
        ["Total alquiler pagado 20 años", "", '=C11*12*((1+C12/100)^20-1)/(C12/100)'],
        ["Total alquiler pagado 30 años", "", '=C11*12*((1+C12/100)^30-1)/(C12/100)'],
        [""],
        ["VEREDICTO"],
        ["", "10 años", "20 años", "30 años"],
        ["Patrimonio COMPRA", '=C22-C20*10/C7', '=C23-C20*20/C7', '=C24-C20*30/C7'],
        ["Patrimonio ALQUILER", '=C29-C32', '=C30-C33', '=C31-C34'],
        ["Mejor opción", '=IF(B37>B38,"COMPRAR","ALQUILAR")', '=IF(C37>C38,"COMPRAR","ALQUILAR")', '=IF(D37>D38,"COMPRAR","ALQUILAR")'],
    ]
    write_block(ws, 1, 1, data)
    rate_limit()

    format_header_row(ws, 1, 4)
    format_header_row(ws, 36, 4)
    format_section_title(ws, "A3", 4)
    format_section_title(ws, "A15", 4)
    format_section_title(ws, "A26", 4)
    format_section_title(ws, "A35", 4)
    for r in [4, 5, 6, 7, 8, 9, 11, 12, 13]:
        format_input_cell(ws, f"C{r}")
    for r in [16, 17, 18, 19, 20, 21, 22, 23, 24, 27, 29, 30, 31, 32, 33, 34]:
        format_result_cell(ws, f"C{r}")
    for c in ["B", "C", "D"]:
        for r in [37, 38, 39]:
            format_result_cell(ws, f"{c}{r}")
    rate_limit()

    ws.format("C4:C5", {"numberFormat": EUR_FORMAT})
    ws.format("C11", {"numberFormat": EUR_FORMAT})
    ws.format("C16:C24", {"numberFormat": EUR_FORMAT})
    ws.format("C27", {"numberFormat": EUR_FORMAT})
    ws.format("C29:C34", {"numberFormat": EUR_FORMAT})
    ws.format("B37:D38", {"numberFormat": EUR_FORMAT})

    add_note(ws, "C9", "Revalorización media histórica vivienda España: ~2-3% anual")
    add_note(ws, "C13", "Rentabilidad media indexados globales: ~7% anual nominal")
    rate_limit()

    protect_range(ws, "C16:C24")
    protect_range(ws, "C27:C34")
    protect_range(ws, "B37:D39")
    print("  ✓ 20. Comprar o Alquilar")


# ─── 21. ¿Tipo Fijo o Variable? ─────────────────────────────────────────────

def create_tab_fijo_variable(spreadsheet, ws):
    """Comparación tipo fijo vs variable con escenarios Euribor."""
    ws.update_title("21. Fijo o Variable")
    ws.resize(rows=35, cols=10)
    rate_limit()

    data = [
        ["¿TIPO FIJO O VARIABLE?"],
        [""],
        ["DATOS DE ENTRADA", "", "VALOR"],
        ["Importe préstamo (€)", "", 200000],
        ["Plazo (años)", "", 25],
        ["Tipo fijo ofertado (%)", "", 3.0],
        ["Diferencial variable (%)", "", 0.8],
        [""],
        ["ESCENARIOS EURIBOR"],
        ["", "Euribor", "Tipo total variable", "Cuota variable", "Cuota fija", "Diferencia/mes"],
        ["Euribor bajo", 1.5, '=B11+$C$7', '=IF(C11=0,$C$4/($C$5*12), $C$4*(C11/100/12)*(1+C11/100/12)^($C$5*12)/((1+C11/100/12)^($C$5*12)-1))', '=IF($C$6=0,$C$4/($C$5*12), $C$4*($C$6/100/12)*(1+$C$6/100/12)^($C$5*12)/((1+$C$6/100/12)^($C$5*12)-1))', '=E11-D11'],
        ["Euribor medio", 2.5, '=B12+$C$7', '=IF(C12=0,$C$4/($C$5*12), $C$4*(C12/100/12)*(1+C12/100/12)^($C$5*12)/((1+C12/100/12)^($C$5*12)-1))', '=IF($C$6=0,$C$4/($C$5*12), $C$4*($C$6/100/12)*(1+$C$6/100/12)^($C$5*12)/((1+$C$6/100/12)^($C$5*12)-1))', '=E12-D12'],
        ["Euribor alto", 4.0, '=B13+$C$7', '=IF(C13=0,$C$4/($C$5*12), $C$4*(C13/100/12)*(1+C13/100/12)^($C$5*12)/((1+C13/100/12)^($C$5*12)-1))', '=IF($C$6=0,$C$4/($C$5*12), $C$4*($C$6/100/12)*(1+$C$6/100/12)^($C$5*12)/((1+$C$6/100/12)^($C$5*12)-1))', '=E13-D13'],
        [""],
        ["COSTE TOTAL A LO LARGO DEL PRÉSTAMO"],
        ["", "", "Variable", "Fijo", "Ahorro fijo"],
        ["Euribor bajo", "", '=D11*$C$5*12', '=E11*$C$5*12', '=D17-C17'],
        ["Euribor medio", "", '=D12*$C$5*12', '=E12*$C$5*12', '=D18-C18'],
        ["Euribor alto", "", '=D13*$C$5*12', '=E13*$C$5*12', '=D19-C19'],
        [""],
        ["RECOMENDACIÓN"],
        ["", "", '=IF(AND(F12>0,F13>0), "VARIABLE — Con Euribor medio y alto sigues pagando menos que el fijo", IF(F13>0, "VARIABLE — Solo perderías con Euribor muy bajo", IF(F12>0, "DEPENDE — El fijo protege si el Euribor sube mucho", "FIJO — Te protege de subidas del Euribor")))'],
    ]
    write_block(ws, 1, 1, data)
    rate_limit()

    format_header_row(ws, 1, 6)
    format_header_row(ws, 10, 6)
    format_header_row(ws, 16, 5)
    format_section_title(ws, "A3", 6)
    format_section_title(ws, "A9", 6)
    format_section_title(ws, "A15", 5)
    format_section_title(ws, "A21", 5)
    for r in [4, 5, 6, 7]:
        format_input_cell(ws, f"C{r}")
    for r in [11, 12, 13]:
        format_input_cell(ws, f"B{r}")
    rate_limit()

    ws.format("C4", {"numberFormat": EUR_FORMAT})
    ws.format("D11:F13", {"numberFormat": EUR_FORMAT})
    ws.format("C17:E19", {"numberFormat": EUR_FORMAT})

    add_note(ws, "C6", "El tipo fijo que te ofrece el banco")
    add_note(ws, "C7", "El diferencial sobre Euribor (ej: Euribor + 0.8%)")
    add_note(ws, "B11", "Cambia estos valores para simular diferentes escenarios de Euribor")
    rate_limit()

    # Formato condicional: verde si fijo es más barato, rojo si más caro
    add_conditional_formatting(spreadsheet, ws, "F11:F13", [
        ("NUMBER_GREATER", ["0"], {"backgroundColor": COLOR_RESULT_BG}),
        ("NUMBER_LESS", ["0"], {"backgroundColor": {"red": 1, "green": 0.85, "blue": 0.85}}),
    ])

    protect_range(ws, "C11:F13")
    protect_range(ws, "C17:E19")
    print("  ✓ 21. Fijo o Variable")


# ─── 22. ¿Amortizar o Invertir? ─────────────────────────────────────────────

def create_tab_amortizar_invertir(spreadsheet, ws):
    """Decisor: amortizar hipoteca anticipadamente o invertir."""
    ws.update_title("22. Amortizar o Invertir")
    ws.resize(rows=30, cols=8)
    rate_limit()

    data = [
        ["¿AMORTIZAR HIPOTECA O INVERTIR?"],
        [""],
        ["DATOS DE ENTRADA", "", "VALOR"],
        ["Capital pendiente hipoteca (€)", "", 150000],
        ["Tipo interés hipoteca (%)", "", 3.0],
        ["Años restantes hipoteca", "", 20],
        ["Cantidad disponible (€)", "", 10000],
        ["Rentabilidad inversión esperada (%)", "", 7],
        ["Tipo marginal IRPF (%)", "", 30],
        ["¿Deducción por vivienda habitual?", "", "No"],
        [""],
        ["OPCIÓN A: AMORTIZAR"],
        ["Cuota actual", "", '=IF(C5=0,C4/(C6*12), C4*(C5/100/12)*(1+C5/100/12)^(C6*12)/((1+C5/100/12)^(C6*12)-1))'],
        ["Intereses restantes sin amortizar", "", '=C13*C6*12-C4'],
        ["Capital tras amortizar", "", '=C4-C7'],
        ["Nueva cuota (reduciendo cuota)", "", '=IF(C5=0,C15/(C6*12), C15*(C5/100/12)*(1+C5/100/12)^(C6*12)/((1+C5/100/12)^(C6*12)-1))'],
        ["Ahorro mensual en cuota", "", '=C13-C16'],
        ["Intereses restantes tras amortizar", "", '=C16*C6*12-C15'],
        ["Ahorro total intereses", "", '=C14-C18'],
        ["Deducción fiscal (si aplica)", "", '=IF(C10="Sí", MIN(C7, 9040)*C9/100, 0)'],
        ["Beneficio total amortizar", "", '=C19+C20'],
        [""],
        ["OPCIÓN B: INVERTIR"],
        ["Valor inversión en N años", "", '=C7*(1+C8/100)^C6'],
        ["Ganancia bruta inversión", "", '=C24-C7'],
        ["Impuestos sobre ganancia (19-23%)", "", '=MIN(6000,MAX(0,C25))*0.19 + MIN(44000,MAX(0,C25-6000))*0.21 + MAX(0,C25-50000)*0.23'],
        ["Ganancia neta inversión", "", '=C25-C26'],
        [""],
        ["VEREDICTO", "", '=IF(C27>C21, "INVERTIR — La rentabilidad esperada supera el ahorro en intereses", "AMORTIZAR — El ahorro en intereses es más seguro y ventajoso")'],
    ]
    write_block(ws, 1, 1, data)
    rate_limit()

    format_header_row(ws, 1, 3)
    format_section_title(ws, "A3", 3)
    format_section_title(ws, "A12", 3)
    format_section_title(ws, "A23", 3)
    format_section_title(ws, "A29", 3)
    for r in [4, 5, 6, 7, 8, 9, 10]:
        format_input_cell(ws, f"C{r}")
    for r in [13, 14, 15, 16, 17, 18, 19, 20, 21, 24, 25, 26, 27, 29]:
        format_result_cell(ws, f"C{r}")
    rate_limit()

    ws.format("C4", {"numberFormat": EUR_FORMAT})
    ws.format("C7", {"numberFormat": EUR_FORMAT})
    ws.format("C13:C21", {"numberFormat": EUR_FORMAT})
    ws.format("C24:C27", {"numberFormat": EUR_FORMAT})

    add_note(ws, "C10", "Solo para hipotecas firmadas antes del 1/1/2013. Escribe 'Sí' o 'No'.")
    add_note(ws, "C8", "Rentabilidad histórica indexados globales: ~7% anual nominal")
    rate_limit()

    protect_range(ws, "C13:C21")
    protect_range(ws, "C24:C29")
    print("  ✓ 22. Amortizar o Invertir")


# ─── 23. ¿Snowball o Avalanche? ─────────────────────────────────────────────

def create_tab_snowball_avalanche(spreadsheet, ws):
    """Decisor rápido Snowball vs Avalanche."""
    ws.update_title("23. Snowball o Avalanche")
    ws.resize(rows=25, cols=6)
    rate_limit()

    data = [
        ["¿SNOWBALL O AVALANCHE?"],
        [""],
        ["Responde estas preguntas para decidir:"],
        [""],
        ["PREGUNTA", "", "TU RESPUESTA"],
        ["¿Tienes deudas con >20% de interés?", "", "Sí"],
        ["¿Cuántas deudas tienes?", "", 4],
        ["¿Te desmotivarías fácilmente?", "", "No"],
        ["¿La diferencia total entre métodos es >500€?", "", "Sí"],
        [""],
        ["ANÁLISIS"],
        ["Puntos a favor Avalanche", "", '=IF(C6="Sí",1,0) + IF(C8="No",1,0) + IF(C9="Sí",1,0)'],
        ["Puntos a favor Snowball", "", '=IF(C6="No",1,0) + IF(C7>3,1,0) + IF(C8="Sí",1,0) + IF(C9="No",1,0)'],
        [""],
        ["RECOMENDACIÓN"],
        ["", "", '=IF(C12>C13, "AVALANCHE — Tienes deudas caras y disciplina. Ahorra más con avalanche.", IF(C13>C12, "SNOWBALL — Muchas deudas y necesitas motivación. Paga la pequeña primero.", "EMPATE — Ambos son válidos. Si tienes disciplina, avalanche. Si necesitas victorias rápidas, snowball."))'],
        [""],
        ["RECUERDA:"],
        ["Avalanche = paga primero la deuda con MAYOR interés (ahorra más)"],
        ["Snowball = paga primero la deuda con MENOR saldo (motivación)"],
        ["Lo importante es elegir UNO y ser constante."],
    ]
    write_block(ws, 1, 1, data)
    rate_limit()

    format_header_row(ws, 1, 3)
    format_header_row(ws, 5, 3)
    format_section_title(ws, "A11", 3)
    format_section_title(ws, "A15", 3)
    for r in [6, 7, 8, 9]:
        format_input_cell(ws, f"C{r}")
    format_result_cell(ws, "C12")
    format_result_cell(ws, "C13")
    format_result_cell(ws, "C16")
    rate_limit()

    add_note(ws, "C6", "Escribe 'Sí' o 'No'")
    add_note(ws, "C8", "Escribe 'Sí' o 'No'")
    add_note(ws, "C9", "Usa la pestaña 6 para calcular la diferencia real")

    protect_range(ws, "C12:C13")
    protect_range(ws, "C16")
    print("  ✓ 23. Snowball o Avalanche")


# ─── 24. ¿Plan Pensiones o Fondo Indexado? ──────────────────────────────────

def create_tab_plan_vs_fondo(spreadsheet, ws):
    """Plan de pensiones vs fondo indexado."""
    ws.update_title("24. Plan Pensiones vs Fondo")
    ws.resize(rows=40, cols=8)
    rate_limit()

    data = [
        ["¿PLAN DE PENSIONES O FONDO INDEXADO?"],
        [""],
        ["DATOS DE ENTRADA", "", "VALOR"],
        ["Aportación anual (€)", "", 1500],
        ["Tipo marginal IRPF actual (%)", "", 30],
        ["Tipo marginal IRPF jubilación (%)", "", 19],
        ["Años hasta jubilación", "", 25],
        ["Rentabilidad anual esperada (%)", "", 7],
        ["Comisión plan pensiones (%)", "", 1.5],
        ["Comisión fondo indexado (%)", "", 0.2],
        [""],
        ["PLAN DE PENSIONES"],
        ["Ahorro fiscal anual", "", '=C4*C5/100'],
        ["Rentabilidad neta (tras comisiones)", "", '=C8-C9'],
        ["Capital acumulado", "", '=C4*((1+C14/100)^C7-1)/(C14/100)'],
        ["Al rescatar — IRPF jubilación", "", '=C15*C6/100'],
        ["Neto plan pensiones", "", '=C15-C16'],
        ["Ahorro fiscal total acumulado", "", '=C13*C7'],
        ["Si inviertes el ahorro fiscal:", "", '=C13*((1+C8/100)^C7-1)/(C8/100)'],
        ["TOTAL NETO PLAN + inversión ahorro", "", '=C17+C19'],
        [""],
        ["FONDO INDEXADO"],
        ["Rentabilidad neta (tras comisiones)", "", '=C8-C10'],
        ["Capital acumulado", "", '=C4*((1+C23/100)^C7-1)/(C23/100)'],
        ["Ganancia", "", '=C24-C4*C7'],
        ["Impuestos al vender (19-23%)", "", '=MIN(6000,MAX(0,C25))*0.19 + MIN(44000,MAX(0,C25-6000))*0.21 + MAX(0,C25-50000)*0.23'],
        ["Neto fondo indexado", "", '=C24-C26'],
        [""],
        ["COMPARACIÓN"],
        ["Neto Plan Pensiones (con inversión ahorro)", "", '=C20'],
        ["Neto Fondo Indexado", "", '=C27'],
        ["Diferencia", "", '=C30-C31'],
        ["VEREDICTO", "", '=IF(C32>0, "PLAN DE PENSIONES — El ahorro fiscal compensa (reinvirtiendo la deducción)", IF(C32<-1000, "FONDO INDEXADO — Más líquido y menor coste", "MUY SIMILAR — El fondo indexado es más flexible"))'],
    ]
    write_block(ws, 1, 1, data)
    rate_limit()

    format_header_row(ws, 1, 3)
    format_section_title(ws, "A3", 3)
    format_section_title(ws, "A12", 3)
    format_section_title(ws, "A22", 3)
    format_section_title(ws, "A29", 3)
    for r in range(4, 11):
        format_input_cell(ws, f"C{r}")
    for r in [13, 14, 15, 16, 17, 18, 19, 20, 23, 24, 25, 26, 27, 30, 31, 32, 33]:
        format_result_cell(ws, f"C{r}")
    rate_limit()

    ws.format("C4", {"numberFormat": EUR_FORMAT})
    ws.format("C13", {"numberFormat": EUR_FORMAT})
    ws.format("C15:C20", {"numberFormat": EUR_FORMAT})
    ws.format("C24:C27", {"numberFormat": EUR_FORMAT})
    ws.format("C30:C32", {"numberFormat": EUR_FORMAT})

    add_note(ws, "C4", "Máximo deducible plan pensiones: 1.500€/año (2025)")
    add_note(ws, "C9", "Comisión media plan pensiones España: 1-1.5%")
    add_note(ws, "C10", "Comisión fondo indexado tipo Vanguard/iShares: 0.1-0.3%")
    add_note(ws, "C6", "Tu tipo marginal cuando rescates el plan. En jubilación suele ser menor.")
    rate_limit()

    add_conditional_formatting(spreadsheet, ws, "C32", [
        ("NUMBER_GREATER", ["0"], {"backgroundColor": COLOR_RESULT_BG}),
        ("NUMBER_LESS", ["0"], {"backgroundColor": {"red": 1, "green": 0.85, "blue": 0.85}}),
    ])

    protect_range(ws, "C13:C20")
    protect_range(ws, "C23:C27")
    protect_range(ws, "C30:C33")
    print("  ✓ 24. Plan Pensiones vs Fondo")


# ─── 25. Índice ──────────────────────────────────────────────────────────────

def create_tab_indice(spreadsheet, ws):
    """Pestaña índice con links a todas las demás."""
    ws.update_title("ÍNDICE")
    ws.resize(rows=40, cols=6)
    rate_limit()

    data = [
        ["NUMEROSCLAROS — CALCULADORAS FINANCIERAS"],
        [""],
        ["Bienvenido a la suite de calculadoras financieras más completa en español."],
        ["Haz clic en cada enlace para ir a la pestaña correspondiente."],
        [""],
        ["CÓMO USAR"],
        ["1. Las celdas AMARILLAS son para que tú introduzcas datos"],
        ["2. Las celdas VERDES son resultados (no las modifiques)"],
        ["3. Cada pestaña tiene notas explicativas en las celdas"],
        ["4. Los gráficos se actualizan automáticamente"],
        [""],
        ["CALCULADORAS UNIVERSALES"],
        ["#", "Calculadora", "Descripción"],
        ["1", "Hipoteca", "Cuota mensual, tabla amortización completa"],
        ["2", "Interés Compuesto", "Capital + aportaciones + tiempo = crecimiento exponencial"],
        ["3", "Comparador Préstamos", "Compara 3 préstamos lado a lado"],
        ["4", "ROI", "Retorno sobre inversión y CAGR"],
        ["5", "Inflación", "Pérdida de poder adquisitivo en el tiempo"],
        ["6", "Snowball vs Avalanche", "Estrategias de pago de deuda comparadas"],
        ["7", "Presupuesto 50/30/20", "Distribución de ingresos con gráfico"],
        ["8", "Fondo Emergencia", "Objetivo y plan de ahorro de emergencia"],
        ["9", "Meta Ahorro", "Cuánto ahorrar al mes para llegar a tu objetivo"],
        [""],
        ["CALCULADORAS ESPAÑA"],
        ["10", "IRPF", "Cálculo por tramos con desglose"],
        ["11", "Sueldo Neto", "De bruto a neto con SS + IRPF detallado"],
        ["12", "FIRE España", "Independencia financiera con SWR 3,25%"],
        ["13", "Autónomo vs SL", "Comparativa fiscal completa"],
        ["14", "Pensión Jubilación", "Estimación pensión pública + ahorro privado"],
        ["15", "Gastos Compra Vivienda", "ITP, notaría, registro por CCAA"],
        ["16", "Plusvalía Municipal", "Método objetivo vs real"],
        ["17", "Cuota Autónomos", "Tabla de tramos 2025-2026"],
        ["18", "Rescate Plan Pensiones", "Optimizador IRPF para rescate"],
        ["19", "Comparador CCAA", "IRPF + ITP + AJD por comunidad"],
        [""],
        ["DECISORES"],
        ["20", "Comprar o Alquilar", "Escenarios a 10-20-30 años"],
        ["21", "Fijo o Variable", "3 escenarios Euribor simulados"],
        ["22", "Amortizar o Invertir", "¿Pago hipoteca o invierto?"],
        ["23", "Snowball o Avalanche", "Test rápido para elegir estrategia"],
        ["24", "Plan Pensiones vs Fondo", "Comparativa con ahorro fiscal incluido"],
    ]
    write_block(ws, 1, 1, data)
    rate_limit()

    format_header_row(ws, 1, 3)
    format_header_row(ws, 13, 3)
    format_section_title(ws, "A6", 3)
    format_section_title(ws, "A12", 3)
    format_section_title(ws, "A24", 3)
    format_section_title(ws, "A35", 3)
    rate_limit()

    # Hacer título grande
    ws.format("A1", {
        "textFormat": {"fontSize": 16, "bold": True},
    })
    ws.format("A3:A4", {
        "textFormat": {"fontSize": 11},
    })

    # Color de fondo para instrucciones
    ws.format("A7:A10", {
        "backgroundColor": COLOR_INPUT_BG,
    })

    print("  ✓ 25. Índice")


# ═══════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════

def main():
    print("═" * 60)
    print("  NumerosClaros — Creando Google Sheets")
    print("═" * 60)
    print()

    # Autenticar
    print("Autenticando con Google...")
    gc = authenticate()
    print("  ✓ Autenticado\n")

    # Crear spreadsheet
    print(f"Creando spreadsheet: {SPREADSHEET_TITLE}")
    spreadsheet = gc.create(SPREADSHEET_TITLE)
    spreadsheet_url = f"https://docs.google.com/spreadsheets/d/{spreadsheet.id}"
    print(f"  ✓ Creado: {spreadsheet_url}")

    # Forzar locale a en_US para que las fórmulas con comas funcionen
    spreadsheet.batch_update({
        "requests": [{
            "updateSpreadsheetProperties": {
                "properties": {"locale": "en_US"},
                "fields": "locale"
            }
        }]
    })
    print("  ✓ Locale: en_US (fórmulas con comas)\n")

    # Renombrar Sheet1 como Índice
    ws_indice = spreadsheet.sheet1

    # Crear todas las pestañas primero
    print("Creando pestañas...")
    tab_names = [
        "1. Hipoteca", "2. Interés Compuesto", "3. Comparador Préstamos",
        "4. ROI", "5. Inflación", "6. Snowball vs Avalanche",
        "7. Presupuesto 50-30-20", "8. Fondo Emergencia", "9. Meta Ahorro",
        "10. IRPF", "11. Sueldo Neto", "12. FIRE España",
        "13. Autónomo vs SL", "14. Pensión Jubilación", "15. Gastos Compra Vivienda",
        "16. Plusvalía Municipal", "17. Cuota Autónomos", "18. Rescate Plan Pensiones",
        "19. Comparador CCAA", "20. Comprar o Alquilar", "21. Fijo o Variable",
        "22. Amortizar o Invertir", "23. Snowball o Avalanche", "24. Plan Pensiones vs Fondo",
    ]

    worksheets = {}
    for name in tab_names:
        ws = spreadsheet.add_worksheet(title=name, rows=50, cols=10)
        worksheets[name] = ws
        rate_limit()

    print(f"  ✓ {len(tab_names) + 1} pestañas creadas\n")

    # Rellenar cada pestaña
    print("Rellenando contenido...")

    tab_creators = [
        ("1. Hipoteca", create_tab_hipoteca),
        ("2. Interés Compuesto", create_tab_interes_compuesto),
        ("3. Comparador Préstamos", create_tab_comparador_prestamos),
        ("4. ROI", create_tab_roi),
        ("5. Inflación", create_tab_inflacion),
        ("6. Snowball vs Avalanche", create_tab_deuda),
        ("7. Presupuesto 50-30-20", create_tab_presupuesto),
        ("8. Fondo Emergencia", create_tab_fondo_emergencia),
        ("9. Meta Ahorro", create_tab_meta_ahorro),
        ("10. IRPF", create_tab_irpf),
        ("11. Sueldo Neto", create_tab_sueldo_neto),
        ("12. FIRE España", create_tab_fire),
        ("13. Autónomo vs SL", create_tab_autonomo_vs_sl),
        ("14. Pensión Jubilación", create_tab_pension),
        ("15. Gastos Compra Vivienda", create_tab_gastos_vivienda),
        ("16. Plusvalía Municipal", create_tab_plusvalia),
        ("17. Cuota Autónomos", create_tab_cuota_autonomos),
        ("18. Rescate Plan Pensiones", create_tab_rescate_pensiones),
        ("19. Comparador CCAA", create_tab_comparador_ccaa),
        ("20. Comprar o Alquilar", create_tab_comprar_alquilar),
        ("21. Fijo o Variable", create_tab_fijo_variable),
        ("22. Amortizar o Invertir", create_tab_amortizar_invertir),
        ("23. Snowball o Avalanche", create_tab_snowball_avalanche),
        ("24. Plan Pensiones vs Fondo", create_tab_plan_vs_fondo),
    ]

    for i, (name, creator) in enumerate(tab_creators):
        try:
            ws = worksheets[name]
            retry_on_quota(creator, spreadsheet, ws)
            print(f"  ✓ {name}")
            if i % 3 == 2:
                rate_limit(5)  # pausa extra cada 3 pestañas
        except Exception as e:
            print(f"  ✗ Error en {name}: {e}")

    # Índice al final (usa Sheet1)
    create_tab_indice(spreadsheet, ws_indice)

    # Mover Índice al principio
    spreadsheet.reorder_worksheets([ws_indice] + [worksheets[n] for n in tab_names])
    rate_limit()

    print()
    print("═" * 60)
    print("  ✓ COMPLETADO")
    print(f"  URL: {spreadsheet_url}")
    print("═" * 60)
    print()
    print("Próximos pasos:")
    print("  1. Abre el enlace de arriba")
    print("  2. Archivo > Hacer una copia (para tener tu versión)")
    print("  3. Empieza a rellenar las celdas amarillas")


if __name__ == "__main__":
    main()
