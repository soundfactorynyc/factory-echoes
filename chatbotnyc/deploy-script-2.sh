#!/bin/bash
# One-command Netlify-Firebase deployment script

# Exit on error
set -e

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Netlify-Firebase One-Command Deployment ===${NC}"

# Check if project directory is provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: Project directory not specified${NC}"
  echo -e "Usage: ./deploy.sh /path/to/netlify-firebase-app"
  exit 1
fi

PROJECT_DIR="$1"

# Check if directory exists
if [ ! -d "$PROJECT_DIR" ]; then
  echo -e "${RED}Error: Directory '$PROJECT_DIR' does not exist${NC}"
  exit 1
fi

# Navigate to project directory
cd "$PROJECT_DIR"

# Step 1: Configure Firebase project
echo -e "\n${BLUE}Step 1: Configure Firebase Project${NC}"
echo -e "${YELLOW}Enter your Firebase project ID:${NC}"
read FIREBASE_PROJECT_ID

echo -e "${YELLOW}Updating .firebaserc...${NC}"
cat > .firebaserc << EOF
{
  "projects": {
    "default": "$FIREBASE_PROJECT_ID"
  }
}
EOF

# Step 2: Configure Firebase credentials
echo -e "\n${BLUE}Step 2: Configure Firebase Credentials${NC}"
echo -e "${YELLOW}Enter your Firebase API Key:${NC}"
read FIREBASE_API_KEY

echo -e "${YELLOW}Enter your Firebase Auth Domain (usually $FIREBASE_PROJECT_ID.firebaseapp.com):${NC}"
read FIREBASE_AUTH_DOMAIN

echo -e "${YELLOW}Enter your Firebase Storage Bucket (usually $FIREBASE_PROJECT_ID.appspot.com):${NC}"
read FIREBASE_STORAGE_BUCKET

echo -e "${YELLOW}Enter your Firebase Messaging Sender ID:${NC}"
read FIREBASE_MESSAGING_SENDER_ID

echo -e "${YELLOW}Enter your Firebase App ID:${NC}"
read FIREBASE_APP_ID

# Update firebase.js
echo -e "${YELLOW}Updating Firebase configuration...${NC}"
FIREBASE_JS_PATH="frontend/src/services/firebase.js"
TMP_FILE=$(mktemp)

sed "s|YOUR_API_KEY|$FIREBASE_API_KEY|g; s|your-project-id.firebaseapp.com|$FIREBASE_AUTH_DOMAIN|g; s|your-project-id|$FIREBASE_PROJECT_ID|g; s|your-project-id.appspot.com|$FIREBASE_STORAGE_BUCKET|g; s|YOUR_MESSAGING_SENDER_ID|$FIREBASE_MESSAGING_SENDER_ID|g; s|YOUR_APP_ID|$FIREBASE_APP_ID|g" "$FIREBASE_JS_PATH" > "$TMP_FILE"
mv "$TMP_FILE" "$FIREBASE_JS_PATH"

# Create .env file
echo -e "${YELLOW}Creating .env file...${NC}"
cat > frontend/.env << EOF
REACT_APP_FIREBASE_API_KEY=$FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID=$FIREBASE_APP_ID
EOF

# Step 3: Check and install dependencies
echo -e "\n${BLUE}Step 3: Installing Dependencies${NC}"

# Check for Firebase CLI
if ! command -v firebase &> /dev/null; then
  echo -e "${YELLOW}Firebase CLI not found. Installing...${NC}"
  npm install -g firebase-tools
else
  echo -e "${GREEN}Firebase CLI is installed.${NC}"
fi

# Check for Netlify CLI
if ! command -v netlify &> /dev/null; then
  echo -e "${YELLOW}Netlify CLI not found. Installing...${NC}"
  npm install -g netlify-cli
else
  echo -e "${GREEN}Netlify CLI is installed.${NC}"
fi

# Install project dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
(cd frontend && npm install)

echo -e "${YELLOW}Installing functions dependencies...${NC}"
(cd functions && npm install)

# Step 4: Firebase login and deploy
echo -e "\n${BLUE}Step 4: Deploy to Firebase${NC}"
echo -e "${YELLOW}Login to Firebase (if not already logged in)${NC}"
firebase login

echo -e "${YELLOW}Deploying Firebase functions...${NC}"
firebase deploy --only functions

# Step 5: Netlify login and deploy
echo -e "\n${BLUE}Step 5: Deploy to Netlify${NC}"
echo -e "${YELLOW}Login to Netlify (if not already logged in)${NC}"
netlify login

echo -e "${YELLOW}Building frontend...${NC}"
(cd frontend && npm run build)

echo -e "${YELLOW}Deploying to Netlify...${NC}"
(cd frontend && netlify deploy --prod)

echo -e "\n${GREEN}Deployment completed! 🚀${NC}"
echo -e "${YELLOW}Your application is now deployed to both Firebase and Netlify.${NC}"
echo -e "${YELLOW}Important: Make sure to add the environment variables to your Netlify site settings if you're using continuous deployment.${NC}"
