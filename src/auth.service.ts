import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'path_to_prisma_service'; // Adjust the path
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(
    email: string,
    phone: string,
    password: string,
  ): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, phone: user.phone, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
