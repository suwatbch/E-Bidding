import { AxiosInstance } from 'axios';

/**
 * Universal API interceptor สำหรับจัดการ session invalidation
 * ใช้ร่วมกันได้กับทุก service
 */
export const setupSessionInterceptor = (apiInstance: AxiosInstance) => {
  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      // ตรวจสอบ 403 error ที่เกิดจาก session invalid
      if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || '';
        const errorCode = error.response?.data?.code || '';

        if (
          errorMessage.includes('Token ไม่ถูกต้องหรือหมดอายุ') ||
          errorMessage.includes('Session ไม่ถูกต้องหรือถูกยกเลิกแล้ว') ||
          errorMessage.includes('Session invalid') ||
          errorMessage.includes('Token invalid') ||
          errorCode === 'INVALID_TOKEN' ||
          errorCode === 'SESSION_INVALID'
        ) {
          // ล้าง storage ทั้งหมด
          if (typeof window !== 'undefined') {
            // Clear localStorage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_session');
            localStorage.removeItem('auth_remember_me');

            // Clear sessionStorage
            sessionStorage.removeItem('auth_token');

            // Clear cookies
            document.cookie =
              'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict';

            // Dispatch custom event for other components to handle
            window.dispatchEvent(
              new CustomEvent('session-invalidated', {
                detail: { reason: 'concurrent_login' },
              })
            );

            // Redirect ไป login พร้อม reason
            const currentPath = window.location.pathname;

            // ป้องกัน redirect loop
            if (!currentPath.startsWith('/login')) {
              window.location.href = `/login?returnUrl=${encodeURIComponent(
                currentPath
              )}&reason=session_invalid`;
            }
          }
        } else {
          console.log('⚠️ 403 Error but not session related:', {
            message: errorMessage,
            code: errorCode,
          });
        }
      }

      return Promise.reject(error);
    }
  );
};
