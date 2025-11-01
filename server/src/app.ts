import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";

export const createApp = (): Express => {
  const app = express();

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  // CORS configuration with credentials support
  app.use(
    cors({
      origin: clientUrl,
      credentials: true, // Allow cookies to be sent cross-origin
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      exposedHeaders: ["Set-Cookie"],
    })
  );

  // Handle preflight requests

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(cookieParser());

  app.use("/", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
