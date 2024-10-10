export interface StorageService {
  upload(file: Express.Multer.File): Promise<string>;
  getUrl(fileKey: string): Promise<string>;
  delete(fileKey: string): Promise<void>;
}
