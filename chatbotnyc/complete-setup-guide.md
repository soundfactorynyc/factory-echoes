# Complete Netlify-Firebase Setup & Deployment Guide

This guide will walk you through the process of setting up and deploying your application using the `complete-migration-script.sh`.

## Setup Process

### Step 1: Save the migration script

First, save the `complete-migration-script.sh` to your local machine:

```bash
# Create the script file
curl -o complete-migration-script.sh https://raw.githubusercontent.com/YOUR-USERNAME/YOUR-REPO/main/complete-migration-script.sh
# OR simply create a new file and paste the script content

# Make it executable
chmod +x complete-migration-script.sh
```

### Step 2: Run the migration script

```bash
./complete-migration-script.sh /path/to/your/existing/project
```

The script will:
1. Analyze your existing project
2. Create a new `netlify-firebase-app` directory
3. Migrate relevant files
4. Set up the proper structure for both Netlify frontend and Firebase backend

## Deployment Process

### Step 1: Update Firebase Configuration

Navigate to the Firebase console (https://console.firebase.google.com/) and either create a new project or use an existing one.

1. Go to Project Settings to find your Firebase config
2. Update `.firebaserc` with your project ID:
   ```json
   {
     "projects": {
       "default": "your-firebase-project-id"
     }
   }
   ```
3. Update the Firebase config in `frontend/src/services/firebase.js`

### Step 2: Install Dependencies

```bash
# Install global tools
npm install -g firebase-tools netlify-cli

# Install frontend dependencies
cd netlify-firebase-app/frontend
npm install

# Install backend dependencies
cd ../functions
npm install
```

### Step 3: Set Up Firebase

```bash
# Login to Firebase
firebase login

# Initialize Firebase (if needed)
firebase init
```

### Step 4: Deploy Firebase Functions

```bash
# From the project root
firebase deploy --only functions
```

### Step 5: Deploy Frontend to Netlify

```bash
# Build the frontend
cd frontend
npm run build

# Deploy to Netlify
netlify deploy --prod
```

## Additional Configuration

### Environment Variables

Create a `.env` file in the `frontend` directory with your Firebase configuration:

```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

Also add these environment variables in the Netlify dashboard under Site settings > Build & deploy > Environment.

### Continuous Deployment

For continuous deployment:

1. Push your code to a Git repository
2. Connect the repository to Netlify
3. Set up build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `build`

## Troubleshooting

### CORS Issues

If you encounter CORS issues, ensure that your Firebase functions properly implement CORS handling:

```javascript
const cors = require('cors')({origin: true});

exports.yourFunction = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    // Your function logic here
  });
});
```

### Connection Issues

If the frontend can't connect to Firebase:
1. Check that environment variables are correctly set
2. Verify that your Firebase project has the appropriate services enabled
3. Ensure your Firebase security rules allow the necessary access

## Maintenance

### Updating Dependencies

Regularly update dependencies for both frontend and backend:

```bash
# Frontend
cd frontend
npm update

# Backend
cd ../functions
npm update
```

### Firebase Emulators

For local development, use Firebase emulators:

```bash
firebase emulators:start
```

This will provide local versions of Firebase services for testing without affecting production.
