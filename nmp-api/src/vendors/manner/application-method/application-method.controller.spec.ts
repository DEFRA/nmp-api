import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationMethodController } from './application-method.controller';

describe('ApplicationMethodController', () => {
  let controller: ApplicationMethodController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationMethodController],
    }).compile();

    controller = module.get<ApplicationMethodController>(ApplicationMethodController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
