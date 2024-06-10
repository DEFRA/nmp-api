import { Test, TestingModule } from '@nestjs/testing';
import { IncorporationDelaysController } from './incorporation-delay.controller';
import { IncorporationDelaysService } from './incorporation-delay.service';
import { IncorporationDelayEntity } from '@db/entity/incorporation-delay.entity';


describe('IncorporationDelaysController', () => {
  let controller: IncorporationDelaysController;
  let service: IncorporationDelaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncorporationDelaysController],
      providers: [
        {
          provide: IncorporationDelaysService,
          useValue: {
            getDelaysByMethodId: jest.fn(),
          },
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

  describe('getDelaysByMethodId', () => {
    it('should return an object with IncorporationDelays array', async () => {
      const result: IncorporationDelayEntity[] = [
        {
          ID: 1, Name: 'Delay Type 1', FromHours: 1, ToHours: 24,
          IncorpMethodsIncorpDelays: [],
          OrganicManures: []
        },
        {
          ID: 2, Name: 'Delay Type 2', FromHours: 25, ToHours: 48,
          IncorpMethodsIncorpDelays: [],
          OrganicManures: []
        },
      ];

      jest.spyOn(service, 'getDelaysByMethodId').mockResolvedValue(result);

      expect(await controller.getDelaysByMethodId(1)).toEqual({
        IncorporationDelays: result,
      });
    });

    it('should call the service with the correct methodId', async () => {
      const methodId = 1;
      await controller.getDelaysByMethodId(methodId);
      expect(service.getDelaysByMethodId).toHaveBeenCalledWith(methodId);
    });
  });
});
