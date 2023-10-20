import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { User } from './user.entity';
import { TokenBlacklistService } from './token-blacklist.service';

@Module({
  imports: [
    //TypeOrmModule.forRoot(),
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: 'YOUR_SECRET_KEY', // Use a more secure key and store it in .env
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, TokenBlacklistService],
  controllers: [AuthController],
})
export class AuthModule {}
