const RB209BaseService = require("../base.service");
const CacheManager = require("../cacheManager");

const cacheManager = new CacheManager();
class RB209MeasurementScotlandService extends RB209BaseService {
  constructor() {
    super(cacheManager);
  }
}

module.exports = RB209MeasurementScotlandService;
