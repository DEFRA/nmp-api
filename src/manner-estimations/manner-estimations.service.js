const { AppDataSource } = require("../db/data-source");
const { BaseService } = require("../base/base.service");
const {
  MannerEstimationsEntity,
} = require("../db/entity/manner-estimations.entity");
const {
  MannerEstimationApplicationsEntity,
} = require("../db/entity/manner-estimation-applications.entity");
const MannerApiNutrientsProductService = require("../vendors/manner/nutrient-products/nutrients-product.service");
const MannerApiNutrientsService = require("../vendors/manner/nutrients/nutrients.service");
const MannerManureTypesService = require("../vendors/manner/manure-types/manure-types.service");
const MannerTopSoilsService = require("../vendors/manner/top-soil/top-soil.service");
const RB209ArableService = require("../vendors/rb209/arable/arable.service");
const MannerCountriesService = require("../vendors/manner/countries/countries.service");
const MannerApplicationMethodService = require("../vendors/manner/application-method/application-method.service");
const MannerIncorporationMethodService = require("../vendors/manner/incorporation-method/incorporation-method.service");
const MannerIncorporationDelayService = require("../vendors/manner/incorporation-delay/incorporation-delay.service");
const MannerMoistureTypesService = require("../vendors/manner/moisture-types/moisture-types.service");
const MannerWindspeedService = require("../vendors/manner/windspeed/windspeed.service");
const MannerRainTypesService = require("../vendors/manner/rain-types/rain-types.service");
const MannerApiCropTypesService = require("../vendors/manner/crop-types/crop-types.service");
const { CountryEntity } = require("../db/entity/country.entity");
const {
  CalculateMannerOutputService,
} = require("../shared/calculate-manner-output-service");
const {
  MannerCalculateNutrientsService,
} = require("../organic-manure/organic-manure-dependencies");
const {
  mannerEstimationsWriteHelpers,
} = require("./manner-estimations-write-helpers");
const {
  mannerEstimationsFinancialHelpers,
} = require("./manner-estimations-financial-helpers");
const {
  mannerEstimationsReadHelpers,
} = require("./manner-estimations-read-helpers");

const {  MannerFarmsEntity } = require("../db/entity/manner-farms.entity");
class MannerEstimationsService extends BaseService {
  constructor() {
    super(MannerEstimationsEntity);
    this.repository = AppDataSource.getRepository(MannerEstimationsEntity);
    this.mannerEstimationApplicationRepository = AppDataSource.getRepository(
      MannerEstimationApplicationsEntity,
    );
    this.countryRepository = AppDataSource.getRepository(CountryEntity);
    this.nutrientsService = new MannerApiNutrientsService();
    this.nutrientsProductService = new MannerApiNutrientsProductService();
    this.MannerManureTypesService = new MannerManureTypesService();
    this.MannerTopSoilsService = new MannerTopSoilsService();
    this.rB209ArableService = new RB209ArableService();
    this.MannerCountriesService = new MannerCountriesService();
    this.MannerApplicationMethodService = new MannerApplicationMethodService();
    this.MannerIncorporationMethodService =
      new MannerIncorporationMethodService();
    this.MannerIncorporationDelayService =
      new MannerIncorporationDelayService();
    this.MannerMoistureTypesService = new MannerMoistureTypesService();
    this.MannerWindspeedService = new MannerWindspeedService();
    this.MannerRainTypesService = new MannerRainTypesService();
    this.CalculateMannerOutputService = new CalculateMannerOutputService();
    this.MannerCalculateNutrientsService = new MannerCalculateNutrientsService();
    this.MannerCropTypesService = new MannerApiCropTypesService();
          this.mannerFarmsRepository = AppDataSource.getRepository(
      MannerFarmsEntity,
    );
  }
}

Object.assign(
  MannerEstimationsService.prototype,
  mannerEstimationsWriteHelpers,
  mannerEstimationsFinancialHelpers,
  mannerEstimationsReadHelpers,
);

module.exports = { MannerEstimationsService };
