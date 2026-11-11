import bcrypt from "bcrypt";
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
} from "../repositories/user.repository.js";
import { signAuthToken } from "../lib/token.js";
import { AppError, UnauthorizedError } from "../utils/AppError.js";

export function toPublicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function register({ name, email, password, phone }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new AppError("Email sudah terdaftar", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({
    name,
    email: email.toLowerCase(),
    passwordHash,
    phone: phone || null,
  });

  return {
    user: toPublicUser(user),
    token: signAuthToken(user),
  };
}

export async function login({ email, password }) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new UnauthorizedError("Email atau password salah");
  }

  if (!user.isActive) {
    throw new AppError("Akun dinonaktifkan", 403);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError("Email atau password salah");
  }

  return {
    user: toPublicUser(user),
    token: signAuthToken(user),
  };
}

export function getProfile(userId) {
  return findUserById(userId).then(toPublicUser);
}

export async function updateProfile(userId, data) {
  const payload = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.phone !== undefined) payload.phone = data.phone || null;

  const user = await updateUser(userId, payload);
  return toPublicUser(user);
}
