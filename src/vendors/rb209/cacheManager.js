class CacheManager {
  constructor() {
    this.cache = new Map();
  }

  async get(key) {
    return this.cache.get(key);
  }

  async set(key, value, options) {
    this.cache.set(key, value);
    if (options && options.ttl) {
      setTimeout(() => this.cache.delete(key), options.ttl * 1000);
    }
  }
}

module.exports = CacheManager;
