import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { User } from './user.entity';
import { TokenBlacklistService } from './token-blacklist.service';
import { Token } from 'src/user/auth/token.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tokenBlacklistService: TokenBlacklistService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  async validateUserCredentials({
    email,
    phone,
    password,
  }: {
    email?: string;
    phone?: string;
    password: string;
  }): Promise<any> {
    const user = await this.userRepository.findOne({
      where: [{ email }, { phone }],
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { ...result } = user;
      return result;
    }

    return null;
  }

  async findUserByToken(jwtToken: string): Promise<User> {
    // Find the token in the database
    const userToken = await this.tokenRepository.findOne({
      where: { token: jwtToken },
      relations: ['user'],
    });

    // If the token is not found, throw an exception
    if (!userToken) {
      throw new UnauthorizedException();
    }

    // If the token is found, find the user by the token
    const user = await this.userRepository.findOne({
      where: { id: userToken.user.id },
    });

    // If the user is not found, throw an exception
    if (!user) {
      throw new UnauthorizedException();
    }

    // If the user is found, return the user
    return user;
  }

  async login(user: User) {
    const { email, phone, id } = user;
    let jwtToken;

    // only if the user's JWT token doesn't exist for this user, generate a new jwt token and store it into the database
    const existingToken = await this.tokenRepository.findOne({
      where: { user },
    });

    if (existingToken) {
      jwtToken = existingToken.token;
    } else {
      const payload = { email, phone, sub: id };
      jwtToken = this.jwtService.sign(payload);

      await this.tokenRepository.save({
        token: jwtToken,
        user,
      });
    }

    return {
      access_token: jwtToken,
    };
  }

  async signUp(userDto: any, ipAddress: string) {
    const { email, phone, password } = userDto;

    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { phone }],
    });

    if (existingUser) {
      const field = existingUser.email ? 'email' : 'phone';

      throw new Error(`${field} has already been taken`);
    }

    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 16);
    const jwtToken = this.jwtService.sign({ email, phone, sub: id });

    const user = this.userRepository.create({
      id,
      email,
      phone,
      password: hashedPassword,
      ip_address: ipAddress,
    });

    await Promise.all([
      this.userRepository.save(user),
      this.tokenRepository.save({
        token: jwtToken,
        user,
      }),
    ]);

    return { user, jwtToken };
  }

  logout(token: string) {
    this.tokenBlacklistService.addToBlacklist(token);
  }
}
