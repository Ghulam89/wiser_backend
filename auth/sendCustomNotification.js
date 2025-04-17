// const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with your service account key
// const serviceAccount = require('./oncloudapis-firebase-adminsdk-xvsqx-1144ae626a.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// Function to send a custom notification
function sendCustomNotification(title, body, recipientToken) {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: recipientToken,
    android: {
      priority: "high",
      notification: {
        sound: 'notification_sound', // Ensure the sound file is in the Android app's `res/raw` directory
        icon: 'notification_logo', // This should be the name of your icon file placed in res/drawable, without file extension
        color: '#4A90E2', // You can specify the notification color you want to use (optional)
      },
    },
  };


  // return admin.messaging().send(message)
  //   .then((response) => {
  //     console.log('Successfully sent notification:', response);
  //   })
  //   .catch((error) => {
  //     console.error('Error sending notification:', error);
  //   });
}

module.exports = sendCustomNotification;
