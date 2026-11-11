import { z } from "zod";

// Admin REST API resource definitions: table, allowed filters, and write schemas.
const status = (v: [string, ...string[]]) => z.enum(v);

export const RESOURCES = {
  students: {
    table: "students",
    filters: ["batch_id", "status", "program"],
    search: ["name", "email", "student_code"],
    create: z.object({
      student_code: z.string().trim().min(1).max(50),
      name: z.string().trim().min(1).max(120),
      email: z.string().trim().email().max(255),
      phone: z.string().max(30).optional(),
      program: z.string().max(200).optional(),
      batch_id: z.string().uuid().nullable().optional(),
      admission_year: z.string().max(10).optional(),
      user_id: z.string().uuid().nullable().optional(),
      status: status(["Active", "Inactive", "Graduated"]).optional(),
    }),
    update: null as z.ZodTypeAny | null,
  },
  batches: {
    table: "batches",
    filters: ["status", "program"],
    search: ["name", "trainer"],
    create: z.object({
      name: z.string().trim().min(1).max(120),
      program: z.string().trim().min(1).max(200),
      start_date: z.string().date().optional(),
      trainer: z.string().max(120).optional(),
      schedule: z.string().max(500).optional(),
      status: status(["Upcoming", "Active", "Completed"]).optional(),
    }),
    update: null as z.ZodTypeAny | null,
  },
  feedback: {
    table: "student_feedback",
    filters: ["kind", "status", "user_id", "module_id"],
    search: ["message"],
    create: null as z.ZodTypeAny | null,
    update: z.object({
      status: status(["Submitted", "Pending", "Reviewed", "Approved", "Declined"]).optional(),
      staff_reply: z.string().max(2000).nullable().optional(),
    }),
  },
  "leave-requests": {
    table: "leave_requests",
    filters: ["status", "user_id"],
    search: ["reason"],
    create: null as z.ZodTypeAny | null,
    update: z.object({
      status: status(["Pending", "Approved", "Declined"]).optional(),
      remark: z.string().max(1000).nullable().optional(),
    }),
  },
  certificates: {
    table: "certificate_requests",
    filters: ["status", "user_id", "certificate_type"],
    search: ["purpose"],
    create: null as z.ZodTypeAny | null,
    update: z.object({
      status: status(["Pending", "Issued", "Declined"]).optional(),
      certificate_no: z.string().max(100).nullable().optional(),
      remark: z.string().max(1000).nullable().optional(),
    }),
  },
  "fee-payments": {
    table: "fee_payments",
    filters: ["student_id", "payment_mode"],
    search: ["receipt_no"],
    create: z.object({
      student_id: z.string().uuid(),
      amount: z.number().positive().max(10_000_000),
      receipt_no: z.string().trim().min(1).max(60),
      payment_mode: z.string().trim().min(1).max(40),
      paid_on: z.string().date().optional(),
      note: z.string().max(500).optional(),
    }),
    update: null as z.ZodTypeAny | null,
  },
} as const;

// Students and batches can be edited with any create field.
(RESOURCES.students as { update: z.ZodTypeAny | null }).update = RESOURCES.students.create.partial();
(RESOURCES.batches as { update: z.ZodTypeAny | null }).update = RESOURCES.batches.create.partial();

export type ResourceName = keyof typeof RESOURCES;
export const isResource = (n: string): n is ResourceName => n in RESOURCES;
