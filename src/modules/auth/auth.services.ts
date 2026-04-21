import { D1Database } from '@cloudflare/workers-types';
import { generateId } from '../../lib/id.lib';
import { hashPassword, verifyPassword } from '../../lib/password.lib';
import { RegisterUserInput, LoginInput, User } from '../../../packages/schemas/auth.schema';
import { createUser, findUserByEmail as findUserByEmailCrud, findUserByPhone } from './auth.crud';

export interface RegisterUserServiceParams {
  db: D1Database;
  input: RegisterUserInput;
}

export async function registerUserService({ db, input }: RegisterUserServiceParams): Promise<User> {
  const hashedPassword = await hashPassword(input.password);

  const user: User = {
    id: generateId(),
    email: input.email,
    name: input.name,
    phone: input.phone,
    password: hashedPassword,
    organizations: input.organizations || "",
    profile: input.profile || {},
    createdAt: new Date(),
  };

  await createUser(db, user);

  return user;
}

export interface LoginUserServiceParams {
  db: D1Database;
  input: LoginInput;
}

export async function loginUserService({ db, input }: LoginUserServiceParams): Promise<Omit<User, 'password'> | null> {
  const { identifier, password } = input;

  let user = await findUserByEmailCrud(db, identifier);
  if (!user) {
    user = await findUserByPhone(db, identifier);
  }

  if (!user) return null;

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) return null;

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export { findUserByEmailCrud as findUserByEmail };
