import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { DrizzleModule } from '@dragic/database';
import { MailModule } from '@dragic/mail';

@Module({
  imports: [UserModule, DrizzleModule, MailModule],
  controllers: [AuthController],
  providers: [
    {
      provide: 'LocalAuthService',
      useClass: AuthService,
    },
  ],
  exports: ['LocalAuthService'],
})
export class AuthModule {}