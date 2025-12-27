#!/bin/bash
# Simulates Claude Code MCP interaction for demo recording
# Run with: ./simulate-claude.sh

# ANSI colour codes for light theme
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BLACK='\033[0;30m'
GRAY='\033[0;90m'
BOLD='\033[1m'
RESET='\033[0m'

# Clear and show intro
clear
echo -e "${BOLD}Australian History MCP Server${RESET}"
echo -e "${GRAY}6 meta-tools | 69 data tools | 11 sources${RESET}"
echo ""
sleep 1.5

# ============================================================
# Scene 1: Tool Discovery
# ============================================================
echo -e "${CYAN}>${RESET} ${BOLD}What tools can search archives?${RESET}"
sleep 0.8
echo ""
echo -e "${GRAY}Using tool: tools(query=\"archives\")${RESET}"
sleep 1
echo ""

# Simulated tools() response
cat << 'EOF'
{
  "matchingTools": 6,
  "totalTools": 69,
  "tools": [
    {"name": "prov_search", "source": "PROV",
     "description": "Search Victorian state archives"},
    {"name": "nma_search_objects", "source": "NMA",
     "description": "Search museum collection objects"},
    {"name": "vhd_search_places", "source": "VHD",
     "description": "Search Victorian heritage places"},
    {"name": "museumsvic_search", "source": "Museums Victoria",
     "description": "Search museum objects and specimens"},
    {"name": "ga_hap_search", "source": "GA HAP",
     "description": "Search aerial photos (1928-1996)"},
    {"name": "ghap_search", "source": "GHAP",
     "description": "Search 330,000+ historical placenames"}
  ]
}
EOF

sleep 2.5
echo ""

# ============================================================
# Scene 2: Federated Search
# ============================================================
echo -e "${CYAN}>${RESET} ${BOLD}Search for 'Flinders Street Station' across all sources${RESET}"
sleep 0.8
echo ""
echo -e "${GRAY}Using tool: search(query=\"Flinders Street Station\", limit=3)${RESET}"
sleep 0.5
echo -e "${GRAY}Searching: PROV, NMA, VHD, Museums Victoria...${RESET}"
sleep 2
echo ""

# Simulated search() response with real-looking data
cat << 'EOF'
{
  "query": "Flinders Street Station",
  "sourcesSearched": ["prov", "nma", "vhd", "museumsvic"],
  "totalResults": 23,
  "results": [
    {
      "source": "PROV",
      "count": 8,
      "records": [
        {"title": "Flinders Street Station - Railway offices",
         "date": "1910", "series": "VPRS 12800",
         "url": "https://prov.vic.gov.au/archive/..."}
      ]
    },
    {
      "source": "VHD",
      "count": 3,
      "records": [
        {"title": "Flinders Street Railway Station Complex",
         "heritage_number": "H1083", "municipality": "Melbourne"}
      ]
    },
    {
      "source": "NMA",
      "count": 7,
      "records": [
        {"title": "Flinders Street Station poster",
         "type": "Photographs", "date": "1950s"}
      ]
    },
    {
      "source": "Museums Victoria",
      "count": 5,
      "records": [
        {"title": "Railway clocks mechanism",
         "category": "Technology"}
      ]
    }
  ],
  "_timing": {"total_ms": 1247}
}
EOF

sleep 3
echo ""

# ============================================================
# Scene 3: Open a Result
# ============================================================
echo -e "${CYAN}>${RESET} ${BOLD}Open the PROV heritage record${RESET}"
sleep 0.8
echo ""
echo -e "${GRAY}Using tool: open(url=\"https://prov.vic.gov.au/archive/...\")${RESET}"
sleep 1
echo ""

cat << 'EOF'
{
  "status": "opened",
  "url": "https://prov.vic.gov.au/archive/vprs-12800",
  "message": "URL opened in default browser"
}
EOF

sleep 1.5
echo ""
echo -e "${GREEN}Browser opened with digitised archive record${RESET}"
sleep 2

# Marker for VHS Wait command
echo ""
echo "DEMO_COMPLETE"
