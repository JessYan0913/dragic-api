import { Test, TestingModule } from '@nestjs/testing';
import { VercelService } from './vercel.service';

describe('VercelService', () => {
  let service: VercelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VercelService],
    }).compile();

    service = module.get<VercelService>(VercelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
