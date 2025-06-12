import { Router } from "express";
import prisma from "../prismaClient";

const r = Router();

// Ensure table exists
prisma.$executeRaw`CREATE TABLE IF NOT EXISTS Feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'NEW',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)`;
// In case the table already existed without the status column
prisma
  .$executeRaw`ALTER TABLE Feedback ADD COLUMN status TEXT NOT NULL DEFAULT 'NEW'`
  .catch(() => {});

r.get("/", async (_, res) => {
  const feedback = await prisma.$queryRaw<{
    id: number;
    type: string;
    description: string;
    status: string;
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
    await prisma.$executeRaw`INSERT INTO Feedback(type, description, status) VALUES (${type}, ${description}, 'NEW')`;
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

// update status open/closed
r.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status: string };
  try {
    await prisma.$executeRaw`UPDATE Feedback SET status=${status} WHERE id=${Number(id)}`;
    res.json({ ok: true });
  } catch (err) {
    console.error("Failed to update feedback status", err);
    res.status(500).json({ ok: false, error: "Failed to update status" });
  }
});

export default r;
