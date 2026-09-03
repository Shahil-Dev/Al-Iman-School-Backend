/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // 1. Log the error for debugging purposes
  if (process.env.NODE_ENV === "development") {
    console.error("Error from Global Error Handler 💥:", err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error!";
  let errorSources: { path: string; message: string }[] = [
    {
      path: "",
      message: err.message || "Something went wrong!",
    },
  ];

  // 2. Zod Validation Error handling
  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errorSources = err.issues.map((issue) => ({
      path: issue.path[issue.path.length - 1] as string,
      message: issue.message,
    }));
  }
  // ৩. Prisma Duplicate (Unique Constraint) Error handling
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 400;
      const target = (err.meta?.target as string[]) || [];
      const fieldName = target.join(", ");
      message = `Duplicate Entry Error! The '${fieldName}' already exists.`;
      errorSources = [
        {
          path: fieldName,
          message: `This ${fieldName} is already registered! Please use a unique value.`,
        },
      ];
    }
  }

  //  4.send response to client
  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: process.env.NODE_ENV === "development" ? err?.stack : null,
  });
};