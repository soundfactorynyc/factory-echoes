#!/bin/bash

# Get the current date and time for the commit message
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

# Add all changes
git add .

# Commit with timestamp
git commit -m "Working state saved at $TIMESTAMP"

echo "✅ Working state saved successfully!" 