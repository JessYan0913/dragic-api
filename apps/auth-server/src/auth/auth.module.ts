import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { DrizzleModule } from '@dragic/database';
import { MailModule } from '@dragic/mail';

@Module({
  imports: [
    UserModule,
    DrizzleModule,
    MailModule.forRoot({
      host: process.env.SMTP_HOST as string,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER as string,
        pass: process.env.SMTP_PASS as string,
      },
      from: process.env.SMTP_FROM,
    }),
  ],
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