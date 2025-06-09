import { Router } from "express";
import prisma from "../prismaClient.ts";
const r = Router();

r.get("/", async (_, res) => {
  const invoices = await prisma.invoice.findMany({ include: { customer: true } });
  res.json(invoices);
});

export default r;