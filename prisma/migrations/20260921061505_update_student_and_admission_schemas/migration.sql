/*
  Warnings:

  - The values [HOLIDAY] on the enum `AttendanceStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `applicantName` on the `admission_applications` table. All the data in the column will be lost.
  - You are about to drop the column `appliedAt` on the `admission_applications` table. All the data in the column will be lost.
  - You are about to drop the column `desiredClass` on the `admission_applications` table. All the data in the column will be lost.
  - The `status` column on the `admission_applications` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `fileUrl` on the `notices` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `notices` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[applicationNo]` on the table `admission_applications` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transactionId]` on the table `admission_applications` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[date,studentId]` on the table `attendances` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `amount` to the `admission_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `applicationNo` to the `admission_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classId` to the `admission_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateOfBirth` to the `admission_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fatherName` to the `admission_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `admission_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guardianPhone` to the `admission_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motherName` to the `admission_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `admission_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `permanentAddress` to the `admission_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `presentAddress` to the `admission_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `religion` to the `admission_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderPhone` to the `admission_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentName` to the `admission_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionId` to the `admission_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `admission_applications` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `admission_applications` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `classId` to the `attendances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `attendances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `notices` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AdmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NoticeTarget" AS ENUM ('ALL', 'STUDENTS', 'TEACHERS', 'PARENTS');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ID_CARD', 'TESTIMONIAL', 'TRANSFER_CERTIFICATE', 'MARK_SHEET');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('PENDING', 'PAID');

-- AlterEnum
BEGIN;
CREATE TYPE "AttendanceStatus_new" AS ENUM ('PRESENT', 'ABSENT', 'LATE');
ALTER TABLE "attendances" ALTER COLUMN "status" TYPE "AttendanceStatus_new" USING ("status"::text::"AttendanceStatus_new");
ALTER TYPE "AttendanceStatus" RENAME TO "AttendanceStatus_old";
ALTER TYPE "AttendanceStatus_new" RENAME TO "AttendanceStatus";
DROP TYPE "AttendanceStatus_old";
COMMIT;

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'CANCELLED';

-- DropIndex
DROP INDEX "attendances_studentId_date_key";

-- AlterTable
ALTER TABLE "admission_applications" DROP COLUMN "applicantName",
DROP COLUMN "appliedAt",
DROP COLUMN "desiredClass",
ADD COLUMN     "admitOtherKids" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "altPhone" TEXT,
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "applicationNo" TEXT NOT NULL,
ADD COLUMN     "birthRegNo" TEXT,
ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "classId" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'Bangladesh',
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fatherName" TEXT NOT NULL,
ADD COLUMN     "fatherNid" TEXT,
ADD COLUMN     "fatherOccupation" TEXT,
ADD COLUMN     "gender" "Gender" NOT NULL,
ADD COLUMN     "guardianAddress" TEXT,
ADD COLUMN     "guardianEmail" TEXT,
ADD COLUMN     "guardianName" TEXT,
ADD COLUMN     "guardianOccupation" TEXT,
ADD COLUMN     "guardianPhone" TEXT NOT NULL,
ADD COLUMN     "healthConditions" TEXT[],
ADD COLUMN     "height" TEXT,
ADD COLUMN     "motherName" TEXT NOT NULL,
ADD COLUMN     "motherNid" TEXT,
ADD COLUMN     "motherOccupation" TEXT,
ADD COLUMN     "nationality" TEXT NOT NULL DEFAULT 'Bangladeshi',
ADD COLUMN     "passportExpiryDate" TIMESTAMP(3),
ADD COLUMN     "passportNo" TEXT,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL,
ADD COLUMN     "permanentAddress" TEXT NOT NULL,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "presentAddress" TEXT NOT NULL,
ADD COLUMN     "prevInstituteAddress" TEXT,
ADD COLUMN     "prevInstituteName" TEXT,
ADD COLUMN     "references" TEXT,
ADD COLUMN     "rejectReason" TEXT,
ADD COLUMN     "religion" TEXT NOT NULL,
ADD COLUMN     "sameAsPresent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "senderPhone" TEXT NOT NULL,
ADD COLUMN     "siblingStudentId" TEXT,
ADD COLUMN     "studentName" TEXT NOT NULL,
ADD COLUMN     "transactionId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "weight" TEXT,
ALTER COLUMN "email" SET NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "AdmissionStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "classId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PRESENT';

-- AlterTable
ALTER TABLE "notices" DROP COLUMN "fileUrl",
DROP COLUMN "isPublic",
ADD COLUMN     "attachment" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "targetGroup" "NoticeTarget" NOT NULL DEFAULT 'ALL',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN     "altPhone" TEXT,
ADD COLUMN     "birthRegNo" TEXT,
ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "country" TEXT DEFAULT 'Bangladesh',
ADD COLUMN     "fatherName" TEXT,
ADD COLUMN     "fatherNid" TEXT,
ADD COLUMN     "fatherOccupation" TEXT,
ADD COLUMN     "healthConditions" TEXT[],
ADD COLUMN     "height" TEXT,
ADD COLUMN     "motherName" TEXT,
ADD COLUMN     "motherNid" TEXT,
ADD COLUMN     "motherOccupation" TEXT,
ADD COLUMN     "nationality" TEXT DEFAULT 'Bangladeshi',
ADD COLUMN     "passportNo" TEXT,
ADD COLUMN     "permanentAddress" TEXT,
ADD COLUMN     "prevInstituteName" TEXT,
ADD COLUMN     "religion" TEXT,
ADD COLUMN     "weight" TEXT;

-- CreateTable
CREATE TABLE "class_routines" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_routines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_documents" (
    "id" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "qrCodeUrl" TEXT,
    "issuedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_payrolls" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "basicSalary" DOUBLE PRECISION NOT NULL,
    "allowance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deduction" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netSalary" DOUBLE PRECISION NOT NULL,
    "status" "PayrollStatus" NOT NULL DEFAULT 'PENDING',
    "paymentDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_payrolls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teacher_payrolls_teacherId_month_year_key" ON "teacher_payrolls"("teacherId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "admission_applications_applicationNo_key" ON "admission_applications"("applicationNo");

-- CreateIndex
CREATE UNIQUE INDEX "admission_applications_transactionId_key" ON "admission_applications"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_date_studentId_key" ON "attendances"("date", "studentId");

-- AddForeignKey
ALTER TABLE "admission_applications" ADD CONSTRAINT "admission_applications_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_routines" ADD CONSTRAINT "class_routines_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_routines" ADD CONSTRAINT "class_routines_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_routines" ADD CONSTRAINT "class_routines_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "parent_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_documents" ADD CONSTRAINT "student_documents_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_payrolls" ADD CONSTRAINT "teacher_payrolls_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
