import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendOtp(email: string, otp: string) {
    try {
      const response = await this.resend.emails.send({
        from: process.env.RESEND_FROM || 'no-reply@yourdomain.com',
        to: email,
        subject: 'Your OTP Code',
        html: `<p>Your OTP code is <b>${otp}</b></p>`,
      });

      console.log('Email sent:', response);
      return response;
    } catch (error) {
      console.error('Resend Error:', error);
      throw error;
    }
  }
}
