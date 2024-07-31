import { Test, TestingModule } from '@nestjs/testing';
import { FertiliserManuresController } from './fertiliser-manures.controller';
import { FertiliserManuresService } from './fertiliser-manures.service';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFertiliserManuresDto } from './dto/create-fertiliser-manures.dto';
import { FertiliserManuresEntity } from '@db/entity/fertiliser-manures.entity';
import ManagementPeriodEntity from '@db/entity/management-period.entity';
import UserEntity from '@db/entity/user.entity';
import CropEntity from '@db/entity/crop.entity';
import FieldEntity from '@db/entity/field.entity';
import FarmEntity from '@db/entity/farm.entity';
import OrganisationEntity from '@db/entity/organisation.entity';
import { ormConfig } from '../../test/ormConfig'; 

describe('FertiliserManuresController', () => {
  let controller: FertiliserManuresController;
  let service: FertiliserManuresService;
  let fertiliserManuresRepository: Repository<FertiliserManuresEntity>;
  let managementPeriodRepository: Repository<ManagementPeriodEntity>;
  let userRepository: Repository<UserEntity>;
  let cropRepository: Repository<CropEntity>;
  let fieldRepository: Repository<FieldEntity>;
  let farmRepository: Repository<FarmEntity>;
  let organisationRepository: Repository<OrganisationEntity>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([
          FertiliserManuresEntity,
          ManagementPeriodEntity,
          UserEntity,
          CropEntity,
          FieldEntity,
          FarmEntity,
          OrganisationEntity,
        ]),
      ],
      controllers: [FertiliserManuresController],
      providers: [FertiliserManuresService],
    }).compile();

    controller = module.get<FertiliserManuresController>(
      FertiliserManuresController,
    );
    service = module.get<FertiliserManuresService>(FertiliserManuresService);
    fertiliserManuresRepository = module.get<
      Repository<FertiliserManuresEntity>
    >(getRepositoryToken(FertiliserManuresEntity));
    managementPeriodRepository = module.get<Repository<ManagementPeriodEntity>>(
      getRepositoryToken(ManagementPeriodEntity),
    );
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    cropRepository = module.get<Repository<CropEntity>>(
      getRepositoryToken(CropEntity),
    );
    fieldRepository = module.get<Repository<FieldEntity>>(
      getRepositoryToken(FieldEntity),
    );
    farmRepository = module.get<Repository<FarmEntity>>(
      getRepositoryToken(FarmEntity),
    );
    organisationRepository = module.get<Repository<OrganisationEntity>>(
      getRepositoryToken(OrganisationEntity),
    );

    // Create necessary test data
    const organisationID = 'b3d6f6f4-8e6d-4d3e-9f89-d0e84e9ea2c0'; // Provide a valid UUID
    const organisation = await organisationRepository.save({
      ID: organisationID,
      Name: 'Test Organisation', // Provide other required fields if any
    });

    const farm = await farmRepository.save({
      OrganisationID: organisation.ID, // Reference the existing OrganisationID
      Name: 'Test Farm', // Provide other required fields
      Postcode: '12345', // Provide a valid postcode
    });

    const field = await fieldRepository.save({
      FarmID: farm.ID, // Reference the existing FarmID
      Name: 'Test Field', // Provide a valid name for the field
      TotalArea: 100, // Provide a valid total area
    });

    const crop = await cropRepository.save({
      FieldID: field.ID, // Reference the existing FieldID
      Year: 2024, // Provide required fields
    });

    const managementPeriod = await managementPeriodRepository.save({
      CropID: crop.ID, // Reference the existing CropID
    });

    await userRepository.save({
      ID: 1, // Set ID explicitly
      GivenName: 'Test User', // Provide required fields
      Surname: 'User',
      Email: 'testuser@example.com',
      // Add other required fields if necessary
    });
  });

  afterEach(async () => {
    // Clean up database after each test
    await fertiliserManuresRepository.delete({});
    await managementPeriodRepository.delete({});
    await userRepository.delete({});
    await cropRepository.delete({});
    await fieldRepository.delete({});
    await farmRepository.delete({});
    await organisationRepository.delete({});
  });

  it('should create a fertiliser manure successfully', async () => {
    const createDto: CreateFertiliserManuresDto = {
      ManagementPeriodID: 1, // Ensure this ID exists
      ApplicationDate: new Date(),
      ApplicationRate: 10,
      N: 1.0,
      P2O5: 1.0,
      K2O: 1.0,
      MgO: 1.0,
      SO3: 1.0,
      Na2O: 1.0,
      NFertAnalysisPercent: 1.0,
      P2O5FertAnalysisPercent: 1.0,
      K2OFertAnalysisPercent: 1.0,
      MgOFertAnalysisPercent: 1.0,
      SO3FertAnalysisPercent: 1.0,
      Na2OFertAnalysisPercent: 1.0,
      Lime: 1.0,
      NH4N: 1.0,
      NO3N: 1.0,
      CreatedByID: 1, // Ensure this ID exists
    };

    const result = await controller.create(createDto);

    expect(result).toHaveProperty('ID');
    expect(result.ManagementPeriodID).toEqual(1);
  });

  it('should fail to create a fertiliser manure with invalid data', async () => {
    const createDto: CreateFertiliserManuresDto = {
      ManagementPeriodID: null, // Invalid value
      ApplicationDate: new Date(),
      ApplicationRate: 10,
      N: 1.0,
      P2O5: 1.0,
      K2O: 1.0,
      MgO: 1.0,
      SO3: 1.0,
      Na2O: 1.0,
      NFertAnalysisPercent: 1.0,
      P2O5FertAnalysisPercent: 1.0,
      K2OFertAnalysisPercent: 1.0,
      MgOFertAnalysisPercent: 1.0,
      SO3FertAnalysisPercent: 1.0,
      Na2OFertAnalysisPercent: 1.0,
      Lime: 1.0,
      NH4N: 1.0,
      NO3N: 1.0,
      CreatedByID: 1,
    };

    await expect(controller.create(createDto)).rejects.toThrow();
  });
});
