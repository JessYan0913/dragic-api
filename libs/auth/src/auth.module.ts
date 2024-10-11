import { DynamicModule, Module, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({})
export class AuthModule {
  static forRoot(userService: Provider): DynamicModule {
    return {
      global: true,
      module: AuthModule,
      imports: [
        PassportModule,
        JwtModule.register({ global: true, secret: 'secret', signOptions: { expiresIn: '1h' } }),
      ],
      providers: [userService, AuthService, LocalStrategy, JwtStrategy],
      exports: [AuthService],
    };
  }
}
