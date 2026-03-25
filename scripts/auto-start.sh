#!/bin/bash

# TEFA DEX Auto-Start
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 TEFA DEX Auto-Start${NC}"
echo -e "${BLUE}========================================${NC}"

# Kill existing processes
echo -e "${RED}Cleaning up old processes...${NC}"
pkill -f "hardhat node" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 2

# Start Hardhat node in background
echo -e "${BLUE}📡 Starting Hardhat node...${NC}"
npx hardhat node > /tmp/hardhat.log 2>&1 &
HARDHAT_PID=$!
echo -e "${GREEN}✅ Hardhat node started (PID: $HARDHAT_PID)${NC}"

# Wait for Hardhat to be ready
echo "Waiting for Hardhat node to be ready..."
sleep 5

# Deploy contracts
echo -e "${BLUE}📦 Deploying contracts...${NC}"
npx hardhat run scripts/deploy.ts --network localhost

# Start frontend
echo -e "${BLUE}🎨 Starting frontend...${NC}"
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}🎉 TEFA DEX is running!${NC}"
echo -e "${BLUE}📍 Frontend: http://localhost:5173${NC}"
echo -e "${BLUE}📍 Public:   http://$(curl -s ifconfig.me):5173${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${RED}Press Ctrl+C to stop all services${NC}"

# Wait for Ctrl+C
wait
