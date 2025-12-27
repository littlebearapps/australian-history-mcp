# Australian History MCP Demo Build
# Usage: make all

.PHONY: all clean terminal browser stitch gif help

SHELL := /bin/bash

help:
	@echo "Australian History MCP Demo Generator"
	@echo ""
	@echo "Usage:"
	@echo "  make terminal    - Record terminal with VHS"
	@echo "  make browser     - Instructions for browser screenshot"
	@echo "  make stitch      - Combine terminal + browser"
	@echo "  make gif         - Create optimised GIF"
	@echo "  make all         - Full pipeline (terminal + stitch + gif)"
	@echo "  make clean       - Remove output files"

all: terminal stitch gif
	@echo ""
	@echo "Demo complete! Files in demos/output/"
	@ls -lh output/combined.gif output/combined.mp4 2>/dev/null || true

# Generate terminal recording with VHS
terminal:
	@echo "Recording terminal with VHS..."
	cd .. && vhs demos/demo.tape
	@echo "Terminal recording complete"
	@ls -lh output/terminal.gif output/terminal.mp4 2>/dev/null || true

# Reminder for browser screenshot (manual step)
browser:
	@echo ""
	@echo "=== Manual Step Required ==="
	@echo "1. Search PROV for 'Flinders Street Station' with digitisedOnly=true"
	@echo "2. Open a result with good images in browser"
	@echo "3. Screenshot at 1200x700 pixels"
	@echo "4. Save to: demos/assets/browser-screenshot.png"
	@echo ""

# Create browser video segment from screenshot
output/browser-segment.mp4: assets/browser-screenshot.png
	@echo "Converting screenshot to video..."
	ffmpeg -y -loop 1 -i $< \
		-c:v libx264 -t 3 -pix_fmt yuv420p \
		-vf "scale=1200:700:force_original_aspect_ratio=decrease,pad=1200:700:(ow-iw)/2:(oh-ih)/2" \
		$@

# Stitch terminal + browser
stitch: output/terminal.mp4 output/browser-segment.mp4
	@echo "Stitching videos..."
	@echo "file 'terminal.mp4'" > output/filelist.txt
	@echo "file 'browser-segment.mp4'" >> output/filelist.txt
	cd output && ffmpeg -y -f concat -safe 0 -i filelist.txt \
		-c:v libx264 -pix_fmt yuv420p \
		combined.mp4
	@rm -f output/filelist.txt
	@echo "Stitching complete"
	@ls -lh output/combined.mp4

# Convert to optimised GIF
gif: output/combined.mp4
	@echo "Creating optimised GIF..."
	ffmpeg -y -i $< \
		-vf "fps=12,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
		-loop 0 \
		output/combined.gif
	@echo "GIF complete"
	@ls -lh output/combined.gif

# Terminal-only GIF (no browser)
terminal-only: terminal
	@echo "Creating terminal-only GIF..."
	ffmpeg -y -i output/terminal.mp4 \
		-vf "fps=12,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
		-loop 0 \
		output/terminal-optimised.gif
	@ls -lh output/terminal-optimised.gif

clean:
	rm -f output/*.gif output/*.mp4 output/*.txt
	@echo "Cleaned output directory"
