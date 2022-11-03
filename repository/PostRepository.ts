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
import { InsertPost, Post } from "../entity/Post.ts";

export interface DbPost {
  id: number;
  title: string;
  content: string;
  user_id: number;
  is_private: boolean;
}

export default class PostRepository implements Repository<Post, InsertPost> {
  private client: PoolClient | Transaction;

  public constructor(client: PoolClient | Transaction) {
    this.client = client;
  }

  private fromDbPost(dbPost: DbPost): Post {
    return new Post(
      dbPost.id,
      dbPost.title,
      dbPost.content,
      dbPost.user_id,
      dbPost.is_private,
    );
  }

  public async insert(entity: InsertPost): Promise<Post | undefined> {
    const { rows } = await this.client.queryObject<
      DbPost
    >`INSERT INTO posts (title, content, user_id, is_private) VALUES (${entity.title}, ${entity.content}, ${entity.userId}, ${entity.isPrivate}) RETURNING id, title, content, user_id, is_private`;

    if (rows.length === 0) {
      return undefined;
    }

    return this.fromDbPost(rows[0]);
  }

  public async deleteById(id: number): Promise<void> {
    await this.client.queryArray("DELETE FROM posts WHERE id = $1", [id]);
  }

  public async update(
    oldEntity: Post,
    newEntity: Post,
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

    pushValue(oldEntity.title, newEntity.title, "title");
    pushValue(oldEntity.content, newEntity.content, "content");
    pushValue(oldEntity.isPrivate, newEntity.isPrivate, "is_private");

    if (fields.length === 0) {
      return false;
    }

    const fieldsAssignValue = fields.map((field, idx) =>
      field + " = $" + (idx + 1)
    ).join(", ");

    await this.client.queryArray(
      "UPDATE posts SET " + fieldsAssignValue + " WHERE id = $" +
        (fields.length + 1),
      [...values, oldEntity.id],
    );

    return true;
  }

  public async findById(id: number): Promise<Post | undefined> {
    const { rows } = await this.client.queryObject<DbPost>(
      "SELECT id, title, content, user_id, is_private FROM posts WHERE id = $1",
      [id],
    );

    if (rows.length === 0) {
      return undefined;
    }

    return this.fromDbPost(rows[0]);
  }

  public async findPublicPostsByTitleOrContentInsecure(
    searchTerm: string,
  ): Promise<Post[]> {
    const { rows } = await this.client.queryObject<DbPost>(
      "SELECT id, title, content, user_id, is_private FROM posts WHERE NOT is_private AND (title LIKE '%" +
        searchTerm + "%' OR content LIKE '%" + searchTerm + "%')",
    );

    return rows.map((dbPost) => this.fromDbPost(dbPost));
  }

  public async findPublicPostsByTitleOrContent(
    searchTerm: string,
  ) {
    const { rows } = await this.client.queryObject<DbPost>(
      "SELECT id, title, content, user_id, is_private FROM posts WHERE NOT is_private AND (title LIKE $1" +
        " OR content LIKE $1)",
      ["%" + searchTerm + "%"],
    );

    return rows.map((dbPost) => this.fromDbPost(dbPost));
  }

  public async findPostsByUserId(
    userId: number,
  ) {
    const { rows } = await this.client.queryObject<DbPost>(
      "SELECt id, title, content, user_id, is_private FROM posts WHERE posts.user_id = $1",
      [userId],
    );

    return rows.map((dbPost) => this.fromDbPost(dbPost));
  }
}
