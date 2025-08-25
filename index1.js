const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendNewMessageNotification = functions.firestore
    .document("conversations/{conversationId}")
    .onUpdate(async (change, context) => {
        const beforeData = change.before.data();
        const afterData = change.after.data();

        // 1. Check if a new message was actually added
        if (!afterData.messages || beforeData.messages.length >= afterData.messages.length) {
            console.log("No new message detected. Exiting function.");
            return null;
        }

        // 2. Get the newest message
        const newMessage = afterData.messages[afterData.messages.length - 1];

        // 3. Check if the message was sent by the user (not the admin)
        // We compare the message author's name to the admin's name in the conversation doc
        const adminName = afterData.admin?.name;
        if (!adminName || newMessage.author === adminName) {
            console.log("Message was sent by an admin. No notification needed.");
            return null;
        }

        // 4. Get the admin's ID to fetch tokens
        const adminId = afterData.admin?.uid;
        if (!adminId) {
            console.log("Admin UID not found in conversation document.");
            return null;
        }

        console.log(`New message from user. Preparing notification for admin: ${adminId}`);

        // 5. Fetch all FCM tokens for that admin
        const tokensSnapshot = await admin.firestore()
            .collection(`admins/${adminId}/fcmTokens`)
            .get();

        if (tokensSnapshot.empty) {
            console.log("No FCM tokens found for this admin.");
            return null;
        }
        
        const tokens = tokensSnapshot.docs.map(doc => doc.id);

        // 6. Define the notification payload
        const payload = {
            notification: {
                title: `New message from ${afterData.user?.name || "a user"}`,
                body: newMessage.text,
            },
        };

        // 7. Send the notification to all of the admin's devices
        const response = await admin.messaging().sendToDevice(tokens, payload);
        console.log("Successfully sent message:", response);

        // Optional: Clean up invalid tokens
        response.results.forEach((result, index) => {
            const error = result.error;
            if (error) {
                console.error("Failure sending notification to", tokens[index], error);
                if (
                    error.code === "messaging/invalid-registration-token" ||
                    error.code === "messaging/registration-token-not-registered"
                ) {
                    // Remove the invalid token from the database
                    admin.firestore().collection(`admins/${adminId}/fcmTokens`).doc(tokens[index]).delete();
                }
            }
        });

        return null;
    });
