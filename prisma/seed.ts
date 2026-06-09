import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import bcrypt from 'bcryptjs';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('[SEEDER] DATABASE_URL tidak terkonfigurasi.');
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    const username = 'admin';
    const plainPassword = 'SecurePassword!123';

    const existingUser = await prisma.user.findUnique({
        where: { username },
    });

    if (existingUser) {
        console.log(`[SEEDER] Peringatan: Pengguna '${username}' sudah ada di database. Proses dilewati.`);
        return;
    }

    console.log(`[SEEDER] Memulai enkrispsi kata sandi untuk '${username}'...`);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    const user = await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
            role: 'admin',
        }
    });

    console.log(`[SEEDER] Sukses: Akun administrator '${username}' berhasil ditanamkan ke database.`);
}

main()
.catch((e) => {
    console.error('[SEEDER] Gagal:', e);
    process.exit(1);
})
.finally(async () => {
    await prisma.$disconnect();
})
