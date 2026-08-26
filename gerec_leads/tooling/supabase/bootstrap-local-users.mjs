import { randomBytes } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { readLocalSupabaseRuntime } from "./local-runtime.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PASSWORD_ALPHABET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*";
export const LOCAL_ADMIN_PASSWORD = "Wtg@2026!Admin";

export const LOCAL_USERS = [
  { email: "admin@gerec.local", fullName: "Administrador WTG", role: "admin", position: null },
  { email: "renato@gerec.local", fullName: "Renato", role: "seller", position: 1 },
  { email: "sandra@gerec.local", fullName: "Sandra", role: "seller", position: 2 },
  { email: "jessica@gerec.local", fullName: "Jessica", role: "seller", position: 3 },
  { email: "nelma@gerec.local", fullName: "Nelma", role: "seller", position: 4 },
];

export function generatePassword(length = 20) {
  const required = ["a", "A", "2", "!"];
  const rest = Array.from(
    randomBytes(Math.max(0, length - required.length)),
    (value) => PASSWORD_ALPHABET[value % PASSWORD_ALPHABET.length],
  );
  return [...required, ...rest].sort(() => randomBytes(1)[0] - 128).join("");
}

export function resolveUserPassword(user) {
  return user.role === "admin" ? LOCAL_ADMIN_PASSWORD : generatePassword();
}

async function adminRequest(runtime, path, options = {}) {
  const response = await fetch(`${runtime.apiUrl}${path}`, {
    ...options,
    headers: {
      apikey: runtime.serviceRoleKey,
      Authorization: `Bearer ${runtime.serviceRoleKey}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  if (!response.ok) throw new Error(`Supabase admin respondeu HTTP ${response.status}.`);
  const body = await response.text();
  return body ? JSON.parse(body) : null;
}

async function ensureAuthUser(runtime, user, password) {
  const listing = await adminRequest(runtime, "/auth/v1/admin/users?per_page=1000");
  const existing = (listing.users ?? []).find(
    (candidate) => candidate.email?.toLowerCase() === user.email,
  );
  const payload = {
    email: user.email,
    password,
    email_confirm: true,
    user_metadata: { full_name: user.fullName, role: user.role },
  };
  return existing
    ? adminRequest(runtime, `/auth/v1/admin/users/${existing.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      })
    : adminRequest(runtime, "/auth/v1/admin/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });
}

export async function bootstrapLocalUsers({
  cwd = ROOT,
  outputPath = resolve(ROOT, "supabase/.temp/local-users.json"),
} = {}) {
  const runtime = readLocalSupabaseRuntime({ cwd });
  const credentials = [];
  for (const user of LOCAL_USERS) {
    const password = resolveUserPassword(user);
    const authUser = await ensureAuthUser(runtime, user, password);
    const profile = {
      user_id: authUser.id,
      full_name: user.fullName,
      email: user.email,
      role: user.role,
      is_active: true,
    };
    const profileResponse = await fetch(`${runtime.apiUrl}/rest/v1/profiles?on_conflict=user_id`, {
      method: "POST",
      headers: {
        apikey: runtime.serviceRoleKey,
        Authorization: `Bearer ${runtime.serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(profile),
    });
    if (!profileResponse.ok)
      throw new Error(`Perfil local não pôde ser reconciliado (HTTP ${profileResponse.status}).`);
    credentials.push({ email: user.email, password, role: user.role, position: user.position });
  }

  const sellerProfiles = credentials.filter((user) => user.role === "seller");
  const profiles = await adminRequest(runtime, "/rest/v1/profiles?select=user_id,email");
  const profileByEmail = new Map(profiles.map((profile) => [profile.email, profile.user_id]));
  const queue = sellerProfiles.map((seller) => ({
    seller_id: profileByEmail.get(seller.email),
    position: seller.position,
    is_paused: false,
  }));
  await adminRequest(runtime, "/rest/v1/seller_queue?on_conflict=seller_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(queue),
  });
  await adminRequest(runtime, "/rest/v1/seller_skip_balances?on_conflict=seller_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(queue.map(({ seller_id }) => ({ seller_id, balance: 0 }))),
  });
  await adminRequest(runtime, "/rest/v1/queue_state?on_conflict=singleton", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ singleton: true, next_seller_id: queue[0].seller_id, version: 0 }),
  });

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(
    outputPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), users: credentials }, null, 2),
    { mode: 0o600 },
  );
  return { outputPath, count: credentials.length };
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const result = await bootstrapLocalUsers();
  console.log(
    `Usuários locais reconciliados: ${result.count}. Credenciais salvas em ${result.outputPath}.`,
  );
}
