import cors from "cors";
import express, { Application, Request, Response } from "express";

import notFound from "./middlewares/notFound";
import { AuthRoutes } from "./modules/Auth/auth.route";
import router from "./routes";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

const app: Application = express();

// Allowed Origins List
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
];

// CORS Configuration Fix for credentials & explicit origins
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Cookies / Authorization Headers অনুমতি দেওয়ার জন্য
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Parsers
app.use(express.json());

// Root Health Check Route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "School Management ERP System API is Running Operational!",
  });
});

app.use("/api/v1", router);

// Global Middlewares
app.use(globalErrorHandler);
app.use(notFound);

export default app;
module.exports = app;