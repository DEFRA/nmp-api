import { ApiProperty } from '@nestjs/swagger';
import { FertiliserManuresEntity } from '@db/entity/fertiliser-manures.entity';

export class CreateFertiliserManuresDto {
  @ApiProperty({ type: [FertiliserManuresEntity] })
  FertiliserManure: FertiliserManuresEntity[];
}
