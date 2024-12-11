/*
  Warnings:

  - You are about to drop the column `driveFileId` on the `Resource` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Space_order_idx";

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "driveFileId";

-- AlterTable
ALTER TABLE "Space" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Resource_sectionId_order_idx" ON "Resource"("sectionId", "order");

-- CreateIndex
CREATE INDEX "Resource_url_idx" ON "Resource"("url");

-- CreateIndex
CREATE INDEX "Resource_userId_idx" ON "Resource"("userId");

-- CreateIndex
CREATE INDEX "Section_spaceId_order_idx" ON "Section"("spaceId", "order");

-- CreateIndex
CREATE INDEX "Section_userId_idx" ON "Section"("userId");

-- CreateIndex
CREATE INDEX "Space_workspaceId_order_idx" ON "Space"("workspaceId", "order");

-- CreateIndex
CREATE INDEX "Space_workspaceId_isLastActive_idx" ON "Space"("workspaceId", "isLastActive");

-- CreateIndex
CREATE INDEX "Space_isLastActive_idx" ON "Space"("isLastActive");

-- CreateIndex
CREATE INDEX "Space_userId_idx" ON "Space"("userId");

-- CreateIndex
CREATE INDEX "User_lastActiveSpaceId_idx" ON "User"("lastActiveSpaceId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Workspace_userId_isDefault_idx" ON "Workspace"("userId", "isDefault");
