# Netlify + Firebase Application

This project uses Netlify for frontend hosting and Firebase for backend services.

## Structure

- `frontend/`: React application hosted on Netlify
- `functions/`: Firebase Cloud Functions

## Setup

### Prerequisites

- Node.js and npm
- Firebase CLI: `npm install -g firebase-tools`
- Netlify CLI: `npm install -g netlify-cli`

### Installation

1. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

2. Install functions dependencies:
   ```
   cd functions
   npm install
   ```

3. Update Firebase configuration in `frontend/src/services/firebase.js` with your project details

### Development

1. Start the React development server:
   ```
   cd frontend
   npm start
   ```

2. Start Firebase emulators:
   ```
   firebase emulators:start
   ```

### Deployment

#### Deploy to Netlify:
```
cd frontend
netlify deploy --prod
```

#### Deploy to Firebase:
```
firebase deploy
```
