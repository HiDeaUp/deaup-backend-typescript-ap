import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TokenBlacklistService } from '../token-blacklist.service';
import { JwtStrategy } from '../auth/jwt.strategy'; // Import the strategy
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Import the guard

import { User } from './user.entity';

@Module({
  imports: [
    //TypeOrmModule.forRoot(),
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_TOKEN_SECRET,
      signOptions: { expiresIn: process.env.JWT_TOKEN_EXPIRATION_TIME },
    }),
  ],
  providers: [UserService, TokenBlacklistService, JwtStrategy, JwtAuthGuard],
  controllers: [UserController],
})
export class UserModule {}
