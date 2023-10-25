import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

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

  async validateUserCredentials(
    email: string,
    phone: string,
    password: string,
  ): Promise<any> {
    const user = await this.userRepository.findOne({
      where: [{ email }, { phone }],
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: User) {
    const { email, phone, id } = user;

    const payload = { email, phone, sub: id };

    return {
      access_token: this.jwtService.sign(payload),
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

    const user = this.userRepository.create({
      id,
      email,
      phone,
      password: hashedPassword,
      ip_address: ipAddress,
    });

    await this.userRepository.save(user);

    const payload = { email: user.email, phone: user.phone, sub: user.id };
    const token = this.jwtService.sign(payload);

    return { user, token };
  }

  logout(token: string) {
    this.tokenBlacklistService.addToBlacklist(token);
  }
}
