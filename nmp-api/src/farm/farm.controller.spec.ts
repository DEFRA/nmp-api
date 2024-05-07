import { Test, TestingModule } from '@nestjs/testing';
import { FarmController } from './farm.controller';
import { FarmService } from './farm.service';
import { UserFarmsService } from '@src/user-farms/user-farms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import FarmEntity from '@db/entity/farm.entity';
import UserFarmEntity from '@db/entity/user-farm.entity';

describe('FarmController', () => {
  let controller: FarmController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([FarmEntity, UserFarmEntity])],
      controllers: [FarmController],
      providers: [FarmService, UserFarmsService],
    }).compile();

    controller = app.get<FarmController>(FarmController);
  });

  describe('get farms by user id', () => {
    it('should return farms short summary', async () => {
      const result = await controller.getFarmsByUserId(1, false);
      expect(result.Farms).toBeTruthy();
    });

    it('should return farms list details', async () => {
      const result = await controller.getFarmsByUserId(1, true);
      expect(result.Farms).toBeTruthy();
    });

    it('should return empty list for user with no farms', async () => {
      const result = await controller.getFarmsByUserId(2, true);
      expect(result.Farms).toBeTruthy();
    });
  });
});
