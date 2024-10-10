import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  service: process.env.STORAGE_SERVICE || 'vercel_blob',
  vercelBlob: {
    token: process.env.VERCEL_BLOB_TOKEN,
    baseUrl: process.env.VERCEL_BLOB_BASE_URL,
  },
}));
