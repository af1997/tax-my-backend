import { Router } from "express";
import prisma from "../prismaClient.ts";   // ← path to the Prisma client helper

const r = Router();

// GET /api/customers – empty list for now
r.get("/", async (_, res) => {
  const customers = await prisma.customer.findMany();
  res.json(customers);
});

export default r;