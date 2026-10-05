import cron from "node-cron";
import { PaymentService } from "./payment.service";

export const initPaymentCronJobs = () => {
  console.log("🚀 [Cron Service] Initializing Automated Fee Reminder Scheduler...");

  // Every day at 09:00 AM BD Time, check if today is day 1 or day 10 of the month
  cron.schedule("0 9 * * *", async () => {
    const today = new Date();
    const dayOfMonth = today.getDate();

    if (dayOfMonth === 1 || dayOfMonth === 10) {
      console.log(`📌 Today is Day ${dayOfMonth} of the month. Triggering WhatsApp fee reminders...`);
      await PaymentService.sendPendingFeeRemindersFromDB();
    }
  });
};