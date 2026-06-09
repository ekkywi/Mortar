import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const secretToken = process.env.API_SECRET_TOKEN;
        
        if (!secretToken) {
            console.error('[API_TELEMETRY] API_SECRET_TOKEN tidak terkonfigurasi di server.');
            return NextResponse.json(
                { error: 'Kesalahan konfigurasi internal server.' },
                { status: 500 }
            );
        }

        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${secretToken}`) {
            return NextResponse.json(
                { error: 'Akses ditolak. Token tidak valid.' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { deviceTime, distanceUpper, distanceLower, isPumpOn, fuzzyOutput } = body;

        if (
            deviceTime === undefined || 
            distanceUpper === undefined || 
            distanceLower === undefined || 
            isPumpOn === undefined || 
            fuzzyOutput === undefined
        ) {
            return NextResponse.json(
                { error: 'Payload tidak valid atau tidak lengkap' },
                { status: 400 }
            );
        }

        const serverReceiptTime = Date.now();
        const numDeviceTime = Number(deviceTime);

        if (numDeviceTime < 1704067200000) {
            console.warn('[API_TELEMETRY] ESP32 gagal sync NTP. Data ditolak.');
            return NextResponse.json(
                { error: 'Integritas waktu gagal. Pastikan ESP32 tersinkronisasi NTP.' },
                { status: 422 } 
            );
        }

        const latencyMs = serverReceiptTime - numDeviceTime;

        if (latencyMs < -5000) {
            console.warn(`[API_TELEMETRY] Latensi negatif ekstrim (${latencyMs}ms). Data ditolak.`);
            return NextResponse.json(
                { error: 'Jam perangkat mendahului server melebihi batas toleransi. Sinkronisasi ulang NTP.' },
                { status: 422 } 
            );
        }

        const parsedDeviceTime = new Date(numDeviceTime);

        const record = await prisma.tankTelemetry.create({
            data: {
                deviceTime: parsedDeviceTime,
                distanceUpper: Number(distanceUpper),
                distanceLower: Number(distanceLower),
                isPumpOn: Boolean(isPumpOn),
                fuzzyOutput: Number(fuzzyOutput),
                latencyMs: latencyMs,
            },
        });

        const serializedRecord = {
            ...record,
            deviceTime: record.deviceTime.toISOString(),
            createdAt: record.createdAt.toISOString(),
        };

        return NextResponse.json(
            { success: true, data: serializedRecord },
            { status: 201 }
        );

    } catch (error) {
        console.error('[API_TELEMETRY_POST] Error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan pada server saat memproses data' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const historyData = await prisma.tankTelemetry.findMany({
            take: 100,
            orderBy: {
                deviceTime: 'desc',
            },
        });

        const chronologicalData = historyData.reverse();
        
        return NextResponse.json(chronologicalData, { status: 200} );
    } catch (error) {
        console.error("TELEMETRY_GET_ERROR", error);
        return NextResponse.json(
            { error: "Gagal mengambil data historis telemetri." },
            { status: 500 }
        );
    }
}
