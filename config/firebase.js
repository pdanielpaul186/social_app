var admin = require("firebase-admin");

var serviceAccount = require("./socialapp-d9794-firebase-adminsdk-m5rvw-1d496cf9c8.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket:"gs://socialapp-d9794.appspot.com"
}); 

console.log("Firebase initialized !!!!")

module.exports = admin.storage().bucket()