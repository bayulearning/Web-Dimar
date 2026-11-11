// Membuat akun admin production tanpa mengubah database secara manual.
// Pemakaian:
//   npm run create-admin --workspace server -- admin@example.com "PasswordKuat#123" "Nama Admin"
// Variabel alternatif: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME.
// Tambahkan --update untuk memperbarui password/role akun yang sudah ada.

import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function readArgs() {
  const args = process.argv.slice(2).filter((arg) => arg !== "--update");
  const update = process.argv.includes("--update");

  const email = (args[0] || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = args[1] || process.env.ADMIN_PASSWORD || "";
  const name = (args[2] || process.env.ADMIN_NAME || "Administrator").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Email admin tidak valid");
  }
  if (password.length < 12) {
    throw new Error("Password admin minimal 12 karakter");
  }
  if (!name) {
    throw new Error("Nama admin wajib diisi");
  }

  return { email, password, name, update };
}

async function main() {
  const { email, password, name, update } = readArgs();
  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing && !update) {
    throw new Error(
      `Akun ${email} sudah ada. Gunakan --update jika memang ingin memperbarui.`,
    );
  }

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      name,
      email,
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
    update: {
      name,
      passwordHash,
      role: "ADMIN",
      isActive: true,
      deletedAt: null,
    },
  });

  console.log(`Admin siap: ${user.email} (id=${user.id}, role=${user.role})`);
}

main()
  .catch((error) => {
    console.error(`Gagal membuat admin: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
