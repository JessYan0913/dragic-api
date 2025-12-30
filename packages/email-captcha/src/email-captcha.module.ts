import { Module, DynamicModule } from '@nestjs/common';
import { EmailCaptchaService } from './email-captcha.service';
import { EmailCaptchaConfig } from './types';
import { MailModule } from '@dragic/mail';

export interface EmailCaptchaModuleOptions {
  storage: {
    set(key: string, value: string, ttl: number): Promise<void>;
    get(key: string): Promise<string | null>;
    del(key: string): Promise<void>;
  };
  codeLength?: number;
  ttl?: number;
  secret?: string;
  enableMail?: boolean;
}

@Module({})
export class EmailCaptchaModule {
  static register(options: EmailCaptchaModuleOptions): DynamicModule {
    const emailCaptchaConfig: EmailCaptchaConfig = {
      storage: options.storage,
      codeLength: options.codeLength || 6,
      ttl: options.ttl || 300,
      secret: options.secret || 'default-secret-change-in-production',
    };

    const imports = [];
    if (options.enableMail) {
      imports.push(MailModule);
    }

    return {
      module: EmailCaptchaModule,
      imports,
      providers: [
        {
          provide: EmailCaptchaService,
          useFactory: (mailService?: any) => new EmailCaptchaService(emailCaptchaConfig, mailService),
          inject: options.enableMail ? ['MailService'] : [],
        },
      ],
      exports: [EmailCaptchaService],
      global: true,
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<EmailCaptchaModuleOptions> | EmailCaptchaModuleOptions;
    inject?: any[];
  }): DynamicModule {
    return {
      module: EmailCaptchaModule,
      imports: [],
      providers: [
        {
          provide: EmailCaptchaService,
          useFactory: async (...args: any[]) => {
            const emailCaptchaOptions = await options.useFactory(...args);
            const emailCaptchaConfig: EmailCaptchaConfig = {
              storage: emailCaptchaOptions.storage,
              codeLength: emailCaptchaOptions.codeLength || 6,
              ttl: emailCaptchaOptions.ttl || 300,
              secret: emailCaptchaOptions.secret || 'default-secret-change-in-production',
            };
            
            // 注意：在异步模式下，邮件服务需要手动提供
            return new EmailCaptchaService(emailCaptchaConfig);
          },
          inject: options.inject || [],
        },
      ],
      exports: [EmailCaptchaService],
      global: true,
    };
  }
}