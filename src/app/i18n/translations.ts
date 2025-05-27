import { LanguageCode } from './languages';

interface TranslationText {
  [key: string]: string;
}

type Translations = Record<LanguageCode, TranslationText>;

export const translations: Translations = {
  th: {
    // Auth
    login_title: 'เข้าสู่ระบบ E-Bidding',
    login_subtitle: 'ระบบประมูลออนไลน์ที่คุณไว้วางใจ',
    email_label: 'อีเมล',
    email_placeholder: 'example@email.com',
    password_label: 'รหัสผ่าน',
    password_placeholder: '••••••••',
    remember_me: 'จดจำฉัน',
    forgot_password: 'ลืมรหัสผ่าน?',
    login_button: 'เข้าสู่ระบบ',
    no_account: 'ยังไม่มีบัญชี? สามารถติดต่อผู้ดูแลระบบเพื่อสมัครสมาชิก',
    
    // Navbar
    home: 'หน้าแรก',
    auctions: 'รายการประมูล',
    my_auctions: 'ประมูลของฉัน',
    notifications: 'แจ้งเตือน',
    profile: 'โปรไฟล์',
    edit_profile: 'แก้ไขโปรไฟล์',
    logout: 'ออกจากระบบ',
  },
  en: {
    // Auth
    login_title: 'Login to E-Bidding',
    login_subtitle: 'The online auction system you can trust',
    email_label: 'Email',
    email_placeholder: 'example@email.com',
    password_label: 'Password',
    password_placeholder: '••••••••',
    remember_me: 'Remember me',
    forgot_password: 'Forgot password?',
    login_button: 'Login',
    no_account: 'No account? Please contact administrator to register',
    
    // Navbar
    home: 'Home',
    auctions: 'Auctions',
    my_auctions: 'My Auctions',
    notifications: 'Notifications',
    profile: 'Profile',
    edit_profile: 'Edit Profile',
    logout: 'Logout',
  }
}; 