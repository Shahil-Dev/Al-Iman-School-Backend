import prisma from "../../lib/prisma";
import { sendWhatsAppMessage } from "../../utils/sendWhatsApp";
import { TCreateAttendancePayload } from "./attendance.interface";

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

  // WhatsApp Alert for ABSENT Students
  const absentStudentIds = attendances
    .filter((item) => item.status === "ABSENT")
    .map((item) => item.studentId);

  if (absentStudentIds.length > 0) {
    // Fetch absent students, including parent contact numbers
    const absentStudents = await prisma.studentProfile.findMany({
      where: {
        id: { in: absentStudentIds },
      },
      include: {
        class: true,
        section: true,
        parent: true, // 👈 Added Parent relation to fetch guardian phone
      },
    });

    const formattedDate = attendanceDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    // Send WhatsApp Alert
    for (const student of absentStudents) {
      // Check phone hierarchy: Student Phone -> Alt Phone -> Parent Phone
      const targetPhone =
        student.phone || student.altPhone || student.parent?.phone;

      console.log(`🔍 Checking contact for student ${student.firstName}: ${targetPhone}`);

      if (targetPhone) {
        const message = `Dear Parent, Your child *${student.firstName} ${student.lastName}* (Roll: ${student.rollNo}, Class: ${student.class.name}) was marked *ABSENT* today (*${formattedDate}*) at Al-Iman School. Please contact administration if you have any query.`;

        // Trigger WhatsApp Notification
        await sendWhatsAppMessage(targetPhone, message);
      } else {
        console.warn(`⚠️ No phone number found for student: ${student.firstName} ${student.lastName}`);
      }
    }
  }

  return result;
};

const getSectionAttendanceFromDB = async (
  classId: string,
  sectionId: string,
  date: string
) => {
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
          firstName: true,
          lastName: true,
          gender: true,
        },
      },
    },
    orderBy: {
      student: {
        rollNo: "asc",
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
    where: { studentId, status: "PRESENT" },
  });

  const absentDays = await prisma.attendance.count({
    where: { studentId, status: "ABSENT" },
  });

  const lateDays = await prisma.attendance.count({
    where: { studentId, status: "LATE" },
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