import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 创建角色
  const adminRole = await prisma.role.create({
    data: {
      name: 'Admin',
    },
  });

  const userRole = await prisma.role.create({
    data: {
      name: 'User',
    },
  });

  // 创建权限
  const readPermission = await prisma.permission.create({
    data: {
      name: 'Read',
      resource: '/posts',
      action: 'GET',
    },
  });

  const writePermission = await prisma.permission.create({
    data: {
      name: 'Write',
      resource: '/posts',
      action: 'POST',
    },
  });

  // 创建用户并分配角色和权限
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: 'password123',
      name: '普通用户',
      roles: {
        connect: { id: userRole.id },
      },
      permissions: {
        connect: { id: readPermission.id },
      },
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: 'admin123',
      name: '管理员',
      roles: {
        connect: { id: adminRole.id },
      },
      permissions: {
        connect: [{ id: readPermission.id }, { id: writePermission.id }],
      },
    },
  });

  // 创建帖子
  await prisma.post.create({
    data: {
      title: '第一篇帖子',
      content: '这是我的第一篇帖子内容。',
      published: true,
      author: {
        connect: { id: user.id },
      },
    },
  });

  // 创建客户和发票
  const customer = await prisma.customer.create({
    data: {
      name: '客户A',
      email: 'customerA@example.com',
      imageUrl: 'http://example.com/imageA.jpg',
    },
  });

  await prisma.invoice.create({
    data: {
      customerId: customer.id,
      amount: 100,
      status: '已支付',
      date: new Date(),
    },
  });

  console.log('数据填充完成');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
