import express from "express";
import cors from "cors";
import morgan from "morgan";

import customerRoutes from "./routes/customers";
import invoiceRoutes from "./routes/invoices";
import feedbackRoutes from "./routes/feedback";
// (add .ts if you later import jobs.ts, materials.ts, etc.)

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_, res) => res.json({ ok: true }));

app.use("/api/customers", customerRoutes);
app.use("/api/invoices",  invoiceRoutes);
app.use("/api/feedback", feedbackRoutes);

export default app;