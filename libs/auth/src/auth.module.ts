import { DynamicModule, Module, Type } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import authConfiguration from './configs/auth.configuration';
import { JWTAuthGuard } from './guards/jwt-auth.guard';
import { ResourceAuthGuard } from './guards/resource-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

export interface ForRootOptions {
  jwt: {
    secret: string;
    signOptions: JwtSignOptions;
  };
  enableJwtGuard: boolean;
  enableResourceGuard: boolean;
  userService: Type;
}

@Module({})
export class AuthModule {
  static forRoot({ userService, enableJwtGuard, enableResourceGuard, jwt }: ForRootOptions): DynamicModule {
    return {
      global: true,
      module: AuthModule,
      imports: [
        ConfigModule.forRoot({ load: [authConfiguration] }),
        PassportModule,
        JwtModule.register({
          global: true,
          secret: jwt.secret,
          signOptions: jwt.signOptions,
        }),
      ],
      providers: [
        AuthService,
        LocalStrategy,
        JwtStrategy,
        { provide: 'UserService', useClass: userService },
        ...(enableJwtGuard ? [{ provide: APP_GUARD, useClass: JWTAuthGuard }] : []),
        ...(enableResourceGuard ? [{ provide: APP_GUARD, useClass: ResourceAuthGuard }] : []),
      ],
      exports: [AuthService],
    };
  }
}
