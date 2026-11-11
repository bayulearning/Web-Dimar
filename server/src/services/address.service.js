import {
  createAddress,
  deleteAddress,
  findAddress,
  findAddresses,
  updateAddress,
} from "../repositories/address.repository.js";
import { NotFoundError } from "../utils/AppError.js";

export function listAddresses(userId) {
  return findAddresses(userId);
}

export function getAddress(userId, id) {
  return findAddress(userId, id);
}

export async function addAddress(userId, data) {
  return createAddress(userId, data);
}

export async function editAddress(userId, id, data) {
  const address = await updateAddress(userId, id, data);
  if (!address) throw new NotFoundError("Alamat tidak ditemukan");
  return address;
}

export async function removeAddress(userId, id) {
  const address = await deleteAddress(userId, id);
  if (!address) throw new NotFoundError("Alamat tidak ditemukan");
  return address;
}
