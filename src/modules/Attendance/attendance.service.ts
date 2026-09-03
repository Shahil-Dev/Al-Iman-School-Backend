// import prisma from '../../../lib/prisma';
import prisma from '../../lib/prisma';
import { TCreateAttendancePayload } from './attendance.interface';

const takeAttendanceIntoDB = async (payload: TCreateAttendancePayload) => {
  const { date, classId, sectionId, attendances } = payload;
  const attendanceDate = new Date(date);

  // Bulk upsert using transaction
  const operations = attendances.map((item) =>
    prisma.attendance.upsert({
      where: {
        date_studentId: {
          date: attendanceDate,
          studentId: item.studentId,
        },
      },
      update: {
        status: item.status,
      },
      create: {
        date: attendanceDate,
        studentId: item.studentId,
        classId,
        sectionId,
        status: item.status,
      },
    })
  );

  const result = await prisma.$transaction(operations);
  return result;
};

const getSectionAttendanceFromDB = async (classId: string, sectionId: string, date: string) => {
  const attendanceDate = new Date(date);

  const result = await prisma.attendance.findMany({
    where: {
      classId,
      sectionId,
      date: attendanceDate,
    },
    include: {
      student: {
        select: {
          id: true,
          studentIdNo: true,
          rollNo: true,
          gender: true,
        },
      },
    },
    orderBy: {
      student: {
        rollNo: 'asc',
      },
    },
  });

  return result;
};

const getStudentAttendanceSummaryFromDB = async (studentId: string) => {
  const totalDays = await prisma.attendance.count({
    where: { studentId },
  });

  const presentDays = await prisma.attendance.count({
    where: { studentId, status: 'PRESENT' },
  });

  const absentDays = await prisma.attendance.count({
    where: { studentId, status: 'ABSENT' },
  });

  const lateDays = await prisma.attendance.count({
    where: { studentId, status: 'LATE' },
  });

  return {
    totalWorkingDays: totalDays,
    totalPresence: presentDays,
    totalAbsent: absentDays,
    totalLate: lateDays,
  };
};

export const AttendanceService = {
  takeAttendanceIntoDB,
  getSectionAttendanceFromDB,
  getStudentAttendanceSummaryFromDB,
};