import { Request, Response } from "express";

/**
 * Health check controller
 * Returns server status
 */
export const healthCheck = (_req: Request, res: Response): void => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
};
