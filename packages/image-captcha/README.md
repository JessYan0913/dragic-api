# @dragic/image-captcha

基于 NestJS 的图片验证码库，支持拼图验证码和轨迹验证。

## 安装

```bash
pnpm add @dragic/image-captcha
```

## 在 NestJS 中使用

### 1. 同步配置

```typescript
import { Module } from '@nestjs/common';
import { CaptchaModule } from '@dragic/image-captcha';
import { RedisStorage } from './storage';
import { LocalImageLoader } from './image-loader';

@Module({
  imports: [
    CaptchaModule.register({
      storage: new RedisStorage(),
      imageLoader: new LocalImageLoader('./public/images'),
      secret: 'your-secret-key',
      ttl: 300,
    }),
  ],
})
export class AppModule {}
```

### 2. 异步配置

```typescript
import { Module } from '@nestjs/common';
import { CaptchaModule } from '@dragic/image-captcha';

@Module({
  imports: [
    CaptchaModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        storage: new RedisStorage(configService.get('REDIS_URL')),
        imageLoader: new LocalImageLoader(configService.get('IMAGE_DIR')),
        secret: configService.get('CAPTCHA_SECRET'),
        ttl: configService.get('CAPTCHA_TTL', 300),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### 3. 在服务中使用

```typescript
import { Injectable } from '@nestjs/common';
import { CaptchaService } from '@dragic/image-captcha';

@Injectable()
export class AuthService {
  constructor(private readonly captchaService: CaptchaService) {}

  async createLoginCaptcha() {
    return this.captchaService.createCaptcha({
      purpose: 'login',
      bgWidth: 360,
      bgHeight: 200,
    });
  }

  async verifyCaptcha(verifyData: VerifyTrailPayload) {
    return this.captchaService.verifyCaptcha(verifyData);
  }
}
```

## 直接使用（非 NestJS）

```typescript
import { createCaptchaService, LocalImageLoader } from '@dragic/image-captcha';
import { RedisStorage } from './storage';

const captchaService = createCaptchaService({
  storage: new RedisStorage(),
  imageLoader: new LocalImageLoader('./public/images'),
  secret: 'your-secret-key',
  ttl: 300,
  defaultSize: { width: 300, height: 200 },
  // ... 其他配置
});
```

## API

### CaptchaService

#### createCaptcha(options)
创建验证码

```typescript
const result = await captchaService.createCaptcha({
  purpose: 'login', // 验证码用途
  bgWidth: 360,     // 背景宽度
  bgHeight: 200,    // 背景高度
  width: 60,        // 拼图宽度
  height: 60,       // 拼图高度
});

// 返回: { id: string, bgUrl: string, puzzleUrl: string }
```

#### verifyCaptcha(payload)
验证验证码

```typescript
const result = await captchaService.verifyCaptcha({
  id: 'captcha-id',
  x: 150,              // 最终 x 坐标
  sliderOffsetX: 120,  // 滑块移动距离
  duration: 2000,      // 拖拽时长(ms)
  trail: [[10,10], [20,15], ...], // 轨迹点
});

// 返回: { id: string, token: string }
```

#### verifyToken(id, token, purpose)
验证 token

```typescript
const isValid = await captchaService.verifyToken(
  'captcha-id',
  'verification-token',
  'login'
);
```

## 配置选项

### CaptchaConfig / CaptchaModuleOptions

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| storage | Storage | - | 存储服务 |
| imageLoader | ImageLoader | - | 图片加载器 |
| defaultSize | {width, height} | {300, 200} | 默认尺寸 |
| trailMinLength | number | 10 | 最小轨迹点数 |
| durationMin | number | 100 | 最小拖拽时长(ms) |
| durationMax | number | 10000 | 最大拖拽时长(ms) |
| sliderOffsetMin | number | 5 | 最小滑块偏移 |
| trailTolerance | number | 10 | 轨迹容差 |
| ttl | number | 300 | 验证码有效期(秒) |
| secret | string | - | JWT 密钥 |

## 自定义实现

### Storage 接口

```typescript
interface Storage {
  set(key: string, value: string, ttl?: number): Promise<void>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<void>;
}
```

### ImageLoader 接口

```typescript
interface ImageLoader {
  pickRandomImagePath(): Promise<string>;
}
```

## 许可证

UNLICENSED
