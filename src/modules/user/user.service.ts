import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { OnboardingDto } from './dto/onboarding.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async submitOnboarding(userId: string, dto: OnboardingDto) {
    let user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    // update fields in User entity
    Object.assign(user, dto);

    // mark onboarding completed
    user.onboardingCompleted = true;

    // save updated user
    await this.userRepo.save(user);

    return {
      success: true,
      message: 'Onboarding completed successfully',
      user,
    };
  }
}
