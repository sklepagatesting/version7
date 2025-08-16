// cloud_functions/index.js (File to deploy to Firebase Functions)

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

exports.checkAdminStatus = functions.https.onCall(async (data, context) => {
    // Ensure the request is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const uid = context.auth.uid;

    const adminDoc = await db.collection('admins').doc(uid).get();
    return { isAdmin: adminDoc.exists };
});

exports.addAdminRole = functions.https.onCall(async (data, context) => {
    // Ensure the caller is authenticated and is an admin
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const callerUid = context.auth.uid;
    const adminDoc = await db.collection('admins').doc(callerUid).get();
    if (!adminDoc.exists) {
        throw new functions.https.HttpsError('permission-denied', 'You do not have permission to perform this action.');
    }

    const targetUid = data.uid;
    const targetName = data.name;
    if (!targetUid) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a user UID.');
    }

    // Add the user to the admins collection
    await db.collection('admins').doc(targetUid).set({
        name: targetName,
        addedByUid: callerUid,
        addedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { success: true };
});

exports.removeAdminRole = functions.https.onCall(async (data, context) => {
    // Ensure the caller is authenticated and is an admin
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const callerUid = context.auth.uid;
    const adminDoc = await db.collection('admins').doc(callerUid).get();
    if (!adminDoc.exists) {
        throw new functions.https.HttpsError('permission-denied', 'You do not have permission to perform this action.');
    }

    const targetUid = data.uid;
    if (!targetUid) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a user UID.');
    }

    // A user cannot remove their own admin role
    if (callerUid === targetUid) {
        throw new functions.https.HttpsError('permission-denied', 'You cannot remove your own admin privileges.');
    }

    // Delete the document from the admins collection
    await db.collection('admins').doc(targetUid).delete();
    return { success: true };
});
