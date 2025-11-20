import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        ciphers: 'TLSv1.2',
        rejectUnauthorized: false, // required for Render sometimes
      },
      connectionTimeout: 15000, // optional, 15s
    });
  }

  async sendOtp(email: string, otp: string) {
    await this.transporter.sendMail({
      from: `OTP Service <${process.env.SMTP_FROM}>`,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
      html: `<p>Your OTP code is <b>${otp}</b></p>`,
    });
  }
}
