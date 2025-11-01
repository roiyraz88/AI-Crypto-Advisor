import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";

export const createApp = (): Express => {
  const app = express();

  const rawAllowed =
    process.env.CLIENT_URL ||
    "http://localhost:5173";
  const allowedOrigins = rawAllowed
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);


const corsOptions = {
  origin: (
    origin: string | undefined,
    cb: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Set-Cookie"],
};


  app.use(cors(corsOptions));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(cookieParser());

  app.use("/", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
