import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { encrypt } from "@/lib/jwt";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { error: "Username dan password wajib diisi."},
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Kredensial tidak valid."},
                { status: 401 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Kredensial tidak valid."},
                { status: 401 }
            );
        }

        const token = await encrypt({
            id: user.id,
            username: user.username,
            role: user.role,
        });

        const cookieStore = await cookies();
        cookieStore.set('session', token, {
           httpOnly: true,
           secure: process.env.NODE_ENV === 'production',
           sameSite: 'lax',
           path: '/',
           maxAge: 8 * 60 * 60,
        });

        return NextResponse.json(
            { message: "Autentikasi berhasil."},
            { status: 200 }
        );

    } catch (error) {
        console.error("[LOGIN_ERROR", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan pada server saat memproses autentikasi."},
            { status: 500 }
        )
    }
}
