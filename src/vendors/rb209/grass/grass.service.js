const RB209BaseService = require("../base.service");
const CacheManager = require("../cacheManager");

const cacheManager = new CacheManager();
class RB209GrassService extends RB209BaseService {
  constructor() {
    super(cacheManager);
  }
}

module.exports = RB209GrassService;
