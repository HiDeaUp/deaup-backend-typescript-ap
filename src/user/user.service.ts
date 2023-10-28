import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { User } from './user.entity'; // Adjust the path
import { TokenBlacklistService } from '../token-blacklist.service';

@Injectable()
export class UserService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly tokenBlacklistService: TokenBlacklistService,
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

  async findUserByJwtToken(jwtToken: string): Promise<User> {
    // Look up the user JWT token
    const user = await this.userRepository.findOne({
      where: { jwt_token: jwtToken },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async login(user: User) {
    const { email, phone, id } = user;

    const payload = { email, phone, sub: id };

    const userJwtToken = this.jwtService.sign(payload);

    this.userRepository.update(id, { jwt_token: userJwtToken });

    return {
      access_token: userJwtToken,
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
      jwt_token: jwtToken,
    });

    await this.userRepository.save(user);

    return { user, jwtToken };
  }

  logout(token: string) {
    this.tokenBlacklistService.addToBlacklist(token);
  }
}
