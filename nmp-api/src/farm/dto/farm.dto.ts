import FarmEntity from '@db/entity/farm.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFarmRequest {
  @ApiProperty()
  Farm: FarmEntity;

  @ApiProperty()
  UserID: number;

  @ApiProperty()
  RoleID: number;
}
