import { AttendanceStatus } from '@prisma/client';
import { z } from 'zod';

const createAttendanceValidationSchema = z.object({
  body: z.object({
    date: z.string({ message: 'Date is required!' }),
    classId: z.string({ message: 'Class ID is required!' }),
    sectionId: z.string({ message: 'Section ID is required!' }),
    attendances: z.array(
      z.object({
        studentId: z.string({ message: 'Student ID is required!' }),
        status: z.nativeEnum(AttendanceStatus, { message: 'Invalid attendance status!' }),
      })
    ).min(1, 'At least one student attendance record is required!'),
  }),
});

export const AttendanceValidation = {
  createAttendanceValidationSchema,
};