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
  UseGuards,
} from '@nestjs/common';

import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('sign-in')
  async login(@Body() body, @Response() res) {
    const user = await this.userService.validateUserCredentials(
      body.user.email,
      body.user.phone,
      body.user.password,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    const token = await this.userService.login(user);
    res.setHeader('Authorization', token.access_token);

    return res.status(HttpStatus.OK).json(user);
  }

  @Post('sign-up')
  async signUp(@Body() body, @Request() req, @Response() res) {
    try {
      const { user, token } = await this.userService.signUp(body.user, req.ip);
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

  @UseGuards(JwtAuthGuard) // Protect this endpoint with JWTAuthGuard
  @Post('check-token')
  async checkToken(@Body() body, @Response() res) {
    // Check if the token is still valid (usually, it's valid if it hasn't expired)
    // You may also implement token revocation logic here if needed

    if (body.user) {
      return res.status(HttpStatus.OK).json({
        id: body.user.id,
        email: body.user.email,
        phone: body.user.phone,
      });
    }

    // If the token has expired or is otherwise invalid
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ error: 'Signature has expired' });
  }

  @Delete('sign-out')
  async logout(@Headers('authorization') token: string, @Response() res) {
    token = token.split('Bearer ')[1]; // Extract the token from the header

    this.userService.logout(token);
    return res.status(HttpStatus.NO_CONTENT).send();
  }
}
