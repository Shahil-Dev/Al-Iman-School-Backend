"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const globalErrorHandler = (err, req, res, next) => {
    // 1. Log the error for debugging purposes
    if (process.env.NODE_ENV === "development") {
        console.error("Error from Global Error Handler 💥:", err);
    }
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error!";
    let errorSources = [
        {
            path: "",
            message: err.message || "Something went wrong!",
        },
    ];
    // 2. Zod Validation Error handling
    if (err instanceof zod_1.ZodError) {
        statusCode = 400;
        message = "Validation Error";
        errorSources = err.issues.map((issue) => ({
            path: issue.path[issue.path.length - 1],
            message: issue.message,
        }));
    }
    // ৩. Prisma Duplicate (Unique Constraint) Error handling
    else if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            statusCode = 400;
            const target = err.meta?.target || [];
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
exports.globalErrorHandler = globalErrorHandler;
