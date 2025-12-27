# Australian History MCP Demo
# Demonstrates dynamic tool discovery and federated search
#
# Usage: vhs demos/demo.tape

Output demos/output/terminal.gif
Output demos/output/terminal.mp4

# Terminal settings for professional appearance
Set Shell "bash"
Set FontSize 18
Set FontFamily "JetBrains Mono"
Set Width 1200
Set Height 700
Set Theme "Catppuccin Latte"
Set Padding 20
Set BorderRadius 8
Set Margin 20
Set MarginFill "#eff1f5"
Set WindowBar Colorful
Set TypingSpeed 0ms
Set CursorBlink false

# Run the simulation script
Type "./demos/scripts/simulate-claude.sh"
Enter

# Wait for simulation to complete
Sleep 25s

# Final pause before end
Sleep 2s
