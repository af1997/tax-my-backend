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
  await prisma.$executeRaw`INSERT INTO Feedback(type, description) VALUES (${type}, ${description})`;
  res.json({ ok: true });
});

export default r;
