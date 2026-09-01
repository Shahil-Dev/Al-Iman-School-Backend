/*
  Warnings:

  - A unique constraint covering the columns `[classId,sectionId,rollNo]` on the table `student_profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_classId_sectionId_rollNo_key" ON "student_profiles"("classId", "sectionId", "rollNo");
