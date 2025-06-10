#!/bin/bash

# Grid OS - Comprehensive Backup Script
# Creates a complete backup of the Grid OS system with timestamp

# Get current timestamp
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_NAME="grid-os-backup-${TIMESTAMP}"
BACKUP_DIR="/Users/jp/grid/backups"
BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"

echo "🔧 Grid OS Backup System"
echo "========================="
echo "Timestamp: ${TIMESTAMP}"
echo "Backup Name: ${BACKUP_NAME}"
echo "Backup Location: ${BACKUP_FILE}"
echo ""

# Create backups directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Create temporary directory for backup staging
TEMP_BACKUP_DIR="/tmp/${BACKUP_NAME}"
mkdir -p "${TEMP_BACKUP_DIR}"

echo "📦 Creating backup structure..."

# Copy main source files
echo "  📁 Copying source files..."
cp -r src/ "${TEMP_BACKUP_DIR}/"

# Copy public files
echo "  🌐 Copying public files..."
cp -r public/ "${TEMP_BACKUP_DIR}/"

# Copy sound factory system
echo "  🔊 Copying sound factory system..."
cp -r sound-factory-system/ "${TEMP_BACKUP_DIR}/"

# Copy configuration files
echo "  ⚙️ Copying configuration files..."
cp package.json "${TEMP_BACKUP_DIR}/"
cp tsconfig.json "${TEMP_BACKUP_DIR}/"
cp astro.config.mjs "${TEMP_BACKUP_DIR}/"
cp vite.config.ts "${TEMP_BACKUP_DIR}/" 2>/dev/null || true

# Copy documentation and test files
echo "  📚 Copying documentation and test files..."
cp README.md "${TEMP_BACKUP_DIR}/" 2>/dev/null || true
cp owncast-tip-handler-README.md "${TEMP_BACKUP_DIR}/" 2>/dev/null || true
cp *.html "${TEMP_BACKUP_DIR}/" 2>/dev/null || true
cp *.js "${TEMP_BACKUP_DIR}/" 2>/dev/null || true
cp *.sh "${TEMP_BACKUP_DIR}/" 2>/dev/null || true

# Copy existing backup directory (if it exists)
if [ -d "backup/" ]; then
    echo "  💾 Copying existing backup directory..."
    cp -r backup/ "${TEMP_BACKUP_DIR}/"
fi

# Create system status snapshot
echo "  📊 Creating system status snapshot..."
cat > "${TEMP_BACKUP_DIR}/BACKUP_INFO.md" << EOF
# Grid OS Backup Information

**Backup Created:** $(date)
**System:** macOS
**Node Version:** $(node --version 2>/dev/null || echo "Not available")
**NPM Version:** $(npm --version 2>/dev/null || echo "Not available")

## System Status at Backup Time

### Package Information
\`\`\`json
$(cat package.json)
\`\`\`

### Directory Structure
\`\`\`
$(find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.astro" | sort)
\`\`\`

### Git Status (if available)
\`\`\`
$(git status 2>/dev/null || echo "Not a git repository")
\`\`\`

### Recent Git Commits (if available)
\`\`\`
$(git log --oneline -10 2>/dev/null || echo "No git history available")
\`\`\`

## Backup Contents

- **src/** - Main source code (React components, TypeScript, integration systems)
- **public/** - Static HTML test pages and assets  
- **sound-factory-system/** - Alternative JavaScript implementation
- **Configuration files** - package.json, tsconfig.json, astro.config.mjs, etc.
- **Documentation** - README files and test documentation
- **Test files** - HTML test pages and JavaScript test scripts

## System Architecture

### Framework Stack
- **Frontend:** Astro v5.9.1 + React + TypeScript
- **3D Graphics:** Three.js v0.177.0 (WebGL)
- **State Management:** RxJS v7.8.2
- **Build Tool:** Vite (via Astro)

### Core Systems
- **Grid OS Backend:** Event-driven architecture with RxJS
- **Shader System:** WebGL shader pipeline management  
- **Event Bus System:** Reactive stream-based communication
- **Trigger System:** Animation and effect triggers
- **Audio System:** Web Audio API integration

### Key Features
- Interactive WebGL grid visualization
- Real-time audio analysis and beat detection
- Live streaming integration (Owncast)
- Mobile and desktop responsive design
- Comprehensive test suite (23+ test pages)

## Recovery Instructions

1. Extract this backup to a new directory
2. Run \`npm install\` to restore dependencies
3. Run \`npm run dev\` to start the development server
4. Access the system at http://localhost:3000 (or next available port)
5. Test system health with \`window.gridOS.getSystemHealth()\` in browser console

EOF

# Create file count summary
echo "  📋 Creating file summary..."
cat > "${TEMP_BACKUP_DIR}/FILE_SUMMARY.txt" << EOF
Grid OS Backup File Summary
===========================

Source Files:
$(find "${TEMP_BACKUP_DIR}/src" -type f | wc -l) files in src/

Public Files:
$(find "${TEMP_BACKUP_DIR}/public" -type f | wc -l) files in public/

Sound Factory Files:
$(find "${TEMP_BACKUP_DIR}/sound-factory-system" -type f | wc -l) files in sound-factory-system/

Total Files: $(find "${TEMP_BACKUP_DIR}" -type f | wc -l)

File Types:
TypeScript files: $(find "${TEMP_BACKUP_DIR}" -name "*.ts" | wc -l)
TSX files: $(find "${TEMP_BACKUP_DIR}" -name "*.tsx" | wc -l)
JavaScript files: $(find "${TEMP_BACKUP_DIR}" -name "*.js" | wc -l)
JSX files: $(find "${TEMP_BACKUP_DIR}" -name "*.jsx" | wc -l)
HTML files: $(find "${TEMP_BACKUP_DIR}" -name "*.html" | wc -l)
CSS files: $(find "${TEMP_BACKUP_DIR}" -name "*.css" | wc -l)
Astro files: $(find "${TEMP_BACKUP_DIR}" -name "*.astro" | wc -l)
JSON files: $(find "${TEMP_BACKUP_DIR}" -name "*.json" | wc -l)
Markdown files: $(find "${TEMP_BACKUP_DIR}" -name "*.md" | wc -l)

Backup created: $(date)
EOF

# Create compressed archive
echo "🗜️ Creating compressed archive..."
cd /tmp
tar -czf "${BACKUP_FILE}" "${BACKUP_NAME}/"

# Calculate file size
BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)

# Clean up temporary directory
rm -rf "${TEMP_BACKUP_DIR}"

echo ""
echo "✅ Backup completed successfully!"
echo "📍 Location: ${BACKUP_FILE}"
echo "📦 Size: ${BACKUP_SIZE}"
echo ""
echo "🔍 Backup contains:"
echo "   - Complete source code (src/)"
echo "   - All public test pages (public/)"
echo "   - Sound Factory system (sound-factory-system/)"
echo "   - Configuration files"
echo "   - Documentation and test files"
echo "   - System status snapshot"
echo ""
echo "📋 To restore this backup:"
echo "   1. Extract: tar -xzf ${BACKUP_FILE}"
echo "   2. Navigate to extracted directory"
echo "   3. Run: npm install"
echo "   4. Run: npm run dev"
echo ""
echo "💾 Backup file: ${BACKUP_FILE}"
