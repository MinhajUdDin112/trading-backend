import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { OnboardingDto } from './dto/onboarding.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('onboarding')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Complete user onboarding' })
  @ApiBody({
    type: OnboardingDto,
    description: 'User onboarding details',
  })
  @ApiResponse({
    status: 200,
    description: 'Onboarding completed successfully',
    schema: {
      example: {
        success: true,
        message: 'Onboarding completed',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async complete(@Req() req, @Body() dto: OnboardingDto) {
    return this.userService.submitOnboarding(req.user.id, dto);
  }
}
