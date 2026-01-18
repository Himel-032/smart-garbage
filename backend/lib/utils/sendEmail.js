import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const sendEmail = async ({to, subject, html}) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: `Smart Garbage: Admin Support <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html,
    });
};