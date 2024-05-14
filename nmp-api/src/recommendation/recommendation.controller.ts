import { Controller } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { RecommendationService } from './recommendation.service';

@ApiTags('Recommendations')
@Controller('recommendations')
export class RecommendationController {
  constructor(private recommendationService: RecommendationService) {}
}
