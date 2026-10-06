import nodemailer from 'nodemailer';
import { logger } from '../config/logger';

// If credentials are not provided, we will just log the email contents to the console
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    if (!process.env.SMTP_USER) {
      logger.info(`[MOCK EMAIL] To: ${to} | Subject: ${subject} | Text: ${text}`);
      return;
    }

    await transporter.sendMail({
      from: `"SIIMS Notifications" <no-reply@siims.io>`,
      to,
      subject,
      text,
    });
    logger.info(`Email sent to ${to}`);
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
  }
};
