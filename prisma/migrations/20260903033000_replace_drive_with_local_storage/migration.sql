-- AlterTable
ALTER TABLE "Document" ADD COLUMN "storageKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Document_storageKey_key" ON "Document"("storageKey");
