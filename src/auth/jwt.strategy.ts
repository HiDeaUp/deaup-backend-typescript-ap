import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserService } from '../user/user.service';

import { base } from 'src/config/base.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: base().jwtTokenSecret,
    });
  }

  async validate(payload: any, done: (err: Error | null, user: any) => void) {
    try {
      const token = ExtractJwt.fromAuthHeaderAsBearerToken();
      const user = await this.userService.findUserByJwtToken(token);
      done(null, user);
    } catch (err) {
      done(err, false);
    }
  }
}
