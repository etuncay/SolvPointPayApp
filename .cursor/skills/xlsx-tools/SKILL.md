---
name: xlsx-tools
description: >-
  Use when a spreadsheet is the primary input or output: open, read, edit, or
  create .xlsx, .xlsm, .csv, or .tsv files; add columns, write formulas, format
  cells, clean tabular data, or convert between formats. Trigger on ".xlsx",
  "excel", "spreadsheet", "tablo", "csv'ye çevir", or when the deliverable must
  be a spreadsheet file. Do NOT trigger when the deliverable is Word, HTML report,
  or a standalone script with no spreadsheet output.
---

# XLSX Tools

Create and edit spreadsheets with open-source libraries. **Always write Excel formulas** — never hardcode calculated values from Python.

## Libraries

| Library | License | Use |
|---------|---------|-----|
| `openpyxl` | MIT | formulas, formatting, workbook structure |
| `pandas` | BSD | read, analyze, reshape, export |

Install: `pip install openpyxl pandas`

## Critical rule: formulas, not hardcoded values

```python
# Wrong — value frozen in Python
sheet["B10"] = df["Sales"].sum()

# Correct — Excel recalculates when data changes
sheet["B10"] = "=SUM(B2:B9)"
```

Apply to totals, percentages, ratios, and averages.

## Read and analyze

```python
import pandas as pd

df = pd.read_excel("data.xlsx")
all_sheets = pd.read_excel("data.xlsx", sheet_name=None)
df.to_excel("output.xlsx", index=False)
```

## Create with formulas (openpyxl)

```python
from openpyxl import Workbook

wb = Workbook()
ws = wb.active
ws["A1"] = "Revenue"
ws["B1"] = 1000
ws["A2"] = "Costs"
ws["B2"] = 400
ws["A3"] = "Profit"
ws["B3"] = "=B1-B2"
wb.save("model.xlsx")
```

## Formatting basics

- Use a professional font (Arial, Calibri) unless the user specifies otherwise
- Currency: `$#,##0` with units in headers ("Revenue ($mm)")
- Percentages: `0.0%`
- Negative numbers: parentheses `(123)` not minus prefix

## Zero formula errors

Before delivering, verify no `#REF!`, `#DIV/0!`, `#VALUE!`, `#N/A`, or `#NAME?` in formula cells. Open the file or inspect with openpyxl `data_only=True` after recalculation if LibreOffice is available.

## CSV conversion

```python
import pandas as pd

pd.read_csv("data.csv").to_excel("out.xlsx", index=False)
pd.read_excel("data.xlsx").to_csv("out.csv", index=False)
```

## Out of scope (v1)

- LibreOffice headless formula recalc automation
- Financial-model color conventions (blue inputs, black formulas)
- Complex VBA macros

## Dependencies

- Python 3.10+
- `openpyxl`, `pandas` (pip)
