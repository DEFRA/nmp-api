import FarmEntity from '@db/entity/farm.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFarmRequest {
  @ApiProperty()
  Farm: FarmEntity;
}

export class UpdateFarmDto extends FarmEntity {
  @ApiProperty()
  ID: number;
}
export class UpdateFarmRequest {
  @ApiProperty()
  Farm: UpdateFarmDto;
}
