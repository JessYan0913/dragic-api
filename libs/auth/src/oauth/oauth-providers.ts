import { Injectable } from '@nestjs/common';
import { OAuthProvider, OAuthUserProfile } from '../interfaces/user.interface';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
  scope?: string;
  [key: string]: any;
}

export interface OAuthAccessToken {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  [key: string]: any;
}

export abstract class BaseOAuthProvider {
  constructor(protected readonly config: OAuthConfig) {}

  abstract getProviderName(): OAuthProvider;
  
  abstract getAuthorizationUrl(state?: string): string;
  
  abstract exchangeCodeForToken(code: string): Promise<OAuthAccessToken>;
  
  abstract getUserInfo(accessToken: string, extra?: string): Promise<OAuthUserProfile>;
  
  abstract refreshToken(refreshToken: string): Promise<OAuthAccessToken>;
}

@Injectable()
export class FeishuOAuthProvider extends BaseOAuthProvider {
  getProviderName(): OAuthProvider {
    return 'feishu';
  }

  getAuthorizationUrl(state?: string): string {
    const baseUrl = 'https://open.feishu.cn/open-apis/authen/v1/authorize';
    const params = new URLSearchParams({
      app_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scope || 'contact:base',
      state: state || '',
    });
    return `${baseUrl}?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<OAuthAccessToken> {
    const response = await fetch('https://open.feishu.cn/open-apis/authen/v1/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code: code,
        redirect_uri: this.config.redirectUri,
      }),
    });

    const data = await response.json();
    if (data.code !== 0) {
      throw new Error(`Feishu OAuth error: ${data.msg}`);
    }

    return {
      access_token: data.data.access_token,
      refresh_token: data.data.refresh_token,
      expires_in: data.data.expires_in,
      scope: data.data.scope,
    };
  }

  async getUserInfo(accessToken: string, _extra?: string): Promise<OAuthUserProfile> {
    const response = await fetch('https://open.feishu.cn/open-apis/authen/v1/user_info', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    if (data.code !== 0) {
      throw new Error(`Feishu user info error: ${data.msg}`);
    }

    const user = data.data;
    return {
      provider: 'feishu',
      providerUserId: user.user_id,
      unionId: user.union_id,
      openId: user.open_id,
      name: user.name,
      avatarUrl: user.avatar_url,
      email: user.email,
      phone: user.mobile,
      raw: user,
    };
  }

  async refreshToken(refreshToken: string): Promise<OAuthAccessToken> {
    const response = await fetch('https://open.feishu.cn/open-apis/authen/v1/refresh_access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();
    if (data.code !== 0) {
      throw new Error(`Feishu refresh token error: ${data.msg}`);
    }

    return {
      access_token: data.data.access_token,
      refresh_token: data.data.refresh_token,
      expires_in: data.data.expires_in,
    };
  }
}
