/*
  Warnings:

  - You are about to drop the column `comment` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `menuId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Review` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentName,itemName]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `itemName` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentName` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_menuId_fkey";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "comment",
DROP COLUMN "menuId",
DROP COLUMN "userId",
ADD COLUMN     "itemName" TEXT NOT NULL,
ADD COLUMN     "menuItemId" INTEGER,
ADD COLUMN     "review" TEXT,
ADD COLUMN     "studentName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Review_studentName_itemName_key" ON "Review"("studentName", "itemName");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
