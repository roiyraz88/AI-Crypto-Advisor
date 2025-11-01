import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";

/**
 * Validation middleware factory
 * Validates request body against Zod schema
 */
export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({ body: req.body });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          error: {
            message: "Validation error",
            details: errors,
          },
        });
        return;
      }
      next(error);
    }
  };

