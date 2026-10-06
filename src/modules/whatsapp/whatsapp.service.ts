import axios from "axios";

// Helper: Format Bangladesh phone numbers into WhatsApp standard (880...)
export const formatBDPhone = (phone: string): string => {
  let clean = phone.replace(/\D/g, "");
  if (clean.startsWith("0")) {
    clean = `88${clean}`;
  } else if (!clean.startsWith("88") && clean.length === 10) {
    clean = `88${clean}`;
  }
  return clean;
};

export interface ISendWhatsAppAdmissionParams {
  phone: string;
  studentName: string;
  className: string;
  sectionName?: string;
  studentCode: string;
  studentIdNo: string;
  pin: string;
}

/**
 * Non-blocking WhatsApp Notification Dispatch on Admission Approval or Manual Student Creation
 */
export const sendWhatsAppAdmissionNotification = async (
  params: ISendWhatsAppAdmissionParams
): Promise<void> => {
  (async () => {
    try {
      if (!params.phone) return;

      const formattedPhone = formatBDPhone(params.phone);
      const rawBaseUrl = process.env.WHATSAPP_MICROSERVICE_URL || "";
      const microserviceUrl = rawBaseUrl.replace(/\/+$/, "");
      const secretKey = process.env.MICROSERVICE_SECRET_KEY;

      if (!microserviceUrl) return;

      const sectionInfo = params.sectionName ? ` (${params.sectionName})` : "";
      const message = `🎉 অভিনন্দন!\nআল-ঈমান স্কুলে ${params.studentName}-এর ভর্তি প্রক্রিয়া সফলভাবে সম্পন্ন হয়েছে।\n\n📌 শিক্ষার্থীর তথ্যাবলী:\n- শ্রেণি: ${params.className}${sectionInfo}\n- Code: ${params.studentCode}\n- ID: ${params.studentIdNo}\n- পিন (PIN): ${params.pin}\n\nধন্যবাদ,\nআল-ঈমান স্কুল অ্যান্ড কলেজ কর্তৃপক্ষ।`;

      await axios.post(
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

      console.log(
        `✅ [WhatsApp Admission Success] Student: ${params.studentName} | Phone: ${formattedPhone}`
      );
    } catch (err: any) {
      console.error(
        "❌ [WhatsApp Admission Dispatch Failed]:",
        err?.response?.data || err?.message || err
      );
    }
  })();
};