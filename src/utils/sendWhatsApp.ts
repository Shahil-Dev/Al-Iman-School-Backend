import path from "path";
import pino from "pino";

let sock: any = null;
let isConnecting = false;

export const connectToWhatsApp = async () => {
  if (isConnecting) return;
  isConnecting = true;

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
            } catch (pairingErr: any) {}
          }, 3000);
        }
      }

      if (connection === "close") {
        isConnecting = false;
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        // Reconnect only if NOT explicitly logged out or replaced session
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut && statusCode !== 401;

        console.log(`WhatsApp Connection Closed (Status: ${statusCode}). Reconnecting: ${shouldReconnect}`);

        if (shouldReconnect) {
          setTimeout(() => {
            connectToWhatsApp();
          }, 5000);
        }
      } else if (connection === "open") {
        isConnecting = false;
        console.log("\n==================================================");
        console.log("✅ WhatsApp Connected Successfully & Stable!");
        console.log("==================================================\n");
      }
    });
  } catch (err) {
    isConnecting = false;
    console.error("Failed to initialize WhatsApp connection:", err);
  }
};

export const sendWhatsAppMessage = async (
  toPhone: string,
  messageText: string
) => {
  try {
    console.log(`\n🚀 [WhatsApp Triggered] Preparing message for ${toPhone}...`);

    if (!sock) {
      console.warn("⚠️ [WhatsApp Error] Socket is not ready!");
      return;
    }

    let formattedPhone = toPhone.trim().replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = `88${formattedPhone}`;
    }
    if (!formattedPhone.endsWith("@s.whatsapp.net")) {
      formattedPhone = `${formattedPhone}@s.whatsapp.net`;
    }

    const res = await sock.sendMessage(formattedPhone, { text: messageText });
    console.log(`✅ [WhatsApp Success] Message Sent! ID: ${res?.key?.id}\n`);
  } catch (error: any) {
    console.error("❌ [WhatsApp Failed]:", error?.message || error);
  }
};