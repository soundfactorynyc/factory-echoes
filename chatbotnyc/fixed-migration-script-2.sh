#!/bin/bash
# Complete project migration script for Netlify frontend and Firebase backend
# macOS compatible version

# Exit on error
set -e

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Netlify-Firebase Project Migration Tool ===${NC}"

# Set the source directory directly to your project path
SOURCE_DIR="/Users/jp/chatbotnyc"

NEW_DIR="netlify-firebase-app"
TARGET_DIR="$(pwd)/$NEW_DIR"

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
  echo -e "${RED}Error: Source directory '$SOURCE_DIR' does not exist${NC}"
  exit 1
fi

echo -e "${GREEN}Source project: ${YELLOW}$SOURCE_DIR${NC}"
echo -e "${GREEN}Target project: ${YELLOW}$TARGET_DIR${NC}"

# Confirm with user
echo -e "${YELLOW}This will create a new project structure with Netlify frontend and Firebase backend.${NC}"
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${RED}Operation cancelled${NC}"
  exit 1
fi

# Create base structure
echo -e "\n${BLUE}Creating new project structure...${NC}"
mkdir -p "$NEW_DIR"
mkdir -p "$NEW_DIR/frontend/public" 
mkdir -p "$NEW_DIR/frontend/src/components" 
mkdir -p "$NEW_DIR/frontend/src/pages" 
mkdir -p "$NEW_DIR/frontend/src/services"
mkdir -p "$NEW_DIR/functions"

# Detect project type and structure from source
echo -e "\n${BLUE}Analyzing source project structure...${NC}"

# Check for React/frontend files
HAS_REACT=false
REACT_DIR=""
if [ -f "$SOURCE_DIR/package.json" ] && grep -q "react" "$SOURCE_DIR/package.json" 2>/dev/null; then
  HAS_REACT=true
  REACT_DIR="$SOURCE_DIR"
  echo -e "${GREEN}Found React in root directory${NC}"
elif [ -d "$SOURCE_DIR/client" ] && [ -f "$SOURCE_DIR/client/package.json" ] && grep -q "react" "$SOURCE_DIR/client/package.json" 2>/dev/null; then
  HAS_REACT=true
  REACT_DIR="$SOURCE_DIR/client"
  echo -e "${GREEN}Found React in client directory${NC}"
elif [ -d "$SOURCE_DIR/frontend" ] && [ -f "$SOURCE_DIR/frontend/package.json" ] && grep -q "react" "$SOURCE_DIR/frontend/package.json" 2>/dev/null; then
  HAS_REACT=true
  REACT_DIR="$SOURCE_DIR/frontend"
  echo -e "${GREEN}Found React in frontend directory${NC}"
fi

# Check for Firebase/backend files
HAS_FIREBASE=false
FIREBASE_DIR=""
if [ -f "$SOURCE_DIR/firebase.json" ]; then
  HAS_FIREBASE=true
  FIREBASE_DIR="$SOURCE_DIR"
  echo -e "${GREEN}Found Firebase configuration in root directory${NC}"
elif [ -d "$SOURCE_DIR/functions" ]; then
  HAS_FIREBASE=true
  FIREBASE_DIR="$SOURCE_DIR"
  echo -e "${GREEN}Found Firebase functions directory${NC}"
elif [ -d "$SOURCE_DIR/server" ] && grep -q "firebase" "$SOURCE_DIR/server/package.json" 2>/dev/null; then
  HAS_FIREBASE=true
  FIREBASE_DIR="$SOURCE_DIR/server"
  echo -e "${GREEN}Found Firebase in server directory${NC}"
elif [ -d "$SOURCE_DIR/backend" ] && grep -q "firebase" "$SOURCE_DIR/backend/package.json" 2>/dev/null; then
  HAS_FIREBASE=true
  FIREBASE_DIR="$SOURCE_DIR/backend"
  echo -e "${GREEN}Found Firebase in backend directory${NC}"
fi

