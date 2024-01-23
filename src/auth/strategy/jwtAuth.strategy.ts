import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import 'dotenv/config';
import { VerifyCallback } from '../utils/verifyCallback';
import { UsersRepository } from '../../users/users.repository';
import { Request } from 'express';
import { JWT, Payload } from '../utils/jwt.type';

export const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    return req.cookies['utk'];
  }

  return null;
};

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, JWT) {
  constructor(private readonly usersRepository: UsersRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: Payload, done: VerifyCallback) {
    const user = await this.usersRepository.findById(payload.id);

    if (!user) {
      return done(new UnauthorizedException(), null);
    }
    return done(null, user);
  }
}

// @Injectable()
// export class JwtAuthStrategy extends PassportStrategy(Strategy, 'google') {
//   constructor(private readonly usersRepository: UsersRepository) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       secretOrKey: process.env.JWT_SECRET,
//     });
//   }

//   async validate(payload: any, done: Function) {
//     const user = await this.usersRepository.findById(payload.id);

//     if (!user) {
//       return done(new UnauthorizedException(), null);
//     }

//     return done(null, user);
//   }
// }