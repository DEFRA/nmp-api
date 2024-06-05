import { Test, TestingModule } from '@nestjs/testing';
import { ClimateController } from './climate.controller';
import { ClimateService } from './climate.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from '../../test/ormConfig';
import ClimateDataEntity from '@db/entity/climate-date.entity';

describe('ClimateController', () => {
  let controller: ClimateController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([ClimateDataEntity]),
      ],
      controllers: [ClimateController],
      providers: [ClimateService],
    }).compile();

    controller = module.get<ClimateController>(ClimateController);
  });

  describe('Get Rainfall Average By Postcode', () => {
    it('should return rainfall average by postcode', async () => {
      const postcode = 'AL1';

      const result = await controller.getRainfallAverageByPostcode(postcode);
      expect(result.rainfallAverage).toBeTruthy();
    });
  });
});
