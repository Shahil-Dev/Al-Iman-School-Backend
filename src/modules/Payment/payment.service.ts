import { PaymentStatus } from "@prisma/client";
import axios from "axios";
import {
  TCollectPaymentPayload,
  TCreateInvoicePayload,
} from "./payment.interface";
import prisma from "../../lib/prisma";

// Helper function to send WhatsApp via Baileys microservice
const sendWhatsAppNotification = async (phone: string, message: string) => {
  try {
    let baseUrl = process.env.WHATSAPP_MICROSERVICE_URL || "https://al-imanwhatsappservice-production.up.railway.app";
    
    // Clean URL formatting to ensure /send-message endpoint is always correctly mapped
    baseUrl = baseUrl.trim().replace(/\/+$/, "");
    if (!baseUrl.endsWith("/send-message")) {
      baseUrl = `${baseUrl}/send-message`;
    }

    const secretKey = process.env.MICROSERVICE_SECRET_KEY || "my_super_secret_key_123";

    console.log(`📡 [WhatsApp Microservice Dispatching]: ${baseUrl} for Phone: ${phone}`);

    const response = await axios.post(
      baseUrl,
      { phone, message },
      { headers: { "x-secret-key": secretKey } }
    );

    console.log("✅ Baileys Microservice Response:", response.data);
  } catch (err: any) {
    console.error(
      "❌ Baileys WhatsApp Dispatch Notification Error:",
      err?.response?.data || err?.message || err
    );
  }
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
      student: true,
    },
  });

  // Baileys WhatsApp Notification with Hadith for New Month Fee Invoice
  if (result.student?.phone) {
    const message = `আসসালামু আলাইকুম। আল-ইমান একাডেমি।\n\nহাদিস: 'মজুরের গায়ের ঘাম শুকানোর আগেই তার মজুরি পরিশোধ করে দাও।' (ইবনে মাজাহ)\n\nসম্মানীয় অভিভাবক, আপনার সন্তান ${result.student.firstName} ${result.student.lastName}-এর চলতি মাসের ফি ৳${payload.amount} প্রদেয় হয়েছে।\n\nইনভয়েস নং: ${invoiceNo}\nপরিশোধের শেষ তারিখ: ${new Date(payload.dueDate).toLocaleDateString('bn-BD')}\n\nঅনুগ্রহ করে নির্দিষ্ট সময়ের মধ্যে বিকাশ/নগদ এর মাধ্যমে ফি পরিশোধ করার অনুরোধ করা হচ্ছে।`;
    
    sendWhatsAppNotification(result.student.phone, message);
  }

  return result;
};

// 2. Process Payment (Handles Cash, bKash/Nagad with Unique TrxID Check)
const processPaymentInDB = async (payload: TCollectPaymentPayload) => {
  const { invoiceId, amount, method, transactionId } = payload;

  const invoice = await prisma.studentInvoice.findUnique({
    where: { id: invoiceId },
    include: { student: true },
  });

  if (!invoice) {
    throw new Error("Invoice not found!");
  }

  if (invoice.status === PaymentStatus.PAID) {
    throw new Error("This invoice is already fully paid!");
  }

  // 🔒 Unique Transaction ID Check (Prevents Fraud / Duplicate TrxID reuse)
  if (transactionId) {
    const existingTransaction = await prisma.paymentTransaction.findFirst({
      where: { transactionId: transactionId.trim() },
    });

    if (existingTransaction) {
      throw new Error("এই ট্রানজেকশন আইডিটি (TrxID) ইতিমধ্যে একবার ব্যবহার করা হয়েছে! অনুগ্রহ করে সঠিক ট্রানজেকশন আইডি প্রদান করুন।");
    }
  }

  const finalTrxId = transactionId ? transactionId.trim() : `CASH-${Date.now()}`;

  // Process Transaction & Update Invoice
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

  // Baileys WhatsApp Payment Receipt Confirmation Message
  if (invoice.student?.phone) {
    const confirmMessage = `আসসালামু আলাইকুম। আল-ইমান একাডেমি।\n\nধন্যবাদ! আপনার সন্তান ${invoice.student.firstName} ${invoice.student.lastName}-এর ফি সফলভাবে গ্রহণ করা হয়েছে।\n\nইনভয়েস নং: ${invoice.invoiceNo}\nপরিশোধিত অর্থ: ৳${amount}\nপেমেন্ট মেথড: ${method}\nট্রানজেকশন আইডি: ${finalTrxId}`;
    
    sendWhatsAppNotification(invoice.student.phone, confirmMessage);
  }

  return result;
};

// 3. Get Invoice Details by Student ID
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

export const PaymentService = {
  createInvoiceIntoDB,
  processPaymentInDB,
  getStudentInvoicesFromDB,
};