import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER, // ✅ sender email or Brevo login email
    pass: process.env.SMTP_PASS, // ✅ your Brevo SMTP key (not password)
  },
});

export default transporter;
