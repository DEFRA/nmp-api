import { EntityManager, Repository } from 'typeorm';
import BaseRepository from './base.repository';

const mockRepository = {} as Repository<any>;
const mockEntityManager = {} as EntityManager;

class MockEntity {
  id: number;
  name: string;
}

const baseRepository = new BaseRepository<MockEntity, any>(
  mockRepository,
  mockEntityManager,
);

describe('BaseRepository', () => {
  describe('getAll', () => {
    it('should return all records', async () => {
      mockRepository.find = jest.fn().mockResolvedValue([
        { id: 1, name: 'Record 1' },
        { id: 2, name: 'Record 2' },
      ]);

      const result = await baseRepository.getAll();

      expect(result.records).toHaveLength(2);
      expect(result.records[0]).toEqual({ id: 1, name: 'Record 1' });
      expect(result.records[1]).toEqual({ id: 2, name: 'Record 2' });
    });
  });

  describe('getById', () => {
    it('should return a record by ID', async () => {
      mockRepository.findOne = jest
        .fn()
        .mockResolvedValue({ id: 1, name: 'Record 1' });

      const result = await baseRepository.getById(1);

      expect(result.records).toEqual({ id: 1, name: 'Record 1' });
    });
  });

  describe('search', () => {
    it('should return records matching search criteria', async () => {
      mockRepository.findAndCount = jest.fn().mockResolvedValue([
        [
          { id: 1, name: 'Record 1' },
          { id: 2, name: 'Record 2' },
        ],
        2,
      ]);

      const result = await baseRepository.search('name', 'Record', 1, 10);

      expect(result.records).toHaveLength(2);
      expect(result.settings.totalCount).toBe(2);
      expect(result.settings.currentPage).toBe(1);
    });
  });

  describe('save', () => {
    it('should save a new entity', async () => {
      mockRepository.save = jest
        .fn()
        .mockResolvedValue({ id: 1, name: 'Record 1' });

      const result = await baseRepository.save({ name: 'Record 1' });

      expect(result).toEqual({ id: 1, name: 'Record 1' });
    });
  });

  describe('delete', () => {
    it('should delete a record by ID', async () => {
      mockRepository.delete = jest.fn().mockResolvedValue({ affected: 1 });

      const result = await baseRepository.delete(1);

      expect(result).toBe(true);
    });
  });

  // describe('saveMultiple', () => {
  //   it('should save multiple entities', async () => {
  //     // Mocking the repository's save method
  //     mockRepository.save = jest.fn().mockResolvedValue([
  //       { id: 1, name: 'Record 1' },
  //       { id: 2, name: 'Record 2' },
  //     ]);

  //     const result = await baseRepository.saveMultiple([
  //       { name: 'Record 1' },
  //       { name: 'Record 2' },
  //     ]);

  //     expect(result).toHaveLength(2);
  //     expect(result[0]).toEqual({ id: 1, name: 'Record 1' });
  //     expect(result[1]).toEqual({ id: 2, name: 'Record 2' });
  //   });
  // });

  // describe('saveMultipleWithTransaction', () => {
  //   it('should save multiple entities within a transaction', async () => {
  //     mockEntityManager.transaction = jest
  //       .fn()
  //       .mockImplementation(async (fn) => {
  //         const transactionalEntityManager = {} as EntityManager;
  //         const savedEntities = [
  //           { id: 1, name: 'Record 1' },
  //           { id: 2, name: 'Record 2' },
  //         ];

  //         transactionalEntityManager.save = jest
  //           .fn()
  //           .mockResolvedValue(savedEntities);
  //         return await fn(transactionalEntityManager);
  //       });

  //     const result = await baseRepository.saveMultipleWithTransaction([
  //       { name: 'Record 1' },
  //       { name: 'Record 2' },
  //     ]);

  //     expect(result).toHaveLength(2);
  //     expect(result[0]).toEqual({ id: 1, name: 'Record 1' });
  //     expect(result[1]).toEqual({ id: 2, name: 'Record 2' });
  //   });
  // });
});
