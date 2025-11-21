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
import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly mailerService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async register(email: string, password: string) {
    const exists = await this.userRepo.findOne({ where: { email } });

    if (exists) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepo.create({
      email,
      password: hashedPassword,
      isVerified: true, // since email/password register does not use otp
    });

    await this.userRepo.save(user);

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
    });

    return {
      message: 'Registration successful',
      user,
      token,
    };
  }

  // ================================
  // LOGIN USER
  // ================================
  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.password) {
      throw new BadRequestException(
        'This user is registered via OTP login, not password login',
      );
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new BadRequestException('Incorrect password');
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
    });

    return {
      message: 'Login successful',
      user,
      token,
    };
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
