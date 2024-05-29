import OrganisationEntity from '@db/entity/organisation.entity';
import UserEntity from '@db/entity/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserWithOrganisationDto {
  @ApiProperty()
  User: UserEntity;

  @ApiProperty()
  Organisation: OrganisationEntity;
}
