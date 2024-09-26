import { Inject, Injectable } from '@nestjs/common';
import { MannerBaseService } from '../base.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { REQUEST } from '@nestjs/core';


@Injectable()
export class MannerCalculateNutrientsService extends MannerBaseService {
  constructor(
    @Inject(CACHE_MANAGER) protected readonly cacheManager: Cache,
    @Inject(REQUEST) protected readonly req: Request,
  ) {
    super(cacheManager, req);
  }
}
