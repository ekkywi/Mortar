import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { decrypt } from '@/lib/jwt';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isProtectedRoute = path.startsWith('/dashboard');
    const cookie = request.cookies.get('session')?.value;
    const session = cookie ? await decrypt(cookie) : null;

    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    if (path === '/' && session) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};