// functions/index.js
require("dotenv").config();
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

exports.onNewBookingRequested = onDocumentCreated(
    "bookings/{bookingId}", // No secrets config means no SecretManager access
    async (event) => {
      const snap = event.data;
      if (!snap) return;
      const data = snap.data();
      if (data.status !== "requested") return;

      const emailUser = process.env.GMAIL_EMAIL;
      const emailPass = process.env.GMAIL_PASSWORD;
      if (!emailUser || !emailPass) {
        console.error("⚠️ missing in environment");
        return;
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {user: emailUser, pass: emailPass},
      });

      const mailOptions = {
        from: `"Booking App" <${emailUser}>`,
        to: data.consumerEmail,
        subject: `Booking Requested: ${event.params.bookingId}`,
        text: `
            New booking requested!
            ID: ${event.params.bookingId}
            Consumer: ${data.consumerId}
            Seller: ${data.sellerId}
            Amount: ${data.amount}
            Time Slot: ${data.timeSlot}
                `.trim(),
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("✅ Email sent for booking:", event.params.bookingId);
      } catch (err) {
        console.error("❌ Email sending failed:", err);
      }
    },
);
