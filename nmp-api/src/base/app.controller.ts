import { Controller } from '@nestjs/common';
import { BaseService } from './base.service';

@Controller()
export class BaseController<Entity, ResponseType> {
  constructor(protected readonly service: BaseService<Entity, ResponseType>) {}
}
