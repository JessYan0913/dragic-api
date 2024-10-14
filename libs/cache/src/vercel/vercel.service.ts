import { Injectable } from '@nestjs/common';
import { kv } from '@vercel/kv';
import { Cache } from '../interfaces/cache.interface';

@Injectable()
export class VercelService implements Cache {
  // 设置缓存
  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (ttl) {
      await kv.set(key, JSON.stringify(value), { ex: ttl });
    } else {
      await kv.set(key, JSON.stringify(value));
    }
  }

  // 获取缓存
  async get<T>(key: string): Promise<T | null> {
    const value = await kv.get(key);
    return value ? JSON.parse(value as string) : null;
  }

  // 删除缓存
  async del(key: string): Promise<void> {
    await kv.del(key);
  }

  // 检查缓存是否存在
  async exists(key: string): Promise<boolean> {
    return (await kv.exists(key)) === 1;
  }
}
