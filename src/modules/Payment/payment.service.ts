import { PaymentStatus } from "@prisma/client";
import axios from "axios";
import {
  TCollectPaymentPayload,
  TCreateInvoicePayload,
} from "./payment.interface";
import prisma from "../../lib/prisma";

// Helper function to format BD phone number cleanly (880...)
const formatBDPhone = (phone: string): string => {
  let clean = phone.replace(/\D/g, "");
  if (clean.startsWith("0")) {
    clean = `88${clean}`;
  } else if (!clean.startsWith("88") && clean.length === 10) {
    clean = `88${clean}`;
  }
  return clean;
};

// Helper function to send WhatsApp via Baileys microservice
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

    console.log(
      `📡 [WhatsApp Microservice Dispatching]: ${baseUrl} for Phone: ${formattedPhone}`
    );

    const response = await axios.post(
      baseUrl,
      { phone: formattedPhone, message },
      { headers: { "x-secret-key": secretKey, "Content-Type": "application/json" } }
    );

    console.log("✅ Baileys Microservice Response:", response.data);
  } catch (err: any) {
    console.error(
      "❌ Baileys WhatsApp Dispatch Notification Error:",
      err?.response?.data || err?.message || err
    );
  }
};

// Helper to extract student/parent phone safely
const getRecipientPhone = (student: any): string | null => {
  return student?.parent?.phone || student?.phone || student?.altPhone || null;
};

// 1. Generate Invoice (Auto-generated Unique Invoice No)
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

  // Baileys WhatsApp Notification with Quranic verse & Hadith for New Month Fee Invoice
  if (recipientPhone) {
    const dueDateFormatted = new Date(payload.dueDate).toLocaleDateString(
      "bn-BD",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    const studentName = `${result.student.firstName || ""} ${result.student.lastName || ""}`.trim();

    const message = `আসসালামু আলাইকুম ওয়া রহমাতুল্লাহ।

সম্মানিত অভিভাবক/অভিভাবিকা,
আমাদের প্রতিষ্ঠানের মূল লক্ষ্য হলো শিক্ষার্থীদের ইসলামিক মূল্যবোধ ও আধুনিক শিক্ষার সমন্বয়ে এক একজন আদর্শ মানুষ হিসেবে গড়ে তোলা। এই শিক্ষা কার্যক্রম সুন্দর, সাবলীল ও সুশৃঙ্খলভাবে পরিচালনার পেছনে প্রতিষ্ঠানের খরচ পরিচালনা এবং শিক্ষক-কর্মচারীদের মাসিক পারিশ্রমিক নিয়মিত প্রদান করা অত্যন্ত জরুরি।

পবিত্র কুরআনে আল্লাহ তাআলা লেনদেনের স্বচ্ছতা ও প্রতিশ্রুতি পালনের বিষয়ে ইরশাদ করেছেন:
"হে মুমিনগণ! তোমরা অঙ্গীকারসমূহ পূর্ণ করো।" — (সূরা আল-মায়িদাহ, আয়াত: ১)

প্রতিনিয়ত অর্জিত দ্বীনি ও পার্থিব জ্ঞানের বিনিময়ে অর্পিত দায়িত্ব পালন করা আমাদের সকলের জন্য নৈতিক ও ঈমানি দায়িত্ব। এছাড়া শ্রমিক ও সেবাদাতাদের পরিশ্রমের মূল্য সময়মতো পরিশোধের ব্যাপারে রাসুলুল্লাহ (সা.) নির্দেশ দিয়ে বলেছেন:
"তোমরা শ্রমিকের গায়ের ঘাম শুকানোর আগেই তার মজুরি বুঝিয়ে দাও।" — (সুনানে ইবনে মাজাহ: ২৪৪৩)

আপনার সন্তান ${studentName}-এর শিক্ষা অর্জন যেন নিরবচ্ছিন্ন থাকে এবং প্রতিষ্ঠানটি যেন সুচারুরূপে পরিচালিত হতে পারে, সে উদ্দেশ্যে চলতি মাসের ফি বাবদ ৳${payload.amount} (ইনভয়েস নং: ${invoiceNo}) আগামী ${dueDateFormatted}-এর মধ্যে পরিশোধ করার জন্য বিশেষভাবে অনুরোধ করা হচ্ছে।

—
আল-ইমান স্কুল অ্যান্ড কলেজ`;

    sendWhatsAppNotification(recipientPhone, message);
  }

  return result;
};

