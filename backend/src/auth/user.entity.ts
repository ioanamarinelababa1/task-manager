import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({ example: 1, description: 'Unique user identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'user@example.com', description: 'User email address (unique)' })
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @ApiProperty({ example: '2026-04-17T10:00:00.000Z', description: 'Timestamp when the account was created' })
  @CreateDateColumn()
  createdAt: Date;
}
