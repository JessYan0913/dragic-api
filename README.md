# Dragic Monorepo

统一身份认证中心 (IdP) 和 API 服务的 Monorepo 项目。

## 项目结构

```
dragic-monorepo/
├── apps/
│   ├── dragic-api/        # 主业务 API 服务
│   └── auth-server/       # 统一认证中心 (IdP + OIDC)
├── packages/
│   ├── auth/              # 认证模块 (JWT, OAuth, Passport)
│   ├── cache/             # 缓存模块 (Redis, Vercel KV)
│   ├── common/            # 公共工具和类型
│   ├── database/          # 数据库模块 (Drizzle ORM)
│   ├── queue/             # 队列模块 (BullMQ)
│   └── storage/           # 存储模块 (MinIO, Vercel Blob)
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

## 快速开始

### 前置要求

- Node.js >= 18
- pnpm >= 9.0
- PostgreSQL 数据库
- Redis (可选，用于缓存和队列)

### 安装

```bash
# 全局安装工具
npm install -g pnpm turbo

# 安装依赖
pnpm install

# 构建所有包
pnpm build:packages
```

### 开发

```bash
# 启动所有服务
pnpm dev

# 只启动 API 服务
pnpm dev:api

# 只启动认证服务
pnpm dev:auth
```

### 数据库操作

```bash
# 生成迁移
pnpm db:generate

# 执行迁移
pnpm db:migrate

# 推送 schema 到数据库
pnpm db:push

# 打开 Drizzle Studio
pnpm db:studio
```

## 应用说明

### dragic-api

主业务 API 服务，处理核心业务逻辑。

- 端口: `3000` (默认)
- 依赖: `@dragic/auth`, `@dragic/database`, `@dragic/cache`, `@dragic/storage`

### auth-server

统一认证中心，实现 OIDC 协议，支持：

- 飞书登录
- 手机号登录
- OIDC 标准接口 (用于 NocoDB 等第三方集成)

**OIDC 端点:**

- `GET /.well-known/openid-configuration` - 发现文档
- `GET /oidc/authorize` - 授权端点
- `POST /oidc/token` - 令牌端点
- `GET /oidc/userinfo` - 用户信息端点

- 端口: `3001` (默认)

## 环境变量

复制 `.env.example` 到 `.env` 并配置：

```bash
cp .env.example .env
```

主要配置项：

- `DATABASE_URL` - PostgreSQL 连接字符串
- `JWT_SECRET` - JWT 签名密钥
- `FEISHU_APP_ID` / `FEISHU_APP_SECRET` - 飞书应用凭据
- `NOCODB_CLIENT_ID` / `NOCODB_CLIENT_SECRET` - NocoDB OIDC 客户端

## NocoDB 集成

1. 部署 auth-server
2. 配置 NocoDB 环境变量：

```bash
NC_AUTH_OIDC_ENABLED=true
NC_AUTH_OIDC_ISSUER_BASE_URL=http://your-auth-server:3001
```

3. 用户登录 Agent 平台后可无感访问 NocoDB

## 技术栈

- **框架**: NestJS 10
- **数据库**: PostgreSQL + Drizzle ORM
- **缓存**: Redis / Vercel KV
- **存储**: MinIO / Vercel Blob
- **认证**: Passport.js + JWT + OAuth2
- **构建**: Turborepo + pnpm workspaces

## License

MIT
