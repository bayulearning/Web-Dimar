import { prisma } from "../lib/prisma.js";

export function createContactMessage(data) {
  return prisma.contactMessage.create({ data });
}
