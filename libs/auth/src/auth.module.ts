import { DynamicModule, Module, Type } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JWTAuthGuard } from './guards/jwt-auth.guard';
import { ResourceAuthGuard } from './guards/resource-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { OAuthStrategy } from './strategies/oauth.strategy';
import { OAuthService, OAuthProvidersConfig } from './oauth/oauth.service';
import { UserService } from './interfaces/user.interface';

export interface ForRootOptions {
  jwt: {
    secret: string;
    signOptions: JwtSignOptions;
  };
  enableJwtGuard: boolean;
  enableResourceGuard: boolean;
  userService: Type;
  oauth?: OAuthProvidersConfig;
}

@Module({})
export class AuthModule {
  static forRoot({ userService, enableJwtGuard, enableResourceGuard, jwt, oauth }: ForRootOptions): DynamicModule {
    const providers = [
      AuthService,
      LocalStrategy,
      {
        provide: JwtStrategy,
        useFactory: () => new JwtStrategy(jwt.secret),
      },
      { provide: 'UserService', useClass: userService },
    ];

    // 如果配置了 OAuth，添加相关服务
    if (oauth) {
      providers.push(
        {
          provide: OAuthService,
          useFactory: () => new OAuthService(oauth),
        } as any,
        {
          provide: OAuthStrategy,
          useFactory: (oauthService: OAuthService, userService: UserService) => new OAuthStrategy(oauthService, userService),
          inject: [OAuthService, 'UserService'],
        } as any,
      );
    }

    const guards = [
      ...(enableJwtGuard ? [{ provide: APP_GUARD, useClass: JWTAuthGuard }] : []),
      ...(enableResourceGuard ? [{ provide: APP_GUARD, useClass: ResourceAuthGuard }] : []),
    ];

    return {
      global: true,
      module: AuthModule,
      imports: [
        PassportModule,
        JwtModule.register({
          global: true,
          secret: jwt.secret,
          signOptions: jwt.signOptions,
        }),
      ],
      providers: [...providers, ...guards],
      exports: [AuthService, ...(oauth ? [OAuthService] : [])],
    };
  }
}
