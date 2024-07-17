import { Test, TestingModule } from '@nestjs/testing';
import { PotatoGroupController } from './potato-group.controller';
import { CropTypePotatoGroupEntity } from '@db/entity/crop-type-potato-group.entity';
import { PotatoGroupService } from './potato-group.service';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from '../../test/ormConfig';
import { RB209ArableService } from '@src/vendors/rb209/arable/arable.service';

describe('PotatoGroupController', () => {
  let controller: PotatoGroupController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PotatoGroupController],
      imports: [
        CacheModule.register(),
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([CropTypePotatoGroupEntity]),
      ],
      providers: [PotatoGroupService, RB209ArableService],
      exports: [TypeOrmModule],
    }).compile();

    controller = module.get<PotatoGroupController>(PotatoGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Get list of Potato Groups', () => {
    it('should return an array of Potato Groups', async () => {
      const result = await controller.getPotatoGroups();
      expect(result.PotatoGroups).toBeDefined();
      expect(Array(result.PotatoGroups).length).toBeGreaterThan(0);
    });
  });
});
