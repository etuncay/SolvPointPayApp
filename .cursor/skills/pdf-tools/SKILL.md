---
name: pdf-tools
description: >-
  Use whenever the user works with PDF files — read or extract text/tables,
  merge or split PDFs, rotate pages, add watermarks, create PDFs, encrypt/decrypt,
  extract images. Trigger on ".pdf", "pdf birleştir", "pdf böl", "pdf form",
  "pdf'den metin çıkar", or any request to produce or manipulate a PDF.
  Do NOT use for Word docs, spreadsheets, or unrelated coding tasks.
---

# PDF Tools

Process PDF files with open-source Python libraries and CLI tools.

## Libraries

| Library | License | Use |
|---------|---------|-----|
| `pypdf` | BSD | merge, split, rotate, metadata, encrypt |
| `pdfplumber` | MIT | text and table extraction |

Install: `pip install pypdf pdfplumber`

## Quick tasks

### Merge PDFs

```python
from pypdf import PdfReader, PdfWriter

writer = PdfWriter()
for path in ["a.pdf", "b.pdf"]:
    for page in PdfReader(path).pages:
        writer.add_page(page)
with open("merged.pdf", "wb") as f:
    writer.write(f)
```

### Split into single-page files

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
for i, page in enumerate(reader.pages):
    w = PdfWriter()
    w.add_page(page)
    with open(f"page_{i + 1}.pdf", "wb") as f:
        w.write(f)
```

### Extract text

```python
from pypdf import PdfReader

text = "\n".join(p.extract_text() or "" for p in PdfReader("doc.pdf").pages)
```

### Extract tables

```python
import pdfplumber

with pdfplumber.open("doc.pdf") as pdf:
    for page in pdf.pages:
        for table in page.extract_tables() or []:
            print(table)
```

### Rotate pages

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
writer = PdfWriter()
page = reader.pages[0]
page.rotate(90)
writer.add_page(page)
with open("rotated.pdf", "wb") as f:
    writer.write(f)
```

### Password protect

```python
from pypdf import PdfReader, PdfWriter

writer = PdfWriter()
for page in PdfReader("input.pdf").pages:
    writer.add_page(page)
writer.encrypt("userpass", "ownerpass")
with open("encrypted.pdf", "wb") as f:
    writer.write(f)
```

### Extract images (CLI)

```bash
pdfimages -j input.pdf output_prefix
```

Requires `poppler-utils`.

## Out of scope (v1)

- PDF form filling with coordinate pipelines
- OCR on scanned documents
- Advanced JavaScript PDF generation

For form filling or OCR, tell the user these need a follow-up iteration or external tools.

## Dependencies

- Python 3.10+
- `pypdf`, `pdfplumber` (pip)
- Optional: `poppler-utils` for `pdfimages`
