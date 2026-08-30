#!/usr/bin/env python3
"""free_models_tracker.py — daily self-contained webpage: OpenRouter free models ranked by Artificial Analysis."""

from __future__ import annotations

import json
import re
import sqlite3
import urllib.request
import urllib.error
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
import os

PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = Path(os.getenv("TRACKER_OUTPUT", "/tmp/free-models-tracker/index.html"))
CACHE_PATH = Path(os.getenv("TRACKER_CACHE", "/tmp/free-models-tracker/cache.json"))
SNAPSHOT_PATH = Path(os.getenv("TRACKER_SNAPSHOT", PROJECT_ROOT / "public/free-llm-tracker/data.json"))

# ── OpenRouter ────────────────────────────────────────────────────────────────

def fetch_openrouter_models() -> list[dict]:
    """Fetch all models from OpenRouter API, return only free ones."""
    url = "https://openrouter.ai/api/v1/models"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode())

    free = []
    for m in data.get("data", []):
        model_id = m.get("id", "")
        pricing = m.get("pricing", {})
        is_free_route = model_id == "openrouter/free" or model_id.endswith(":free")
        if is_free_route and pricing.get("prompt") == "0" and pricing.get("completion") == "0":
            free.append({
                "id": m["id"],
                "name": m.get("name", m["id"]),
                "provider": m["id"].split("/")[0],
                "context": m.get("context_length", 0),
                "description": m.get("description", ""),
                "max_tokens": m.get("top_provider", {}).get("max_completion_tokens", 0),
            })
    return free


# ── Artificial Analysis ────────────────────────────────────────────────────────

class AATableParser(HTMLParser):
    """Parse the Artificial Analysis leaderboard table from raw HTML."""

    def __init__(self):
        super().__init__()
        self.in_table = False
        self.in_tbody = False
        self.in_row = False
        self.in_cell = False
        self.current_cell = ""
        self.current_row: list[str] = []
        self.rows: list[list[str]] = []
        self.depth = 0

    def handle_starttag(self, tag, attrs):
        if tag == "table":
            self.in_table = True
        elif tag == "tbody" and self.in_table:
            self.in_tbody = True
        elif tag == "tr" and self.in_tbody:
            self.in_row = True
            self.current_row = []
        elif tag in ("td", "th") and self.in_row:
            self.in_cell = True
            self.current_cell = ""

    def handle_endtag(self, tag):
        if tag in ("td", "th") and self.in_cell:
            self.in_cell = False
            self.current_row.append(self.current_cell.strip())
        elif tag == "tr" and self.in_row:
            self.in_row = False
            if self.current_row:
                self.rows.append(self.current_row)
        elif tag == "tbody":
            self.in_tbody = False
        elif tag == "table":
            self.in_table = False

    def handle_data(self, data):
        if self.in_cell:
            self.current_cell += data


def fetch_aa_leaderboard() -> dict[str, dict]:
    """Fetch AA leaderboard and return {model_name: {intelligence, speed, ...}}."""
    url = "https://artificialanalysis.ai/leaderboards/models"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
        "Accept": "text/html",
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            html = resp.read().decode()
    except Exception as e:
        print(f"AA fetch failed: {e}")
        return {}

    parser = AATableParser()
    parser.feed(html)

    scores = {}
    for row in parser.rows:
        if len(row) < 4:
            continue
        # Columns: model_name, features, context, intelligence, price, speed, latency, e2e, links
        name = row[0].strip()
        try:
            intel = int(row[3].strip().replace("*", ""))
        except (ValueError, IndexError):
            continue
        speed = row[5].strip() if len(row) > 5 else ""
        scores[name.lower()] = {
            "intelligence": intel,
            "speed": speed,
            "raw_name": name,
        }
    return scores


# ── Cross-reference ────────────────────────────────────────────────────────────

