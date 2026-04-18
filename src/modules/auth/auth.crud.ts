import { D1Database } from '@cloudflare/workers-types';
import { User } from './auth.schema';

export async function createUser(
  db: D1Database,
  user: User
): Promise<void> {
  await db.prepare(`
    INSERT INTO users (id, email, name, phone, password, organizations, profile, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    user.id,
    user.email,
    user.name,
    user.phone,
    user.password,
    JSON.stringify(user.organizations),
    JSON.stringify(user.profile),
    user.createdAt.toISOString()
  ).run();
}

export async function findUserByEmail(
  db: D1Database,
  email: string
): Promise<User | null> {
  const result = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  
  if (!result) return null;
  
  return mapRowToUser(result);
}

export async function findUserByPhone(
  db: D1Database,
  phone: string
): Promise<User | null> {
  const result = await db.prepare('SELECT * FROM users WHERE phone = ?').bind(phone).first();
  
  if (!result) return null;
  
  return mapRowToUser(result);
}

function mapRowToUser(result: Record<string, unknown>): User {
  return {
    id: result.id as string,
    email: result.email as string,
    name: result.name as string,
    phone: result.phone as string | undefined,
    password: result.password as string,
    organizations: JSON.parse(result.organizations as string),
    profile: JSON.parse(result.profile as string),
    createdAt: new Date(result.createdAt as string),
  };
}