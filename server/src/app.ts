import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";

export const createApp = (): Express => {
  const app = express();

  const corsOptions = {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean | string) => void
    ) => {
      const allowedOrigins = [
        ...(process.env.CLIENT_URLS ? process.env.CLIENT_URLS.split(",") : []),
        process.env.CLIENT_URL || "https://ai-crypto-advisor-three.vercel.app",
        "http://localhost:5173",
      ]
        .map((s) => s.trim())
        .filter(Boolean);

      // allow requests with no origin (server-to-server, curl, tests)
      if (!origin) return callback(null, "*");

      if (allowedOrigins.includes(origin)) return callback(null, origin);

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Set-Cookie",
      "Cookie",
      "Origin",
      "Accept",
    ],
    exposedHeaders: ["Set-Cookie", "Set-Cookie"],
  };

  app.use(cors(corsOptions));
  app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use("/", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
