import { PoolClient, Transaction } from "pg";
import Repository from "./Repository.ts";
import { Confirm, InsertConfirm, SubjectNameTypes } from "../entity/Confirm.ts";

interface DbConfirm {
  id: number;
  confirm_key: string;
  subject_name: string;
  subject_id: number;
}

export default class ConfirmRepository
  implements Repository<Confirm, InsertConfirm> {
  private client: PoolClient | Transaction;

  public constructor(client: PoolClient | Transaction) {
    this.client = client;
  }

  private fromDbConfirm(dbConfirm: DbConfirm): Confirm | undefined {
    if (dbConfirm.subject_name !== "user") {
      return undefined;
    }

    return new Confirm(
      dbConfirm.id,
      dbConfirm.confirm_key,
      dbConfirm.subject_name,
      dbConfirm.subject_id,
    );
  }

  public async insert(entity: InsertConfirm): Promise<Confirm | undefined> {
    const { rows } = await this.client.queryObject<
      DbConfirm
    >`INSERT INTO confirmations (subject_name, subject_id) VALUES (${entity.subjectName}, ${entity.subjectId}) RETURNING id, confirm_key, subject_name, subject_id`;

    if (rows.length === 0) {
      return undefined;
    }

    return this.fromDbConfirm(rows[0]);
  }

  public async deleteById(id: number): Promise<void> {
    await this.client.queryArray("DELETE FROM confirmations WHERE id = $1", [
      id,
    ]);
  }

  public async update(
    oldEntity: Confirm,
    newEntity: Confirm,
  ): Promise<boolean> {
    if (oldEntity.id !== newEntity.id) {
      throw new Error("Ids must be equals for update");
    }

    const fields: string[] = [];
    const values: unknown[] = [];

    function pushValue<T>(oldValue: T, newValue: T, field: string) {
      if (newValue !== oldValue) {
        fields.push(field);
        values.push(newValue);
      }
    }

    pushValue(oldEntity.subjectName, newEntity.subjectName, "subject_name");
    pushValue(oldEntity.subjectId, newEntity.subjectId, "subject_id");

    if (fields.length === 0) {
      return false;
    }

    const fieldsAssignValue = fields.map((field, idx) =>
      field + " = $" + (idx + 1)
    ).join(", ");

    await this.client.queryArray(
      "UPDATE confirmations SET " + fieldsAssignValue + " WHERE id = $" +
        (fields.length + 1),
      [...values, oldEntity.id],
    );

    return true;
  }

  public async findById(id: number): Promise<Confirm | undefined> {
    const { rows } = await this.client.queryObject<DbConfirm>(
      "SELECT id, confirm_key, subject_name, subject_id FROM confirmations WHERE id = $1",
      [id],
    );

    if (rows.length === 0) {
      return undefined;
    }

    return this.fromDbConfirm(rows[0]);
  }

  public async findBySubjectNameAndKey(
    subjectName: SubjectNameTypes,
    key: string,
  ): Promise<Confirm | undefined> {
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        .test(key)
    ) {
      return undefined;
    }

    const { rows } = await this.client.queryObject<DbConfirm>(
      "SELECT id, confirm_key, subject_name, subject_id FROM confirmations WHERE subject_name = $1 AND confirm_key = $2",
      [subjectName, key],
    );

    if (rows.length === 0) {
      return undefined;
    }

    return this.fromDbConfirm(rows[0]);
  }
}