# Migrate React/frontend files if found
if [ "$HAS_REACT" = true ]; then
  echo -e "\n${BLUE}Migrating React/Frontend files...${NC}"
  
  # Copy package.json and modify if needed
  if [ -f "$REACT_DIR/package.json" ]; then
    cp "$REACT_DIR/package.json" "$NEW_DIR/frontend/"
    echo -e "${GREEN}Copied package.json${NC}"
    
    # Add Netlify CLI if not present - use a safer approach that works in macOS
    if ! grep -q "netlify-cli" "$NEW_DIR/frontend/package.json"; then
      # Create a temporary file
      TEMP_FILE=$(mktemp)
      # Process the file
      awk '/"devDependencies"[[:space:]]*:/ { 
        print $0; 
        print "    \"netlify-cli\": \"^15.0.0\","; 
        next; 
      } 
      /"devDependencies"[[:space:]]*:[[:space:]]*\{/ { 
        print $0; 
        print "    \"netlify-cli\": \"^15.0.0\","; 
        next; 
      } 
      { print $0 }' "$NEW_DIR/frontend/package.json" > "$TEMP_FILE"
      # Replace the original file
      mv "$TEMP_FILE" "$NEW_DIR/frontend/package.json"
      echo -e "${YELLOW}Added netlify-cli to devDependencies${NC}"
    fi
  fi
  
  # Create netlify.toml if it doesn't exist
  echo -e "${GREEN}Creating netlify.toml configuration...${NC}"
  cat > "$NEW_DIR/frontend/netlify.toml" << EOF
[build]
  base = "."
  publish = "build"
  command = "npm run build"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOF

  # Copy source directories
  SRC_PATHS=("src" "public" "components" "assets" "styles" "utils" "hooks")
  
  for path in "${SRC_PATHS[@]}"; do
    if [ -d "$REACT_DIR/$path" ]; then
      if [ "$path" == "src" ]; then
        # Handle src differently - we want to preserve its structure but also ensure our services directory
        mkdir -p "$NEW_DIR/frontend/src"
        cp -r "$REACT_DIR/src"/* "$NEW_DIR/frontend/src/" 2>/dev/null || true
        echo -e "${GREEN}Copied src directory${NC}"
      elif [ "$path" == "public" ]; then
        # Copy public directory content
        mkdir -p "$NEW_DIR/frontend/public"
        cp -r "$REACT_DIR/public"/* "$NEW_DIR/frontend/public/" 2>/dev/null || true
        echo -e "${GREEN}Copied public directory${NC}"
      else
        # For other directories, create them in src if they don't exist
        mkdir -p "$NEW_DIR/frontend/src/$path"
        cp -r "$REACT_DIR/$path"/* "$NEW_DIR/frontend/src/$path/" 2>/dev/null || true
        echo -e "${GREEN}Copied $path directory to src/$path${NC}"
      fi
    fi
  done
  
  # Create Firebase service if it doesn't exist
  if [ ! -f "$NEW_DIR/frontend/src/services/firebase.js" ]; then
    mkdir -p "$NEW_DIR/frontend/src/services"
    echo -e "${YELLOW}Creating Firebase service file...${NC}"
    cat > "$NEW_DIR/frontend/src/services/firebase.js" << EOF
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Replace with your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "your-project-id.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "your-project-id.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const functions = getFunctions(app);

export { app, db, functions };
EOF
  fi

  # Copy config files
  for file in .env .env.local .env.development .env.production .env.example; do
    if [ -f "$REACT_DIR/$file" ]; then
      cp "$REACT_DIR/$file" "$NEW_DIR/frontend/"
      echo -e "${GREEN}Copied $file${NC}"
    fi
  done
else
  echo -e "${YELLOW}No React frontend detected. Using template files.${NC}"
  # Create minimal package.json
  cat > "$NEW_DIR/frontend/package.json" << EOF
{
  "name": "netlify-firebase-app",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "firebase": "^10.7.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0", 
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "netlify-cli": "^15.0.0"
  }
}
EOF

  # Create basic index files
  cat > "$NEW_DIR/frontend/public/index.html" << EOF
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Netlify + Firebase Application" />
    <title>Netlify + Firebase App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
EOF

  cat > "$NEW_DIR/frontend/src/index.js" << EOF
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

  cat > "$NEW_DIR/frontend/src/App.js" << EOF
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Netlify + Firebase App</h1>
      <p>Welcome to your new application!</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
EOF

  cat > "$NEW_DIR/frontend/src/services/firebase.js" << EOF
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Replace with your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "your-project-id.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "your-project-id.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const functions = getFunctions(app);

export { app, db, functions };
EOF

  # Create netlify.toml
  cat > "$NEW_DIR/frontend/netlify.toml" << EOF
[build]
  base = "."
  publish = "build"
  command = "npm run build"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOF
fi

# Migrate Firebase/backend files if found
if [ "$HAS_FIREBASE" = true ]; then
  echo -e "\n${BLUE}Migrating Firebase/Backend files...${NC}"
  
  # Copy firebase.json if exists
  if [ -f "$FIREBASE_DIR/firebase.json" ]; then
    cp "$FIREBASE_DIR/firebase.json" "$NEW_DIR/"
    echo -e "${GREEN}Copied firebase.json${NC}"
  else
    echo -e "${YELLOW}Creating firebase.json...${NC}"
    cat > "$NEW_DIR/firebase.json" << EOF
{
  "functions": {
    "source": "functions",
    "predeploy": [
      "npm --prefix functions run lint"
    ]
  },
  "hosting": {
    "public": "frontend/build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "emulators": {
    "functions": {
      "port": 5001
    },
    "hosting": {
      "port": 5000
    },
    "ui": {
      "enabled": true
    }
  }
}
EOF
  fi
  
  # Copy .firebaserc if exists
  if [ -f "$FIREBASE_DIR/.firebaserc" ]; then
    cp "$FIREBASE_DIR/.firebaserc" "$NEW_DIR/"
    echo -e "${GREEN}Copied .firebaserc${NC}"
  else
    echo -e "${YELLOW}Creating .firebaserc template...${NC}"
    cat > "$NEW_DIR/.firebaserc" << EOF
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
EOF
  fi
  
  # Copy functions directory if exists
  if [ -d "$FIREBASE_DIR/functions" ]; then
    mkdir -p "$NEW_DIR/functions"
    cp -r "$FIREBASE_DIR/functions"/* "$NEW_DIR/functions/" 2>/dev/null || true
    echo -e "${GREEN}Copied functions directory${NC}"
  else
    # Look for server/backend code
    BACKEND_DIRS=("server" "backend" "api")
    FOUND_BACKEND=false
    
    for dir in "${BACKEND_DIRS[@]}"; do
      if [ -d "$SOURCE_DIR/$dir" ]; then
        mkdir -p "$NEW_DIR/functions"
        cp -r "$SOURCE_DIR/$dir"/* "$NEW_DIR/functions/" 2>/dev/null || true
        echo -e "${GREEN}Copied $dir directory to functions/${NC}"
        FOUND_BACKEND=true
        break
      fi
    done
    
    if [ "$FOUND_BACKEND" = false ]; then
      echo -e "${YELLOW}No backend code found. Creating basic Firebase Functions...${NC}"
      
      # Create basic index.js
      cat > "$NEW_DIR/functions/index.js" << EOF
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

admin.initializeApp();

exports.api = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    if (req.method === 'GET') {
      res.status(200).json({ message: 'Hello from Firebase Functions!' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  });
});
EOF
      
      # Create basic package.json
      cat > "$NEW_DIR/functions/package.json" << EOF
{
  "name": "functions",
  "description": "Firebase Cloud Functions",
  "scripts": {
    "lint": "eslint .",
    "serve": "firebase emulators:start --only functions",
    "shell": "firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  },
  "main": "index.js",
  "dependencies": {
    "cors": "^2.8.5",
    "firebase-admin": "^11.11.0",
    "firebase-functions": "^4.5.0"
  },
  "devDependencies": {
    "eslint": "^8.55.0",
    "eslint-plugin-promise": "^6.1.1"
  },
  "private": true
}
EOF
    fi
  fi
else
  echo -e "${YELLOW}No Firebase backend detected. Creating basic functions structure...${NC}"
  
  # Create firebase configuration
  cat > "$NEW_DIR/firebase.json" << EOF
{
  "functions": {
    "source": "functions",
    "predeploy": [
      "npm --prefix functions run lint"
    ]
  },
  "hosting": {
    "public": "frontend/build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "emulators": {
    "functions": {
      "port": 5001
    },
    "hosting": {
      "port": 5000
    },
    "ui": {
      "enabled": true
    }
  }
}
EOF

  cat > "$NEW_DIR/.firebaserc" << EOF
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
EOF

  # Create basic index.js
  cat > "$NEW_DIR/functions/index.js" << EOF
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

admin.initializeApp();

exports.api = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    if (req.method === 'GET') {
      res.status(200).json({ message: 'Hello from Firebase Functions!' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  });
});
EOF

  # Create basic package.json
  cat > "$NEW_DIR/functions/package.json" << EOF
{
  "name": "functions",
  "description": "Firebase Cloud Functions",
  "scripts": {
    "lint": "eslint .",
    "serve": "firebase emulators:start --only functions",
    "shell": "firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  },
  "main": "index.js",
  "dependencies": {
    "cors": "^2.8.5",
    "firebase-admin": "^11.11.0",
    "firebase-functions": "^4.5.0"
  },
  "devDependencies": {
    "eslint": "^8.55.0",
    "eslint-plugin-promise": "^6.1.1"
  },
  "private": true
}
EOF
fi

# Create or copy README
if [ -f "$SOURCE_DIR/README.md" ]; then
  cp "$SOURCE_DIR/README.md" "$NEW_DIR/"
  echo -e "${GREEN}Copied README.md${NC}"
else
  echo -e "${YELLOW}Creating README.md...${NC}"
  cat > "$NEW_DIR/README.md" << EOF
# Netlify + Firebase Application

This project uses Netlify for frontend hosting and Firebase for backend services.

## Structure

- \`frontend/\`: React application hosted on Netlify
- \`functions/\`: Firebase Cloud Functions

## Setup

### Prerequisites

- Node.js and npm
- Firebase CLI: \`npm install -g firebase-tools\`
- Netlify CLI: \`npm install -g netlify-cli\`

### Installation

1. Install frontend dependencies:
   \`\`\`
   cd frontend
   npm install
   \`\`\`

2. Install functions dependencies:
   \`\`\`
   cd functions
   npm install
   \`\`\`

3. Update Firebase configuration in \`frontend/src/services/firebase.js\` with your project details

### Development

1. Start the React development server:
   \`\`\`
   cd frontend
   npm start
   \`\`\`

2. Start Firebase emulators:
   \`\`\`
   firebase emulators:start
   \`\`\`

### Deployment

#### Deploy to Netlify:
\`\`\`
cd frontend
netlify deploy --prod
\`\`\`

#### Deploy to Firebase:
\`\`\`
firebase deploy
\`\`\`
EOF
fi

# Create gitignore if it doesn't exist
if [ -f "$SOURCE_DIR/.gitignore" ]; then
  cp "$SOURCE_DIR/.gitignore" "$NEW_DIR/"
  echo -e "${GREEN}Copied .gitignore${NC}"
else
  echo -e "${YELLOW}Creating .gitignore...${NC}"
  cat > "$NEW_DIR/.gitignore" << EOF
# dependencies
/node_modules
/frontend/node_modules
/functions/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build
/frontend/build

# Firebase
.firebase/
firebase-debug.log
ui-debug.log

# Netlify
.netlify

# env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# misc
.DS_Store
npm-debug.log*
yarn-debug.log*
yarn-error.log*
EOF
fi

echo -e "\n${GREEN}✅ Migration completed successfully!${NC}"
echo -e "${BLUE}New project structure created at: ${YELLOW}$TARGET_DIR${NC}"

# Final instructions
echo -e "\n${BLUE}Next steps:${NC}"
echo -e "1. ${YELLOW}cd $NEW_DIR${NC}"
echo -e "2. Update Firebase project ID in ${YELLOW}.firebaserc${NC}"
echo -e "3. Update Firebase config in ${YELLOW}frontend/src/services/firebase.js${NC}"
echo -e "4. Install dependencies:${NC}"
echo -e "   ${YELLOW}cd frontend && npm install${NC}"
echo -e "   ${YELLOW}cd ../functions && npm install${NC}"
echo -e "5. Start development servers:${NC}"
echo -e "   Frontend: ${YELLOW}cd frontend && npm start${NC}"
echo -e "   Firebase: ${YELLOW}firebase emulators:start${NC}"
echo -e "6. Deploy:${NC}"
echo -e "   Netlify: ${YELLOW}cd frontend && npx netlify deploy --prod${NC}"
echo -e "   Firebase: ${YELLOW}firebase deploy${NC}"

echo -e "\n${GREEN}Happy coding! 🚀${NC}"
