// W tym pliczku też nic nie zmieniamy - postgres ma zostać :3
import { Pool } from "pg";

const pg =
  new Pool();

export const db = {
  sql: async (
    query: string,
    params?: unknown[],
  ) => {
    const res =
      await pg.query(
        query,
        params,
      );

    return res.rows as unknown[];
  },
};
