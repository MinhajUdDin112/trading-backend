import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { OnboardingDto } from './dto/onboarding.dto';
import { Multer } from 'multer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async submitOnboarding(
    userId: string,
    dto: OnboardingDto,
    files: {
      aadhaar?: Multer.File[];
      pan?: Multer.File[];
      selfie?: Multer.File[];
    },
  ) {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    const baseUrl = `${process.env.BACKEND_URL}/uploads`;

    // Store full URLs instead of only filename
    if (files.aadhaar?.[0]) {
      user.aadhaarFile = `${baseUrl}/${files.aadhaar[0].filename}`;
    }

    if (files.pan?.[0]) {
      user.panFile = `${baseUrl}/${files.pan[0].filename}`;
    }

    if (files.selfie?.[0]) {
      user.selfieFile = `${baseUrl}/${files.selfie[0].filename}`;
    }

    // Update fields
    Object.assign(user, dto);

    user.onboardingCompleted = true;

    await this.userRepo.save(user);

    return {
      success: true,
      message: 'Onboarding completed successfully',
      user,
    };
  }
}
