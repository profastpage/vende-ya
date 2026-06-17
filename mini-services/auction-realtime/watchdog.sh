#!/bin/bash
# Vende Ya — Socket.io server watchdog
# Restarts the auction-realtime server if it crashes.
cd /home/z/my-project/mini-services/auction-realtime
LOG=/home/z/my-project/mini-services/auction-realtime/server.log

while true; do
  echo "[$(date '+%H:%M:%S')] starting auction-realtime..." >> "$LOG"
  bun index.ts >> "$LOG" 2>&1
  EXIT=$?
  echo "[$(date '+%H:%M:%S')] auction-realtime exited with $EXIT, restarting in 2s..." >> "$LOG"
  sleep 2
done
