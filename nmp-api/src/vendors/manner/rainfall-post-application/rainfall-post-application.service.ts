import { Inject, Injectable } from '@nestjs/common';
import { MannerBaseService } from '../base.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { REQUEST } from '@nestjs/core';              
import { Cache } from 'cache-manager';


@Injectable()
export class MannerRainfallPostApplicationService extends MannerBaseService {
  constructor(
    @Inject(CACHE_MANAGER) protected readonly cacheManager: Cache,
    @Inject(REQUEST) protected readonly req: Request,
  ) {
    super(cacheManager, req);
  }
}
