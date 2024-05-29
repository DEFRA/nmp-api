// import FarmEntity from '@db/entity/farm.entity';
// //import UserFarmEntity from '@db/entity/user-farm.entity';
// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { ApiDataResponseType } from '@shared/base.response';
// import { BaseService } from '@src/base/base.service';
// import { DeepPartial, EntityManager, Repository } from 'typeorm';

// @Injectable()
// export class UserFarmService extends BaseService<
//   UserFarmEntity,
//   ApiDataResponseType<UserFarmEntity>
// > {
//   constructor(
//     @InjectRepository(UserFarmEntity)
//     protected readonly repository: Repository<UserFarmEntity>,
//     @InjectRepository(FarmEntity)
//     protected readonly repositoryFarm: Repository<FarmEntity>,
//     protected readonly entityManager: EntityManager,
//   ) {
//     super(repository, entityManager);
//   }

//   async getUserFarms(
//     userID: number,
//     shortSummary: boolean = false,
//   ): Promise<FarmEntity[]> {
//     try {
//       const storedProcedure =
//         'EXEC dbo.spFarms_GetUserFarms @userID = @0, @shortSummary = @1';
//       const farms = await this.executeQuery(storedProcedure, [
//         userID,
//         shortSummary,
//       ]);
//       return farms;
//     } catch (error) {
//       console.error('Error while fetching join data:', error);
//       throw error;
//     }
//   }
// }
