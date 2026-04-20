-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "rating" INTEGER,
ADD COLUMN     "review" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';
