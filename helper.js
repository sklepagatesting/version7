// cloud_functions/index.js (File to deploy)

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

/**
 * Checks if the authenticated user is an admin.
 * @return {Object} An object containing a boolean `isAdmin`.
 */
exports.checkAdminStatus = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const uid = context.auth.uid;

    const adminDoc = await db.collection('admins').doc(uid).get();
    return { isAdmin: adminDoc.exists };
});

/**
 * Adds an admin role to a specified user.
 * @param {Object} data - Contains the user's `uid` and `name`.
 * @return {Object} An object indicating success.
 */
exports.addAdminRole = functions.https.onCall(async (data, context) => {
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

    await db.collection('admins').doc(targetUid).set({
        name: targetName,
        addedByUid: callerUid,
        addedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { success: true };
});

/**
 * Removes an admin role from a specified user.
 * @param {Object} data - Contains the user's `uid`.
 * @return {Object} An object indicating success.
 */
exports.removeAdminRole = functions.https.onCall(async (data, context) => {
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

    if (callerUid === targetUid) {
        throw new functions.https.HttpsError('permission-denied', 'You cannot remove your own admin privileges.');
    }

    await db.collection('admins').doc(targetUid).delete();
    return { success: true };
});
