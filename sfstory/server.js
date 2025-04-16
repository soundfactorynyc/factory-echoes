const express = require('express');
const admin = require('firebase-admin');
const app = express();
const port = process.env.PORT || 3000;

// Initialize Firebase Admin SDK
// You'll need to generate a private key file from the Firebase console
// and save it as serviceAccountKey.json
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
}

app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Firebase Node.js backend is running!');
});

// Example Firebase route
app.get('/api/data', async (req, res) => {
  try {
    // Example: Get data from Firestore
    // const snapshot = await admin.firestore().collection('your-collection').get();
    // const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // res.json(data);
    
    res.json({ message: 'Replace this with your actual Firebase data retrieval' });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log();
});
