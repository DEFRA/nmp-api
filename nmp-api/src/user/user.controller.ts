import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserWithOrganisationDto } from './dto/create-user.dto';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth('token')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/')
  @ApiOperation({
    summary: 'Create User along with Organisation api',
  })
  async createUserWithOrganisation(
    @Body() body: CreateUserWithOrganisationDto,
  ) {
    const data = await this.userService.createUserWithOrganisation(
      body.Organisation,
      body.User,
    );
    return data;
  }
}
