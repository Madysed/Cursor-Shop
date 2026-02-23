/*
  Warnings:

  - You are about to drop the column `imageUrls` on the `Product` table. All the data in the column will be lost.
  - Added the required column `shippingAddress` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingAddress" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "imageUrls",
ADD COLUMN     "images" TEXT[];

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
