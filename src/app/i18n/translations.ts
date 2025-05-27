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

    // Forget Password
    forget_title: 'ลืมรหัสผ่าน',
    forget_subtitle: 'กรุณากรอกข้อมูลเพื่อตั้งรหัสผ่านใหม่',
    forget_email_label: 'อีเมล',
    forget_email_placeholder: 'example@email.com',
    forget_new_password_label: 'รหัสผ่านใหม่',
    forget_new_password_placeholder: '••••••••',
    forget_new_password_hint: 'ขั้นต่ำ 8 ตัวอักษร',
    forget_otp_label: 'รหัส OTP',
    forget_otp_placeholder: '______',
    forget_otp_hint: 'กรอกรหัส 6 หลัก',
    forget_button: 'ตกลง',
    back_to_login: 'กลับไปหน้าเข้าสู่ระบบ',
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

    // Forget Password
    forget_title: 'Forgot Password',
    forget_subtitle: 'Please enter information to set new password',
    forget_email_label: 'Email',
    forget_email_placeholder: 'example@email.com',
    forget_new_password_label: 'New Password',
    forget_new_password_placeholder: '••••••••',
    forget_new_password_hint: 'Minimum 8 characters',
    forget_otp_label: 'OTP Code',
    forget_otp_placeholder: '______',
    forget_otp_hint: 'Enter 6 digits code',
    forget_button: 'Submit',
    back_to_login: 'Back to Login',
  },
  zh: {
    // Auth
    login_title: '登录 E-Bidding',
    login_subtitle: '值得信赖的在线拍卖系统',
    email_label: '电子邮件',
    email_placeholder: 'example@email.com',
    password_label: '密码',
    password_placeholder: '••••••••',
    remember_me: '记住我',
    forgot_password: '忘记密码？',
    login_button: '登录',
    no_account: '没有账号？请联系管理员注册',
    
    // Navbar
    home: '首页',
    auctions: '拍卖列表',
    my_auctions: '我的拍卖',
    notifications: '通知',
    profile: '个人资料',
    edit_profile: '编辑资料',
    logout: '退出登录',

    // Forget Password
    forget_title: '忘记密码',
    forget_subtitle: '请输入信息以设置新密码',
    forget_email_label: '电子邮件',
    forget_email_placeholder: 'example@email.com',
    forget_new_password_label: '新密码',
    forget_new_password_placeholder: '••••••••',
    forget_new_password_hint: '最少8个字符',
    forget_otp_label: 'OTP验证码',
    forget_otp_placeholder: '______',
    forget_otp_hint: '输入6位验证码',
    forget_button: '确认',
    back_to_login: '返回登录页面'
  }
}; 