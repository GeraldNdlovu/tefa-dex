#!/bin/bash
# Fix: rename to .cjs for CommonJS compatibility
mv src/server.js src/server.cjs 2>/dev/null

# Kill old processes
pkill -9 node 2>/dev/null

# Start backend
PORT=3001 node src/server.cjs > /tmp/relayer.log 2>&1 &
node src/worker.js > /tmp/worker.log 2>&1 &

# Start frontend
cd ../frontend
npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &

sleep 3
echo "Servers started. Check: curl http://localhost:3001/api/admin/me"
