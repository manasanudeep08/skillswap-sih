import "dotenv/config";

import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../app/generated/prisma/client";

const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl) {
  throw new Error("TURSO_DATABASE_URL is not defined");
}

if (!authToken) {
  throw new Error("TURSO_AUTH_TOKEN is not defined");
}

const adapter = new PrismaLibSql({
  url: databaseUrl,
  authToken,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}