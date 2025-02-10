import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RouteInfo {
  controller: string;
  path: string;
  method: string;
  description?: string;
}

async function cleanDatabase() {
  // 按照正确的顺序清空数据(处理外键约束)
  console.log('Cleaning database...');

  await prisma.$transaction(async (prisma) => {
    // 1. 删除用户相关数据
    await prisma.user.deleteMany();

    // 2. 删除帖子
    await prisma.post.deleteMany();

    // 3. 删除角色和权限
    await prisma.role.deleteMany();
    await prisma.permission.deleteMany();
  });

  console.log('Database cleaned');
}

async function main() {
  // 首先清空数据库
  await cleanDatabase();

  // 1. 定义所有API路由
  const routes: RouteInfo[] = [
    // Account Controller
    { controller: 'account', path: '/account/registry', method: 'POST', description: '用户注册' },
    { controller: 'account', path: '/account/login', method: 'POST', description: '用户登录' },

    // User Controller
    { controller: 'user', path: '/user/profile', method: 'GET', description: '获取用户资料' },
    { controller: 'user', path: '/user/profile', method: 'PUT', description: '更新用户资料' },

    // Post Controller
    { controller: 'post', path: '/post', method: 'GET', description: '获取帖子列表' },
    { controller: 'post', path: '/post/:id', method: 'GET', description: '获取帖子详情' },
    { controller: 'post', path: '/post', method: 'POST', description: '创建帖子' },
    { controller: 'post', path: '/post/:id', method: 'PUT', description: '更新帖子' },
    { controller: 'post', path: '/post/:id', method: 'DELETE', description: '删除帖子' },

    // File Controller
    { controller: 'file', path: '/file/upload', method: 'POST', description: '上传文件' },
    { controller: 'file', path: '/file/:id', method: 'GET', description: '获取文件' },
    { controller: 'file', path: '/file/:id', method: 'DELETE', description: '删除文件' },

    // Role Controller
    { controller: 'role', path: '/role', method: 'GET', description: '获取角色列表' },
    { controller: 'role', path: '/role/:id', method: 'GET', description: '获取角色详情' },
    { controller: 'role', path: '/role', method: 'POST', description: '创建角色' },
    { controller: 'role', path: '/role/:id', method: 'PUT', description: '更新角色' },
    { controller: 'role', path: '/role/:id', method: 'DELETE', description: '删除角色' },

    // Permission Controller
    { controller: 'permission', path: '/permission', method: 'GET', description: '获取权限列表' },
    { controller: 'permission', path: '/permission/:id', method: 'GET', description: '获取权限详情' },
    { controller: 'permission', path: '/permission', method: 'POST', description: '创建权限' },
    { controller: 'permission', path: '/permission/:id', method: 'PUT', description: '更新权限' },
    { controller: 'permission', path: '/permission/:id', method: 'DELETE', description: '删除权限' },
  ];

  // 2. 创建所有权限
  const permissions = await Promise.all(
    routes.map(async (route) => {
      const permissionName = `${route.method.toLowerCase()}_${route.controller}${route.path.replace(/\//g, '_').replace(/:/g, '')}`;

      try {
        return await prisma.permission.create({
          data: {
            name: permissionName,
            description: route.description || `${route.method} ${route.path}`,
            resource: route.path,
            action: route.method as any,
          },
        });
      } catch (error) {
        if ((error as any).code === 'P2002') {
          console.log(`Permission already exists: ${permissionName}`);
          return await prisma.permission.findUnique({
            where: { name: permissionName },
          });
        }
        throw error;
      }
    }),
  );

  // 2.1 创建超级管理员权限
  const superAdminPermission = await prisma.permission.create({
    data: {
      name: 'super_admin',
      description: '系统超级管理员权限,拥有所有资源的访问权限',
      resource: '*',
      action: 'GET',
    },
  });

  console.log('Created super admin permission');
  console.log('Created permissions:', permissions.length + 1);

  // 3. 创建管理员角色并只分配super_admin权限
  const adminRole = await prisma.role.create({
    data: {
      name: 'Admin',
      permissions: {
        connect: [{ id: superAdminPermission.id }],
      },
    },
  });

  console.log('Created Admin role with super_admin permission');

  // 4. 创建普通用户角色并分配基础权限
  const basicPermissions = permissions.filter((p) => {
    // 排除角色和权限管理相关的权限
    if (p.resource.startsWith('/role') || p.resource.startsWith('/permission')) {
      return false;
    }
    return true;
  });

  const userRole = await prisma.role.create({
    data: {
      name: 'User',
      permissions: {
        connect: basicPermissions.map((p) => ({ id: p.id })),
      },
    },
  });

  console.log('Created User role with basic permissions');

  // 5. 创建默认管理员用户
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: 'admin123', // 注意：实际应用中应该使用加密密码
      name: '系统管理员',
      roles: {
        connect: { id: adminRole.id },
      },
    },
  });

  console.log('Created admin user:', admin.email);
  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
