import { PrismaClient } from "@/lib/generated/prisma"

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = db;
}

// to memorize 
// globalThis.prisma: this global variable ensures that the Prisma Client instance is
// reused across hot reloads during development. Without this, each time your application
// reloads, a new instance of the Prisma client would be created, potentially leading
// to connection issues.