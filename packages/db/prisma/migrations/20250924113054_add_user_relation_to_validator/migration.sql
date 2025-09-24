/*
  Warnings:

  - A unique constraint covering the columns `[publicKey]` on the table `Validator` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Validator` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Validator" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Validator_publicKey_key" ON "Validator"("publicKey");

-- CreateIndex
CREATE UNIQUE INDEX "Validator_userId_key" ON "Validator"("userId");

-- AddForeignKey
ALTER TABLE "Validator" ADD CONSTRAINT "Validator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
