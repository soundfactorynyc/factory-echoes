#!/bin/bash

# Get the current date and time
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

# Get the last checkpoint number
LAST_CHECKPOINT=$(git tag --list "checkpoint-*" | sort -V | tail -n 1 | sed 's/checkpoint-//')
if [ -z "$LAST_CHECKPOINT" ]; then
    NEXT_CHECKPOINT=1
else
    NEXT_CHECKPOINT=$((LAST_CHECKPOINT + 1))
fi

# Add all changes
git add .

# Commit with timestamp and checkpoint number
git commit -m "Checkpoint $NEXT_CHECKPOINT - $TIMESTAMP"

# Create a tag for this checkpoint
git tag -a "checkpoint-$NEXT_CHECKPOINT" -m "Checkpoint $NEXT_CHECKPOINT - $TIMESTAMP"

echo "✅ Checkpoint $NEXT_CHECKPOINT saved successfully!"
echo "To return to this checkpoint later, use: git checkout checkpoint-$NEXT_CHECKPOINT" 