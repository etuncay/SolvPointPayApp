---
name: pptx-tools
description: >-
  Use whenever a .pptx file is involved: create slide decks, pitch decks,
  presentations; read or extract text; add slides to existing files. Trigger on
  "deck", "slides", "presentation", "sunum", ".pptx", or "powerpoint".
  Do NOT use for Word docs, PDFs, or spreadsheets unless the deliverable is
  specifically a presentation file.
---

# PPTX Tools

Build and edit PowerPoint files with `python-pptx` (MIT).

Install: `pip install python-pptx`

## Create a presentation from scratch

```python
from pptx import Presentation
from pptx.util import Inches, Pt

prs = Presentation()
slide = prs.slides.add_slide(prs.slide_layouts[0])  # title slide
slide.shapes.title.text = "Quarterly Review"
slide.placeholders[1].text = "Team Update — Q4"

bullet = prs.slides.add_slide(prs.slide_layouts[1])  # title + content
bullet.shapes.title.text = "Key Results"
body = bullet.placeholders[1].text_frame
body.text = "Revenue up 12%"
p = body.add_paragraph()
p.text = "New markets launched"
p.level = 1

prs.save("deck.pptx")
```

## Read text from existing presentation

```python
from pptx import Presentation

prs = Presentation("existing.pptx")
for i, slide in enumerate(prs.slides):
    print(f"--- Slide {i + 1} ---")
    for shape in slide.shapes:
        if shape.has_text_frame:
            print(shape.text)
```

## Add a slide to existing file

```python
from pptx import Presentation

prs = Presentation("template.pptx")
layout = prs.slide_layouts[1]
slide = prs.slides.add_slide(layout)
slide.shapes.title.text = "New Section"
slide.placeholders[1].text = "Content here"
prs.save("updated.pptx")
```

## Design tips

- Pick one dominant color (60–70% visual weight) plus one accent
- Dark title/conclusion slides with light content slides works well
- Avoid plain bullet-only slides — use visuals or varied layouts when possible
- Keep titles short; body text scannable

## Slide layouts

Common `slide_layouts` indices (may vary by template):

| Index | Typical layout |
|-------|----------------|
| 0 | Title slide |
| 1 | Title and content |
| 5 | Title only |
| 6 | Blank |

Inspect `prs.slide_layouts` names when working with a custom template.

## Out of scope (v1)

- Thumbnail preview generation
- Low-level OOXML unpack/pack
- `pptxgenjs` (JavaScript) workflows
- Speaker notes and comments editing

## Dependencies

- Python 3.10+
- `python-pptx` (pip)
