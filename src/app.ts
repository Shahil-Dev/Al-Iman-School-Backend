import cors from "cors";
import express, { Application, Request, Response, NextFunction } from "express";

import notFound from "./middlewares/notFound";
import router from "./routes";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

const app: Application = express();

// 🔹 Allowed Origins for Local Development & Production
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "https://al-iman-school-frontend.vercel.app",
];

// 🔹 Custom Dynamic Origin & Preflight Handling Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;

  // Check if request origin is in our allowed list or matches .vercel.app
  if (origin && (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app"))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, x-secret-key"
  );

  // Handle Browser OPTIONS Preflight Request directly with 200 OK
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// Standard CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback to pass preflight securely handled above
    },
    credentials: true,
  })
);

// Body Parsers
app.use(express.json());

// Root Health Check Route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "School Management ERP System API is Operational!",
  });
});

app.use("/api/v1", router);

// Global Middlewares
app.use(globalErrorHandler);
app.use(notFound);

export default app;
module.exports = app;