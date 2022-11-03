/*
 * vuln-showcase - Showcasing some common web vulnerabilities
 * Copyright (C) 2022 Fionn Langhans
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { PoolClient, Transaction } from "pg";
import Repository from "./Repository.ts";
import { InsertUser, User } from "../entity/User.ts";
import { hashPassword } from "../utils/password.ts";

interface DbUser {
  id: number;
  email: string;
  firstname: string;
  surname: string;
  hashed_password: string;
  is_active: boolean;
}

export default class UserRepository implements Repository<User, InsertUser> {
  private client: PoolClient | Transaction;

  public constructor(client: PoolClient | Transaction) {
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
    const hashedPassword = hashPassword(entity.cleartextPassword);
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
