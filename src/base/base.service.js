const { AppDataSource } = require("../db/data-source");
const { Like, getRepository } = require("typeorm");
const boom = require("@hapi/boom");
const { StaticStrings } = require("../shared/static.string");

class BaseService {
  #entity;
  #entityManager;

  constructor(entity) {
    this.#entity = getRepository(entity);
    this.#entityManager = AppDataSource.manager;
  }

  async getById(id) {
    const records = await this.#entity.findOne({ where: { ID: id } });
    return { records };
  }

  async getAll() {
    const records = await this.#entity.find();
    if (!records) {
      throw boom.notFound(StaticStrings.HTTP_STATUS_NOT_FOUND);
    }
    return { records };
  }

  async getBy(column, value, selectOptions) {
    const records = await this.#entity.find({
      where: { [column]: value },
      select: selectOptions,
    });
    return { records };
  }

  async search(columns, value, page = 1, pageSize = 10) {
    const columnsArray = columns?.split(",");
    const where = columnsArray.reduce((acc, col) => {
      acc[col] = Like(`%${value}%`);
      return acc;
    }, {});

    const [records, totalCount] = await this.#entity.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalPages = Math.ceil(totalCount / pageSize);
    const hasPreviousPage = page > 1;
    const hasNextPage = page < totalPages;
    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, totalCount);

    return {
      records,
      settings: {
        totalCount,
        totalPages,
        currentPage: page,
        pageSize,
        hasPreviousPage,
        hasNextPage,
        from,
        to,
      },
    };
  }

  async save(entity, options) {
    return this.#entity.save(entity, options);
  }

  async delete(id) {
    const result = await this.#entity.delete(id);
    return result.affected > 0;
  }

  async saveMultiple(entities) {
    return this.#entity.save(entities);
  }

  async saveMultipleWithTransaction(entities) {
    return this.#entityManager.transaction(
      async (transactionalEntityManager) => {
        const savedEntities = [];
        for (const entity of entities) {
          const savedEntity = await transactionalEntityManager.save(
            this.#entity.create(entity)
          );
          savedEntities.push(savedEntity);
        }
        return savedEntities;
      }
    );
  }

  async recordExists(whereOptions) {
    const count = await this.countRecords(whereOptions);
    return count > 0;
  }

  async countRecords(whereOptions) {
    return await this.#entity.count({
      where: whereOptions,
    });
  }

  async executeQuery(query, parameters = []) {
    if (query.toLowerCase().includes("delete")) {
      throw new boom.HttpException(
        {
          status: boom.HttpStatus.FORBIDDEN,
          error: "Delete query not allowed",
        },
        boom.HttpStatus.FORBIDDEN,
        {
          cause: "Unauthorized",
        }
      );
    }
    return this.#entityManager.query(query, parameters);
  }
}

module.exports = { BaseService };
