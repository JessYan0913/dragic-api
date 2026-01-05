# Captcha Guard 使用说明

## 概述

Captcha Guard 用于验证请求头中是否带有合法的 captcha token，适用于需要人机验证的接口。

## 使用方法

### 1. 基本使用

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { CaptchaGuard, CaptchaPurpose } from '@dragic/image-captcha';

@Controller('protected')
export class ProtectedController {
  
  @Get()
  @UseGuards(CaptchaGuard)
  @CaptchaPurpose('login')
  async protectedEndpoint() {
    return { message: 'This endpoint requires captcha verification' };
  }
}
```

### 2. 全局配置

```typescript
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CaptchaGuard } from '@dragic/image-captcha';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useFactory: (captchaService, reflector) => {
        return new CaptchaGuard(captchaService, reflector, {
          headerName: 'x-custom-captcha-token', // 自定义请求头名称
          defaultPurpose: 'global' // 默认用途
        });
      },
      inject: [ImageCaptchaService, Reflector],
    },
  ],
})
export class AppModule {}
```

### 3. 请求头格式

客户端需要在请求中包含以下头部：

```
# 方式1：请求头（手动设置）
x-captcha-id: captcha_id_from_verification
x-captcha-token: jwt_token_from_verification

# 方式2：Cookie（自动携带）
# 验证成功后自动设置，浏览器会自动携带
```

### 4. 验证流程

1. 客户端调用验证码创建接口获取验证码图片
2. 客户端完成验证码验证，获得 captcha ID 和 JWT token
3. **验证成功后，token 自动设置到 Cookie 中**
4. 客户端在后续需要验证的接口请求中，**浏览器自动携带 Cookie**
5. Guard 优先检查请求头，其次检查 Cookie 中的 token
6. 验证通过则允许访问，否则返回 401 错误

## 异常类型

- `CaptchaTokenMissingException`: 缺少 captcha token
- `CaptchaTokenInvalidException`: token 无效
- `CaptchaTokenExpiredException`: token 已过期

## 配置选项

```typescript
interface CaptchaGuardOptions {
  headerName?: string;        // 自定义 token 请求头名称，默认 'x-captcha-token'
  cookieName?: string;        // 自定义 Cookie 名称，默认 'captcha_token'
  defaultPurpose?: string;    // 默认验证码用途，默认 'default'
}
```

### 6. Cookie 配置

验证成功后自动设置的 Cookie 配置：

```typescript
response.cookie('captcha_token', result.token, {
  httpOnly: false,           // 允许前端访问
  secure: process.env.NODE_ENV === 'production', // 生产环境使用 HTTPS
  sameSite: 'lax',           // CSRF 防护
  maxAge: 5 * 60 * 1000,     // 5分钟过期
});
```