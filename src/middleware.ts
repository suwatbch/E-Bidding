import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ฟังก์ชันสำหรับตรวจสอบ token หมดอายุ
function isTokenExpired(token: string): boolean {
  try {
    // สำหรับการทดสอบ ให้ถือว่า token หมดอายุใน 24 ชั่วโมง
    // ในกรณีจริงอาจต้อง decode JWT เพื่อตรวจสอบ exp
    const tokenData = JSON.parse(atob(token.split('.')[1] || '{}'));
    const currentTime = Math.floor(Date.now() / 1000);

    return tokenData.exp ? tokenData.exp < currentTime : false;
  } catch (error) {
    // ถ้า token ไม่สามารถ parse ได้ ให้ถือว่าหมดอายุ
    return true;
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

  console.log(
    `🔍 Middleware checking: ${pathname}, Token: ${token ? 'exists' : 'none'}`
  );

  // ตรวจสอบหน้า auth (login, register, forget)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isAuthRoute) {
    // ถ้ามี token และยังไม่หมดอายุ ไม่ให้เข้าหน้า auth
    if (token && !isTokenExpired(token)) {
      console.log('✅ User already logged in, redirecting to auctions');
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
      console.log('🚫 No token found, redirecting to login');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // ตรวจสอบว่า token หมดอายุหรือไม่
    if (isTokenExpired(token)) {
      console.log('⏰ Token expired, redirecting to login');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);

      // ลบ token ที่หมดอายุออกจาก cookies
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('auth_token');
      return response;
    }

    // ถ้า token ยังใช้ได้ ให้ผ่านได้
    console.log('✅ Token valid, allowing access to:', pathname);
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
