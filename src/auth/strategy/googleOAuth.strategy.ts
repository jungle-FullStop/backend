// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy, VerifyCallback } from 'passport-google-oauth20';
// import { AuthService } from '../auth.service';

// @Injectable()
// export class GoogleOAuthStrategy extends PassportStrategy(Strategy, 'google') {
//   constructor(private readonly authService: AuthService) {
//     super({
//       clientID: '998666507743-8fe6chebijnoabeeql68cat66bbit1vj.apps.googleusercontent.com',
//       clientSecret: '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',
//       callbackURL: 'http://localhost:3000/auth/google',
//       passReqToCallback: true,
//       scope: ['profile', 'email'],
//     });
//   }

//   async validate(
//     request: any,
//     accessToken: string,
//     refreshToken: string,
//     profile: any,
//     done: VerifyCallback,
//   ) {
//     // 여기에서 구글 OAuth에서 반환한 정보를 사용하여 사용자를 찾거나 생성합니다.
//     const user = await this.authService.findOrCreateGoogleUser(profile);

//     if (!user) {
//       return done(new UnauthorizedException(), null);
//     }

//     return done(null, user);
//   }
// }