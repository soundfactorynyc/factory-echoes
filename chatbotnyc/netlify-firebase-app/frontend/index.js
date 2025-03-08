// Add this at the top of your file
const cors = require('cors')({origin: true});

// Then wrap your function handler
exports.api = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    // Your existing function code here
  });
});
