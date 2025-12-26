import { Test, TestingModule } from '@nestjs/testing';
import { DrizzleService } from '@pictode-api/drizzle';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: DrizzleService,
          useValue: {
            db: {
              select: () => ({
                from: () => ({
                  where: () => ({
                    limit: async () => [],
                  }),
                }),
              }),
            },
          },
        },
        {
          provide: 'Cache',
          useValue: {
            get: async () => null,
            set: async () => undefined,
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
