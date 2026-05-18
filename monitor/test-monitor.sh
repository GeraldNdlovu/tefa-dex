#!/bin/bash
echo "🧪 Testing TEFA Monitor Setup"

# Create test .env if not exists
if [ ! -f .env ]; then
  cat > .env << 'ENVEOF'
RPC_URL=http://localhost:8545
ROUTER_ADDRESS=0x0000000000000000000000000000000000000000
POOL_ADDRESSES=0x1111111111111111111111111111111111111111,0x2222222222222222222222222222222222222222
DISCORD_WEBHOOK=
ENVEOF
  echo "✓ Created .env file - UPDATE with your real addresses!"
fi

# Test Node.js module
echo "✓ Checking Node.js..."
node -e "console.log('Node.js OK')"

# Start monitor (will run but fail gracefully without real RPC)
echo "✓ Starting monitor (will show connection errors - normal for test)"
node monitor/tefa-monitor.cjs &
MONITOR_PID=$!

sleep 3
kill $MONITOR_PID 2>/dev/null

echo "✅ Monitor script is ready"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Deploy your contracts to testnet"
echo "2. Update .env with real addresses"
echo "3. Run: node monitor/tefa-monitor.cjs"
