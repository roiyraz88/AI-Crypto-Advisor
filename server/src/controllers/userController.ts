import { Response } from "express";
import { AuthRequest } from "../middleware/requireAuth";


export const getMe = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: { message: "User not authenticated" },
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};

