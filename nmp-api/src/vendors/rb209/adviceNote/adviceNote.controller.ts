import { Controller, Get, Param, Req } from '@nestjs/common';
import { RB209AdviceNoteService } from './adviceNote.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('RB209 AdviceNote')
@Controller('vendors/rb209/AdviceNote')
export class RB209AdviceNoteController {
  constructor(private readonly service: RB209AdviceNoteService) {}

  @Get('/AdviceNotes')
  @ApiOperation({ summary: 'The full list of available Advice Notes' })
  async getAdviceNotes(@Req() req: Request) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/AdviceNote/:adviceNoteCode')
  @ApiOperation({ summary: 'The full list of available Advice Notes' })
  async getAdviceNotesByAdviceNoteCode(
    @Param('adviceNoteCode') adviceNoteCode: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }
}
