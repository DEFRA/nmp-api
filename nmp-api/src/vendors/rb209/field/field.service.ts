import { Inject, Injectable } from '@nestjs/common';

import { RB209BaseService } from '../base.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RB209FieldService extends RB209BaseService {
  constructor(@Inject(CACHE_MANAGER) protected readonly cacheManager: Cache) {
    super(cacheManager);
  }
}
