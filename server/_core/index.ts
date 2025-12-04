import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { createContext } from "./context";
import { appRouter } from "./router";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(dirname, "../..");
const staticDir = path.resolve(projectRoot, "dist/public");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime().toFixed(0),
    timestamp: new Date().toISOString(),
  });
});

app.use(express.static(staticDir));

app.use("*", (req, res, next) => {
  const indexPath = path.join(staticDir, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
    return;
  }
  if (req.path.startsWith("/api") || req.path.startsWith("/trpc")) {
    next();
    return;
  }
  res.status(200).json({
    message: "Frontend build not found yet. Run `pnpm build` or `pnpm dev`.",
  });
});

const port = Number(process.env.PORT ?? 4173);

const server = app.listen(port, () => {
  console.log(`Recruitment pass server ready on http://localhost:${port}`);
});

const gracefulShutdown = () => {
  server.close(() => process.exit(0));
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
