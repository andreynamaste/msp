#!/bin/bash
cd /X/opt/video
while true; do
    echo "$(date): Starting server..." >> /tmp/server_monitor.log
    python3 glass_design_main.py >> server.log 2>&1
    echo "$(date): Server stopped, restarting in 2 seconds..." >> /tmp/server_monitor.log
    sleep 2
done

