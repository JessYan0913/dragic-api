import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import authConfiguration from './configs/auth.configuration';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({})
export class AuthModule {
  static forRoot(userService: Provider): DynamicModule {
    return {
      global: true,
      module: AuthModule,
      imports: [
        ConfigModule.forRoot({ load: [authConfiguration] }),
        PassportModule,
        JwtModule.register({
          global: true,
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
        }),
      ],
      providers: [userService, AuthService, LocalStrategy, JwtStrategy],
      exports: [AuthService],
    };
  }
}
