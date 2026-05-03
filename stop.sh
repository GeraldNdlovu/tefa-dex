#!/bin/bash
# Stop everything
tmux kill-session -t tefa 2>/dev/null
pkill -f "hardhat" 2>/dev/null
pkill -f "vite" 2>/dev/null
echo "✅ TEFA DEX stopped"
