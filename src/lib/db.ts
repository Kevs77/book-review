import { Pool, QueryResult, QueryResultRow } from "pg";

const connectionString = process.env.DATABASE_URL as string;

if (!connectionString) {
  throw new Error("DATABASE_URL no esta configurado");
}

const pool = new Pool({
  connectionString,
  // para railway
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

type QueryParams = (string | number | boolean | null)[];

export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: QueryParams
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}
