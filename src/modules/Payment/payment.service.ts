import { PaymentMethod, PaymentStatus, TransactionStatus } from "@prisma/client";
import axios from "axios";
import prisma from "../../lib/prisma";
import {
  TApprovePaymentPayload,
  TCollectPaymentPayload,
  TCreateFeeStructurePayload,
  TCreateInvoicePayload,
  TGenerateMonthlyInvoicesPayload,
} from "./payment.interface";

// ----------------------------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------------------------

const formatBDPhone = (phone: string): string => {
  let clean = phone.replace(/\D/g, "");
  if (clean.startsWith("0")) {
    clean = `88${clean}`;
  } else if (!clean.startsWith("88") && clean.length === 10) {
    clean = `88${clean}`;
  }
  return clean;
};

const getRecipientPhone = (student: any): string | null => {
  return student?.parent?.phone || student?.phone || student?.altPhone || null;
};

const generateFeeReminderTemplate = (
  studentName: string,
  amount: number,
  invoiceNo: string,
  dueDateFormatted: string
): string => {
  return `আসসালামু আলাইকুম ওয়া রহমাতুল্লাহ।

সম্মানিত অভিভাবক/অভিভাবিকা,
আমাদের প্রতিষ্ঠানের মূল লক্ষ্য হলো শিক্ষার্থীদের ইসলামিক মূল্যবোধ ও আধুনিক শিক্ষার সমন্বয়ে এক একজন আদর্শ মানুষ হিসেবে গড়ে তোলা। এই শিক্ষা কার্যক্রম সুন্দর, সাবলীল ও সুশৃঙ্খলভাবে পরিচালনার পেছনে প্রতিষ্ঠানের খরচ পরিচালনা এবং শিক্ষক-কর্মচারীদের মাসিক পারিশ্রমিক নিয়মিত প্রদান করা অত্যন্ত জরুরি।

পবিত্র কুরআনে আল্লাহ তাআলা ইরশাদ করেছেন:
"হে মুমিনগণ! তোমরা অঙ্গীকারসমূহ পূর্ণ করো।" — (সূরা আল-মায়িদাহ, আয়াত: ১)

আপনার সন্তান ${studentName}-এর শিক্ষা অর্জন যেন নিরবচ্ছিন্ন থাকে এবং প্রতিষ্ঠানটি যেন সুচারুরূপে পরিচালিত হতে পারে, সে উদ্দেশ্যে চলতি মাসের ফি/বকেয়া ফি বাবদ ৳${amount} (ইনভয়েস নং: ${invoiceNo}) আগামী ${dueDateFormatted}-এর মধ্যে পরিশোধ করার জন্য বিশেষভাবে অনুরোধ করা হচ্ছে।

—
আল-ইমান স্কুল অ্যান্ড কলেজ`;
};

