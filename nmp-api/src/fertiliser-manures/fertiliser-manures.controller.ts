import { Controller, Post, Body, NotFoundException, Req } from '@nestjs/common';
import { FertiliserManuresService } from './fertiliser-manures.service';
import { ApiTags, ApiBody, ApiOperation } from '@nestjs/swagger';
import { FertiliserManuresEntity } from '@db/entity/fertiliser-manures.entity';
import { CreateFertiliserManuresDto } from './dto/create-fertiliser-manures.dto';

@Controller('fertiliser-manures')
@ApiTags('Fertiliser Manures')
export class FertiliserManuresController {
  constructor(
    private readonly fertiliserManuresService: FertiliserManuresService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create Fetiliser Manure api' })
  @ApiBody({ type: CreateFertiliserManuresDto })
  async createFertiliserManure(
    @Body('FertiliserManure') body: FertiliserManuresEntity,
    @Req() req: Request,
  ): Promise<FertiliserManuresEntity> {
    const userId = req['userId'];
    try {
      const fertiliserManure =
        await this.fertiliserManuresService.createFertiliserManures(
          body,
          userId,
        );

      return fertiliserManure;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
