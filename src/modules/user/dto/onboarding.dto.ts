import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OnboardingDto {
  @ApiProperty({
    example: 'john doe',
    description: 'Full name of the user',
  })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({
    example: '913001234567',
    description: 'Phone number of the user',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    example: 'India',
    required: false,
    description: 'Country of the user',
  })
  @IsOptional()
  country?: string;
}
