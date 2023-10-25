import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { base } from '../config/base.config';
import { TokenBlacklistService } from '../token-blacklist.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { User } from './user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule.forRoot({
      load: [base],
    }),
    JwtModule.register({
      secret: base().jwtTokenSecret,
      signOptions: { expiresIn: base().jwtTokenExpirationTime },
    }),
  ],

  providers: [UserService, TokenBlacklistService, JwtStrategy, JwtAuthGuard],
  controllers: [UserController],
})
export class UserModule {}
