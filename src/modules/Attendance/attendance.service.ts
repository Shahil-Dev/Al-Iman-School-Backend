import prisma from "../../lib/prisma";
import axios from "axios";

export interface ISingleAttendanceInput {
  studentId: string;
  status: "PRESENT" | "ABSENT" | "LATE";
}

export interface ITakeAttendancePayload {
  date: string; // YYYY-MM-DD
  classId: string;
  sectionId: string;
  attendances: ISingleAttendanceInput[];
}

// 1. Take / Update Bulk Attendance into DB & Trigger WhatsApp Alerts for ABSENT Students
const takeAttendanceIntoDB = async (payload: ITakeAttendancePayload) => {
  const { date, classId, sectionId, attendances } = payload;
  const attendanceDate = new Date(date);

  // DB Operations for Bulk Upsert
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
        studentId: item.studentId,
        classId,
        sectionId,
        date: attendanceDate,
        status: item.status,
      },
    })
  );

  const result = await prisma.$transaction(operations);

  // 🔴 Trigger WhatsApp Dispatch for ABSENT Students
  const absentStudentIds = attendances
    .filter((item) => item.status === "ABSENT")
    .map((item) => item.studentId);

  if (absentStudentIds.length > 0) {
    // Background execution to protect DB performance
    (async () => {
      try {
        const absentStudents = await prisma.studentProfile.findMany({
          where: {
            id: { in: absentStudentIds },
          },
          include: {
            class: true,
            section: true,
            parentProfile: true,
          },
        });

        const microserviceUrl = process.env.WHATSAPP_MICROSERVICE_URL;
        const secretKey = process.env.MICROSERVICE_SECRET_KEY;

        if (!microserviceUrl) {
          console.error("⚠️ WHATSAPP_MICROSERVICE_URL missing in .env!");
          return;
        }

        for (const student of absentStudents as any[]) {
          // Safe phone number extraction from parentProfile or student fields
          const parentPhone =
            student.parentProfile?.phone ||
            student.guardianPhone ||
            student.phone;

          if (parentPhone) {
            const studentName = `${student.firstName || ""} ${student.lastName || ""}`.trim();
            const className = student.class?.name || "N/A";
            const sectionName = student.section?.name || "";

            const message = `السلام عليكم,\nসম্মানিত অভিভাবক, আপনার সন্তান ${studentName} (শ্রেণি: ${className} ${sectionName}, রোল: ${student.rollNo}) আজ (${date}) আল-ঈমান স্কুলে অনুপস্থিত রয়েছে।\n\n- আল-ঈমান স্কুল ও কলেজ কর্তৃপক্ষ।`;

            try {
              await axios.post(
                `${microserviceUrl}/send-message`,
                {
                  phone: parentPhone,
                  message,
                },
                {
                  headers: {
                    "x-secret-key": secretKey,
                  },
                }
              );
              console.log(`✅ [WhatsApp Absent Alert Sent] Student: ${studentName} | Phone: ${parentPhone}`);
            } catch (msgErr: any) {
              console.error(
                `❌ [WhatsApp Dispatch Failed] Student: ${studentName} | Phone: ${parentPhone} | Error:`,
                msgErr?.response?.data || msgErr?.message
              );
            }
          }
        }
      } catch (err) {
        console.error("❌ Error in WhatsApp notification loop:", err);
      }
    })();
  }

  return result;
};

// 2. Get Section Attendance List for a Specific Date
const getSectionAttendanceFromDB = async (
  classId: string,
  sectionId: string,
  date: string
) => {
  const targetDate = new Date(date);

  // Get enrolled students in section
  const students = await prisma.studentProfile.findMany({
    where: {
      classId,
      sectionId,
    },
    orderBy: {
      rollNo: "asc",
    },
    select: {
      id: true,
      studentCode: true,
      studentIdNo: true,
      firstName: true,
      lastName: true,
      rollNo: true,
      photoUrl: true,
    },
  });

  // Fetch attendance records for target date
  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      classId,
      sectionId,
      date: targetDate,
    },
  });

  // Map attendance record with student profile
  const attendanceMap = new Map(
    attendanceRecords.map((att) => [att.studentId, att.status])
  );

  const result = students.map((student) => ({
    studentId: student.id,
    studentCode: student.studentCode,
    studentIdNo: student.studentIdNo,
    studentName: `${student.firstName} ${student.lastName}`.trim(),
    rollNo: student.rollNo,
    photoUrl: student.photoUrl,
    status: attendanceMap.get(student.id) || "PRESENT", // Default to PRESENT if unrecorded
  }));

  return result;
};

// 3. Get Attendance Summary for Individual Student
const getStudentAttendanceSummaryFromDB = async (studentId: string) => {
  const totalRecords = await prisma.attendance.count({
    where: { studentId },
  });

  const presentCount = await prisma.attendance.count({
    where: { studentId, status: "PRESENT" },
  });

  const absentCount = await prisma.attendance.count({
    where: { studentId, status: "ABSENT" },
  });

  const lateCount = await prisma.attendance.count({
    where: { studentId, status: "LATE" },
  });

  const percentage =
    totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(2) : "100.00";

  return {
    totalRecords,
    presentCount,
    absentCount,
    lateCount,
    percentage: Number(percentage),
  };
};

export const AttendanceService = {
  takeAttendanceIntoDB,
  getSectionAttendanceFromDB,
  getStudentAttendanceSummaryFromDB,
};