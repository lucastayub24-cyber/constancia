import { z } from "zod";

export const registerSchema=z.object({
  name:z.string().trim().min(2).max(80),
  organizationName:z.string().trim().min(2).max(120),
  email:z.string().email(),
  password:z.string().min(8).max(100),
});
export const loginSchema=z.object({email:z.string().email(),password:z.string().min(1)});
export const clientSchema=z.object({
  name:z.string().trim().min(2).max(160),
  email:z.string().trim().email().optional().or(z.literal("")),
  phone:z.string().trim().max(80).optional(),
  document:z.string().trim().max(40).optional(),
  address:z.string().trim().max(240).optional(),
  notes:z.string().trim().max(1500).optional(),
});
export const certificateSchema=z.object({
  clientId:z.string().min(1),
  assetId:z.string().optional().or(z.literal("")),
  workOrderId:z.string().optional().or(z.literal("")),
  serviceTitle:z.string().trim().min(3).max(160),
  description:z.string().trim().min(5).max(5000),
  observations:z.string().trim().max(2500).optional(),
  technicianName:z.string().trim().max(160).optional(),
  serviceAddress:z.string().trim().max(240).optional(),
  performedAt:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  nextServiceAt:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  warrantyUntil:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  signatureDataUrl:z.string().max(900000).optional().or(z.literal("")),
  signatureName:z.string().trim().max(160).optional(),
  signatureDocument:z.string().trim().max(80).optional(),
  photoKeys:z.array(z.string().max(500000)).max(6).default([]),
  totalAmount:z.union([z.number(),z.string()]).optional(),
  paymentDueDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  initialPaymentAmount:z.union([z.number(),z.string()]).optional(),
  initialPaymentMethod:z.enum(["CASH","BANK_TRANSFER","MERCADO_PAGO","DEBIT_CARD","CREDIT_CARD","CHECK","OTHER"]).optional(),
  paymentReference:z.string().trim().max(180).optional(),
  paymentNotes:z.string().trim().max(1200).optional(),
});
export const servicePaymentSchema=z.object({
  amount:z.union([z.number(),z.string()]),
  method:z.enum(["CASH","BANK_TRANSFER","MERCADO_PAGO","DEBIT_CARD","CREDIT_CARD","CHECK","OTHER"]),
  paidAt:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  reference:z.string().trim().max(180).optional(),
  notes:z.string().trim().max(1200).optional(),
});

export const assetSchema=z.object({
  clientId:z.string().min(1),
  name:z.string().trim().min(2).max(160),
  category:z.string().trim().max(100).optional(),
  brand:z.string().trim().max(100).optional(),
  model:z.string().trim().max(100).optional(),
  serialNumber:z.string().trim().max(120).optional(),
  location:z.string().trim().max(180).optional(),
  notes:z.string().trim().max(2500).optional(),
  installedAt:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  warrantyUntil:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
});
export const workOrderSchema=z.object({
  clientId:z.string().min(1),
  assetId:z.string().optional().or(z.literal("")),
  templateId:z.string().optional().or(z.literal("")),
  assignedUserId:z.string().optional().or(z.literal("")),
  priority:z.enum(["LOW","NORMAL","HIGH","URGENT"]).default("NORMAL"),
  title:z.string().trim().min(3).max(160),
  description:z.string().trim().min(3).max(5000),
  serviceAddress:z.string().trim().max(240).optional(),
  scheduledStart:z.string().optional().or(z.literal("")),
  scheduledEnd:z.string().optional().or(z.literal("")),
  internalNotes:z.string().trim().max(3000).optional(),
});
export const serviceTemplateSchema=z.object({
  name:z.string().trim().min(2).max(120),
  category:z.string().trim().max(100).optional(),
  defaultTitle:z.string().trim().min(3).max(160),
  defaultDescription:z.string().trim().min(3).max(5000),
  checklistText:z.string().trim().max(4000).optional(),
  defaultDurationMinutes:z.union([z.number(),z.string()]).optional(),
  defaultNextServiceDays:z.union([z.number(),z.string()]).optional(),
});
