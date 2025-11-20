import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { OnboardingDto } from './dto/onboarding.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { multerConfig } from 'src/common/utils/multer.config';
import { Multer } from 'multer';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('onboarding')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Complete user onboarding' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'aadhaar', maxCount: 1 },
        { name: 'pan', maxCount: 1 },
        { name: 'selfie', maxCount: 1 },
      ],
      multerConfig,
    ),
  )
  @ApiBody({
    description: 'User onboarding data with file uploads',
    schema: {
      type: 'object',
      properties: {
        fullName: { type: 'string', example: 'John Doe' },
        phoneNumber: { type: 'string', example: '913001234567' },
        country: { type: 'string', example: 'India' },
        aadhaar: { type: 'string', format: 'binary' },
        pan: { type: 'string', format: 'binary' },
        selfie: { type: 'string', format: 'binary' },
      },
    },
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
  async complete(
    @Req() req,
    @Body() dto: OnboardingDto,
    @UploadedFiles()
    files: {
      aadhaar?: Multer.File[];
      pan?: Multer.File[];
      selfie?: Multer.File[];
    },
  ) {
    return this.userService.submitOnboarding(req.user.id, dto, files);
  }
}
