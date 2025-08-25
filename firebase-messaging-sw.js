// firebase-messaging-sw.js

// Import and initialize the Firebase SDK
importScripts("https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js");

// IMPORTANT: This config MUST be outside the onBackgroundMessage handler
const firebaseConfig = {
    apiKey: "AIzaSyDZUVChTTWtGm4R40wMWGrTYwyUk0FDahs",
    authDomain: "sklepaga-8790e.firebaseapp.com",
    projectId: "sklepaga-8790e",
    storageBucket: "sklepaga-8790e.appspot.com",
    messagingSenderId: "815409129057",
    appId: "1:815409129057:web:9f6342be47e28c1f69ec20",
    measurementId: "G-9GH707G2WZ"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle incoming messages when the app is in the background or closed
messaging.onBackgroundMessage((payload) => {
    console.log(
        "[firebase-messaging-sw.js] Received background message ",
        payload
    );

    // Customize the notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/firebase-logo.png', // Optional: path to an icon
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
