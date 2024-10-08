import { WindspeedEntity } from '@db/entity/wind-speed.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { MannerWindspeedService } from '@src/vendors/manner/windspeed/windspeed.service';


@Injectable()
export class WindspeedService extends BaseService<
  WindspeedEntity,
  ApiDataResponseType<WindspeedEntity>
> {
  constructor(
    @InjectRepository(WindspeedEntity)
    protected readonly repository: Repository<WindspeedEntity>,
    protected readonly entityManager: EntityManager,
    protected readonly MannerWindspeedService: MannerWindspeedService,
  ) {
    super(repository, entityManager);
  }

  async findAll(): Promise<ApiDataResponseType<WindspeedEntity>> {
    const { records } = await this.getAll();
    return { records };
  }

  async findFirstRow(): Promise<any> {
    // Fetch the windspeeds list from the manner service
    const mannerWindSpeedList =
      await this.MannerWindspeedService.getData('windspeeds');
    

    // Check if the response was successful and data exists
    if (mannerWindSpeedList.success && mannerWindSpeedList.data) {
      // Sort the windspeeds by ID in ascending order and take the first one
      const sortedList = mannerWindSpeedList.data.sort(
        (a: any, b: any) => a.ID - b.ID,
      );

      // Return the first row from the sorted list
      const firstRow = sortedList[0];

      return firstRow;
    } else {
      throw new Error('Failed to fetch windspeed data or data is unavailable');
    }
  }
}
