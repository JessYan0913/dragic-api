import { Module } from '@nestjs/common';
import { CacheModule } from '@dragic/cache';
import { DatabaseModule } from '@dragic/database';

@Module({
  imports: [
    // 首先导入数据库模块
    DatabaseModule.forRoot({
      connectionString: process.env.DATABASE_URL,
    }),
    
    // 配置缓存模块使用 PostgreSQL
    CacheModule.forRoot({
      service: 'postgres',
      config: {}, // PostgreSQL 配置通过 DrizzleService 自动处理
    }),
  ],
})
export class AppModule {}