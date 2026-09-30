import { Plan } from "@prisma/client";

export const PLAN_INFO = {
  FREE: { name: "Gratis", monthly: 0, certificateLimit: 5, reminders: false, team: false },
  PROFESSIONAL: { name: "Profesional", monthly: 14900, certificateLimit: 100, reminders: false, team: false },
  PRO: { name: "Pro", monthly: 29900, certificateLimit: 500, reminders: true, team: false },
  BUSINESS: { name: "Empresa", monthly: 59900, certificateLimit: 2000, reminders: true, team: true },
} as const;

export function planInfo(plan: Plan) { return PLAN_INFO[plan]; }
export function paidPlan(plan: string): plan is Exclude<Plan, "FREE"> {
  return ["PROFESSIONAL", "PRO", "BUSINESS"].includes(plan);
}
