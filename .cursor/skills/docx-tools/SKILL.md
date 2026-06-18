---
name: docx-tools
description: >-
  Use when creating, reading, or editing Word documents (.docx): reports, memos,
  letters, templates with headings and tables. Trigger on "word doc", ".docx",
  "word belgesi", "rapor word", "memo", or requests for a polished Word deliverable.
  Do NOT use for PDFs, PowerPoint, spreadsheets, or general coding unrelated to
  document generation.
---

# DOCX Tools

Create and convert Word documents with open-source tools.

## Libraries and tools

| Tool | License | Use |
|------|---------|-----|
| `python-docx` | MIT | create and edit .docx programmatically |
| `pandoc` | GPL (CLI) | markdown/HTML → docx, text extraction |

Install: `pip install python-docx` and system `pandoc` if conversion is needed.

## Create a new document

```python
from docx import Document
from docx.shared import Inches, Pt

doc = Document()
doc.add_heading("Report Title", level=0)
doc.add_paragraph("Introduction paragraph.")
doc.add_heading("Section 1", level=1)
doc.add_paragraph("Body text with ", style=None).add_run("bold").bold = True

table = doc.add_table(rows=2, cols=2)
table.cell(0, 0).text = "Header A"
table.cell(0, 1).text = "Header B"
table.cell(1, 0).text = "Value 1"
table.cell(1, 1).text = "Value 2"

doc.save("report.docx")
```

## Read text from existing .docx

```python
from docx import Document

doc = Document("existing.docx")
text = "\n".join(p.text for p in doc.paragraphs)
```

## Markdown to Word (pandoc)

```bash
pandoc input.md -o output.docx
```

With a reference template for styles:

```bash
pandoc input.md --reference-doc=template.docx -o output.docx
```

## Common patterns

- **Headings:** `add_heading(text, level=1)` for levels 0–9
- **Lists:** `doc.add_paragraph("Item", style="List Bullet")`
- **Page break:** `doc.add_page_break()`
- **Images:** `doc.add_picture("image.png", width=Inches(4))`

## Out of scope (v1)

- OOXML unpack/pack for low-level XML editing
- Tracked changes and comments
- Legacy `.doc` files (convert with LibreOffice first: `soffice --headless --convert-to docx file.doc`)

## Dependencies

- Python 3.10+
- `python-docx` (pip)
- Optional: `pandoc` (system package)
