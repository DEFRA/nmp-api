import FarmEntity from '@db/entity/farm.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFarmRequest extends FarmEntity {
  @ApiProperty()
  UserID: number;

  @ApiProperty()
  RoleID: number;
}
