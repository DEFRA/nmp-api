import { FertiliserManuresEntity } from '@db/entity/fertiliser-manures.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFertiliserManuresDto {
  @ApiProperty({ type: [FertiliserManuresEntity] })
  FertiliserManure: FertiliserManuresEntity[];
}
