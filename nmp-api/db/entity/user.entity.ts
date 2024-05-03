import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import UserFarmsEntity from './user-farms.entity';
import FieldEntity from './field.entity';
import FarmEntity from './farm.entity';
import CropEntity from './crop.entity';
import SoilAnalysesEntity from './soil-analyses.entity';
import ManagementPeriodEntity from './management-period.entity';

@Entity({ name: 'Users' })
export default class UserEntity {
  @PrimaryGeneratedColumn('identity', { generatedIdentity: 'ALWAYS' })
  ID: number;

  @Column('nvarchar', { length: 50 })
  GivenName: string;

  @Column('nvarchar', { length: 50 })
  Surname?: string;

  @Column('nvarchar', { length: 256 })
  Email: string;

  @Column('nvarchar', { length: 128, unique: true })
  UserName: string;

  @OneToMany(() => UserFarmsEntity, (userFarms) => userFarms.User)
  UserFarms: UserFarmsEntity[];

  @OneToMany(() => FieldEntity, (field) => field.CreatedByUser)
  CreatedFields: FieldEntity[];

  @OneToMany(() => FieldEntity, (field) => field.ModifiedByUser)
  ModifiedFields: FieldEntity[];

  @OneToMany(() => FarmEntity, (farm) => farm.CreatedByUser)
  CreatedFarms: FarmEntity[];

  @OneToMany(() => FarmEntity, (farm) => farm.ModifiedByUser)
  ModifiedFarms: FarmEntity[];

  @OneToMany(() => CropEntity, (crop) => crop.CreatedByUser)
  CreatedCrops: CropEntity[];

  @OneToMany(() => CropEntity, (crop) => crop.ModifiedByUser)
  ModifiedCrops: CropEntity[];

  @OneToMany(
    () => SoilAnalysesEntity,
    (soilAnalyses) => soilAnalyses.CreatedByUser,
  )
  CreatedSoilAnalyses: SoilAnalysesEntity[];

  @OneToMany(
    () => SoilAnalysesEntity,
    (soilAnalyses) => soilAnalyses.ModifiedByUser,
  )
  ModifiedSoilAnalyses: SoilAnalysesEntity[];

  @OneToMany(
    () => ManagementPeriodEntity,
    (managementPeriod) => managementPeriod.CreatedByUser,
  )
  CreatedManagementPeriods: ManagementPeriodEntity[];

  @OneToMany(
    () => ManagementPeriodEntity,
    (managementPeriod) => managementPeriod.ModifiedByUser,
  )
  ModifiedManagementPeriods: ManagementPeriodEntity[];
}
