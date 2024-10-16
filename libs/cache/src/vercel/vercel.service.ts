import { Injectable } from '@nestjs/common';
import { createClient, VercelKV } from '@vercel/kv';
import { Cache } from '../interfaces/cache.interface';

@Injectable()
export class VercelService implements Cache {
  private readonly kv: VercelKV;

  constructor(
    private readonly config: {
      token: string;
      url: string;
    },
  ) {
    this.kv = createClient(this.config);
  }

  // 设置缓存
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (ttl) {
      await this.kv.set<T>(key, value, { ex: ttl });
    } else {
      await this.kv.set<T>(key, value);
    }
  }

  // 获取缓存
  async get<T>(key: string): Promise<T | null> {
    return await this.kv.get<T>(key);
  }

  // 删除缓存
  async del(key: string): Promise<void> {
    await this.kv.del(key);
  }

  // 检查缓存是否存在
  async exists(key: string): Promise<boolean> {
    return (await this.kv.exists(key)) === 1;
  }
}
