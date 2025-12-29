import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Request } from 'express';
import { OAuthService } from '../oauth/oauth.service';
import { UserService, OAuthUserProfile } from '../interfaces/user.interface';

@Injectable()
export class OAuthStrategy extends PassportStrategy(Strategy, 'oauth') {
  constructor(
    private readonly oauthService: OAuthService,
    @Inject('UserService') private readonly userService: UserService,
  ) {
    super({
      usernameField: 'provider',
      passwordField: 'code',
    });
  }

  async validate(provider: string, code: string): Promise<any> {
    if (!provider || !code) {
      throw new Error('Missing provider or code in OAuth request');
    }

    try {
      // 交换访问令牌
      const tokenResponse = await this.oauthService.exchangeCodeForToken(provider as any, code);
      
      // 获取用户信息
      const userProfile = await this.oauthService.getUserInfo(provider as any, tokenResponse.access_token);
      
      // 查找或创建用户
      const user = await this.userService.findOrCreateByOAuth(userProfile);
      
      return {
        ...user,
        oauthProfile: userProfile,
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
      };
    } catch (error) {
      throw new Error(`OAuth authentication failed: ${error.message}`);
    }
  }
}
