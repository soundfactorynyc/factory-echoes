#!/bin/bash

# Owncast Tip Handler Backup Restore Script
# This script restores the Owncast Tip Handler backup files to their proper locations

echo "🚀 Starting Owncast Tip Handler backup restoration..."

# Check if backup zip exists
if [ ! -f "owncast-tip-handler-backup.zip" ]; then
    echo "❌ Error: Backup file 'owncast-tip-handler-backup.zip' not found!"
    exit 1
fi

# Create temporary directory for extraction
echo "📦 Creating temporary directory..."
mkdir -p temp_backup
cd temp_backup

# Extract backup
echo "📂 Extracting backup files..."
unzip -q ../owncast-tip-handler-backup.zip

# Create destination directories if they don't exist
echo "🗂️ Creating destination directories..."
mkdir -p ../src/components
mkdir -p ../src/integration
mkdir -p ../public

# Copy files to their destinations
echo "📋 Copying files to their destinations..."

# Components
cp -v src/components/OwncastTipDisplay.tsx ../src/components/
cp -v src/components/OwncastTipDisplay.css ../src/components/

# Integration
cp -v src/integration/owncastTipHandler.ts ../src/integration/
cp -v src/integration/owncastTipHandler.js ../src/integration/
cp -v src/integration/gridOSBackend.js ../src/integration/
cp -v src/integration/gridIntegration.js ../src/integration/

# Public
cp -v public/owncast-tip-test.html ../public/

# Copy README
cp -v README.md ../owncast-tip-handler-README.md

# Clean up
echo "🧹 Cleaning up..."
cd ..
rm -rf temp_backup

echo "✅ Backup restoration complete!"
echo "📝 Documentation has been saved to 'owncast-tip-handler-README.md'"
echo "🌐 You can test the system by opening 'public/owncast-tip-test.html' in a browser"
