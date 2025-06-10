import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ฟังก์ชันสำหรับตรวจสอบ token หมดอายุ
function isTokenExpired(token: string): boolean {
  try {
    // แยก payload จาก JWT token
    const parts = token.split('.');
    if (parts.length !== 3) {
      return true; // token format ไม่ถูกต้อง
    }

    // ใช้ Buffer แทน atob() เพื่อรองรับ Node.js environment
    const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
    const tokenData = JSON.parse(payload);

    const currentTime = Math.floor(Date.now() / 1000);

    return tokenData.exp ? tokenData.exp < currentTime : false;
  } catch (error) {
    return true; // ถ้า decode ไม่ได้ ถือว่าหมดอายุ
  }
}

// หน้าที่ต้อง login ก่อนเข้าได้
const protectedRoutes = [
  '/auctions',
  '/auction',
  '/auctionform',
  '/my-auctions',
  '/alerts',
  '/company',
  '/language',
  '/user',
  '/token-session',
  '/test',
];

// หน้า auth ที่ไม่ควรเข้าเมื่อ login แล้ว
const authRoutes = ['/login', '/register', '/forget'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ดึง token จาก cookies
  const token = request.cookies.get('auth_token')?.value;

  // ตรวจสอบหน้า auth (login, register, forget)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isAuthRoute) {
    // ถ้ามี token และยังไม่หมดอายุ ไม่ให้เข้าหน้า auth
    if (token && !isTokenExpired(token)) {
      return NextResponse.redirect(new URL('/auctions', request.url));
    }
    // ถ้าไม่มี token หรือหมดอายุแล้ว ให้เข้าหน้า auth ได้
    return NextResponse.next();
  }

  // ตรวจสอบหน้าที่ต้อง login
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // ถ้าไม่มี token
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // ตรวจสอบว่า token หมดอายุหรือไม่
    if (isTokenExpired(token)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);

      // ลบ token ที่หมดอายุออกจาก cookies
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('auth_token');
      return response;
    }

    // ถ้า token ยังใช้ได้ ให้ผ่านได้
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
