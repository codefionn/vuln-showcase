import { PoolClient } from "pg";
import Repository from "./Repository.ts";
import { HASH_SALT, InsertUser, User } from "../entity/User.ts";
import { hash } from "argon2";
import { encode } from "std/encoding/base64url.ts";

interface DbUser {
  id: number;
  email: string;
  firstname: string;
  surname: string;
  hashed_password: string;
  is_active: boolean;
}

export default class UserRepository implements Repository<User, InsertUser> {
  private client: PoolClient;

  public constructor(client: PoolClient) {
    this.client = client;
  }

  private fromDbUser(dbUser: DbUser): User {
    return new User(
      dbUser.id,
      dbUser.email,
      dbUser.firstname,
      dbUser.surname,
      dbUser.hashed_password,
      dbUser.is_active,
    );
  }

  public async insert(entity: InsertUser): Promise<User | undefined> {
    const encoder = new TextEncoder();

    const hashedPassword = encode(hash(
      encoder.encode(entity.cleartextPassword),
      encoder.encode(HASH_SALT),
    ));

    const { rows } = await this.client.queryObject<
      DbUser
    >`INSERT INTO users (email, firstname, surname, hashed_password) VALUES (${entity.email}, ${entity.name}, ${entity.surname}, ${hashedPassword}) RETURNING id, email, firstname, surname, hashed_password, is_active`;

    if (rows.length === 0) {
      return undefined;
    }

    return this.fromDbUser(rows[0]);
  }

  public async deleteById(id: number): Promise<void> {
    await this.client.queryArray("DELETE FROM users WHERE id = $1", [id]);
  }

  public async update(
    oldEntity: User,
    newEntity: User,
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

    pushValue(oldEntity.email, newEntity.email, "email");
    pushValue(oldEntity.name, newEntity.name, "name");
    pushValue(oldEntity.surname, newEntity.surname, "surname");
    pushValue(oldEntity.isActive, newEntity.isActive, "is_active");

    if (fields.length === 0) {
      return false;
    }

    const fieldsAssignValue = fields.map((field, idx) =>
      field + " = $" + (idx + 1)
    ).join(", ");

    await this.client.queryArray(
      "UPDATE users SET " + fieldsAssignValue + " WHERE id = $" +
        (fields.length + 1),
      [...values, oldEntity.id],
    );

    return true;
  }

  public async findById(id: number): Promise<User | undefined> {
    const { rows } = await this.client.queryObject<DbUser>(
      "SELECT id, email, firstname, surname, hashed_password, is_active FROM users WHERE id = $1",
      [id],
    );

    if (rows.length === 0) {
      return undefined;
    }

    return this.fromDbUser(rows[0]);
  }

  public async findByEmail(email: string): Promise<User | undefined> {
    const { rows } = await this.client.queryObject<DbUser>(
      "SELECT id, email, firstname, surname, hashed_password, is_active FROM users WHERE email = $1",
      [email],
    );

    if (rows.length === 0) {
      return undefined;
    }

    return this.fromDbUser(rows[0]);
  }
}
