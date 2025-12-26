import { Injectable } from '@nestjs/common';
import { del, put } from '@vercel/blob';
import { Storage } from '../interfaces/storage.interface';

@Injectable()
export class VercelService implements Storage {
  constructor(
    private readonly config: {
      token: string;
      baseUrl: string;
    },
  ) {}

  async putObject(params: { key?: string; filename?: string; data: Buffer; contentType?: string }): Promise<string> {
    const pathname = params.key ?? `${Date.now()}-${params.filename ?? 'file'}`;
    const result = await put(pathname, params.data, {
      access: 'public',
      token: this.config.token,
      contentType: params.contentType,
    });

    const key = new URL(result.url).pathname.replace(/^\//, '');
    return key;
  }

  async getUrl(fileKey: string): Promise<string> {
    if (/^https?:\/\//i.test(fileKey)) {
      return fileKey;
    }

    const base = this.config.baseUrl.replace(/\/+$/, '');
    const key = fileKey.replace(/^\//, '');
    return `${base}/${key}`;
  }

  async delete(fileKey: string): Promise<void> {
    const url = await this.getUrl(fileKey);
    await del(url, { token: this.config.token });
  }
}
