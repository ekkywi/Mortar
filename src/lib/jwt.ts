import { SignJWT, jwtVerify} from "jose";

if (!process.env.JWT_SECRET_KEY) {
    throw new Error('PENGATURAN KRITIS HILANG: JWT_SECRET_KEY tidak ditemukan.');
}

const key = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

export async function encrypt(payload: { id: string; username: string; role: string }) {
    return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(key);
}

export async function decrypt(token: string) {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        });

        return payload;
    } catch (error) {
        return null
    }
}