import { Test, TestingModule } from '@nestjs/testing';
import { GrassController } from './grass.controller';
import { GrassService } from './grass.service';

describe('GrassController', () => {
  let controller: GrassController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GrassController],
      providers: [GrassService],
    }).compile();

    controller = module.get<GrassController>(GrassController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
