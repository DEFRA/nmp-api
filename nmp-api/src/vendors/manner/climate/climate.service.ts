import { Inject, Injectable } from '@nestjs/common';


import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { MannerBaseService } from '../base.service';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class MannerClimateService extends MannerBaseService {
  constructor(
    @Inject(CACHE_MANAGER) protected readonly cacheManager: Cache,
    @Inject(REQUEST) protected readonly req: Request,
  ) {
    super(cacheManager, req);
  }
}
