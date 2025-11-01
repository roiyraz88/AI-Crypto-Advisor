import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";

export const createApp = (): Express => {
  const app = express();

  app.set("trust proxy", 1);

  const allowedOrigins = [
    process.env.CLIENT_URL || "http://localhost:5173",
  ];

  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use("/", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
