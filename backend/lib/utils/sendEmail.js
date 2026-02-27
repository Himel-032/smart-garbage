// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';

// dotenv.config();

// export const sendEmail = async ({to, subject, html}) => {
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: process.env.GMAIL_USER,
//             pass: process.env.GMAIL_PASS,
//         },
//     });

//     await transporter.sendMail({
//         from: `Smart Garbage: Admin Support <${process.env.GMAIL_USER}>`,
//         to,
//         subject,
//         html,
//     });
// };

import sgMail from "@sendgrid/mail";
import dotenv from 'dotenv';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const msg = {
      to,
      from: process.env.GMAIL_USER, // must match verified sender
      subject,
      html,
    };

    const response = await sgMail.send(msg);
    console.log("Email sent:", response[0].statusCode);
  } catch (error) {
    console.error("SendGrid error:", error.response?.body || error);
  }
};