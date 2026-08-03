const { AppDataSource } = require("../db/data-source");
const { Like, getRepository } = require("typeorm");
const boom = require("@hapi/boom");
const { StaticStrings } = require("../shared/static.string");
const { runWithRetry } = require("../shared/resilience-guard.service");

class BaseService {
  #entity;
  #entityManager;

  static #defaultGetByLimit = 200;
  static #defaultGetByRetries = 2;
  static #defaultGetByRetryDelayMs = 200;

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
  async getAllWithLastUpdatedDate(organisationId) {
    const records = await this.#entity.query(
      "EXEC dbo.spFarms_GetAllFarmsWithLastUpdatedDate @OrganisationID = @0",
      [organisationId],
    );

    return { records };
  }

  #resolveGetByOptions(selectOptionsOrQueryOptions, queryOptions) {
    const optionsCandidate = selectOptionsOrQueryOptions;
    const isSelectOptions =
      Array.isArray(optionsCandidate) || optionsCandidate === undefined;

    return {
      selectOptions: isSelectOptions ? optionsCandidate : undefined,
      queryOptions: isSelectOptions
        ? queryOptions
        : (optionsCandidate ?? queryOptions),
    };
  }

  #buildGetByWhere(column, value) {
    if (column && typeof column === "object" && !Array.isArray(column)) {
      return column;
    }

    return { [column]: value };
  }

  #resolveSafeTake(take) {
    if (!Number.isFinite(take)) {
      return BaseService.#defaultGetByLimit;
    }

    const normalizedTake = Math.floor(take);
    if (normalizedTake <= 0) {
      return BaseService.#defaultGetByLimit;
    }

    return Math.min(normalizedTake, 1000);
  }

  #isRetryableReadError(error) {
    const driverCode = error?.driverError?.code ?? error?.code;
    const driverNumber = error?.driverError?.number ?? error?.number;

    return (
      driverCode === "ETIMEOUT" ||
      driverCode === "ESOCKET" ||
      driverNumber === 1205
    );
  }

  async getBy(column, value, selectOptionsOrQueryOptions, queryOptions) {
    const { selectOptions, queryOptions: resolvedQueryOptions } =
      this.#resolveGetByOptions(selectOptionsOrQueryOptions, queryOptions);

    const where = this.#buildGetByWhere(column, value);
    const take = this.#resolveSafeTake(resolvedQueryOptions?.take);

    const records = await runWithRetry(
      async () =>
        this.#entity.find({
          where,
          select: selectOptions,
          order: resolvedQueryOptions?.order,
          skip: resolvedQueryOptions?.skip,
          take,
        }),
      {
        retries: BaseService.#defaultGetByRetries,
        baseDelayMs: BaseService.#defaultGetByRetryDelayMs,
        shouldRetry: this.#isRetryableReadError.bind(this),
      },
    );
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
            this.#entity.create(entity),
          );
          savedEntities.push(savedEntity);
        }
        return savedEntities;
      },
    );
  }

  async recordExists(whereOptions) {
    const count = await this.countRecords(whereOptions);
    return count > 0;
  }

  async countRecords(whereOptions) {
    return this.#entity.count({
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
        },
      );
    }
    return this.#entityManager.query(query, parameters);
  }
}

module.exports = { BaseService };
