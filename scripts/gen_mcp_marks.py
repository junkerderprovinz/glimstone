"""Generate the MCP clients' marks in packages/core/src/mcpMarks.ts.

    npm pack simple-icons@16 somewhere and unpack it, then:
    python scripts/gen_mcp_marks.py <path to simple-icons/icons>

The same two kinds of source as the storage providers' marks: the SIMPLE ones
from Simple Icons, the rest whole SVG files in packages/core/mcp-marks/, each
with its source and licence recorded below and in that folder's README. Every
mark is a trademark of its owner, used only to name the client it refers to,
on a tile that picks exactly that client, reproduced unmodified apart from its
colour, with no claim of endorsement by or affiliation with any of them.

The machinery is in brand_marks.py, which needs the svgelements package (pip
install svgelements).
"""
import sys
from pathlib import Path

from brand_marks import MarkSet, local, simple, simple_data, write

ROOT = Path(__file__).parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else None
OUT = ROOT / "packages" / "core" / "src" / "mcpMarks.ts"

DASHBOARD = "Apache-2.0"

# The id a catalog entry names its mark by -> the Simple Icons slug, with what it is.
SIMPLE = [
    ("claude", "claude", "Claude"),
    ("cline", "cline", "Cline"),
    ("cursor", "cursor", "Cursor"),
    ("gemini", "googlegemini", "Google Gemini"),
    ("jetbrains", "jetbrains", "JetBrains"),
    ("kimi", "kimi", "Kimi"),
    ("lmstudio", "lmstudio", "LM Studio"),
    ("mistral", "mistralai", "Mistral AI"),
    ("opencode", "opencode", "opencode"),
    ("perplexity", "perplexity", "Perplexity"),
    ("qwen", "qwen", "Qwen"),
    ("warp", "warp", "Warp"),
    ("windsurf", "windsurf", "Windsurf"),
    ("zed", "zedindustries", "Zed"),
]

# The id -> the file in mcp-marks/, what it is, where it comes from, its licence.
LOCAL = [
    ("anythingllm", "AnythingLLM", "homarr-labs/dashboard-icons, svg/anything-llm.svg", DASHBOARD),
    ("chatgpt", "ChatGPT", "homarr-labs/dashboard-icons, svg/chatgpt.svg", DASHBOARD),
    ("copilot", "GitHub Copilot", "homarr-labs/dashboard-icons, svg/github-copilot.svg, in black", DASHBOARD),
    ("grok", "Grok", "homarr-labs/dashboard-icons, svg/grok.svg", DASHBOARD),
    ("n8n", "n8n", "homarr-labs/dashboard-icons, svg/n8n.svg", DASHBOARD),
    ("openai", "OpenAI", "homarr-labs/dashboard-icons, svg/openai.svg", DASHBOARD),
    ("openwebui", "Open WebUI", "homarr-labs/dashboard-icons, svg/open-webui.svg", DASHBOARD),

    ("continuedev", "Continue", "continuedev/continue, docs/logo/light.svg", "Apache-2.0"),
    ("goose", "Goose", "block/goose, documentation/static/img/goose.svg", "Apache-2.0"),
    ("roo", "Roo Code", "RooCodeInc/Roo-Code, src/assets/images/roo-logo.svg, in black", "Apache-2.0"),
]

HEAD = """// The marks of MCP clients, as markup for BrandMark, each with the colour its
// tile lights up in and the ink that holds on it ("Brand tiles"). Written by
// scripts/gen_mcp_marks.py; packages/core/mcp-marks/ holds the sources, their
// licences and the README that records where each came from.
//
// Every mark is a trademark of its owner, used only to name the client it
// refers to, on a tile that picks exactly that client, reproduced unmodified
// apart from its colour, with no claim of endorsement by or affiliation with
// any of them. The MCP catalog names the mark each client wears; a client
// whose brand has no clean source wears the app's glyph instead.

import type { TileMark } from "./picker.ts";
"""

TILE_COLOUR = {
    # ChatGPT's green rather than the paler one its plate is drawn in.
    "chatgpt": ("#10a37f", None),
}

MARKS = MarkSet(ROOT / "packages" / "core" / "mcp-marks", {}, set(), TILE_COLOUR, set())

if SRC is None or not SRC.is_dir():
    raise SystemExit("pass the icons folder of simple-icons@16: python scripts/gen_mcp_marks.py <path>")

data = simple_data(SRC)
entries = {m[0]: simple(*m, SRC, data, MARKS) for m in SIMPLE}
entries.update({m[0]: local(*m, MARKS) for m in LOCAL})
ids = write(OUT, HEAD, entries, "MCP_MARKS", "McpMarkId")
print("%s: %d marks (%d from Simple Icons, %d from mcp-marks/)" % (OUT.name, len(ids), len(SIMPLE), len(LOCAL)))
