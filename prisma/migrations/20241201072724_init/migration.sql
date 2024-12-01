/*
  Warnings:

  - You are about to drop the column `isDefault` on the `Workspace` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "isDefault";

-- CreateTable
CREATE TABLE "DefaultWorkspace" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DefaultWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DefaultWorkspace_userId_key" ON "DefaultWorkspace"("userId");

-- RenameForeignKey
ALTER TABLE "Space" RENAME CONSTRAINT "Space_workspaceId_fkey" TO "Space_workspace_fkey";

-- AddForeignKey
ALTER TABLE "DefaultWorkspace" ADD CONSTRAINT "DefaultWorkspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_defaultWorkspace_fkey" FOREIGN KEY ("workspaceId") REFERENCES "DefaultWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
