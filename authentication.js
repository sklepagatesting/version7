const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();

// Configure your email transport (use an App Password if Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dzeyautajay@gmail.com", // sender email
    pass: "YOUR_APP_PASSWORD", // use Gmail App Password, not normal password
  },
});

// Generate random 4-digit OTP
function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Send OTP email
async function sendOtpEmail(otp) {
  const mailOptions = {
    from: "dzeyautajay@gmail.com",
    to: "dzeyautajay@gmail.com", // recipient
    subject: "Your Admin OTP Code",
    text: `Your admin verification code is: ${otp}\nIt will expire in 5 minutes.`,
  };
  await transporter.sendMail(mailOptions);
}

exports.sendAdminOtp = functions.https.onCall(async (data, context) => {
  try {
    const otp = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes from now

    await db.collection("adminOtps").add({
      code: otp,
      expiresAt: expiresAt,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await sendOtpEmail(otp);
    return { success: true };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, error: error.message };
  }
});

exports.verifyAdminOtp = functions.https.onCall(async (data, context) => {
  const { code } = data;
  if (!code) {
    return { success: false, error: "Code is required" };
  }

  try {
    const snapshot = await db
      .collection("adminOtps")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) {
      return { success: false, error: "No OTP found" };
    }

    const otpDoc = snapshot.docs[0].data();
    const now = Date.now();

    if (otpDoc.code === code && now <= otpDoc.expiresAt) {
      return { success: true };
    } else {
      return { success: false, error: "Invalid or expired code" };
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { success: false, error: error.message };
  }
});
