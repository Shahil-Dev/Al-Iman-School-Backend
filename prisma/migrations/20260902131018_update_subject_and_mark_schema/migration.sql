/*
  Warnings:

  - You are about to drop the column `mcq` on the `marks` table. All the data in the column will be lost.
  - You are about to drop the column `practical` on the `marks` table. All the data in the column will be lost.
  - You are about to drop the column `written` on the `marks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "marks" DROP COLUMN "mcq",
DROP COLUMN "practical",
DROP COLUMN "written",
ADD COLUMN     "fullMarks" DOUBLE PRECISION NOT NULL DEFAULT 100,
ADD COLUMN     "mtMarks" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "terminal" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "subjects" ADD COLUMN     "fullMarks" DOUBLE PRECISION NOT NULL DEFAULT 100,
ADD COLUMN     "hasMT" BOOLEAN NOT NULL DEFAULT true;
