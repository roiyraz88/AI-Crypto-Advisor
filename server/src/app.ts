import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";

export const createApp = (): Express => {
  const app = express();

  // When behind a proxy (Render, Vercel) trust the first proxy so Express
  // can detect secure requests via X-Forwarded-* headers. This is required
  // for correct `secure` cookie behavior when the app is served over HTTPS.
  app.set("trust proxy", 1);

  // Build an allowlist for CORS. Prefer explicit env var(s), otherwise fall
  // back to the known production frontend URL and localhost dev URLs.
  const allowedOrigins = [
    ...(process.env.CLIENT_URLS ? process.env.CLIENT_URLS.split(",") : []),
    process.env.CLIENT_URL || "https://ai-crypto-advisor-three.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
  ]
    .map((s) => s.trim())
    .filter(Boolean);

  const corsOptions = {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean | string) => void
    ) => {
      // allow requests with no origin (curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, origin);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
      "Origin",
      "Accept",
    ],
    exposedHeaders: ["Set-Cookie"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  console.info("CORS allowed origins:", allowedOrigins);

  // Apply CORS middleware and ensure OPTIONS preflight returns a 204 quickly
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use("/", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
