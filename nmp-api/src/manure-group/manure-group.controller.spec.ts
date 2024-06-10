import { Test, TestingModule } from '@nestjs/testing';
import { ManureGroupController } from './manure-group.controller';
import { ManureGroupService } from './manure-group.service';

describe('ManureGroupController', () => {
  let controller: ManureGroupController;
  let service: ManureGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManureGroupController],
      providers: [
        {
          provide: ManureGroupService,
          useValue: {
            getAll: jest
              .fn()
              .mockResolvedValue({ records: [{ id: 1, name: 'Test Group' }] }),
            getById: jest
              .fn()
              .mockResolvedValue({ records: { id: 1, name: 'Test Group' } }),
          },
        },
      ],
    }).compile();

    controller = module.get<ManureGroupController>(ManureGroupController);
    service = module.get<ManureGroupService>(ManureGroupService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllManureGroups', () => {
    it('should return all Manure Groups', async () => {
      const result = await controller.getAllManureGroups();
      expect(result.ManureGroups).toEqual([{ id: 1, name: 'Test Group' }]);
      expect(service.getAll).toHaveBeenCalled();
    });
  });

  describe('getManureGroupByManureGroupId', () => {
    it('should return a single Manure Group by id', async () => {
      const result = await controller.getManureGroupByManureGroupId(1);
      expect(result.ManureGroup).toEqual({ id: 1, name: 'Test Group' });
      expect(service.getById).toHaveBeenCalledWith(1);
    });
  });
});
