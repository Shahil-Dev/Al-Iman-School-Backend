import { AttendanceStatus } from '@prisma/client';

export type TSingleStudentAttendance = {
  studentId: string;
  status: AttendanceStatus;
};

export type TCreateAttendancePayload = {
  date: string; // YYYY-MM-DD
  classId: string;
  sectionId: string;
  attendances: TSingleStudentAttendance[];
};