// 2. Process Payment (Handles Cash, bKash/Nagad with Unique TrxID Check)
const processPaymentInDB = async (payload: TCollectPaymentPayload) => {
  const { invoiceId, amount, method, transactionId } = payload;

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
        "এই ট্রানজেকশন আইডিটি (TrxID) ইতিমধ্যে একবার ব্যবহার করা হয়েছে! অনুগ্রহ করে সঠিক ট্রানজেকশন আইডি প্রদান করুন।"
      );
    }
  }

  const finalTrxId = transactionId
    ? transactionId.trim()
    : `CASH-${Date.now()}`;

  const result = await prisma.$transaction(async (tx) => {
    const transaction = await tx.paymentTransaction.create({
      data: {
        invoiceId,
        amount,
        method,
        transactionId: finalTrxId,
        status: PaymentStatus.PAID,
      },
    });

    const updatedPaidAmount = invoice.paidAmount + amount;
    const isFullyPaid = updatedPaidAmount >= invoice.amount;

    const updatedInvoice = await tx.studentInvoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: updatedPaidAmount,
        status: isFullyPaid ? PaymentStatus.PAID : PaymentStatus.PARTIAL,
      },
    });

    return { transaction, invoice: updatedInvoice };
  });

  const recipientPhone = getRecipientPhone(invoice.student);

  if (recipientPhone) {
    const studentName = `${invoice.student.firstName || ""} ${invoice.student.lastName || ""}`.trim();
    const confirmMessage = `আসসালামু আলাইকুম। আল-ইমান স্কুল অ্যান্ড কলেজ।\n\nধন্যবাদ! আপনার সন্তান ${studentName}-এর ফি সফলভাবে গ্রহণ করা হয়েছে।\n\nইনভয়েস নং: ${invoice.invoiceNo}\nপরিশোধিত অর্থ: ৳${amount}\nপেমেন্ট মেথড: ${method}\nট্রানজেকশন আইডি: ${finalTrxId}`;

    sendWhatsAppNotification(recipientPhone, confirmMessage);
  }

  return result;
};

// 3. Automated Reminder Trigger for Pending Invoices (Used by Cron Job)
const sendPendingFeeRemindersFromDB = async () => {
  console.log("⏰ [Cron Job] Checking for unpaid invoices...");

  const pendingInvoices = await prisma.studentInvoice.findMany({
    where: {
      status: {
        in: [PaymentStatus.PENDING, PaymentStatus.PARTIAL],
      },
    },
    include: {
      student: {
        include: {
          parent: true,
        },
      },
    },
  });

  console.log(`📋 Found ${pendingInvoices.length} pending/partial invoices to send reminders.`);

  for (const invoice of pendingInvoices) {
    const recipientPhone = getRecipientPhone(invoice.student);

    if (recipientPhone) {
      const studentName = `${invoice.student.firstName || ""} ${invoice.student.lastName || ""}`.trim();
      const dueAmount = invoice.amount - invoice.paidAmount;
      const dueDateFormatted = new Date(invoice.dueDate).toLocaleDateString(
        "bn-BD",
        { year: "numeric", month: "long", day: "numeric" }
      );

      const reminderMessage = `আসসালামু আলাইকুম ওয়া রহমাতুল্লাহ।

সম্মানিত অভিভাবক/অভিভাবিকা,
আমাদের প্রতিষ্ঠানের মূল লক্ষ্য হলো শিক্ষার্থীদের ইসলামিক মূল্যবোধ ও আধুনিক শিক্ষার সমন্বয়ে এক একজন আদর্শ মানুষ হিসেবে গড়ে তোলা। এই শিক্ষা কার্যক্রম সুন্দর, সাবলীল ও সুশৃঙ্খলভাবে পরিচালনার পেছনে প্রতিষ্ঠানের খরচ পরিচালনা এবং শিক্ষক-কর্মচারীদের মাসিক পারিশ্রমিক নিয়মিত প্রদান করা অত্যন্ত জরুরি।

পবিত্র কুরআনে আল্লাহ তাআলা লেনদেনের স্বচ্ছতা ও প্রতিশ্রুতি পালনের বিষয়ে ইরশাদ করেছেন:
"হে মুমিনগণ! তোমরা অঙ্গীকারসমূহ পূর্ণ করো।" — (সূরা আল-মায়িদাহ, আয়াত: ১)

প্রতিনিয়ত অর্জিত দ্বীনি ও পার্থিব জ্ঞানের বিনিময়ে অর্পিত দায়িত্ব পালন করা আমাদের সকলের জন্য নৈতিক ও ঈমানি দায়িত্ব। এছাড়া শ্রমিক ও সেবাদাতাদের পরিশ্রমের মূল্য সময়মতো পরিশোধের ব্যাপারে রাসুলুল্লাহ (সা.) নির্দেশ দিয়ে বলেছেন:
"তোমরা শ্রমিকের গায়ের ঘাম শুকানোর আগেই তার মজুরি বুঝিয়ে দাও।" — (সুনানে ইবনে মাজাহ: ২৪৪৩)

আপনার সন্তান ${studentName}-এর শিক্ষা অর্জন যেন নিরবচ্ছিন্ন থাকে এবং প্রতিষ্ঠানটি যেন সুচারুরূপে পরিচালিত হতে পারে, সে উদ্দেশ্যে চলতি মাসের বকেয়া ফি বাবদ ৳${dueAmount} (ইনভয়েস নং: ${invoice.invoiceNo}) আগামী ${dueDateFormatted}-এর মধ্যে পরিশোধ করার জন্য বিশেষভাবে অনুরোধ করা হচ্ছে।

—
আল-ইমান স্কুল অ্যান্ড কলেজ`;

      await sendWhatsAppNotification(recipientPhone, reminderMessage);
    }
  }
};

// 4. Get Invoice Details by Student ID
const getStudentInvoicesFromDB = async (studentId: string) => {
  const result = await prisma.studentInvoice.findMany({
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

  return result;
};

// 5. Get All Invoices and Payment Transactions for Admin Overview
const getAllInvoicesFromDB = async () => {
  const result = await prisma.studentInvoice.findMany({
    include: {
      transactions: true,
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          studentIdNo: true,
          rollNo: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

export const PaymentService = {
  createInvoiceIntoDB,
  processPaymentInDB,
  sendPendingFeeRemindersFromDB,
  getStudentInvoicesFromDB,
  getAllInvoicesFromDB,
};