import { Router } from "express";
import prisma from "../prismaClient";

const r = Router();

// Ensure table exists
prisma.$executeRaw`CREATE TABLE IF NOT EXISTS Feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)`;

r.get("/", async (_, res) => {
  const feedback = await prisma.$queryRaw<{
    id: number;
    type: string;
    description: string;
    createdAt: string;
  }[]>`SELECT * FROM Feedback ORDER BY id DESC`;
  res.json(feedback);
});

r.post("/", async (req, res) => {
  const { type, description } = req.body as {
    type: string;
    description: string;
  };
  try {
    await prisma.$executeRaw`INSERT INTO Feedback(type, description) VALUES (${type}, ${description})`;
  } catch (err) {
    console.error("Failed to store feedback", err);
    return res.status(500).json({ ok: false, error: "Failed to store feedback" });
  }

  const webhook = process.env.FEEDBACK_WEBHOOK_URL;
  if (webhook) {
    try {
      const resp = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, description }),
      });
      if (!resp.ok) {
        console.error("Webhook responded with", resp.status);
        return res.status(500).json({ ok: false, error: "Webhook request failed" });
      }
    } catch (err) {
      console.error("Error sending to webhook", err);
      return res.status(500).json({ ok: false, error: "Webhook request failed" });
    }
  }

  res.json({ ok: true });
});

export default r;
