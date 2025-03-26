#!/bin/bash

# List all checkpoints
echo "Available checkpoints:"
git tag --list "checkpoint-*" | sort -V

# Ask for checkpoint number
echo -e "\nEnter checkpoint number to restore (or press Enter to cancel):"
read CHECKPOINT_NUM

if [ -z "$CHECKPOINT_NUM" ]; then
    echo "Operation cancelled."
    exit 0
fi

# Check if checkpoint exists
if git rev-parse "checkpoint-$CHECKPOINT_NUM" >/dev/null 2>&1; then
    echo "Restoring checkpoint $CHECKPOINT_NUM..."
    git checkout "checkpoint-$CHECKPOINT_NUM"
    echo "✅ Successfully restored checkpoint $CHECKPOINT_NUM"
else
    echo "❌ Checkpoint $CHECKPOINT_NUM not found!"
fi 