import { NextRequest, NextResponse } from 'next/server';

// กำหนด routes ต่างๆ
const PUBLIC_ROUTES = ['/', '/about', '/contact'];
const AUTH_ROUTES = ['/login', '/register', '/forget'];
const PROTECTED_ROUTES = [
  '/auctions',
  '/auction',
  '/auctionform',
  '/company',
  '/language',
  '/user',
  '/token-session',
  '/test',
];

// ฟังก์ชันอ่าน cookie
function getCookie(request: NextRequest, name: string): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

// ฟังก์ชันตรวจสอบ JWT token
function isTokenValid(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Decode payload
    const payload = parts[1];
    const decoded = JSON.parse(
      Buffer.from(
        payload.replace(/-/g, '+').replace(/_/g, '/'),
        'base64'
      ).toString('utf-8')
    );

    // เช็คว่ามี exp หรือไม่
    if (!decoded.exp) return false;

    // เช็คว่าหมดอายุหรือยัง
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp > now;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

// ฟังก์ชันล้าง auth cookies
function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.set('auth_token', '', {
    path: '/',
    expires: new Date(0),
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  // เพิ่ม header สำหรับ client-side cleanup
  response.headers.set('X-Clear-Auth', 'true');

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ข้าม static files และ API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // files with extensions
  ) {
    return NextResponse.next();
  }

  // อ่าน auth token จาก cookie
  const authToken = getCookie(request, 'auth_token');
  const isAuthenticated = authToken && isTokenValid(authToken);

  // ตรวจสอบ route type
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // === AUTO LOGOUT: Token หมดอายุ ===
  if (authToken && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    loginUrl.searchParams.set('reason', 'token_expired');

    const response = NextResponse.redirect(loginUrl);
    return clearAuthCookies(response);
  }

  // === PROTECTED ROUTES: ต้อง login ก่อน ===
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);

    return NextResponse.redirect(loginUrl);
  }

  // === AUTH ROUTES: ถ้า login แล้วไม่ควรเข้า ===
  if (isAuthRoute && isAuthenticated) {
    // ถ้ามี returnUrl ให้ไปที่นั่น ไม่งั้นไป auctions
    const returnUrl = request.nextUrl.searchParams.get('returnUrl');
    const redirectUrl =
      returnUrl && returnUrl !== '/login' ? returnUrl : '/auctions';

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // === DEFAULT: อนุญาตให้ผ่าน ===
  const response = NextResponse.next();
  response.headers.set(
    'X-Auth-Status',
    isAuthenticated ? 'authenticated' : 'unauthenticated'
  );
  response.headers.set(
    'X-Route-Type',
    isPublicRoute
      ? 'public'
      : isAuthRoute
      ? 'auth'
      : isProtectedRoute
      ? 'protected'
      : 'unknown'
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files with extensions (js, css, png, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
