import { DeepPartial } from 'typeorm';

export default interface MutableContract<Entity> {
  save(entity: DeepPartial<Entity>): Promise<Entity>;
  delete(id: number): Promise<boolean>;
  saveMultiple(entities: DeepPartial<Entity>[]): Promise<Entity[]>;
  saveMultipleWithTransaction(
    entities: DeepPartial<Entity>[],
  ): Promise<Entity[]>;
}
