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

// Helper: Format Bangladesh phone numbers into WhatsApp compatible standard (880...)
const formatBDPhone = (phone: string): string => {
  let clean = phone.replace(/\D/g, "");
  if (clean.startsWith("0")) {
    clean = `88${clean}`;
  } else if (!clean.startsWith("88") && clean.length === 10) {
    clean = `88${clean}`;
  }
  return clean;
};

// Helper: Normalize YYYY-MM-DD date safely without time shifting
const parseDateToUTC = (dateStr: string) => {
  const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
};

const getStartOfDayUTC = (dateStr: string) => parseDateToUTC(dateStr);

const getEndOfDayUTC = (dateStr: string) => {
  const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
};

// 1. Take / Update Bulk Attendance into DB & Trigger WhatsApp Alerts
const takeAttendanceIntoDB = async (payload: ITakeAttendancePayload) => {
  const { date, classId, sectionId, attendances } = payload;
  const attendanceDate = getStartOfDayUTC(date);

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

  // Trigger WhatsApp Dispatch for ABSENT Students
  const absentStudentIds = attendances
    .filter((item) => item.status && item.status.toUpperCase() === "ABSENT")
    .map((item) => item.studentId);

  if (absentStudentIds.length > 0) {
    // Process WhatsApp alert dispatching
    (async () => {
      try {
        const absentStudents = await prisma.studentProfile.findMany({
          where: {
            id: { in: absentStudentIds },
          },
          include: {
            class: true,
            section: true,
            parent: true,
          },
        });

        const rawBaseUrl = process.env.WHATSAPP_MICROSERVICE_URL || "";
        const microserviceUrl = rawBaseUrl.replace(/\/+$/, "");
        const secretKey = process.env.MICROSERVICE_SECRET_KEY;

        if (!microserviceUrl) {
          console.warn("⚠️ WHATSAPP_MICROSERVICE_URL not configured in env");
          return;
        }

        for (const student of absentStudents as any[]) {
          // Priority: Admission/Student Profile Phone -> Linked Parent Phone -> Alt Phone
          const rawPhone =
            student.phone || student.parent?.phone || student.altPhone;

          if (!rawPhone) continue;

          const formattedPhone = formatBDPhone(rawPhone);
          const studentName = `${student.firstName || ""} ${student.lastName || ""}`.trim();
          const className = student.class?.name || "N/A";
          const rollNo = student.rollNo ?? "N/A";

          const message = `Dear Parent, Your child ${studentName} (Roll: ${rollNo}, Class: ${className}) was marked ABSENT today (${date}) at Al-Iman School. Please contact administration if you have any query.`;

          try {
            await axios.post(
              `${microserviceUrl}/send-message`,
              { phone: formattedPhone, message },
              {
                headers: {
                  "x-secret-key": secretKey,
                  "Content-Type": "application/json",
                },
                timeout: 5000,
              }
            );
            console.log(`✅ [WhatsApp Sent] ${studentName} (${formattedPhone})`);
          } catch (msgErr: any) {
            console.error(`❌ [WhatsApp Error] ${studentName}:`, msgErr?.message);
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
  const startDate = getStartOfDayUTC(date);
  const endDate = getEndOfDayUTC(date);

  const students = await prisma.studentProfile.findMany({
    where: { classId, sectionId },
    orderBy: { rollNo: "asc" },
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

  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      classId,
      sectionId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const attendanceMap = new Map(
    attendanceRecords.map((att) => [att.studentId, att.status])
  );

  return students.map((student) => ({
    studentId: student.id,
    studentCode: student.studentCode,
    studentIdNo: student.studentIdNo,
    studentName: `${student.firstName} ${student.lastName}`.trim(),
    rollNo: student.rollNo,
    photoUrl: student.photoUrl,
    status: attendanceMap.get(student.id) || "PRESENT",
  }));
};

// 3. Get Attendance Summary & Detailed Logs for Individual Student
const getStudentAttendanceSummaryFromDB = async (identifier: string) => {
  const student = await prisma.studentProfile.findFirst({
    where: {
      OR: [
        { id: identifier },
        { userId: identifier },
        { studentCode: identifier },
      ],
    },
    select: { id: true, firstName: true, lastName: true },
  });

  if (!student) {
    throw new Error("Student profile not found!");
  }

  const targetStudentId = student.id;

  const logs = await prisma.attendance.findMany({
    where: { studentId: targetStudentId },
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      status: true,
    },
  });

  const totalRecords = logs.length;
  const presentCount = logs.filter((r) => r.status === "PRESENT").length;
  const absentCount = logs.filter((r) => r.status === "ABSENT").length;
  const lateCount = logs.filter((r) => r.status === "LATE").length;

  const percentage =
    totalRecords > 0
      ? Number(((presentCount / totalRecords) * 100).toFixed(2))
      : 100;

  return {
    studentId: targetStudentId,
    totalDays: totalRecords,
    presentDays: presentCount,
    absentDays: absentCount,
    lateDays: lateCount,
    percentage,
    logs,
    summary: {
      totalRecords,
      presentCount,
      absentCount,
      lateCount,
      percentage,
    },
    records: logs,
  };
};

export const AttendanceService = {
  takeAttendanceIntoDB,
  getSectionAttendanceFromDB,
  getStudentAttendanceSummaryFromDB,
};