import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationMethodController } from './application-method.controller';
import { ApplicationMethodService } from './application-method.service';

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
    it('should return application methods', async () => {
      const result = [
        {
          ID: 1,
          Name: 'Method 1',
          ApplicableForGrass: 'L',
          ApplicableForArableAndHorticulture: 'S',
          ApplicationMethodsIncorpMethods: [],
          OrganicManures: [],
        },
      ];
      jest.spyOn(service, 'getApplicationMethods').mockResolvedValue(result);

      expect(await controller.getApplicationMethods(1, 'someValue')).toEqual({
        ApplicationMethods: result,
      });
    });

    it('should call getApplicationMethods with correct parameters', async () => {
      const fieldType = 1;
      const applicableFor = 'someValue';
      const result = [
        {
          ID: 1,
          Name: 'Method 1',
          ApplicableForGrass: 'L',
          ApplicableForArableAndHorticulture: 'S',
          ApplicationMethodsIncorpMethods: [],
          OrganicManures: [],
        },
      ];
      jest.spyOn(service, 'getApplicationMethods').mockResolvedValue(result);

      await controller.getApplicationMethods(fieldType, applicableFor);

      expect(service.getApplicationMethods).toHaveBeenCalledWith(
        fieldType,
        applicableFor,
      );
    });

    it('should handle errors', async () => {
      const fieldType = 1;
      const applicableFor = 'someValue';
      jest
        .spyOn(service, 'getApplicationMethods')
        .mockRejectedValue(new Error('test error'));

      await expect(
        controller.getApplicationMethods(fieldType, applicableFor),
      ).rejects.toThrow('test error');
    });
  });
});