def cross_reference(free_models: list[dict], aa_scores: dict) -> list[dict]:
    """Merge OpenRouter free models with AA intelligence scores."""
    # Manual mapping for models that don't match by name
    MANUAL_MAP = {
        "z-ai/glm-5.2:free": "glm-5.2 (max)",
        "nvidia/nemotron-3-ultra-550b-a55b:free": "nemotron 3 ultra",
        "nvidia/nemotron-3-super-120b-a12b:free": "nemotron 3 super",
        "nvidia/nemotron-3.5-lightning:free": "nemotron 3.5 lightning",
        "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free": "nemotron 3 nano omni 30b a3b",
        "thinkingmachines/inkling:free": "inkling",
        "thinkingmachines/inkling-small:free": "inkling small",
        "cohere/north-mini-code:free": "north mini code",
        "liquid/lfm-2.5-2.6b:free": "lfm2.5-2.6b",
        "google/gemma-4-31b-it:free": "gemma 4 31b",
        "google/gemma-4-26b-a4b-it:free": "gemma 4 26b a4b",
        "inclusionai/ling-3.0-flash-fin:free": "ling 3.0 flash fin",
        "minimax/minimax-m3:free": "minimax-m3",
        "minimax/minimax-m2.7:free": "minimax-m2.7",
        "poolside/laguna-s-2.1:free": "laguna s 2.1",
        "poolside/laguna-xs-2.1:free": "laguna xs 2.1",
        "dots-studio/dots-3-note-preview:free": "dots3-note preview",
    }

    def normalize(name: str) -> str:
        """Strip common suffixes for matching."""
        name = name.lower()
        for suffix in [" (free)", " (max)", " (xhigh)", " (high)", " (medium)", " (low)", " (non-reasoning)", " (reasoning)", " (with fallback)", " preview"]:
            name = name.replace(suffix, "")
        return name.strip()

    enriched = []
    for m in free_models:
        name_lower = m["name"].lower()
        score = None

        # Try manual map first
        if m["id"] in MANUAL_MAP:
            target = MANUAL_MAP[m["id"]].lower()
            score = aa_scores.get(target)

        # Try normalized name match
        if not score:
            norm = normalize(m["name"])
            score = aa_scores.get(norm)

        # Try partial substring match
        if not score:
            for key, val in aa_scores.items():
                if key in name_lower or name_lower in key:
                    score = val
                    break

        m["intelligence"] = score["intelligence"] if score else None
        m["aa_speed"] = score.get("speed", "") if score else ""
        enriched.append(m)

    # Sort: scored models first (by intelligence desc), then unscored
    enriched.sort(key=lambda x: (-(x["intelligence"] or 0), x["name"]))
    return enriched


