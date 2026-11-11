import { env } from "../config/env.js";
import { authCookieOptions } from "../lib/token.js";
import { login, register, updateProfile, toPublicUser } from "../services/user.service.js";
import { successResponse } from "../utils/apiResponse.js";

function setAuthCookie(res, token) {
  res.cookie(env.COOKIE_NAME, token, authCookieOptions());
}

export async function postRegister(req, res) {
  const { user, token } = await register(req.validatedBody);
  setAuthCookie(res, token);
  return successResponse(res, {
    statusCode: 201,
    message: "Akun berhasil dibuat",
    data: { user },
  });
}

export async function postLogin(req, res) {
  const { user, token } = await login(req.validatedBody);
  setAuthCookie(res, token);
  return successResponse(res, {
    message: "Login berhasil",
    data: { user },
  });
}

export function postLogout(_req, res) {
  const options = authCookieOptions();
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path,
  });
  return successResponse(res, { message: "Logout berhasil" });
}

export function getMe(req, res) {
  return successResponse(res, {
    message: "Profil berhasil diambil",
    data: { user: toPublicUser(req.user) },
  });
}

export async function patchMe(req, res) {
  const user = await updateProfile(req.user.id, req.validatedBody);
  return successResponse(res, {
    message: "Profil berhasil diperbarui",
    data: { user },
  });
}
