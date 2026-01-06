# PostgreSQL 缓存服务使用指南

## 概述

`@dragic/cache` 模块现在支持基于 PostgreSQL 的缓存服务，通过 Drizzle ORM 与数据库交互。

## 配置方式

### 1. 在应用模块中配置

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from '@dragic/cache';
import { DatabaseModule } from '@dragic/database';

@Module({
  imports: [
    // 首先导入数据库模块
    DatabaseModule.forRoot({
      connectionString: process.env.DATABASE_URL,
    }),
    
    // 然后配置缓存模块使用 PostgreSQL
    CacheModule.forRoot({
      service: 'postgres',
      config: {
        cleanupIntervalMs: 10 * 60 * 1000, // 可选：自定义清理间隔，默认 5 分钟
      },
    }),
  ],
})
export class AppModule {}
```

### 2. 在服务中使用

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { Cache } from '@dragic/cache';

@Injectable()
export class UserService {
  constructor(@Inject('Cache') private readonly cache: Cache) {}

  async getUser(id: string) {
    // 尝试从缓存获取
    const cached = await this.cache.get(`user:${id}`);
    if (cached) {
      return cached;
    }

    // 从数据库获取
    const user = await this.findUserById(id);
    
    // 存入缓存，TTL 为 1 小时
    await this.cache.set(`user:${id}`, user, 3600);
    
    return user;
  }
}
```

## 数据库表结构

缓存服务会自动创建以下表结构：

```sql
CREATE TABLE cache (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  ttl INTEGER, -- TTL in seconds
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

## 特性

- **TTL 支持**：支持设置过期时间
- **自动清理**：内置定时器自动清理过期缓存（默认每 5 分钟）
- **可配置清理间隔**：可自定义清理频率
- **即时过期检查**：访问时自动检查并清理过期缓存
- **类型安全**：使用 TypeScript 泛型确保类型安全
- **JSON 序列化**：自动处理复杂对象的序列化/反序列化
- **生命周期管理**：应用启动时开始清理，关闭时停止定时器

## 性能考虑

- PostgreSQL 缓存适合读多写少的场景
- 建议为 `key` 字段创建索引（已通过主键自动创建）
- 定时清理会自动执行，无需手动调用
- 可根据应用负载调整清理间隔：
  - 高负载应用：增加间隔（如 10-15 分钟）
  - 低负载应用：减少间隔（如 2-3 分钟）

## 与其他缓存服务的比较

| 特性 | Redis | Vercel KV | PostgreSQL |
|------|-------|-----------|------------|
| 性能 | 最高 | 高 | 中等 |
| 持久化 | 可选 | 内置 | 内置 |
| 复杂查询 | 不支持 | 不支持 | 支持 |
| 部署复杂度 | 中等 | 低 | 低 |

## 迁移指南

从 Redis 迁移到 PostgreSQL：

1. 更新模块配置中的 `service` 为 `'postgres'`
2. 确保已导入 `DatabaseModule`
3. API 调用保持不变，无需修改业务代码