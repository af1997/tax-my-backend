import { Router } from "express";
import prisma from "../prismaClient";

const r = Router();

// GET /api/customers – empty list for now
r.get("/", async (_, res) => {
  const customers = await prisma.customer.findMany();
  res.json(customers);
});

export default r;