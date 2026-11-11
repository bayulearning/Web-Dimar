import {
  estimateArrival,
  findShippingService,
  listShippingServices,
  shippingProviderName,
} from "./mock.provider.js";

// Hanya mock yang tersedia saat ini. Provider nyata dapat ditambahkan
// dengan mengimplementasikan antarmuka yang sama.
const adapters = {
  mock: {
    name: shippingProviderName,
    listServices: listShippingServices,
    findService: findShippingService,
    estimateArrival,
  },
};

export function getShippingAdapter() {
  return adapters.mock;
}
