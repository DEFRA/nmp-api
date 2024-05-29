import OrganisationEntity from '@db/entity/organisation.entity';
import UserEntity from '@db/entity/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { OrganisationService } from '@src/organisation/organisation.service';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class UserService extends BaseService<
  UserEntity,
  ApiDataResponseType<UserEntity>
> {
  constructor(
    @InjectRepository(UserEntity)
    protected readonly repository: Repository<UserEntity>,
    @InjectRepository(OrganisationEntity)
    protected readonly organisationRepository: Repository<OrganisationEntity>,
    protected readonly entityManager: EntityManager,
    protected readonly organisationService: OrganisationService,
  ) {
    super(repository, entityManager);
  }

  private async updateOrCreateUser(userData: UserEntity) {
    try {
      const storedProcedure =
        'EXEC dbo.spUsers_MergeUser @userIdentifier = @0, @givenName = @1, @surname = @2, @email = @3';
      const organisation = await this.executeQuery(storedProcedure, [
        userData.UserIdentifier,
        userData.GivenName,
        userData.Surname,
        userData.Email,
      ]);
      return organisation;
    } catch (error) {
      console.error('Error while fetching updating or creating user:', error);
      throw error;
    }
  }

  async createUserWithOrganisation(
    organisation: OrganisationEntity,
    user: UserEntity,
  ) {
    await this.organisationService.updateOrCreateOrganisation(organisation);
    await this.updateOrCreateUser(user);
    const updatedUser = await this.repository.findOneBy({
      UserIdentifier: user.UserIdentifier,
    });
    return {
      UserID: updatedUser.ID,
    };
  }
}
