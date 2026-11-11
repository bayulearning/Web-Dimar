import {
  addAddress,
  editAddress,
  listAddresses,
  removeAddress,
} from "../services/address.service.js";
import { successResponse } from "../utils/apiResponse.js";

export async function getAddresses(req, res) {
  const addresses = await listAddresses(req.user.id);
  return successResponse(res, {
    message: "Daftar alamat berhasil diambil",
    data: addresses,
  });
}

export async function postAddress(req, res) {
  const address = await addAddress(req.user.id, req.validatedBody);
  return successResponse(res, {
    statusCode: 201,
    message: "Alamat berhasil ditambahkan",
    data: address,
  });
}

export async function patchAddress(req, res) {
  const address = await editAddress(
    req.user.id,
    req.validatedParams.id,
    req.validatedBody,
  );
  return successResponse(res, {
    message: "Alamat berhasil diperbarui",
    data: address,
  });
}

export async function deleteAddressHandler(req, res) {
  await removeAddress(req.user.id, req.validatedParams.id);
  return successResponse(res, { message: "Alamat berhasil dihapus" });
}
