import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER, // ✅ your Brevo login email
    pass: process.env.SMTP_PASS, // ✅ your Brevo SMTP key
  },
});

export default transporter;
