#!/bin/bash
# TEFA DEX - Unified Production System
# ONE COMMAND: ./start.sh

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🚀 TEFA DEX - PRODUCTION SYSTEM v2.0         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"

# Kill existing sessions
tmux kill-session -t tefa 2>/dev/null && echo -e "${YELLOW}⚠️  Stopped existing session${NC}"

# Create new tmux session
tmux new-session -d -s tefa -n "main"

# ============================================================
# WINDOW 1: Hardhat Blockchain Node
# ============================================================
tmux send-keys -t tefa:main "cd ~/tefa-dex" C-m
tmux send-keys -t tefa:main "clear" C-m
tmux send-keys -t tefa:main "echo '════════════════════════════════════════════════════'" C-m
tmux send-keys -t tefa:main "echo '🔗 HARDHAT NODE - BLOCKCHAIN LAYER'" C-m
tmux send-keys -t tefa:main "echo '════════════════════════════════════════════════════'" C-m
tmux send-keys -t tefa:main "npx hardhat node --hostname 0.0.0.0" C-m

sleep 3

# ============================================================
# WINDOW 2: Deploy Contracts
# ============================================================
tmux new-window -t tefa -n "deploy"
tmux send-keys -t tefa:deploy "cd ~/tefa-dex" C-m
tmux send-keys -t tefa:deploy "clear" C-m
tmux send-keys -t tefa:deploy "echo '════════════════════════════════════════════════════'" C-m
tmux send-keys -t tefa:deploy "echo '📦 DEPLOYING CONTRACTS'" C-m
tmux send-keys -t tefa:deploy "echo '════════════════════════════════════════════════════'" C-m
tmux send-keys -t tefa:deploy "npx hardhat run scripts/deploy.ts --network localhost" C-m

sleep 5

# ============================================================
# WINDOW 3: Frontend
# ============================================================
tmux new-window -t tefa -n "frontend"
tmux send-keys -t tefa:frontend "cd ~/tefa-dex/frontend" C-m
tmux send-keys -t tefa:frontend "clear" C-m
tmux send-keys -t tefa:frontend "echo '════════════════════════════════════════════════════'" C-m
tmux send-keys -t tefa:frontend "echo '🎨 FRONTEND - WEB INTERFACE'" C-m
tmux send-keys -t tefa:frontend "echo '════════════════════════════════════════════════════'" C-m
tmux send-keys -t tefa:frontend "npm run dev -- --host 0.0.0.0 --port 5173" C-m

# ============================================================
# WINDOW 4: Monitor
# ============================================================
tmux new-window -t tefa -n "monitor"
tmux send-keys -t tefa:monitor "cd ~/tefa-dex" C-m
tmux send-keys -t tefa:monitor "clear" C-m
tmux send-keys -t tefa:monitor "echo '════════════════════════════════════════════════════'" C-m
tmux send-keys -t tefa:monitor "echo '📊 MONITOR - HEALTH CHECKS'" C-m
tmux send-keys -t tefa:monitor "echo '════════════════════════════════════════════════════'" C-m
tmux send-keys -t tefa:monitor "watch -n 3 'curl -s http://localhost:8545 -X POST -H \"Content-Type: application/json\" --data \"{\\\"jsonrpc\\\":\\\"2.0\\\",\\\"method\\\":\\\"eth_blockNumber\\\",\\\"params\\\":[],\\\"id\\\":1}\" | jq -r .result'" C-m

# ============================================================
# WINDOW 5: Shell
# ============================================================
tmux new-window -t tefa -n "shell"
tmux send-keys -t tefa:shell "cd ~/tefa-dex" C-m
tmux send-keys -t tefa:shell "clear" C-m
tmux send-keys -t tefa:shell "echo '════════════════════════════════════════════════════'" C-m
tmux send-keys -t tefa:shell "echo '💻 COMMAND SHELL'" C-m
tmux send-keys -t tefa:shell "echo '════════════════════════════════════════════════════'" C-m
tmux send-keys -t tefa:shell "echo ''" C-m
tmux send-keys -t tefa:shell "echo 'Available commands:'" C-m
tmux send-keys -t tefa:shell "echo '  npx hardhat run scripts/test-swap.ts --network localhost'" C-m
tmux send-keys -t tefa:shell "echo '  npx hardhat console --network localhost'" C-m
tmux send-keys -t tefa:shell "echo '  tail -f /tmp/hardhat.log'" C-m

# ============================================================
# SUMMARY
# ============================================================
IP=$(curl -s ifconfig.me)

echo -e "\n${GREEN}✅ TEFA DEX IS RUNNING!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🌐 Frontend:${NC} http://${IP}:5173"
echo -e "${GREEN}🔗 RPC:${NC}      http://${IP}:8545"
echo -e "${GREEN}🔢 Chain ID:${NC} 31337"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}📺 View all windows:${NC} tmux attach -t tefa"
echo -e "${YELLOW}🔍 Window navigation:${NC} Ctrl+B then 0-4"
echo -e "${YELLOW}🔄 Detach from tmux:${NC} Ctrl+B then D"
echo -e "${YELLOW}🛑 Stop everything:${NC} ./stop.sh"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
