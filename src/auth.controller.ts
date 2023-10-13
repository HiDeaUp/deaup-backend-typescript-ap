import {
  Controller,
  Post,
  Request,
  Response,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  async login(@Request() req, @Response() res) {
    const user = await this.authService.validateUser(
      req.body.user.email,
      req.body.user.phone,
      req.body.user.password,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    const token = await this.authService.login(user);
    res.setHeader('Authorization', token.access_token);
    return res.status(200).json(user);
  }
}
