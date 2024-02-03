import { Test, TestingModule } from '@nestjs/testing';
import { GrassService } from './grass.service';

describe('GrassService', () => {
  let service: GrassService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GrassService],
    }).compile();

    service = module.get<GrassService>(GrassService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
