import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// 1. Connection Pool үүсгэх (Adapter ашиглахад заавал хэрэгтэй)
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 2. Global instance зарлах
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 3. Singleton үүсгэх
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter, // Энд adapter-оо дамжуулж байна
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// 4. Development орчинд global instance-д хадгалах
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
