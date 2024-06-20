import { Test, TestingModule } from '@nestjs/testing';
import { IncorporationMethodController } from './incorporation-method.controller';
import { IncorporationMethodService } from './incorporation-method.service';

describe('IncorporationMethodController', () => {
  let controller: IncorporationMethodController;
  let service: IncorporationMethodService;

  const mockIncorporationMethodService = {
    getIncorporationMethods: jest.fn((fieldType, applicableFor, appId) => {
      if (fieldType === 1 && applicableFor === 'L' && appId === 1) {
        return [
          {
            ID: 1,
            Name: 'Method 1',
            ApplicableForGrass: 'L',
            ApplicableForArableAndHorticulture: 'L',
          },
        ];
      } else if (fieldType === 2 && applicableFor === 'S' && appId === 2) {
        return [
          {
            ID: 2,
            Name: 'Method 2',
            ApplicableForGrass: 'S',
            ApplicableForArableAndHorticulture: 'S',
          },
          ,
        ];
      } else {
        return [];
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncorporationMethodController],
      providers: [
        {
          provide: IncorporationMethodService,
          useValue: mockIncorporationMethodService,
        },
      ],
    }).compile();

    controller = module.get<IncorporationMethodController>(
      IncorporationMethodController,
    );
    service = module.get<IncorporationMethodService>(
      IncorporationMethodService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getIncorporationMethods', () => {
    it('should return a list of incorporation methods for valid parameters', async () => {
      const result = await controller.getIncorporationMethods(1, 'L', 1);
      expect(result).toEqual({
        IncorporationMethods: [
          {
            ID: 1,
            Name: 'Method 1',
            ApplicableForGrass: 'L',
            ApplicableForArableAndHorticulture: 'L',
          },
          ,
        ],
      });
      expect(service.getIncorporationMethods).toHaveBeenCalledWith(1, 'L', 1);
    });

    it('should return a list of incorporation methods for another set of valid parameters', async () => {
      const result = await controller.getIncorporationMethods(2, 'S', 2);
      expect(result).toEqual({
        IncorporationMethods: [
          {
            ID: 2,
            Name: 'Method 2',
            ApplicableForGrass: 'S',
            ApplicableForArableAndHorticulture: 'S',
          },
        ],
      });
      expect(service.getIncorporationMethods).toHaveBeenCalledWith(2, 'S', 2);
    });

    it('should return an empty list for invalid parameters', async () => {
      const result = await controller.getIncorporationMethods(0, 'C', 3);
      expect(result).toEqual({ IncorporationMethods: [] });
      expect(service.getIncorporationMethods).toHaveBeenCalledWith(0, 'C', 3);
    });
  });
});
