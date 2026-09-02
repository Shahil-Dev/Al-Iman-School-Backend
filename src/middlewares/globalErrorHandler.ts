import { ErrorRequestHandler } from 'express';
import { ZodError, ZodIssue } from 'zod';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong!';
  let errorSources = [
    {
      path: '',
      message: err.message || 'Something went wrong!',
    },
  ];


  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errorSources = err.issues.map((issue: ZodIssue) => {
      return {
        path: issue.path[issue.path.length - 1] as string,
        message: issue.message,
      };
    });
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: process.env.NODE_ENV === 'development' ? err?.stack : null,
  });
};

export default globalErrorHandler;