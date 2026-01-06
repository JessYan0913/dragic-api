import { Test, TestingModule } from '@nestjs/testing';
import { PostgresService } from './postgres.service';
import { DrizzleService } from '@dragic/database';
import { Cache } from '../interfaces/cache.interface';

describe('PostgresService', () => {
  let service: PostgresService;
  let mockDrizzle: jest.Mocked<DrizzleService>;

  beforeEach(async () => {
    const mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
    };

    mockDrizzle = {
      db: mockDb,
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostgresService,
        {
          provide: DrizzleService,
          useValue: mockDrizzle,
        },
      ],
    }).compile();

    service = module.get<PostgresService>(PostgresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should implement Cache interface', () => {
    expect(service).toBeInstanceOf(PostgresService);
    expect(typeof service.set).toBe('function');
    expect(typeof service.get).toBe('function');
    expect(typeof service.del).toBe('function');
    expect(typeof service.exists).toBe('function');
  });
});