import { DynamicModule, Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';

export type RateLimitModuleOptions = ThrottlerModuleOptions;

@Global()
@Module({})
export class RateLimitModule {
  static forRoot(options: RateLimitModuleOptions): DynamicModule {
    return {
      global: true,
      module: RateLimitModule,
      imports: [ThrottlerModule.forRoot(options)],
      providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
      exports: [ThrottlerModule],
    };
  }
}
