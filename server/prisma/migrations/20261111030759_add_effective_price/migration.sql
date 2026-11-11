-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "brand" TEXT NOT NULL DEFAULT 'Stride Athletics',
    "categoryId" INTEGER NOT NULL,
    "gender" TEXT NOT NULL DEFAULT 'unisex',
    "basePrice" INTEGER NOT NULL,
    "salePrice" INTEGER,
    "effectivePrice" INTEGER NOT NULL DEFAULT 0,
    "badge" TEXT,
    "ratingAverage" REAL NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("badge", "basePrice", "brand", "categoryId", "createdAt", "deletedAt", "description", "gender", "id", "isPublished", "name", "publishedAt", "ratingAverage", "ratingCount", "salePrice", "sku", "slug", "updatedAt") SELECT "badge", "basePrice", "brand", "categoryId", "createdAt", "deletedAt", "description", "gender", "id", "isPublished", "name", "publishedAt", "ratingAverage", "ratingCount", "salePrice", "sku", "slug", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE INDEX "Product_categoryId_isPublished_idx" ON "Product"("categoryId", "isPublished");
CREATE INDEX "Product_gender_isPublished_idx" ON "Product"("gender", "isPublished");
CREATE INDEX "Product_isPublished_createdAt_idx" ON "Product"("isPublished", "createdAt");
CREATE INDEX "Product_isPublished_effectivePrice_idx" ON "Product"("isPublished", "effectivePrice");
CREATE INDEX "Product_name_idx" ON "Product"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
