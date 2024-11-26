/*
  Warnings:

  - You are about to drop the column `position` on the `Resource` table. All the data in the column will be lost.
  - Added the required column `order` to the `Resource` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Resource_position_idx";

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "position",
ADD COLUMN     "order" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Resource_order_idx" ON "Resource"("order");
