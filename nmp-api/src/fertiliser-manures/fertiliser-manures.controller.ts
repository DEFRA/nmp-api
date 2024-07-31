import { Controller, Post, Body, NotFoundException } from '@nestjs/common';
import { FertiliserManuresService } from './fertiliser-manures.service';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { FertiliserManuresEntity } from '@db/entity/fertiliser-manures.entity';
import { CreateFertiliserManuresDto } from './dto/create-fertiliser-manures.dto';


@Controller('fertiliser-manures')
@ApiTags('Fertiliser Manures')
export class FertiliserManuresController {
  constructor(
    private readonly fertiliserManuresService: FertiliserManuresService,
  ) {}

  @Post()
  @ApiBody({ type: CreateFertiliserManuresDto })
  async create(
    @Body() createDto: CreateFertiliserManuresDto,
  ): Promise<FertiliserManuresEntity> {
    try {
      return this.fertiliserManuresService.createFertiliserManures(createDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
