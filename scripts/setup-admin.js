#!/usr/bin/env node
// One-time script to create or update an admin account.
// Usage: node scripts/setup-admin.js <email> <password>
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function readEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const match = line.match(/^([^#=\s]+)\s*=\s*(.+)$/);
    if (!match) continue;
    env[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error('Usage: node scripts/setup-admin.js <email> <password>');
    process.exit(1);
  }

  let env;
  try {
    env = await readEnv();
  } catch {
    console.error('Could not read .env.local — run this from the project root.');
    process.exit(1);
  }

  const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = env;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const hash = await bcrypt.hash(password, 12);

  // Upsert (insert or update on duplicate email)
  const res = await fetch(`${url}/rest/v1/admins`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({ email: normalizedEmail, password_hash: hash }),
  });

  if (res.ok || res.status === 201) {
    console.log(`✓ Admin account ready for ${normalizedEmail}`);
  } else {
    const body = await res.text();
    console.error(`Failed (${res.status}): ${body}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
