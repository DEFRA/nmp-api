import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationMethodController } from './application-method.controller';
import { ApplicationMethodService } from './application-method.service';
import { ApplicationMethodEntity } from '@db/entity/application-method.entity';

describe('ApplicationMethodController', () => {
  let controller: ApplicationMethodController;
  let service: ApplicationMethodService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationMethodController],
      providers: [
        {
          provide: ApplicationMethodService,
          useValue: {
            getApplicationMethods: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ApplicationMethodController>(
      ApplicationMethodController,
    );
    service = module.get<ApplicationMethodService>(ApplicationMethodService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getApplicationMethods', () => {
    it('should return an array of application methods', async () => {
      const applicableFor = 'L';
      const expectedResult: ApplicationMethodEntity[] = [
        {
          ID: 1,
          Name: 'Method 1',
          ApplicableFor: 'L',
          ApplicationMethodsIncorpMethods: [],
          OrganicManures: [],
        },
        {
          ID: 2,
          Name: 'Method 2',
          ApplicableFor: 'S',
          ApplicationMethodsIncorpMethods: [],
          OrganicManures: [],
        },
      ];

      jest
        .spyOn(service, 'getApplicationMethods')
        .mockResolvedValue(expectedResult);

      expect(
        await controller.getApplicationMethods(applicableFor),
      ).toStrictEqual({ ApplicationMethods: expectedResult });
    });

    it('should return an empty array if no methods are found', async () => {
      const applicableFor = 'L';
      const expectedResult: ApplicationMethodEntity[] = [];

      jest
        .spyOn(service, 'getApplicationMethods')
        .mockResolvedValue(expectedResult);

      expect(await controller.getApplicationMethods(applicableFor)).toEqual({
        ApplicationMethods: expectedResult,
      });
    });
  });
});
