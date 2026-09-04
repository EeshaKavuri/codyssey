from __future__ import annotations

import html
import json
import re
import sys
import urllib.request
from pathlib import Path

SHEET_URL = "https://hynts.in/preparation/dsa-sheets/striver-a2z-dsa-sheet/"
MARKER = "export const dsaPatterns: DsaPattern[] = "


def fetch_urls() -> dict[str, str]:
    request = urllib.request.Request(SHEET_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        page = response.read().decode("utf-8", errors="replace")
    pattern = (
        r"&quot;_id&quot;:\[0,&quot;[^&]+&quot;\],"
        r"&quot;title&quot;:\[0,&quot;(.*?)&quot;\],"
        r"&quot;problemUrl&quot;:\[0,&quot;(.*?)&quot;\]"
    )
    return {
        html.unescape(title): html.unescape(url)
        for title, url in re.findall(pattern, page)
        if url and url != "#"
    }


def attach_urls(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    prefix, payload = text.split(MARKER, 1)
    patterns = json.loads(payload)
    urls = fetch_urls()
    attached = 0
    for pattern in patterns:
        for problem in pattern["problems"]:
            url = urls.get(problem["title"])
            if url:
                problem["url"] = url
                attached += 1
    path.write_text(
        prefix + MARKER + json.dumps(patterns, indent=2, ensure_ascii=True) + "\n",
        encoding="utf-8",
    )
    print(f"Attached {attached} exact URLs to {sum(len(item['problems']) for item in patterns)} questions.")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: attach_problem_urls.py DESTINATION.ts")
    attach_urls(Path(sys.argv[1]))
