import path from "path";
import pino from "pino";

let sock: any = null;

/**
 * Initialize Baileys WhatsApp Socket Connection via Pairing Code
 */
export const connectToWhatsApp = async () => {
  try {
    const {
      default: makeWASocket,
      useMultiFileAuthState,
      DisconnectReason,
      fetchLatestBaileysVersion,
      Browsers,
    } = await import("@whiskeysockets/baileys");

    const authFolderPath = path.join(process.cwd(), "baileys_auth_info");
    const { state, saveCreds } = await useMultiFileAuthState(authFolderPath);
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      browser: Browsers.ubuntu("Chrome"),
      syncFullHistory: false,
      markOnlineOnConnect: false,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 10000,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update: any) => {
      const { connection, lastDisconnect } = update;

      if (connection === "connecting" && !sock.authState.creds.registered) {
        const phoneNumber = process.env.WHATSAPP_PHONE_NUMBER;
        if (phoneNumber) {
          setTimeout(async () => {
            try {
              const cleanNumber = phoneNumber.replace(/\D/g, "");
              const code = await sock.requestPairingCode(cleanNumber);
              console.log("\n==================================================");
              console.log(`📱 YOUR WHATSAPP PAIRING CODE: 👉  ${code}  👈`);
              console.log("==================================================\n");
            } catch (pairingErr: any) {
              // Ignore if already requested
            }
          }, 4000);
        }
      }

      if (connection === "close") {
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        console.log("WhatsApp Connection closed. Reconnecting:", shouldReconnect);

        if (shouldReconnect) {
          setTimeout(() => {
            connectToWhatsApp();
          }, 5000);
        }
      } else if (connection === "open") {
        console.log("\n==================================================");
        console.log("✅ WhatsApp Connected Successfully!");
        console.log("==================================================\n");
      }
    });
  } catch (err) {
    console.error("Failed to initialize WhatsApp connection:", err);
  }
};

/**
 * Send WhatsApp Notification to Parent/Student Phone Number
 */
export const sendWhatsAppMessage = async (
  toPhone: string,
  messageText: string
) => {
  try {
    console.log(`\n🚀 [WhatsApp Process Started] Attempting to send message...`);
    console.log(`📱 Raw Target Phone: ${toPhone}`);

    if (!sock) {
      console.warn("⚠️ [WhatsApp Error] Socket is not connected or initialized yet!");
      return;
    }

    let formattedPhone = toPhone.trim().replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = `88${formattedPhone}`;
    }
    if (!formattedPhone.endsWith("@s.whatsapp.net")) {
      formattedPhone = `${formattedPhone}@s.whatsapp.net`;
    }

    console.log(`📞 Formatted JID: ${formattedPhone}`);

    const res = await sock.sendMessage(formattedPhone, { text: messageText });
    console.log(`✅ [WhatsApp Success] Message Sent! ID: ${res?.key?.id}\n`);
  } catch (error: any) {
    console.error(
      "❌ [WhatsApp Failed]:",
      error?.message || error
    );
  }
};