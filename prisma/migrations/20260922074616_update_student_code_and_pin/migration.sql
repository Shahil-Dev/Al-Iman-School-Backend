/*
  Warnings:

  - A unique constraint covering the columns `[studentCode]` on the table `student_profiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pin` to the `student_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentCode` to the `student_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `teacher_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN     "pin" TEXT NOT NULL,
ADD COLUMN     "studentCode" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "teacher_profiles" ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "gender" "Gender" NOT NULL,
ADD COLUMN     "nidOrPassport" TEXT,
ADD COLUMN     "qualification" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_studentCode_key" ON "student_profiles"("studentCode");
