import { Test, TestingModule } from '@nestjs/testing';
import { IncorporationMethodController } from './incorporation-method.controller';
import { IncorporationMethodService } from './incorporation-method.service';
import { IncorporationMethodEntity } from '@db/entity/incorporation-method.entity';


describe('IncorporationMethodController', () => {
  let controller: IncorporationMethodController;
  let service: IncorporationMethodService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncorporationMethodController],
      providers: [
        {
          provide: IncorporationMethodService,
          useValue: {
            getIncorporationMethodsByAppId: jest.fn(),
          },
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
    it('should return an array of incorporation methods', async () => {
      const appId = 1;
      const expectedResult: IncorporationMethodEntity[] = [
        {
          ID: 1, Name: 'Method 1' /* Add other properties as needed */,
          ApplicationMethodsIncorpMethods: [],
          IncorpMethodsIncorpDelays: [],
          OrganicManures: []
        },
        {
          ID: 2, Name: 'Method 2' /* Add other properties as needed */,
          ApplicationMethodsIncorpMethods: [],
          IncorpMethodsIncorpDelays: [],
          OrganicManures: []
        },
      ];

      jest
        .spyOn(service, 'getIncorporationMethodsByAppId')
        .mockResolvedValue(expectedResult);

      const result = await controller.getIncorporationMethods(appId);
      expect(result).toEqual({ IncorporationMethods: expectedResult });
    });

    it('should return an empty array if no methods are found', async () => {
      const appId = 1;
      const expectedResult: IncorporationMethodEntity[] = [];

      jest
        .spyOn(service, 'getIncorporationMethodsByAppId')
        .mockResolvedValue(expectedResult);

      const result = await controller.getIncorporationMethods(appId);
      expect(result).toEqual({ IncorporationMethods: expectedResult });
    });
  });
});
