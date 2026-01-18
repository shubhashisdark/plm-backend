import nodemailer from "nodemailer";
import config from "../config/env.config.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"${config.email.fromName}" <${config.email.user}>`,
    to,
    subject,
    html,
  });
};
