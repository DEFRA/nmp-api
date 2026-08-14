class CacheManager {
  constructor() {
    this.cache = new Map();
  }

  async get(key) {
    return this.cache.get(key);
  }

  async set(key, value, options) {
    this.cache.set(key, value);
    if (options?.ttl) {
      setTimeout(() => this.cache.delete(key), options.ttl * 1000);
    }
  }

  async delete(key) {
    return this.cache.delete(key);
  }
}

module.exports = CacheManager;
