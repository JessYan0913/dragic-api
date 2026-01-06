import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DrizzleService, cacheTable } from '@dragic/database';
import { eq, and, gt, lt, sql } from 'drizzle-orm';
import { Cache } from '../interfaces/cache.interface';

@Injectable()
export class PostgresService implements Cache, OnModuleInit, OnModuleDestroy {
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly CLEANUP_INTERVAL_MS: number;

  constructor(
    private readonly drizzle: DrizzleService,
    config?: { cleanupIntervalMs?: number }
  ) {
    this.CLEANUP_INTERVAL_MS = config?.cleanupIntervalMs || 5 * 60 * 1000; // 默认 5 分钟
  }

  async onModuleInit() {
    // 启动定时清理过期缓存
    this.startCleanupTimer();
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const payload = JSON.stringify(value);
    
    // 清理已存在的相同 key
    await this.drizzle.db.delete(cacheTable).where(eq(cacheTable.key, key));
    
    // 插入新记录
    await this.drizzle.db.insert(cacheTable).values({
      key,
      value: payload,
      ttl: ttl || null,
      createdAt: new Date(),
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const cache = await this.drizzle.db
      .select()
      .from(cacheTable)
      .where(eq(cacheTable.key, key))
      .limit(1);

    if (cache.length === 0) {
      return null;
    }

    const cacheItem = cache[0];

    // 检查是否过期
    if (this.isExpired(cacheItem)) {
      await this.del(key);
      return null;
    }

    try {
      return JSON.parse(cacheItem.value) as T;
    } catch {
      return cacheItem.value as unknown as T;
    }
  }

  async del(key: string): Promise<void> {
    await this.drizzle.db.delete(cacheTable).where(eq(cacheTable.key, key));
  }

  async exists(key: string): Promise<boolean> {
    const cache = await this.drizzle.db
      .select()
      .from(cacheTable)
      .where(eq(cacheTable.key, key))
      .limit(1);

    if (cache.length === 0) {
      return false;
    }

    // 检查是否过期
    if (this.isExpired(cache[0])) {
      await this.del(key);
      return false;
    }

    return true;
  }

  // 清理过期缓存的方法
  async cleanupExpired(): Promise<void> {
    try {
      // 使用 SQL 表达式进行精确的过期检查
      // 创建时间 + TTL 秒数 < 当前时间戳
      await this.drizzle.db
        .delete(cacheTable)
        .where(
          and(
            gt(cacheTable.ttl, 0),
            sql`EXTRACT(EPOCH FROM ${cacheTable.createdAt}) + ${cacheTable.ttl} < EXTRACT(EPOCH FROM NOW())`
          )
        );
      
      console.log('[PostgresService] Cleaned up expired cache entries');
    } catch (error) {
      console.error('[PostgresService] Error cleaning up expired cache:', error);
    }
  }

  private startCleanupTimer(): void {
    // 立即执行一次清理
    this.cleanupExpired();
    
    // 设置定时器
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, this.CLEANUP_INTERVAL_MS);
    
    console.log(`[PostgresService] Started cleanup timer with interval: ${this.CLEANUP_INTERVAL_MS / 1000}s`);
  }

  private stopCleanupTimer(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('[PostgresService] Stopped cleanup timer');
    }
  }

  private isExpired(cacheItem: any): boolean {
    if (!cacheItem.ttl) {
      return false; // 没有 TTL 的缓存永不过期
    }

    const expiryTime = new Date(cacheItem.createdAt).getTime() + cacheItem.ttl * 1000;
    return Date.now() > expiryTime;
  }

  async onModuleDestroy() {
    this.stopCleanupTimer();
  }
}