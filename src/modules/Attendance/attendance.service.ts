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

// Helper to format BD Phone Numbers cleanly for WhatsApp
const formatBDPhone = (phone: string): string => {
  let clean = phone.replace(/\D/g, ""); // strip non-digits
  if (clean.startsWith("0")) {
    clean = `88${clean}`;
  } else if (!clean.startsWith("88") && clean.length === 10) {
    clean = `88${clean}`;
  }
  return clean;
};

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
    .filter((item) => item.status && item.status.toUpperCase() === "ABSENT")
    .map((item) => item.studentId);

  console.log(`📡 [Attendance Processing] Total Absent Students Found: ${absentStudentIds.length}`);

  if (absentStudentIds.length > 0) {
    // Non-blocking async background execution
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
        const microserviceUrl = rawBaseUrl.replace(/\/+$/, ""); // Remove trailing slash
        const secretKey = process.env.MICROSERVICE_SECRET_KEY;

        if (!microserviceUrl) {
          console.error("❌ WHATSAPP_MICROSERVICE_URL missing in .env!");
          return;
        }

        for (const student of absentStudents as any[]) {
          // Check parent phone or student phone fallback
          const rawPhone =
            student.parent?.phone ||
            student.phone ||
            student.guardianPhone;

          if (!rawPhone) {
            console.warn(`⚠️ [WhatsApp Warning] No phone number found for student: ${student.firstName} ${student.lastName} (ID: ${student.id})`);
            continue;
          }

          const formattedPhone = formatBDPhone(rawPhone);
          const studentName = `${student.firstName || ""} ${student.lastName || ""}`.trim();
          const className = student.class?.name || "N/A";
          const rollNo = student.rollNo || "N/A";

          // 💬 Custom Exact Message requested
          const message = `Dear Parent, Your child ${studentName} (Roll: ${rollNo}, Class: ${className}) was marked ABSENT today (${date}) at Al-Iman School. Please contact administration if you have any query.`;

          console.log(`🛫 [Dispatching WA Alert] To: ${formattedPhone} | Student: ${studentName}`);

          try {
            const res = await axios.post(
              `${microserviceUrl}/send-message`,
              {
                phone: formattedPhone,
                message,
              },
              {
                headers: {
                  "x-secret-key": secretKey,
                  "Content-Type": "application/json",
                },
              }
            );

            console.log(`✅ [WhatsApp Dispatch Success] Student: ${studentName} | Status: ${res.data?.message || 'OK'}`);
          } catch (msgErr: any) {
            console.error(
              `❌ [WhatsApp Dispatch HTTP Failed] Student: ${studentName} | Phone: ${formattedPhone} | Error:`,
              msgErr?.response?.data || msgErr?.message
            );
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

  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      classId,
      sectionId,
      date: targetDate,
    },
  });

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
    status: attendanceMap.get(student.id) || "PRESENT",
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