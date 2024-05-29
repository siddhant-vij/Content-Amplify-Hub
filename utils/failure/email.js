import nodemailer from "nodemailer";

export const sendEmail = async (subject, message) => {
  const recepient = process.env.USER_TO_EMAIL;
  const sender = process.env.USER_FROM_EMAIL;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: sender,
      pass: process.env.USER_PASSWORD,
    },
  });

  const mailOptions = {
    from: sender,
    to: recepient,
    subject: subject,
    text: message,
  };
  await transporter.sendMail(mailOptions);
};
