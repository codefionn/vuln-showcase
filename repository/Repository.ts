export default interface Repository<Entity, InsertEntity> {
  insert(entity: InsertEntity): Promise<Entity | undefined>;
  deleteById(id: number): Promise<void>;
  update(oldEntity: Entity, newEntity: Entity): Promise<boolean>;
  findById(id: number): Promise<Entity | undefined>;
}
