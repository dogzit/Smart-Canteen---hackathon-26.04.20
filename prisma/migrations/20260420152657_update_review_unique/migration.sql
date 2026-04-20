/*
  Warnings:

  - You are about to drop the column `itemName` on the `Review` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentName,menuItemId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Made the column `menuItemId` on table `Review` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_menuItemId_fkey";

-- DropIndex
DROP INDEX "Review_studentName_itemName_key";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "itemName",
ALTER COLUMN "menuItemId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Review_studentName_menuItemId_key" ON "Review"("studentName", "menuItemId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
