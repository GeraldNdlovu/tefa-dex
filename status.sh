#!/bin/bash
# Check status
if tmux has-session -t tefa 2>/dev/null; then
    echo "✅ TEFA DEX is running"
    echo "   Attach with: tmux attach -t tefa"
else
    echo "❌ TEFA DEX is not running"
    echo "   Start with: ./start.sh"
fi
