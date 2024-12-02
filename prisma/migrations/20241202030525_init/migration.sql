/*
  Warnings:

  - You are about to drop the `DefaultWorkspace` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DefaultWorkspace" DROP CONSTRAINT "DefaultWorkspace_userId_fkey";

-- DropForeignKey
ALTER TABLE "Space" DROP CONSTRAINT "Space_defaultWorkspace_fkey";

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "DefaultWorkspace";

-- RenameForeignKey
ALTER TABLE "Space" RENAME CONSTRAINT "Space_workspace_fkey" TO "Space_workspaceId_fkey";
