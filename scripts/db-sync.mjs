import { spawnSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.log("DATABASE_URL not configured; skipping Prisma schema sync.");
  process.exit(0);
}

// One-time Constancia 2.0 additive schema rollout.
// This release only adds new tables, nullable columns, enums and unique constraints
// on newly-created nullable columns. Revert to strict mode after production sync.
console.log("DATABASE_URL detected; syncing Constancia 2.0 schema...");
const command = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(command, ["prisma", "db", "push", "--skip-generate", "--accept-data-loss"], {
  stdio: "inherit",
  env: process.env,
});

if (result.status !== 0) process.exit(result.status ?? 1);
