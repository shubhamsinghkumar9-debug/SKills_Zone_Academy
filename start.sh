#!/bin/bash
# ═══════════════════════════════════════════════
#skill zone — One-Command Dev Starter
# ═══════════════════════════════════════════════

set -e
CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

# Get the actual directory this script lives in
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/skills-Zone-Backend"
FRONTEND_DIR="$SCRIPT_DIR/Skill-zone"

echo -e "${CYAN}"
echo "  ███████╗██╗  ██╗██╗██╗     ██╗     ███████╗"
echo "  ██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝"
echo "  ███████╗█████╔╝ ██║██║     ██║     █████╗  "
echo "  ╚════██║██╔═██╗ ██║██║     ██║     ██╔══╝  "
echo "  ███████║██║  ██╗██║███████╗███████╗███████╗"
echo "  ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝"

echo "   ███████╗ ██████╗ ███╗  ██╗███████╗"
echo "   ╚════██║██╔═══██╗████╗ ██║██╔════╝"
echo "   ███████║██║   ██║██╔██╗██║█████╗  "
echo "   ╚════██║██║   ██║██║╚████║██╔══╝  "
echo "   ███████║╚██████╔╝██║ ╚███║███████╗"
echo "   ╚══════╝ ╚═════╝ ╚═╝  ╚══╝╚══════╝"
echo -e "${NC}"

echo -e "${GREEN}  Skill Zone Dev Environment${NC}"
echo ""

# ── Validate folders exist ────────────────────────────────────────
if [ ! -d "$BACKEND_DIR" ]; then
  echo -e "${RED}  ❌ Cannot find Skill-Zone-backend at: $BACKEND_DIR${NC}"
  exit 1
fi
if [ ! -d "$FRONTEND_DIR" ]; then
  echo -e "${RED}  ❌ Cannot find Skill-Zone-clone at: $FRONTEND_DIR${NC}"
  exit 1
fi

# ── Check MongoDB ──────────────────────────────────────────────
echo -e "${YELLOW}[1/4] Checking MongoDB...${NC}"
MONGO_URI=$(grep MONGO_URI "$BACKEND_DIR/.env" 2>/dev/null | cut -d'=' -f2-)
if echo "$MONGO_URI" | grep -q "mongodb+srv"; then
  echo -e "${GREEN}  ✅ Using MongoDB Atlas${NC}"
elif ! pgrep -x mongod &>/dev/null; then
  echo -e "${YELLOW}  ⚠  Local MongoDB not running — make sure Atlas URI is set in .env${NC}"
else
  echo -e "${GREEN}  ✅ Local MongoDB running${NC}"
fi

# ── Backend setup ─────────────────────────────────────────────
echo -e "${YELLOW}[2/4] Setting up backend...${NC}"
cd "$BACKEND_DIR"
if [ ! -d "venv" ]; then
  echo "  Creating Python venv..."
  python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt -q
echo -e "${GREEN}  ✅ Backend dependencies installed${NC}"

# ── Seed ──────────────────────────────────────────────────────
echo -e "${YELLOW}[3/4] Running seed...${NC}"

# ── Start both servers ────────────────────────────────────────
echo -e "${YELLOW}[4/4] Starting servers...${NC}"
echo ""
echo -e "${GREEN}  Backend  → http://localhost:8080${NC}"
echo -e "${GREEN}  Frontend → http://localhost:5173${NC}"
echo -e "${GREEN}  Health   → http://localhost:8080/api/health${NC}"
echo ""
echo -e "  Press ${RED}Ctrl+C${NC} to stop both servers"
echo ""

# Start backend
python3 "$BACKEND_DIR/run.py" &
BACKEND_PID=$!

sleep 2

# Start frontend
cd "$FRONTEND_DIR"
npm install -q
npm run dev &
FRONTEND_PID=$!

# Trap Ctrl+C
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

wait
