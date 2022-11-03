import { Pool, PoolClient } from "pg";

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
