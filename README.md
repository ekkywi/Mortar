# MORTAR (Monitoring Tinggi Air)

**MORTAR** adalah aplikasi web dan API untuk **Sistem Pemantauan & Kendali Tandon Air Cerdas** berbasis *Serverless IoT*. Sistem ini memantau ketersediaan air pada dua titik, yaitu tandon atas dan sumur bawah, secara waktu nyata (*real-time*) melalui kolaborasi antara perangkat *edge* berbasis mikrokontroler dan layanan serverless.

Proyek ini dibangun untuk mendukung pengujian analitis pada luaran jurnal ilmiah bidang **Mikrokontroler** dan **Sistem Terdistribusi**.

## Gambaran Sistem

MORTAR dirancang sebagai sistem terdistribusi ringan untuk menerima data telemetri dari perangkat seperti ESP32, memvalidasi integritas data, lalu menyimpannya ke database serverless.

Alur utama sistem:

1. Perangkat mikrokontroler membaca kondisi tandon atas dan sumur bawah.
2. Perangkat melakukan komputasi lokal, termasuk status pompa dan nilai keluaran fuzzy.
3. Data telemetri dikirim ke API serverless MORTAR.
4. API memvalidasi token, kelengkapan payload, dan waktu perangkat.
5. Data valid disimpan ke Neon serverless PostgreSQL melalui Prisma.
6. Aplikasi web dapat dikembangkan untuk menampilkan data monitoring secara real-time.

## Arsitektur

Komponen utama:

- **Edge Device**: mikrokontroler seperti ESP32 untuk membaca sensor, sinkronisasi NTP, dan mengirim data.
- **Serverless API**: Next.js Route Handler pada endpoint `/api/telemetry`.
- **Database**: Neon serverless PostgreSQL untuk penyimpanan data telemetri.
- **ORM**: Prisma Client dengan adapter Neon serverless.
- **Web App**: Next.js sebagai antarmuka pemantauan.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Prisma 7
- Neon serverless PostgreSQL
- `@neondatabase/serverless`
- `@prisma/adapter-neon`

## Model Data

Data telemetri disimpan dalam model `TankTelemetry`.

Field utama:

- `deviceTime`: waktu dari perangkat dalam format timestamp milidetik.
- `distanceUpper`: jarak pembacaan sensor pada tandon atas.
- `distanceLower`: jarak pembacaan sensor pada sumur bawah.
- `isPumpOn`: status pompa.
- `fuzzyOutput`: nilai keluaran fuzzy dari perangkat.
- `latencyMs`: selisih waktu antara server menerima data dan waktu perangkat.
- `createdAt`: waktu data tersimpan di server.

## Endpoint API

### `POST /api/telemetry`

Endpoint ini menerima data telemetri dari perangkat IoT.

Header wajib:

```http
Authorization: Bearer <API_SECRET_TOKEN>
Content-Type: application/json
```

Contoh payload:

```json
{
  "deviceTime": 1791294000000,
  "distanceUpper": 12.5,
  "distanceLower": 34.5,
  "isPumpOn": true,
  "fuzzyOutput": 0.72
}
```

Contoh respons sukses:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "deviceTime": "2026-10-06T12:20:00.000Z",
    "distanceUpper": 12.5,
    "distanceLower": 34.5,
    "isPumpOn": true,
    "fuzzyOutput": 0.72,
    "latencyMs": 120,
    "createdAt": "2026-10-06T12:20:00.120Z"
  }
}
```

Status respons:

- `201`: data berhasil diterima dan disimpan.
- `400`: payload tidak lengkap.
- `401`: token tidak valid.
- `422`: waktu perangkat tidak valid atau sinkronisasi NTP bermasalah.
- `500`: kesalahan konfigurasi atau kegagalan server.

## Setup Lokal

Install dependency:

```bash
npm install
```

Buat file `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require&channel_binding=require"
JWT_SECRET_KEY="ganti-dengan-secret-jwt-yang-kuat"
API_SECRET_TOKEN="ganti-dengan-token-rahasia"
NEXT_PUBLIC_MQTT_URL="wss://broker.example.com:port/mqtt"
NEXT_PUBLIC_MQTT_USERNAME="username-broker"
NEXT_PUBLIC_MQTT_PASSWORD="password-broker"
```

Untuk deployment di Vercel, pastikan semua variabel di atas juga ditambahkan ke Project Settings -> Environment Variables agar proses build dan runtime tidak gagal karena konfigurasi yang hilang.

Validasi schema Prisma:

```bash
npx prisma validate
```

Jalankan development server:

```bash
npm run dev
```

Aplikasi berjalan di:

```text
http://localhost:3000
```

## Perintah Pengembangan

```bash
npm run dev
npm run build
npm run start
npm run lint
npx tsc --noEmit
```

## Catatan Keamanan

- Jangan commit file `.env` karena berisi `DATABASE_URL` dan `API_SECRET_TOKEN`.
- Perangkat wajib mengirim header `Authorization` dengan token yang sesuai.
- ESP32 atau perangkat edge harus tersinkronisasi NTP sebelum mengirim data.
- API menolak data dengan waktu perangkat terlalu lama atau terlalu maju dari waktu server.

## Konteks Penelitian

MORTAR digunakan sebagai repositori aplikasi pendukung untuk eksperimen sistem pemantauan tandon air cerdas. Fokus sistem berada pada integrasi mikrokontroler, validasi data waktu nyata, penyimpanan serverless, serta rancangan sistem terdistribusi yang ringan dan dapat direplikasi.
