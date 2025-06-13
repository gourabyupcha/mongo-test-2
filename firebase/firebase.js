// firebase.js

const admin = require('firebase-admin');
const serviceAccount = require('../service-account-key.json'); // Replace with path to your file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

module.exports = { firestore };
