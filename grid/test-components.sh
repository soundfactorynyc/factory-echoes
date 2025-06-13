#!/bin/bash
echo "Testing components individually..."

# Backup current components
cp -r src/components src/components.backup

# Test each component
for component in src/components/*.astro; do
  if [ -f "$component" ]; then
    echo "Testing: $component"
    
    # Temporarily move all others
    mkdir -p src/components.temp
    mv src/components/*.astro src/components.temp/ 2>/dev/null
    
    # Move back only the test component
    cp "src/components.temp/$(basename $component)" src/components/
    
    # Try to build
    if npm run build > /dev/null 2>&1; then
      echo "✅ $component - OK"
    else
      echo "❌ $component - FAILED"
    fi
    
    # Restore all
    mv src/components.temp/*.astro src/components/ 2>/dev/null
    rm -rf src/components.temp
  fi
done

# Restore backup
rm -rf src/components
mv src/components.backup src/components
