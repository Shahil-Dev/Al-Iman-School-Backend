import cors from "cors";
import express, { Application, Request, Response } from "express";

import notFound from "./middlewares/notFound";
import { AuthRoutes } from "./modules/Auth/auth.route";
import router from "./routes";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

const app: Application = express();

// Parsers
app.use(express.json());
app.use(cors());

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
