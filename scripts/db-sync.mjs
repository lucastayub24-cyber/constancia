import { spawnSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.log("DATABASE_URL not configured; skipping Prisma schema sync.");
  process.exit(0);
}

console.log("DATABASE_URL detected; syncing Prisma schema...");
const command = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(command, ["prisma", "db", "push", "--skip-generate"], {
  stdio: "inherit",
  env: process.env,
});

if (result.status !== 0) process.exit(result.status ?? 1);
