import { Injectable } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY is missing');
    }
    sgMail.setApiKey(apiKey);
  }

  async sendOtp(email: string, otp: string) {
    try {
      const msg = {
        to: email,
        from: process.env.SENDGRID_FROM || 'no-reply@yourdomain.com',
        subject: 'Your OTP Code',
        html: `<p>Your OTP code is <b>${otp}</b></p>`,
      };

      const response = await sgMail.send(msg);
      return response;
    } catch (error) {
      console.error('SendGrid Error:', error.response?.body || error);
      throw error;
    }
  }
}
