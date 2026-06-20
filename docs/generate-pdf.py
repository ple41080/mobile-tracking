#!/usr/bin/env python3
"""Convert docs/USER_GUIDE.md to PDF via Chromium (proper Thai text shaping)."""

from __future__ import annotations

from pathlib import Path

import markdown
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
MD_PATH = ROOT / "USER_GUIDE.md"
PDF_PATH = ROOT / "USER_GUIDE.pdf"

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <style>
    @page {{ size: A4; margin: 2cm; }}
    body {{
      font-family: "Thonburi", "Thonburi UI", "Noto Sans Thai", sans-serif;
      font-size: 14px;
      line-height: 1.75;
      color: #1a1a1a;
      max-width: 100%;
    }}
    h1 {{
      color: #0f5032;
      font-size: 26px;
      margin-top: 0;
      border-bottom: 2px solid #d0e8d8;
      padding-bottom: 8px;
    }}
    h2 {{
      color: #145a37;
      font-size: 18px;
      margin-top: 28px;
    }}
    h3 {{
      color: #1a6640;
      font-size: 15px;
      margin-top: 20px;
    }}
    p {{ margin: 8px 0; }}
    ol, ul {{ padding-left: 1.4em; margin: 8px 0; }}
    li {{ margin: 4px 0; }}
    hr {{
      border: none;
      border-top: 1px solid #d0ddd5;
      margin: 24px 0;
    }}
    blockquote {{
      background: #f5faf7;
      border-left: 4px solid #8ec4a8;
      margin: 12px 0;
      padding: 10px 16px;
      color: #444;
    }}
    table {{
      border-collapse: collapse;
      width: 100%;
      margin: 12px 0;
      font-size: 13px;
    }}
    th, td {{
      border: 1px solid #c8ddd0;
      padding: 8px 12px;
      text-align: left;
    }}
    th {{
      background: #e6f5ec;
      color: #145a37;
      font-weight: 600;
    }}
    tr:nth-child(even) td {{ background: #fafcfa; }}
    strong {{ color: #0f5032; }}
    code {{
      background: #f0f4f2;
      padding: 1px 5px;
      border-radius: 3px;
      font-size: 12px;
    }}
  </style>
</head>
<body>
{body}
</body>
</html>
"""


def md_to_html(md_text: str) -> str:
    body = markdown.markdown(
        md_text,
        extensions=["tables", "fenced_code", "nl2br"],
    )
    return HTML_TEMPLATE.format(body=body)


def main() -> None:
    md_text = MD_PATH.read_text(encoding="utf-8")
    html = md_to_html(md_text)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.set_content(html, wait_until="networkidle")
        page.pdf(
            path=str(PDF_PATH),
            format="A4",
            margin={"top": "2cm", "bottom": "2cm", "left": "2cm", "right": "2cm"},
            print_background=True,
        )
        browser.close()

    print(f"Wrote {PDF_PATH}")


if __name__ == "__main__":
    main()
