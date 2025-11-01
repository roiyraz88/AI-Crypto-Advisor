import { Request, Response, NextFunction } from "express";


export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("Error:", err);

  let statusCode = 500;
  const message = err.message || "Internal server error";

  if (err.message.includes("not found")) {
    statusCode = 404;
  } else if (
    err.message.includes("unauthorized") ||
    err.message.includes("authentication")
  ) {
    statusCode = 401;
  } else if (err.message.includes("forbidden")) {
    statusCode = 403;
  } else if (err.message.includes("validation")) {
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

