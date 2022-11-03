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

import { Pool, PoolClient, Transaction } from "pg";

const POOL_CONNECTIONS = 16;

const dbPool = new Pool(
  {
    user: "appuser",
    password: "test",
    database: "app",
    hostname: "/var/run/postgresql",
    host_type: "socket",
    port: 5432,
  },
  POOL_CONNECTIONS,
  true,
);

/**
 * Establishes a connection to the database and calls the function `fn` with the
 * established connections.
 * @param fn The function to call
 * @returns Returns the result of the function `fn`.
 */
export async function connectDb<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await dbPool.connect();

  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

/**
 * Establishes a connection to the database and calls the function `fn` with the
 * established connections. All changes made inside `fn` will be rolled back.
 * @param fn The function to call
 * @returns Returns the result of the function `fn`.
 */
export async function connectDbTestTransaction<T>(
  fn: (client: Transaction) => Promise<T>,
): Promise<T> {
  return await connectDb(async (dbClient) => {
    const transaction = dbClient.createTransaction("thisisatest");
    try {
      await transaction.begin();
      return await fn(transaction);
    } finally {
      await transaction.rollback();
    }
  });
}
