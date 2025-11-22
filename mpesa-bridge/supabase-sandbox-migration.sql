-- Create Enum
CREATE TYPE "Environment" AS ENUM ('LIVE', 'SANDBOX');

-- AlterTable Project
ALTER TABLE "projects" ADD COLUMN "test_public_key" TEXT;
ALTER TABLE "projects" ADD COLUMN "test_secret_key" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "projects_test_public_key_key" ON "projects"("test_public_key");
CREATE UNIQUE INDEX "projects_test_secret_key_key" ON "projects"("test_secret_key");

-- AlterTable Transaction
ALTER TABLE "transactions" ADD COLUMN "environment" "Environment" NOT NULL DEFAULT 'LIVE';
