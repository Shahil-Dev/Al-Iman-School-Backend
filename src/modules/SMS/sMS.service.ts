import nodemailer from "nodemailer";
import config from "../../config";
import prisma from "../../lib/prisma";
import {
  getAbsenceEmailTemplate,
  getFeeReminderEmailTemplate,
} from "./email.template";

const sendEmail = async (to: string, subject: string, htmlContent: string) => {
  const transporter = nodemailer.createTransport({
    host: config.email.host as string,
    port: Number(config.email.port),
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  const mailOptions = {
    from: config.email.from,
    to,
    subject,
    html: htmlContent,
  };

  return await transporter.sendMail(mailOptions);
};

const sendAbsenceAlertEmails = async (date: Date) => {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const absentRecords = await prisma.attendance.findMany({
    where: {
      date: { gte: targetDate },
      status: "ABSENT",
    },
    include: {
      student: {
        include: {
          user: { select: { email: true } },
          parent: { include: { user: { select: { email: true } } } },
        },
      },
    },
  });

  const emailPromises = absentRecords.map(async (record) => {
    const parentEmail =
      record.student.parent?.user?.email || record.student.user?.email;

    if (parentEmail) {
      const studentName = `${record.student.firstName} ${record.student.lastName}`;
      const subject = `[Notice] Absence Alert for ${studentName}`;
      const html = getAbsenceEmailTemplate(
        studentName,
        "N/A",
        targetDate.toLocaleDateString(),
      );

      return sendEmail(parentEmail, subject, html);
    }
  });

  await Promise.all(emailPromises);

  return {
    totalSent: absentRecords.length,
    message: "Absence email alerts sent successfully to parents!",
  };
};

const sendDueFeeReminderEmails = async () => {
  const dueInvoices = await prisma.studentInvoice.findMany({
    where: {
      status: { in: ["PENDING", "PARTIAL"] },
    },
    include: {
      student: {
        include: {
          user: { select: { email: true } },
          parent: { include: { user: { select: { email: true } } } },
        },
      },
    },
  });

  const emailPromises = dueInvoices.map(async (invoice) => {
    const parentEmail =
      invoice.student.parent?.user?.email || invoice.student.user?.email;

    if (parentEmail) {
      const dueAmount = invoice.amount - invoice.paidAmount;
      const studentName = `${invoice.student.firstName} ${invoice.student.lastName}`;
      const subject = `[Reminder] Fee Payment Due for ${studentName}`;
      const html = getFeeReminderEmailTemplate(
        studentName,
        invoice.invoiceNo,
        dueAmount,
        new Date(invoice.dueDate).toLocaleDateString(),
      );

      return sendEmail(parentEmail, subject, html);
    }
  });

  await Promise.all(emailPromises);

  return {
    totalSent: dueInvoices.length,
    message: "Fee due reminder emails sent successfully!",
  };
};

const sendTestEmail = async (toEmail: string) => {
  const subject = "Al-Iman ERP - Nodemailer Test Email";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #28a745; border-radius: 8px;">
      <h2 style="color: #28a745;">Al-Iman School ERP</h2>
      <p>Congratulations! Your Nodemailer setup is working perfectly.</p>
      <p>This is a test notification from the system.</p>
    </div>
  `;
  return await sendEmail(toEmail, subject, html);
};

export const EmailNotificationService = {
  sendEmail,
  sendAbsenceAlertEmails,
  sendDueFeeReminderEmails,
  sendTestEmail,
};
