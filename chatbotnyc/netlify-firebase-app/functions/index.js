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
