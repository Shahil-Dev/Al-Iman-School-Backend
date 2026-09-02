import { z } from 'zod';
import { Gender } from '@prisma/client';

const createTeacherValidationSchema = z.object({
  body: z.object({
    password: z.string().optional(),
    teacher: z.object({
      email: z.string({ message: 'Email is required!' }).email('Invalid email format!'),
      employeeId: z.string({ message: 'Employee ID is required!' }),
      name: z.string({ message: 'Teacher name is required!' }),
      designation: z.string({ message: 'Designation is required!' }),
      phone: z.string({ message: 'Phone number is required!' }),
      photoUrl: z.string().optional(),
    }),
  }),
});

const createStudentValidationSchema = z.object({
  body: z.object({
    password: z.string().optional(),
    student: z.object({
      email: z.string().email('Invalid email format!').optional(),
      studentIdNo: z.string({ message: 'Student ID No is required!' }),
      firstName: z.string({ message: 'First name is required!' }),
      lastName: z.string({ message: 'Last name is required!' }),
      gender: z.nativeEnum(Gender, { message: 'Gender is required!' }),
      dob: z.string({ message: 'Date of birth is required!' }),
      phone: z.string().optional(),
      address: z.string().optional(),
      photoUrl: z.string().optional(),
      classId: z.string({ message: 'Class ID is required!' }),
      sectionId: z.string({ message: 'Section ID is required!' }),
      rollNo: z.number({ message: 'Roll number must be a number!' }),
      parentId: z.string().optional(),
    }),
  }),
});

export const UserValidation = {
  createTeacherValidationSchema,
  createStudentValidationSchema,
};