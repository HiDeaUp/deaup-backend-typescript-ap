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
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('sign-in')
  async login(@Body() body, @Response() res): Promise<any> {
    const { email, phone, password } = body.user;

    /**
     * Validates the user credentials.
     *
     * @param {string} email - The user's email.
     * @param {string} phone - The user's phone number.
     * @param {string} password - The user's password.
     * @returns {Promise<User>} - The validated user object.
     */
    const user = await this.userService.validateUserCredentials({
      email,
      phone,
      password,
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const token = await this.userService.login(user);
    res.setHeader('Authorization', token.access_token);

    return res.status(HttpStatus.OK).json(user);
  }

  @Post('sign-up')
  async signUp(@Body() body, @Request() req, @Response() res): Promise<any> {
    try {
      const { user, jwtToken } = await this.userService.signUp(
        body.user,
        req.ip,
      );
      res.setHeader('Authorization', jwtToken);

      return res.status(HttpStatus.CREATED).json(user);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        errors: {
          [error.message.split(' ')[0]]: [error.message],
        },
      });
    }
  }

  @UseGuards(JwtAuthGuard) // Protect this endpoint with JWTAuthGuard
  @Post('check-token')
  async checkToken(@Request() req: any): Promise<any> {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException({ error: 'Signature has expired' });
    }

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  @Delete('sign-out')
  async logout(
    @Headers('authorization') token: string,
    @Response() res,
  ): Promise<any> {
    token = token.split('Bearer ')[1]; // Extract the token from the header

    this.userService.logout(token);
    return res.status(HttpStatus.NO_CONTENT).send(); // `return` is optional here
  }
}
