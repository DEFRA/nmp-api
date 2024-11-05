const RB209BaseService = require("../base.service");
const CacheManager = require("../cacheManager");

const cacheManager = new CacheManager();
class RB209AdviceNoteService extends RB209BaseService {
  constructor() {
    super(cacheManager);
  }
}

module.exports = RB209AdviceNoteService;