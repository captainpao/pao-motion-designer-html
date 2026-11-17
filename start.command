#!/bin/bash
# Quick start: double-click in Finder. Serves this folder and opens the project list in your browser.
# Close this Terminal window (or press Ctrl+C) to stop.
cd "$(dirname "$0")"
PORT=5199
(sleep 1; open "http://localhost:$PORT/") &
python3 -m http.server "$PORT"