const sendWhatsAppNotification = async (phone: string, message: string) => {
  try {
    let baseUrl =
      process.env.WHATSAPP_MICROSERVICE_URL ||
      "https://al-imanwhatsappservice-production.up.railway.app";

    baseUrl = baseUrl.trim().replace(/\/+$/, "");
    if (!baseUrl.endsWith("/send-message")) {
      baseUrl = `${baseUrl}/send-message`;
    }

    const secretKey =
      process.env.MICROSERVICE_SECRET_KEY || "my_super_secret_key_123";

    const formattedPhone = formatBDPhone(phone);

    await axios.post(
      baseUrl,
      { phone: formattedPhone, message },
      {
        headers: {
          "x-secret-key": secretKey,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err: unknown) {
    const errorMsg = axios.isAxiosError(err)
      ? err.response?.data || err.message
      : (err as Error).message;

    console.error("❌ WhatsApp Dispatch Error:", errorMsg);
  }
};

// ----------------------------------------------------------------------
// SERVICE METHODS
// ----------------------------------------------------------------------

// 1. Fee Structure Setup
const setFeeStructureInDB = async (payload: TCreateFeeStructurePayload) => {
  const result = await prisma.feeStructure.upsert({
    where: {
      classId_feeHeadId: {
        classId: payload.classId,
        feeHeadId: payload.feeHeadId,
      },
    },
    update: { amount: payload.amount },
    create: {
      classId: payload.classId,
      feeHeadId: payload.feeHeadId,
      amount: payload.amount,
    },
  });
  return result;
};

// 2. Automated Bulk Monthly Invoice Generator (Class-wise Fee Structure mapping)
const generateMonthlyInvoicesInDB = async (payload: TGenerateMonthlyInvoicesPayload) => {
  const students = await prisma.studentProfile.findMany({
    include: {
      class: {
        include: {
          feeStructures: true,
        },
      },
      parent: true,
    },
  });

  const dueDate = new Date(payload.dueDate);
  let createdCount = 0;

  for (const student of students) {
    const totalAmount = student.class.feeStructures.reduce(
      (sum, fs) => sum + fs.amount,
      0
    );

    if (totalAmount <= 0) continue;

    const invoiceNo = `INV-${Date.now().toString().slice(-6)}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    await prisma.studentInvoice.create({
      data: {
        invoiceNo,
        studentId: student.id,
        amount: totalAmount,
        dueDate,
        status: PaymentStatus.PENDING,
      },
    });

    createdCount++;

    const recipientPhone = getRecipientPhone(student);
    if (recipientPhone) {
      const studentName = `${student.firstName || ""} ${student.lastName || ""}`.trim();
      const dueDateFormatted = dueDate.toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const message = generateFeeReminderTemplate(
        studentName,
        totalAmount,
        invoiceNo,
        dueDateFormatted
      );

      await sendWhatsAppNotification(recipientPhone, message);
    }
  }

  return { createdCount };
};

// 3. Create Manual Single Invoice
const createInvoiceIntoDB = async (payload: TCreateInvoicePayload) => {
  const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;

  const result = await prisma.studentInvoice.create({
    data: {
      invoiceNo,
      studentId: payload.studentId,
      amount: payload.amount,
      dueDate: new Date(payload.dueDate),
      status: PaymentStatus.PENDING,
    },
    include: {
      student: {
        include: {
          parent: true,
        },
      },
    },
  });

  const recipientPhone = getRecipientPhone(result.student);
  if (recipientPhone) {
    const studentName = `${result.student.firstName || ""} ${result.student.lastName || ""}`.trim();
    const dueDateFormatted = new Date(payload.dueDate).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const message = generateFeeReminderTemplate(
      studentName,
      payload.amount,
      invoiceNo,
      dueDateFormatted
    );

    await sendWhatsAppNotification(recipientPhone, message);
  }

  return result;
};

// 4. Collect Payment (Offline/Cash: APPROVED immediately; Online/Bank: PENDING_APPROVAL)
const processPaymentInDB = async (payload: TCollectPaymentPayload) => {
  const { invoiceId, amount, method, transactionId, receiptUrl } = payload;

  const invoice = await prisma.studentInvoice.findUnique({
    where: { id: invoiceId },
    include: {
      student: {
        include: {
          parent: true,
        },
      },
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found!");
  }

  if (invoice.status === PaymentStatus.PAID) {
    throw new Error("This invoice is already fully paid!");
  }

  if (transactionId) {
    const existingTransaction = await prisma.paymentTransaction.findFirst({
      where: { transactionId: transactionId.trim() },
    });

    if (existingTransaction) {
      throw new Error(
        "এই ট্রানজেকশন আইডিটি (TrxID) ইতিমধ্যে ব্যবহার করা হয়েছে! সঠিক তথ্য প্রদান করুন।"
      );
    }
  }

  const isCash = method === PaymentMethod.CASH;
  const initialTrxStatus = isCash
    ? TransactionStatus.APPROVED
    : TransactionStatus.PENDING_APPROVAL;

  const finalTrxId = transactionId
    ? transactionId.trim()
    : `CASH-${Date.now().toString().slice(-6)}`;

  const result = await prisma.$transaction(async (tx) => {
    const transaction = await tx.paymentTransaction.create({
      data: {
        invoiceId,
        amount,
        method,
        transactionId: finalTrxId,
        receiptUrl: receiptUrl || null,
        status: initialTrxStatus,
      },
    });

    let updatedInvoice: any = invoice;

    if (isCash) {
      const updatedPaidAmount = invoice.paidAmount + amount;
      const isFullyPaid = updatedPaidAmount >= invoice.amount;

      updatedInvoice = await tx.studentInvoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: updatedPaidAmount,
          status: isFullyPaid ? PaymentStatus.PAID : PaymentStatus.PARTIAL,
        },
        include: {
          student: {
            include: {
              parent: true,
            },
          },
        },
      });
    }

    return { transaction, invoice: updatedInvoice };
  });

  const recipientPhone = getRecipientPhone(invoice.student);

  if (recipientPhone && isCash) {
    const studentName = `${invoice.student.firstName || ""} ${invoice.student.lastName || ""}`.trim();
    const confirmMessage = `আসসালামু আলাইকুম। আল-ইমান স্কুল অ্যান্ড কলেজ।\n\nধন্যবাদ! আপনার সন্তান ${studentName}-এর ফি সফলভাবে ক্যাশে গ্রহণ করা হয়েছে।\n\nইনভয়েস নং: ${invoice.invoiceNo}\nপরিশোধিত অর্থ: ৳${amount}\nপেমেন্ট মেথড: CASH\nরসিদ আইডি: ${finalTrxId}`;

    await sendWhatsAppNotification(recipientPhone, confirmMessage);
  }

  return result;
};

// 5. Approve or Reject Online/Bank Payment Transaction (Admin Action)
const approveOrRejectPaymentInDB = async (payload: TApprovePaymentPayload) => {
  const { transactionId, status, note } = payload;

  const transaction = await prisma.paymentTransaction.findUnique({
    where: { id: transactionId },
    include: {
      invoice: {
        include: {
          student: {
            include: {
              parent: true,
            },
          },
        },
      },
    },
  });

  if (!transaction) {
    throw new Error("Payment transaction record not found!");
  }

  if (transaction.status !== TransactionStatus.PENDING_APPROVAL) {
    throw new Error("This payment transaction has already been processed!");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedTransaction = await tx.paymentTransaction.update({
      where: { id: transactionId },
      data: {
        status,
        note: note || null,
      },
    });

    let updatedInvoice: any = transaction.invoice;

    if (status === TransactionStatus.APPROVED) {
      const newPaidAmount = transaction.invoice.paidAmount + transaction.amount;
      const isFullyPaid = newPaidAmount >= transaction.invoice.amount;

      updatedInvoice = await tx.studentInvoice.update({
        where: { id: transaction.invoiceId },
        data: {
          paidAmount: newPaidAmount,
          status: isFullyPaid ? PaymentStatus.PAID : PaymentStatus.PARTIAL,
        },
        include: {
          student: {
            include: {
              parent: true,
            },
          },
        },
      });
    }

    return { transaction: updatedTransaction, invoice: updatedInvoice };
  });

  const recipientPhone = getRecipientPhone(transaction.invoice.student);

  if (recipientPhone) {
    const studentName = `${transaction.invoice.student.firstName || ""} ${transaction.invoice.student.lastName || ""}`.trim();

    if (status === TransactionStatus.APPROVED) {
      const msg = `আসসালামু আলাইকুম। আল-ইমান স্কুল অ্যান্ড কলেজ।\n\nআলহামদুলিল্লাহ! আপনার জমা দেওয়া পেমেন্ট রসিদ ভেরিফাই করে অনুমোদন করা হয়েছে।\n\nশিক্ষার্থী: ${studentName}\nইনভয়েস নং: ${transaction.invoice.invoiceNo}\nপরিশোধিত অর্থ: ৳${transaction.amount}\nমেথড: ${transaction.method}\nট্রানজেকশন আইডি: ${transaction.transactionId}`;
      await sendWhatsAppNotification(recipientPhone, msg);
    } else if (status === TransactionStatus.REJECTED) {
      const msg = `আসসালামু আলাইকুম। আল-ইমান স্কুল অ্যান্ড কলেজ।\n\nদুঃখিত, আপনার জমা দেওয়া পেমেন্ট তথ্য/রসিদ ভেরিফিকেশনে গৃহীত হয়নি।\n\nকারণ/নোট: ${note || "অসঠিক ট্রানজেকশন আইডি বা রসিদ"}\nঅনুগ্রহ করে সঠিক তথ্য প্রদান করুন বা অফিসে যোগাযোগ করুন।`;
      await sendWhatsAppNotification(recipientPhone, msg);
    }
  }

  return result;
};

// 6. Get Pending Approvals List for Admin
const getPendingApprovalsFromDB = async () => {
  return await prisma.paymentTransaction.findMany({
    where: { status: TransactionStatus.PENDING_APPROVAL },
    include: {
      invoice: {
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              studentIdNo: true,
              studentCode: true,
              rollNo: true,
              class: { select: { name: true } },
              section: { select: { name: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

// 7. Get Overdue/Defaulter Invoices (Used by Admin Defaulter Tracker)
const getOverdueInvoicesFromDB = async () => {
  const currentDate = new Date();

  await prisma.studentInvoice.updateMany({
    where: {
      dueDate: { lt: currentDate },
      status: { in: [PaymentStatus.PENDING, PaymentStatus.PARTIAL] },
    },
    data: { status: PaymentStatus.OVERDUE },
  });

  return await prisma.studentInvoice.findMany({
    where: {
      status: { in: [PaymentStatus.PENDING, PaymentStatus.PARTIAL, PaymentStatus.OVERDUE] },
    },
    include: {
      student: {
        include: {
          class: true,
          section: true,
          parent: true,
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });
};

// 8. Cron Job Routine Trigger for 1st & 10th Reminders
const sendPendingFeeRemindersFromDB = async () => {
  const pendingInvoices = await prisma.studentInvoice.findMany({
    where: {
      status: { in: [PaymentStatus.PENDING, PaymentStatus.PARTIAL, PaymentStatus.OVERDUE] },
    },
    include: {
      student: {
        include: {
          parent: true,
        },
      },
    },
  });

  for (const invoice of pendingInvoices) {
    const recipientPhone = getRecipientPhone(invoice.student);
    if (recipientPhone) {
      const studentName = `${invoice.student.firstName || ""} ${invoice.student.lastName || ""}`.trim();
      const dueAmount = invoice.amount - invoice.paidAmount;
      const dueDateFormatted = new Date(invoice.dueDate).toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const reminderMessage = generateFeeReminderTemplate(
        studentName,
        dueAmount,
        invoice.invoiceNo,
        dueDateFormatted
      );

      await sendWhatsAppNotification(recipientPhone, reminderMessage);
    }
  }
};

// 9. Get Student Invoices
const getStudentInvoicesFromDB = async (studentId: string) => {
  return await prisma.studentInvoice.findMany({
    where: { studentId },
    include: {
      transactions: true,
      student: {
        include: {
          class: true,
          section: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

// 10. Get All Invoices for Admin
const getAllInvoicesFromDB = async () => {
  return await prisma.studentInvoice.findMany({
    include: {
      transactions: true,
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          studentIdNo: true,
          rollNo: true,
          class: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const PaymentService = {
  setFeeStructureInDB,
  generateMonthlyInvoicesInDB,
  createInvoiceIntoDB,
  processPaymentInDB,
  approveOrRejectPaymentInDB,
  getPendingApprovalsFromDB,
  getOverdueInvoicesFromDB,
  sendPendingFeeRemindersFromDB,
  getStudentInvoicesFromDB,
  getAllInvoicesFromDB,
  sendWhatsAppNotification,
  getRecipientPhone,
  formatBDPhone,
};