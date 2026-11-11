import { prisma } from "../lib/prisma.js";

export function findUserByEmail(email) {
  return prisma.user.findFirst({
    where: { email: email.toLowerCase(), deletedAt: null },
  });
}

export function findUserById(id) {
  return prisma.user.findFirst({
    where: { id, deletedAt: null, isActive: true },
  });
}

export function createUser(data) {
  return prisma.user.create({
    data: {
      ...data,
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });
}

export function updateUser(id, data) {
  return prisma.user.update({ where: { id }, data });
}
