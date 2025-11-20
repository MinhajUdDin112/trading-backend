import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { Repository } from 'typeorm';
import { MailService } from 'src/common/utils/mail.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SendOtpDto } from './dto/sendotp.dto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly mailerService: MailService,
  ) {}

  generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(dto: SendOtpDto) {
    const { email } = dto;

    console.log('Sending OTP to email:', email);

    let user = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      user = this.userRepo.create({ email });
    }

    const otp = this.generateOtp();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await this.userRepo.save(user);

    await this.mailerService.sendOtp(email, otp);

    return { message: 'OTP sent successfully', email };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const { email, otp } = dto;

    const user = await this.userRepo.findOne({ where: { email } });

    if (!user) throw new NotFoundException('User not found');

    if (!user.otp || !user.otpExpiresAt)
      throw new BadRequestException('OTP not requested');

    if (user.otp !== otp) throw new BadRequestException('Invalid OTP');

    if (user.otpExpiresAt < new Date())
      throw new BadRequestException('OTP expired');

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;

    const updatedUsr = await this.userRepo.save(user);

    // create verification token
    const token = jwt.sign(
      { email: user.email, id: user.id },
      process.env.JWT_SECRET || 'secretKey',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7h' } as jwt.SignOptions,
    );

    return { message: 'OTP verified successfully', user: updatedUsr, token };
  }
}
