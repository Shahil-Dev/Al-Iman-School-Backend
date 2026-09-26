import prisma from "../../lib/prisma";
import axios from "axios";
import { TCreateAttendancePayload } from "./attendance.interface";

// 🌐 Helper function to trigger WhatsApp via Railway Microservice
const triggerWhatsAppAlert = async (phone: string, message: string) => {
  try {
    const baseUrl =
      process.env.WHATSAPP_MICROSERVICE_URL ||
      "https://al-imanwhatsappservice-production.up.railway.app";

    // Remove trailing slash if provided in env
    const microserviceUrl = baseUrl.replace(/\/$/, "");
    const secretKey = process.env.MICROSERVICE_SECRET_KEY;

    console.log(`🚀 [Microservice Request] Dispatching WhatsApp to: ${phone}`);

    const response = await axios.post(
      `${microserviceUrl}/send-message`,
      { phone, message },
      {
        headers: {
          "Content-Type": "application/json",
          "x-secret-key": secretKey,
        },
        timeout: 12000, // 12 seconds timeout for cross-server latency
      },
    );

    console.log(
      `✅ [Microservice Success] Response:`,
      response.data?.message || "Dispatched",
    );
  } catch (error: any) {
    console.error(
      "❌ [Microservice Error] Failed to send WhatsApp alert:",
      error?.response?.data || error?.message || error,
    );
  }
};

const takeAttendanceIntoDB = async (payload: TCreateAttendancePayload) => {
  console.log("📥 [Service Received] Processing attendance payload...");
  const { date, classId, sectionId, attendances } = payload;
  const attendanceDate = new Date(date);

  // 1. Bulk upsert using transaction
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
    }),
  );

  const result = await prisma.$transaction(operations);
  console.log("💾 [DB Success] Attendance recorded in Database successfully!");

  // 2. WhatsApp Alert for ABSENT Students
  const absentStudentIds = attendances
    .filter((item) => item.status === "ABSENT")
    .map((item) => item.studentId);

  console.log(
    `🚨 [Absent Check] Total Absent Students Found: ${absentStudentIds.length}`,
  );

  if (absentStudentIds.length > 0) {
    // Fetch absent students profile with relations
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

    const formattedDate = attendanceDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    // 3. Dispatch WhatsApp Alert via Railway Microservice
    for (const student of absentStudents) {
      const targetPhone =
        student.phone || student.altPhone || student.parent?.phone;

      console.log(
        `🔍 Checking contact for student ${student.firstName}: ${targetPhone}`,
      );

      if (targetPhone) {
        const message = `Dear Parent, Your child *${student.firstName} ${student.lastName}* (Roll: ${student.rollNo}, Class: ${student.class?.name || "N/A"}) was marked *ABSENT* today (*${formattedDate}*) at Al-Iman School. Please contact administration if you have any query.`;

        // Async call to WhatsApp Microservice
        triggerWhatsAppAlert(targetPhone, message);
      } else {
        console.warn(
          `⚠️ No phone number found for student: ${student.firstName} ${student.lastName}`,
        );
      }
    }
  }

  return result;
};

const getSectionAttendanceFromDB = async (
  classId: string,
  sectionId: string,
  date: string,
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
