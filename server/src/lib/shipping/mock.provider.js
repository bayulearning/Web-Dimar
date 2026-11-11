// Adapter pengiriman development.
// Tarif di bawah adalah MOCK dan tidak boleh diklaim sebagai tarif kurir aktual.

const SERVICES = [
  {
    provider: "JNE",
    service: "REG",
    description: "Reguler (mock)",
    etaMinDays: 2,
    etaMaxDays: 3,
    cost: 18000,
  },
  {
    provider: "JNE",
    service: "YES",
    description: "Yakin Esok Sampai (mock)",
    etaMinDays: 1,
    etaMaxDays: 1,
    cost: 32000,
  },
  {
    provider: "J&T",
    service: "EZ",
    description: "Reguler (mock)",
    etaMinDays: 2,
    etaMaxDays: 4,
    cost: 17000,
  },
  {
    provider: "SiCepat",
    service: "REG",
    description: "Reguler (mock)",
    etaMinDays: 2,
    etaMaxDays: 3,
    cost: 16000,
  },
  {
    provider: "SiCepat",
    service: "BEST",
    description: "Best Service (mock)",
    etaMinDays: 1,
    etaMaxDays: 2,
    cost: 28000,
  },
];

function decorate(entry) {
  return {
    ...entry,
    currency: "IDR",
    isMock: true,
  };
}

export function listShippingServices() {
  return SERVICES.map(decorate);
}

export function findShippingService(provider, service) {
  const match = SERVICES.find(
    (entry) =>
      entry.provider.toLowerCase() === String(provider).toLowerCase() &&
      entry.service.toLowerCase() === String(service).toLowerCase(),
  );
  return match ? decorate(match) : null;
}

export function estimateArrival(daysMax) {
  return new Date(Date.now() + daysMax * 24 * 60 * 60 * 1000);
}

export const shippingProviderName = "mock";
