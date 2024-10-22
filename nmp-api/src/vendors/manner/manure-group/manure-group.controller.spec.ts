import { Test, TestingModule } from '@nestjs/testing';
import { ManureGroupController } from './manure-group.controller';

describe('ManureGroupController', () => {
  let controller: ManureGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManureGroupController],
    }).compile();

    controller = module.get<ManureGroupController>(ManureGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
