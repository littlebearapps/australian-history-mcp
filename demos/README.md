# Australian History MCP - Demo Assets

This directory contains everything needed to generate the demo GIF shown in the main README.

## Quick Start

```bash
# Terminal-only demo (no browser screenshot needed)
make terminal-only

# Full demo with browser (requires manual screenshot first)
make all
```

## Files

| File | Purpose |
|------|---------|
| `demo.tape` | VHS recording script |
| `scripts/simulate-claude.sh` | Simulates Claude Code output |
| `assets/browser-screenshot.png` | PROV record page screenshot (manual) |
| `output/combined.gif` | Final demo for README |
| `output/terminal-optimised.gif` | Terminal-only demo |

## Demo Content

The demo shows:
1. **Tool Discovery** - Using `tools(query="archives")` to find 6 matching tools
2. **Federated Search** - Using `search("Flinders Street Station")` to query 4 sources in parallel
3. **Open Result** - Using `open` to view a PROV record in browser

## Manual Steps

For the full demo with browser:

1. **Browser screenshot**: The browser portion requires a manual screenshot:
   - Use the MCP to search PROV for "Flinders Street Station" with digitisedOnly=true
   - Open a result with good digitised images
   - Screenshot at 1200x700 pixels
   - Save to `assets/browser-screenshot.png`

2. **Run make**: `make all` handles the rest

## Customisation

- Edit `demo.tape` to change terminal appearance (font, colours, size)
- Edit `scripts/simulate-claude.sh` to change demo content or timing
- Adjust ffmpeg settings in Makefile for different file sizes

## Requirements

- VHS: `brew install vhs`
- ffmpeg: `brew install ffmpeg`
- ttyd: `brew install ttyd` (VHS dependency)

## Regenerating

```bash
# Clean and regenerate
make clean
make all

# Or just the terminal portion
make clean
make terminal-only
```

## Output Sizes

Target sizes for README embedding:
- `terminal.gif` < 2MB
- `combined.gif` < 3MB

If GIFs are too large, adjust in Makefile:
- Reduce fps (e.g., `fps=10`)
- Reduce scale (e.g., `scale=640:-1`)
