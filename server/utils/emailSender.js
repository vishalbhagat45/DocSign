// utils/emailSender.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendSignedPdfEmail = async ({ to, subject, text, attachmentPath }) => {
  try {
    await transporter.sendMail({
      from: `"DocuSign Clone" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      attachments: [
        {
          filename: "SignedDocument.pdf",
          path: attachmentPath,
        },
      ],
    });
    console.log(" Email sent successfully");
  } catch (error) {
    console.error(" Failed to send email:", error);
    throw error;
  }
};
