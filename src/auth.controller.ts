import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Request,
  Response,
  Delete,
  Headers,
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

    return res.status(HttpStatus.OK).json(user);
  }

  @Post('register')
  async register(@Body() body, @Request() req, @Response() res) {
    try {
      const { user, token } = await this.authService.register(
        body.user,
        req.ip,
      );
      res.setHeader('Authorization', token);

      return res.status(HttpStatus.CREATED).json(user);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        errors: {
          [error.message.split(' ')[0]]: [error.message],
        },
      });
    }
  }

  @Delete('sign-out')
  async logout(@Headers('authorization') token: string, @Request() res) {
    token = token.split('Bearer ')[1]; // Extract the token from the header

    this.authService.logout(token);
    return res.status(HttpStatus.NO_CONTENT).send();
  }
}
