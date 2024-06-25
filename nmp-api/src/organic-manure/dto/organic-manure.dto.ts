import { ApiProperty } from '@nestjs/swagger';
import { OrganicManureEntity } from '@db/entity/organic-manure.entity';

export class OrganicManureDto {
  @ApiProperty({ type: OrganicManureEntity })
  OrganicManure: OrganicManureEntity;

  @ApiProperty()
  FarmID: number;

  @ApiProperty()
  FieldTypeID: number;

  @ApiProperty()
  SaveDefaultForFarm: boolean;
}

export class CreateOrganicManuresWithFarmManureTypeDto {
  @ApiProperty({ type: [OrganicManureDto] })
  OrganicManures: OrganicManureDto[];
}
