import { getShippingAdapter } from "../lib/shipping/index.js";
import { successResponse } from "../utils/apiResponse.js";

export function getShippingServices(_req, res) {
  return successResponse(res, {
    message: "Layanan pengiriman (mock development)",
    data: getShippingAdapter().listServices(),
    meta: {
      isMock: true,
      note: "Tarif dan estimasi adalah simulasi development, bukan tarif kurir aktual.",
    },
  });
}
