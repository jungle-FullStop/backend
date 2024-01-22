import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entity/user.entity';
import { AuthUserDto, LoginResultDto, OAuthLoginDto } from './dto/auth.dto';
import { Request } from 'express';
import { cookieExtractor } from './strategy/jwtAuth.strategy';
import { SocialType } from 'src/users/entity/socialType';
import { GET_GOOGLE_PROFILE_URL, GOOGLE_OAUTH_URL } from './utils/auth.constant';
import { v4 as uuidv4 } from 'uuid';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authRepository: AuthRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async login(oAuthLoginDto: OAuthLoginDto): Promise<LoginResultDto> {
    const googleAccessToken = await this.getToken(oAuthLoginDto);
    const profile = await this.getUserProfile(googleAccessToken);

    let user = await this.usersRepository.findBySocialIdAndSocialType(
      profile.id,
      oAuthLoginDto.socialType,
    );

    if (!user) {
      user = await this.signUp(profile, oAuthLoginDto.socialType);
    }

    const accessKey = uuidv4();
    this.authRepository.setRefreshToken(accessKey);

    const accessToken = this.jwtService.sign({
      id: user.id,
      nickname: user.nickname,
      accessKey,
    });

    return {
      userId: user.id,
      token: accessToken,
    };
  }

  async signUp(user: AuthUserDto, socialType: SocialType): Promise<User> {
    return await this.usersRepository.createUser(user, socialType);
  }

  private async getToken(oAuthLoginDto: OAuthLoginDto) {
    const response = await fetch(GOOGLE_OAUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: this.makeGoogleOauthParam(null, oAuthLoginDto),
    });

    if (response.status !== 200) {
      throw new UnauthorizedException('유효하지 않은 인가 코드입니다.');
    }

    const data = await response.json();
    return data.access_token;
  }

  async refreshAccessToken(req: Request) {
    const userJwt = cookieExtractor(req);
    const payload = this.jwtService.decode(userJwt);
    const refreshToken = await this.authRepository.getRefreshToken(payload.accessKey);

    if (refreshToken) {
      return this.jwtService.sign({
        id: payload.id,
        nickname: payload.nickname,
        accessKey: payload.accessKey,
      });
    } else {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }
  }

  removeRefreshToken(req: Request) {
    const userJwt = cookieExtractor(req);
    this.authRepository.removeRefreshToken(userJwt);
  }

  private async getUserProfile(accessToken: string) {
    const response = await fetch(GET_GOOGLE_PROFILE_URL, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    });

    if (response.status === 401) {
      throw new UnauthorizedException('유효하지 않은 accessToken입니다.');
    } else if (response.status === 403) {
      throw new ForbiddenException('데이터 호출 권한이 없습니다.');
    } else if (response.status !== 200) {
      throw new InternalServerErrorException('Naver 서버 에러입니다.');
    }

    const data = await response.json();
    return data.response as AuthUserDto;
  }

  private makeGoogleOauthParam(refreshToken: string, dto: OAuthLoginDto = null): URLSearchParams {
    const params = new URLSearchParams();
    params.append('client_id', process.env.GOOGLE_CLIENT_ID);
    params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET);

    if (!refreshToken) {
      params.append('grant_type', 'authorization_code');
      params.append('code', dto.code);
      params.append('state', dto.state);
    } else {
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', refreshToken);
    }
    return params;
  }
}