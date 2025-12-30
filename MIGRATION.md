# 认证服务迁移文档

## 迁移概述

将认证逻辑从 `dragic-api` 迁移到独立的 `auth-server` 服务，实现统一的认证中心。

## 架构变更

### 迁移前
```
客户端 → dragic-api:3000/login     (登录注册)
客户端 → dragic-api:3000/api/*     (业务API)
客户端 → auth-server:3001/oidc/*   (OIDC认证)
```

### 迁移后
```
客户端 → auth-server:3001/auth/*   (登录注册)
客户端 → auth-server:3001/oidc/*   (OIDC认证)
客户端 → dragic-api:3000/api/*     (业务API，需携带JWT)
```

### Nginx 代理后（推荐）
```
客户端 → your-domain.com/auth/*    (认证相关)
客户端 → your-domain.com/api/*     (业务API)
```

## 第一阶段：认证端点迁移

### 1. 在 auth-server 中添加认证端点

创建了 `/src/auth` 目录，包含：
- `auth.controller.ts` - 认证控制器
- `auth.service.ts` - 认证服务
- `auth.module.ts` - 认证模块
- `dto/` - 数据传输对象

### 2. 新增的认证端点

- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `POST /auth/refresh` - 刷新 token
- `POST /auth/logout` - 用户登出

## 第二阶段：dragic-api 改造

### 1. 移除认证逻辑

- 删除 `src/account/` 目录
- 从 `app.module.ts` 移除 `AuthModule` 配置
- 移除 `AuthService` 相关导入

### 2. 添加 JWT 验证

创建了 `/src/guards` 目录：
- `jwt-auth.guard.ts` - JWT 认证守卫
- `jwt.strategy.ts` - JWT 策略
- `index.ts` - 导出文件

创建了 `/src/decorators` 目录：
- `public.decorator.ts` - 公共接口装饰器

### 3. 全局 JWT 守卫

在 `app.module.ts` 中配置：
- 全局启用 `JwtAuthGuard`
- 所有接口默认需要认证
- 使用 `@Public()` 装饰器标记公共接口

## 第三阶段：Nginx 代理配置

### 1. 代理规则

```nginx
# 认证相关请求
location ~ ^/(auth|oidc)/ {
    proxy_pass http://auth_server;
}

# 业务 API
location /api/ {
    proxy_pass http://api_server;
}
```

### 2. CORS 配置

- 支持跨域请求
- 处理 OPTIONS 预检请求
- 传递 Authorization header

### 3. 安全配置

- HTTPS 支持
- 安全头设置
- 静态资源缓存

## 部署说明

### 1. 环境变量

确保设置以下环境变量：

**auth-server:**
- `JWT_SECRET` - JWT 密钥
- `DATABASE_URL` - 数据库连接
- `REDIS_URL` - Redis 连接

**dragic-api:**
- `JWT_SECRET` - 与 auth-server 相同
- `ENABLE_JWT_GUARD=true` - 启用 JWT 守卫

### 2. Docker 部署

使用 `docker-compose.yml` 一键部署：

```bash
docker-compose up -d
```

包含的服务：
- PostgreSQL 数据库
- Redis 缓存
- MinIO 对象存储
- auth-server (端口 3001)
- dragic-api (端口 3000)
- Nginx 代理 (端口 80/443)

## 客户端调用示例

### 1. 登录

```javascript
const response = await fetch('https://your-domain.com/auth/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123'
    })
});

const { accessToken, refreshToken } = await response.json();
```

### 2. 调用业务 API

```javascript
const response = await fetch('https://your-domain.com/api/users', {
    headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    }
});
```

### 3. 刷新 Token

```javascript
const response = await fetch('https://your-domain.com/auth/refresh', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        refreshToken: 'your-refresh-token'
    })
});
```

## 迁移验证

### 1. 功能测试

- [ ] 用户注册功能
- [ ] 用户登录功能
- [ ] Token 刷新功能
- [ ] 用户登出功能
- [ ] 业务 API JWT 验证

### 2. 集成测试

- [ ] OIDC Discovery Document
- [ ] OAuth 流程
- [ ] 跨域请求
- [ ] Nginx 代理转发

### 3. 性能测试

- [ ] 认证服务响应时间
- [ ] 业务 API 响应时间
- [ ] 并发请求处理

## 注意事项

1. **JWT 密钥一致性**：确保 auth-server 和 dragic-api 使用相同的 JWT_SECRET
2. **数据库共享**：两个服务必须连接同一个数据库
3. **缓存共享**：Redis 用于 session 和 token 缓存
4. **日志监控**：分别监控两个服务的日志
5. **负载均衡**：生产环境考虑多个实例部署

## 后续优化

1. **API Gateway**：考虑使用 Kong、Zuul 等 API Gateway
2. **服务发现**：使用 Consul、Eureka 进行服务发现
3. **配置中心**：使用 Nacos、Apollo 统一配置管理
4. **链路追踪**：集成 Jaeger、Zipkin 进行分布式追踪
5. **熔断降级**：使用 Hystrix、Sentinel 保护服务