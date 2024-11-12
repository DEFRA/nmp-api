
const AddressLookupBaseService = require('./base.service');
const CacheManager = require('../rb209/cacheManager');

const cacheManager = new CacheManager();

class AddressLookupService extends AddressLookupBaseService {
  constructor() {
        super(cacheManager);
  }
}

module.exports = AddressLookupService;
