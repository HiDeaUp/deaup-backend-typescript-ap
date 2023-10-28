import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { base } from '../config/base.config';
import { TokenBlacklistService } from '../token-blacklist.service';
import { JwtStrategy } from './auth/jwt.strategy';

import { User } from './user.entity';
import { Token } from './auth/token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Token]),
    ConfigModule.forRoot({
      load: [base],
      isGlobal: true,
    }),
    JwtModule.register({
      secret: base().jwtTokenSecret,
      signOptions: { expiresIn: base().jwtTokenExpirationTime },
    }),
  ],

  providers: [UserService, TokenBlacklistService, JwtStrategy],
  controllers: [UserController],
})
export class UserModule {}
