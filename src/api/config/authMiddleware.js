const { verifyToken } = require('../helper/authHelper');

// รายการ API ที่ไม่ต้องเช็ค Token (Public Routes)
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/otp',
  '/api/auth/reset-password',
  '/api/languages',
  '/api/languages/',
];

// รายการ API ที่ต้องเป็น Admin เท่านั้น
const ADMIN_ONLY_ROUTES = [];

// ฟังก์ชันตรวจสอบว่า route เป็น public หรือไม่
function isPublicRoute(path) {
  return PUBLIC_ROUTES.some((route) => {
    if (route === path) return true;
    if (route.endsWith('/') && path.startsWith(route)) return true;
    return false;
  });
}

// ฟังก์ชันตรวจสอบว่า route ต้องเป็น admin หรือไม่
function isAdminOnlyRoute(path) {
  return ADMIN_ONLY_ROUTES.some((route) => {
    const routePattern = route.replace(':userId', '\\d+');
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(path);
  });
}

// Middleware สำหรับตรวจสอบ Authentication
function authMiddleware(req, res, next) {
  const path = req.path;
  const method = req.method;

  // ข้าม authentication สำหรับ public routes
  if (isPublicRoute(path)) {
    console.log(`🟢 Public Route: ${method} ${path} - ไม่ต้องเช็ค Token`);
    return next();
  }

  // ตรวจสอบ Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.log(`🔴 No Token: ${method} ${path}`);
    return res.status(401).json({
      success: false,
      message: 'ไม่พบ Access Token กรุณา Login ก่อน',
      code: 'NO_TOKEN',
    });
  }

  // ตรวจสอบ Token
  const tokenResult = verifyToken(token);

  if (!tokenResult.success) {
    console.log(`🔴 Invalid Token: ${method} ${path}`);
    return res.status(403).json({
      success: false,
      message: 'Token ไม่ถูกต้องหรือหมดอายุ',
      code: 'INVALID_TOKEN',
    });
  }

  // เพิ่มข้อมูลผู้ใช้ใน request
  req.user = tokenResult.data;

  // ตรวจสอบสิทธิ์ Admin สำหรับ Admin-only routes
  if (isAdminOnlyRoute(path)) {
    if (req.user.type !== 'admin') {
      console.log(
        `🔴 Admin Required: ${method} ${path} - User: ${req.user.username} (${req.user.type})`
      );
      return res.status(403).json({
        success: false,
        message: 'ไม่มีสิทธิ์เข้าถึง ต้องเป็น Admin เท่านั้น',
        code: 'ADMIN_REQUIRED',
      });
    }
  }

  console.log(
    `🟢 Authenticated: ${method} ${path} - User: ${req.user.username} (${req.user.type})`
  );
  next();
}

// Middleware สำหรับบังคับให้เป็น Admin
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'ไม่พบข้อมูลการ Authentication',
      code: 'NO_AUTH',
    });
  }

  if (req.user.type !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'ต้องมีสิทธิ์ Admin เท่านั้น',
      code: 'ADMIN_REQUIRED',
    });
  }

  next();
}

// Middleware สำหรับตรวจสอบว่าเป็นเจ้าของบัญชีหรือ Admin
function requireOwnerOrAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'ไม่พบข้อมูลการ Authentication',
      code: 'NO_AUTH',
    });
  }

  const requestedUserId = parseInt(req.params.userId);
  const isOwner = req.user.user_id === requestedUserId;
  const isAdmin = req.user.type === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้',
      code: 'ACCESS_DENIED',
    });
  }

  next();
}

module.exports = {
  authMiddleware,
  requireAdmin,
  requireOwnerOrAdmin,
  isPublicRoute,
  isAdminOnlyRoute,
  PUBLIC_ROUTES,
  ADMIN_ONLY_ROUTES,
};
