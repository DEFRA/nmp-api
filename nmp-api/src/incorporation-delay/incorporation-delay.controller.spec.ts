import { Test, TestingModule } from '@nestjs/testing';
import { IncorporationDelaysService } from './incorporation-delay.service';
import { IncorporationDelaysController } from './incorporation-delay.controller';

describe('IncorporationDelaysController', () => {
  let controller: IncorporationDelaysController;
  let service: IncorporationDelaysService;

  const mockIncorporationDelaysService = {
    getIncorporationDelays: jest.fn((methodId, applicableFor) => {
      if (methodId === 1 && applicableFor === 'L') {
        return [
          {
            ID: 1,
            Name: 'Delay 1',
            FromHours: 2,
            ToHours: 6,
            ApplicableFor: 'L',
          },
        ];
      } else if (methodId === 2 && applicableFor === 'S') {
        return [
          {
            ID: 2,
            Name: 'Delay 2',
            FromHours: 2,
            ToHours: 6,
            ApplicableFor: 'S',
          },
        ];
      } else {
        return [];
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncorporationDelaysController],
      providers: [
        {
          provide: IncorporationDelaysService,
          useValue: mockIncorporationDelaysService,
        },
      ],
    }).compile();

    controller = module.get<IncorporationDelaysController>(
      IncorporationDelaysController,
    );
    service = module.get<IncorporationDelaysService>(
      IncorporationDelaysService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getIncorporationDelays', () => {
    it('should return a list of incorporation delays for valid methodId and applicableFor', async () => {
      const result = await controller.getIncorporationDelays(1, 'L');
      expect(result).toEqual({
        IncorporationDelays: [
          {
            ID: 1,
            Name: 'Delay 1',
            FromHours: 2,
            ToHours: 6,
            ApplicableFor: 'L',
          },
        ],
      });
      expect(service.getIncorporationDelays).toHaveBeenCalledWith(1, 'L');
    });

    it('should return an empty list for invalid methodId and applicableFor', async () => {
      const result = await controller.getIncorporationDelays(0, 'L');
      expect(result).toEqual({ IncorporationDelays: [] });
      expect(service.getIncorporationDelays).toHaveBeenCalledWith(0, 'L');
    });
  });
});
