import { Controller, Post, Body, NotFoundException, Req } from '@nestjs/common';
import { FertiliserManuresService } from './fertiliser-manures.service';
import { ApiTags, ApiBody, ApiOperation } from '@nestjs/swagger';
import { CreateFertiliserManuresDto } from './dto/create-fertiliser-manures.dto';
import { FertiliserManuresEntity } from '@db/entity/fertiliser-manures.entity';

@Controller('fertiliser-manures')
@ApiTags('Fertiliser Manures')
export class FertiliserManuresController {
  constructor(
    private readonly fertiliserManuresService: FertiliserManuresService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create Fertiliser Manure api' })
  @ApiBody({ type: CreateFertiliserManuresDto })
  async createFertiliserManure(
    @Body() body: CreateFertiliserManuresDto,
    @Req() req: Request,
  ): Promise<FertiliserManuresEntity[]> {
    const userId = req['userId'];

    try {
      const fertiliserManures =
        await this.fertiliserManuresService.createFertiliserManures(
          body.FertiliserManure,
          userId,
        );

      return fertiliserManures;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
