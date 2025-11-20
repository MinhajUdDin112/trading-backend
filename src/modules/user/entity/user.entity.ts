import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column({ type: 'varchar', length: 6, nullable: true })
  otp: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  otpExpiresAt: Date | null;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  country: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  onboardingCompleted: boolean;

  @Column({ nullable: true })
  aadhaarFile: string;

  @Column({ nullable: true })
  panFile: string;

  @Column({ nullable: true })
  selfieFile: string;
}
