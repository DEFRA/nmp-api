const { AppDataSource } = require("../db/data-source");
const {
  FertiliserManuresEntity,
} = require("../db/entity/fertiliser-manures.entity");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const { BaseService } = require("../base/base.service");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const { FieldEntity } = require("../db/entity/field.entity");
const { CropEntity } = require("../db/entity/crop.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const { FarmEntity } = require("../db/entity/farm.entity");
const { HandleSoilAnalysisService } = require("../shared/handle-soil-analysis");
const {
  CalculatePKBalanceOther,
} = require("../shared/calculate-pk-balance-other");
const {
  WarningMessagesEntity,
} = require("../db/entity/warning-message.entity");
const {
  CreateOrUpdateWarningMessage,
} = require("../shared/create-update-warning-messages.service");
const {
  ProcessFutureManuresForWarnings,
} = require("../shared/process-future-warning-calculations-service");
const {
  UpdatingFutureRecommendations,
} = require("../shared/updating-future-recommendations-service");
const {
  CurrentAndFuture,
} = require("../shared/generate-current-and-future-recommendations-service");
const {
  fertiliserManuresQueryMethods,
} = require("./fertiliser-manures-query.service");
const {
  fertiliserManuresMutationMethods,
} = require("./fertiliser-manures-mutation.service");

class FertiliserManuresService extends BaseService {
  constructor() {
    super(FertiliserManuresEntity);
    this.repository = AppDataSource.getRepository(FertiliserManuresEntity);
    this.warningMessageRepository = AppDataSource.getRepository(
      WarningMessagesEntity,
    );
    this.organicManureRepository =
      AppDataSource.getRepository(OrganicManureEntity);
    this.RecommendationRepository =
      AppDataSource.getRepository(RecommendationEntity);
    this.fieldRepository = AppDataSource.getRepository(FieldEntity);
    this.cropRepository = AppDataSource.getRepository(CropEntity);
    this.managementPeriodRepository = AppDataSource.getRepository(
      ManagementPeriodEntity,
    );
    this.pkBalanceRepository = AppDataSource.getRepository(PKBalanceEntity);
    this.updatingFutureRecommendations = new UpdatingFutureRecommendations();
    this.soilAnalysisRepository =
      AppDataSource.getRepository(SoilAnalysisEntity);
    this.farmRepository = AppDataSource.getRepository(FarmEntity);
    this.HandleSoilAnalysisService = new HandleSoilAnalysisService();
    this.CalculatePKBalanceOther = new CalculatePKBalanceOther();
    this.CreateOrUpdateWarningMessage = new CreateOrUpdateWarningMessage();
    this.ProcessFutureManuresForWarnings =
      new ProcessFutureManuresForWarnings();
    this.currentAndFuture = new CurrentAndFuture();
  }

  async getFertiliserManureNitrogenSum(...args) {
    return fertiliserManuresQueryMethods.getFertiliserManureNitrogenSum.call(
      this,
      ...args,
    );
  }

  async getTotalNitrogen(...args) {
    return fertiliserManuresQueryMethods.getTotalNitrogen.call(this, ...args);
  }

  async getTotalNitrogenByCropID(...args) {
    return fertiliserManuresQueryMethods.getTotalNitrogenByCropID.call(
      this,
      ...args,
    );
  }

  async getTotalP205AndK20(...args) {
    return fertiliserManuresQueryMethods.getTotalP205AndK20.call(this, ...args);
  }

  async getTotalFertiliserP205AndK20FromRecommandation(...args) {
    return fertiliserManuresQueryMethods.getTotalFertiliserP205AndK20FromRecommandation.call(
      this,
      ...args,
    );
  }

  async getFertiliserByFarmIdAndYear(...args) {
    return fertiliserManuresQueryMethods.getFertiliserByFarmIdAndYear.call(
      this,
      ...args,
    );
  }

  async getTotalNitrogenByManagementPeriodID(...args) {
    return fertiliserManuresQueryMethods.getTotalNitrogenByManagementPeriodID.call(
      this,
      ...args,
    );
  }

  async getTotalNitrogenByManagementPeriodIDAndIsAutumn(...args) {
    return fertiliserManuresQueryMethods.getTotalNitrogenByManagementPeriodIDAndIsAutumn.call(
      this,
      ...args,
    );
  }

  async getClosedPeriodByID(...args) {
    return fertiliserManuresQueryMethods.getClosedPeriodByID.call(
      this,
      ...args,
    );
  }

  async setOtherCropPKBalance(...args) {
    return fertiliserManuresMutationMethods.setOtherCropPKBalance.call(
      this,
      ...args,
    );
  }

  async preparePKBalanceUpdateData(...args) {
    return fertiliserManuresMutationMethods.preparePKBalanceUpdateData.call(
      this,
      ...args,
    );
  }

  async findAsArray(...args) {
    return fertiliserManuresMutationMethods.findAsArray.call(this, ...args);
  }

  async buildPKBalanceData(...args) {
    return fertiliserManuresMutationMethods.buildPKBalanceData.call(
      this,
      ...args,
    );
  }

  async saveWarningMessages(...args) {
    return fertiliserManuresMutationMethods.saveWarningMessages.call(
      this,
      ...args,
    );
  }

  checkNextYearPlanAndFertiliserExist(...args) {
    return fertiliserManuresMutationMethods.checkNextYearPlanAndFertiliserExist.call(
      this,
      ...args,
    );
  }

  async updatePKBalanceAndRegenerateRecommendations(...args) {
    return fertiliserManuresMutationMethods.updatePKBalanceAndRegenerateRecommendations.call(
      this,
      ...args,
    );
  }

  async handlePKBalanceAndFutureRecommendations(...args) {
    return fertiliserManuresMutationMethods.handlePKBalanceAndFutureRecommendations.call(
      this,
      ...args,
    );
  }

  async queueFutureWarningsForSavedFertiliser(...args) {
    return fertiliserManuresMutationMethods.queueFutureWarningsForSavedFertiliser.call(
      this,
      ...args,
    );
  }

  async saveFertilisersAndQueueWarnings(...args) {
    return fertiliserManuresMutationMethods.saveFertilisersAndQueueWarnings.call(
      this,
      ...args,
    );
  }

  async processFertiliserForPKAndRecommendations(...args) {
    return fertiliserManuresMutationMethods.processFertiliserForPKAndRecommendations.call(
      this,
      ...args,
    );
  }

  async createFertiliserManures(...args) {
    return fertiliserManuresMutationMethods.createFertiliserManures.call(
      this,
      ...args,
    );
  }

  async updateFertiliser(...args) {
    return fertiliserManuresMutationMethods.updateFertiliser.call(
      this,
      ...args,
    );
  }

  async deleteFertiliserManure(...args) {
    return fertiliserManuresMutationMethods.deleteFertiliserManure.call(
      this,
      ...args,
    );
  }
}

module.exports = { FertiliserManuresService };
