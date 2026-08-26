import { readFileSync } from "node:fs";
import { createAdminClient } from "../lib/supabase/admin";

function loadEnvLocal() {
  const text = readFileSync(".env.local", "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq);
    let value = trimmed.slice(eq + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@premierbrooklyn.com";
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("Set ADMIN_PASSWORD in the environment");
  }
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Premier Admin" },
  });
  if (error && !error.message.toLowerCase().includes("already")) {
    throw error;
  }
  const userId = data.user?.id;
  if (userId) {
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: "Premier Admin",
      role: "admin",
    });
    if (profileError) throw profileError;
  }
  console.log("Admin ready:", email);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