# ── HTML generation ────────────────────────────────────────────────────────────

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Free LLM Tracker — {date}</title>
<style>
:root {{ --bg:#0d1117; --card:#161b22; --border:#30363d; --text:#c9d1d9; --accent:#58a6ff; --green:#3fb950; --orange:#d29922; --red:#f85149; --gray:#8b949e; }}
* {{ box-sizing:border-box; margin:0; padding:0; }}
body {{ font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; background:var(--bg); color:var(--text); min-height:100vh; }}
.container {{ max-width:1200px; margin:0 auto; padding:2rem 1rem; }}
h1 {{ font-size:1.8rem; margin-bottom:0.3rem; }}
.subtitle {{ color:var(--gray); margin-bottom:1.5rem; font-size:0.9rem; }}
.stats {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:1rem; margin-bottom:2rem; }}
.stat-card {{ background:var(--card); border:1px solid var(--border); border-radius:8px; padding:1rem; text-align:center; }}
.stat-card .value {{ font-size:1.6rem; font-weight:700; color:var(--accent); }}
.stat-card .label {{ font-size:0.75rem; color:var(--gray); margin-top:0.3rem; }}
.filters {{ display:flex; gap:0.5rem; margin-bottom:1rem; flex-wrap:wrap; }}
.filters input {{ background:var(--card); border:1px solid var(--border); color:var(--text); padding:0.5rem 0.8rem; border-radius:6px; font-size:0.85rem; width:240px; }}
.filters input:focus {{ outline:none; border-color:var(--accent); }}
table {{ width:100%; border-collapse:collapse; background:var(--card); border-radius:8px; overflow:hidden; }}
th, td {{ padding:0.7rem 0.9rem; text-align:left; border-bottom:1px solid var(--border); font-size:0.85rem; }}
th {{ background:#1c2128; color:var(--gray); font-weight:600; cursor:pointer; user-select:none; white-space:nowrap; }}
th:hover {{ color:var(--text); }}
tr:hover {{ background:#1c2128; }}
.model-name {{ font-weight:600; color:var(--text); }}
.provider {{ color:var(--gray); font-size:0.75rem; }}
.score {{ font-weight:700; }}
.score-high {{ color:var(--green); }}
.score-mid {{ color:var(--orange); }}
.score-low {{ color:var(--red); }}
.score-none {{ color:var(--gray); }}
.context {{ font-family:monospace; font-size:0.8rem; }}
.badge {{ display:inline-block; padding:0.15rem 0.4rem; border-radius:4px; font-size:0.7rem; font-weight:600; }}
.badge-free {{ background:rgba(63,185,80,0.15); color:var(--green); }}
tr.hidden {{ display:none; }}
.footer {{ margin-top:2rem; text-align:center; color:var(--gray); font-size:0.75rem; }}
@media(max-width:600px) {{ .container {{ padding:1rem 0.5rem; }} th, td {{ padding:0.5rem 0.4rem; font-size:0.75rem; }} h1 {{ font-size:1.4rem; }} }}
</style>
</head>
<body>
<div class="container">
<h1>🤖 Free LLM Tracker</h1>
<p class="subtitle">OpenRouter free models ranked by Artificial Analysis Intelligence Index — Updated {date}</p>

<div class="stats">
  <div class="stat-card"><div class="value">{total}</div><div class="label">Free Models</div></div>
  <div class="stat-card"><div class="value">{scored}</div><div class="label">AA Scored</div></div>
  <div class="stat-card"><div class="value">{best_name}</div><div class="label">Best Free Model</div></div>
  <div class="stat-card"><div class="value">{best_score}</div><div class="label">Best Intelligence</div></div>
</div>

<div class="filters">
  <input type="text" id="search" placeholder="Filter by name or provider..." oninput="filterTable()">
</div>

<table>
<thead>
<tr><th onclick="sortTable(0)">#</th><th onclick="sortTable(1)">Model</th><th onclick="sortTable(2)">Provider</th><th onclick="sortTable(3)">Intelligence</th><th onclick="sortTable(4)">Context</th><th onclick="sortTable(5)">AA Speed</th></tr>
</thead>
<tbody id="tableBody">
{rows}
</tbody>
</table>

<div class="footer">
  <p>Data: <a href="https://openrouter.ai/collections/free-models" style="color:var(--accent)">OpenRouter</a> + <a href="https://artificialanalysis.ai/leaderboards/models" style="color:var(--accent)">Artificial Analysis</a></p>
  <p>Generated {date} • Auto-refreshes daily at 06:00 UTC</p>
</div>
</div>

<script>
let sortDir = {{}};
function sortTable(col) {{
  const tbody = document.getElementById('tableBody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  sortDir[col] = !sortDir[col];
  rows.sort((a, b) => {{
    let aVal = a.cells[col].textContent.replace(/[^0-9.-]/g,'') || '0';
    let bVal = b.cells[col].textContent.replace(/[^0-9.-]/g,'') || '0';
    if (!isNaN(aVal) && !isNaN(bVal)) {{ aVal = parseFloat(aVal); bVal = parseFloat(bVal); }}
    if (aVal < bVal) return sortDir[col] ? 1 : -1;
    if (aVal > bVal) return sortDir[col] ? -1 : 1;
    return 0;
  }});
  rows.forEach(r => tbody.appendChild(r));
}}
function filterTable() {{
  const q = document.getElementById('search').value.toLowerCase();
  document.querySelectorAll('#tableBody tr').forEach(r => {{
    const text = r.textContent.toLowerCase();
    r.classList.toggle('hidden', !text.includes(q));
  }});
}}
</script>
</body>
</html>"""


def ctx_short(ctx: int) -> str:
    if ctx >= 1_000_000:
        return f"{ctx/1_000_000:.1f}M"
    if ctx >= 1_000:
        return f"{ctx/1_000:.0f}K"
    return str(ctx)


def score_class(score) -> str:
    if score is None:
        return "score-none"
    if score >= 45:
        return "score-high"
    if score >= 25:
        return "score-mid"
    return "score-low"


def generate_html(models: list[dict]) -> str:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    scored = [m for m in models if m.get("intelligence") is not None]
    best = scored[0] if scored else None

    rows_html = []
    for i, m in enumerate(models, 1):
        intel = m.get("intelligence")
        intel_str = str(intel) if intel is not None else "—"
        rows_html.append(
            f'<tr>'
            f'<td>{i}</td>'
            f'<td><span class="model-name">{m["name"]}</span><br><span class="provider">{m.get("description","")[:80]}{"..." if len(m.get("description",""))>80 else ""}</span></td>'
            f'<td class="provider">{m["provider"]}</td>'
            f'<td class="score {score_class(intel)}">{intel_str}</td>'
            f'<td class="context">{ctx_short(m["context"])}</td>'
            f'<td>{m.get("aa_speed","")}</td>'
            f'</tr>'
        )

    return HTML_TEMPLATE.format(
        date=now,
        total=len(models),
        scored=len(scored),
        best_name=f'<span style="font-size:0.9rem">{best["name"] if best else "N/A"}</span>',
        best_score=str(best["intelligence"]) if best else "—",
        rows="\n".join(rows_html),
    )


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    print("Fetching OpenRouter free models...")
    free = fetch_openrouter_models()
    print(f"  Found {len(free)} free models")

    print("Fetching Artificial Analysis leaderboard...")
    aa = fetch_aa_leaderboard()
    print(f"  Parsed {len(aa)} scored models from AA")
    if not aa:
        raise RuntimeError("Artificial Analysis returned no leaderboard data; refusing to publish stale scores")

    print("Cross-referencing...")
    merged = cross_reference(free, aa)
    scored_count = sum(1 for m in merged if m.get("intelligence"))
    print(f"  {scored_count} free models matched with AA scores")

    print("Generating HTML...")
    html = generate_html(merged)
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(html, encoding="utf-8")
    print(f"  Written to {OUTPUT_PATH}")

    # Save cache for debugging
    CACHE_PATH.write_text(json.dumps({
        "generated": datetime.now(timezone.utc).isoformat(),
        "models": merged,
    }, indent=2, default=str), encoding="utf-8")
    print(f"  Cache saved to {CACHE_PATH}")

    # Snapshot for site build
    snapshot = {
        "generated": datetime.now(timezone.utc).isoformat(),
        "total": len(merged),
        "scored": scored_count,
        "models": merged,
    }
    SNAPSHOT_PATH.parent.mkdir(parents=True, exist_ok=True)
    SNAPSHOT_PATH.write_text(json.dumps(snapshot, indent=2, default=str), encoding="utf-8")
    print(f"  Snapshot saved to {SNAPSHOT_PATH}")


# Run this script daily from GitHub Actions. It writes the combined OpenRouter +
# Artificial Analysis snapshot that the static page serves at /free-llm-tracker/data.json.

if __name__ == "__main__":
    main()
