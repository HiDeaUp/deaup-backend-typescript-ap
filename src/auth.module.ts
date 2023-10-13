import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'YOUR_SECRET_KEY', // Use a more secure key and store it in .env
      signOptions: { expiresIn: '1h' },
    }),
    // ... other modules like UserModule
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
