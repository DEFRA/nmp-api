import OrganisationEntity from '@db/entity/organisation.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class OrganisationService extends BaseService<
  OrganisationEntity,
  ApiDataResponseType<OrganisationEntity>
> {
  constructor(
    @InjectRepository(OrganisationEntity)
    protected readonly repository: Repository<OrganisationEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }

  async updateOrCreateOrganisation(organisationData: OrganisationEntity) {
    try {
      const storedProcedure =
        'EXEC dbo.spOrganisations_MergeOrganisation @organisationId = @0, @organisationName = @1';
      const organisation = await this.executeQuery(storedProcedure, [
        organisationData.ID,
        organisationData.Name,
      ]);
      return organisation;
    } catch (error) {
      console.error(
        'Error while fetching updating or creating organisation:',
        error,
      );
      throw error;
    }
  }
}
