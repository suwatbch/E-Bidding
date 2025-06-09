import { LanguageCode } from '@/app/model/language_Temp';

interface TranslationText {
  [key: string]: string;
}

type Translations = Record<LanguageCode, TranslationText>;

// ตาราง Text_Language (ข้อความแปลภาษา)
export interface LanguageText {
  id: number; // INT AUTO_INCREMENT PRIMARY KEY
  keyname: string; // VARCHAR(100) NOT NULL
  language_code: string; // VARCHAR(5) FOREIGN KEY
  text: string; // TEXT NOT NULL
}

// Auto-generated from API data
export const languageTexts = [
  {
    id: 1,
    keyname: 'app_title',
    language_code: 'th',
    text: 'ระบบประมูลอิเล็กทรอนิกส์',
  },
  {
    id: 2,
    keyname: 'app_title',
    language_code: 'en',
    text: 'E-Bidding System',
  },
  {
    id: 3,
    keyname: 'app_subtitle',
    language_code: 'th',
    text: 'ระบบประมูลออนไลน์ที่ทันสมัยและน่าเชื่อถือ',
  },
  {
    id: 4,
    keyname: 'app_subtitle',
    language_code: 'en',
    text: 'Modern and reliable online bidding system',
  },
  {
    id: 5,
    keyname: 'login_title',
    language_code: 'th',
    text: 'เข้าสู่ระบบ E-Bidding',
  },
  {
    id: 6,
    keyname: 'login_title',
    language_code: 'en',
    text: 'Login to E-Bidding',
  },
  {
    id: 7,
    keyname: 'login_title',
    language_code: 'zh',
    text: '登录 E-Bidding',
  },
  {
    id: 8,
    keyname: 'login_subtitle',
    language_code: 'th',
    text: 'ระบบประมูลออนไลน์ที่คุณไว้วางใจ',
  },
  {
    id: 9,
    keyname: 'login_subtitle',
    language_code: 'en',
    text: 'The online auction system you can trust',
  },
  {
    id: 10,
    keyname: 'login_subtitle',
    language_code: 'zh',
    text: '值得信赖的在线拍卖系统',
  },
  {
    id: 11,
    keyname: 'email_label',
    language_code: 'th',
    text: 'อีเมล',
  },
  {
    id: 12,
    keyname: 'email_label',
    language_code: 'en',
    text: 'Email',
  },
  {
    id: 13,
    keyname: 'email_label',
    language_code: 'zh',
    text: '电子邮件',
  },
  {
    id: 14,
    keyname: 'email_placeholder',
    language_code: 'th',
    text: 'example@email.com',
  },
  {
    id: 15,
    keyname: 'email_placeholder',
    language_code: 'en',
    text: 'example@email.com',
  },
  {
    id: 16,
    keyname: 'email_placeholder',
    language_code: 'zh',
    text: 'example@email.com',
  },
  {
    id: 17,
    keyname: 'password_label',
    language_code: 'th',
    text: 'รหัสผ่าน',
  },
  {
    id: 18,
    keyname: 'password_label',
    language_code: 'en',
    text: 'Password',
  },
  {
    id: 19,
    keyname: 'password_label',
    language_code: 'zh',
    text: '密码',
  },
  {
    id: 20,
    keyname: 'password_placeholder',
    language_code: 'th',
    text: '••••••••',
  },
  {
    id: 21,
    keyname: 'password_placeholder',
    language_code: 'en',
    text: '••••••••',
  },
  {
    id: 22,
    keyname: 'password_placeholder',
    language_code: 'zh',
    text: '••••••••',
  },
  {
    id: 23,
    keyname: 'remember_me',
    language_code: 'th',
    text: 'จดจำฉัน',
  },
  {
    id: 24,
    keyname: 'remember_me',
    language_code: 'en',
    text: 'Remember me',
  },
  {
    id: 25,
    keyname: 'remember_me',
    language_code: 'zh',
    text: '记住我',
  },
  {
    id: 26,
    keyname: 'forgot_password',
    language_code: 'th',
    text: 'ลืมรหัสผ่าน?',
  },
  {
    id: 27,
    keyname: 'forgot_password',
    language_code: 'en',
    text: 'Forgot password?',
  },
  {
    id: 28,
    keyname: 'forgot_password',
    language_code: 'zh',
    text: '忘记密码？',
  },
  {
    id: 29,
    keyname: 'login_button',
    language_code: 'th',
    text: 'เข้าสู่ระบบ',
  },
  {
    id: 30,
    keyname: 'login_button',
    language_code: 'en',
    text: 'Login',
  },
  {
    id: 31,
    keyname: 'login_button',
    language_code: 'zh',
    text: '登录',
  },
  {
    id: 32,
    keyname: 'no_account',
    language_code: 'th',
    text: 'ยังไม่มีบัญชี? สามารถติดต่อผู้ดูแลระบบเพื่อสมัครสมาชิก',
  },
  {
    id: 33,
    keyname: 'no_account',
    language_code: 'en',
    text: 'No account? Please contact administrator to register',
  },
  {
    id: 34,
    keyname: 'no_account',
    language_code: 'zh',
    text: '没有账号？请联系管理员注册',
  },

  // Navbar
  {
    id: 35,
    keyname: 'auctions',
    language_code: 'th',
    text: 'ตลาดประมูล',
  },
  {
    id: 36,
    keyname: 'auctions',
    language_code: 'en',
    text: 'Auctions',
  },
  {
    id: 37,
    keyname: 'auctions',
    language_code: 'zh',
    text: '拍卖',
  },
  {
    id: 38,
    keyname: 'my_auctions',
    language_code: 'th',
    text: 'ประมูลของฉัน',
  },
  {
    id: 39,
    keyname: 'my_auctions',
    language_code: 'en',
    text: 'My Auctions',
  },
  {
    id: 40,
    keyname: 'my_auctions',
    language_code: 'zh',
    text: '我的拍卖',
  },
  {
    id: 41,
    keyname: 'notifications',
    language_code: 'th',
    text: 'แจ้งเตือน',
  },
  {
    id: 42,
    keyname: 'notifications',
    language_code: 'en',
    text: 'Notifications',
  },
  {
    id: 43,
    keyname: 'notifications',
    language_code: 'zh',
    text: '通知',
  },
  {
    id: 44,
    keyname: 'profile',
    language_code: 'th',
    text: 'โปรไฟล์',
  },
  {
    id: 45,
    keyname: 'profile',
    language_code: 'en',
    text: 'Profile',
  },
  {
    id: 46,
    keyname: 'profile',
    language_code: 'zh',
    text: '个人资料',
  },
  {
    id: 47,
    keyname: 'edit_profile',
    language_code: 'th',
    text: 'แก้ไขโปรไฟล์',
  },
  {
    id: 48,
    keyname: 'edit_profile',
    language_code: 'en',
    text: 'Edit Profile',
  },
  {
    id: 49,
    keyname: 'edit_profile',
    language_code: 'zh',
    text: '编辑资料',
  },
  {
    id: 50,
    keyname: 'logout',
    language_code: 'th',
    text: 'ออกจากระบบ',
  },
  {
    id: 51,
    keyname: 'logout',
    language_code: 'en',
    text: 'Logout',
  },
  {
    id: 52,
    keyname: 'logout',
    language_code: 'zh',
    text: '退出登录',
  },

  // Data Management
  {
    id: 53,
    keyname: 'data_management',
    language_code: 'th',
    text: 'จัดการข้อมูล',
  },
  {
    id: 54,
    keyname: 'data_management',
    language_code: 'en',
    text: 'Data Management',
  },
  {
    id: 55,
    keyname: 'data_management',
    language_code: 'zh',
    text: '数据管理',
  },
  {
    id: 56,
    keyname: 'company_info',
    language_code: 'th',
    text: 'ข้อมูลบริษัท',
  },
  {
    id: 57,
    keyname: 'company_info',
    language_code: 'en',
    text: 'Company Information',
  },
  {
    id: 58,
    keyname: 'company_info',
    language_code: 'zh',
    text: '公司信息',
  },
  {
    id: 59,
    keyname: 'user_info',
    language_code: 'th',
    text: 'ข้อมูลผู้ใช้งาน',
  },
  {
    id: 60,
    keyname: 'user_info',
    language_code: 'en',
    text: 'User Information',
  },
  {
    id: 61,
    keyname: 'user_info',
    language_code: 'zh',
    text: '用户信息',
  },
  {
    id: 62,
    keyname: 'language_info',
    language_code: 'th',
    text: 'ข้อมูลภาษา',
  },
  {
    id: 63,
    keyname: 'language_info',
    language_code: 'en',
    text: 'Language Information',
  },
  {
    id: 64,
    keyname: 'language_info',
    language_code: 'zh',
    text: '语言信息',
  },

  // Hero Section
  {
    id: 65,
    keyname: 'hero_title',
    language_code: 'th',
    text: 'ยินดีต้อนรับสู่',
  },
  {
    id: 66,
    keyname: 'hero_title',
    language_code: 'en',
    text: 'Welcome to',
  },
  {
    id: 67,
    keyname: 'hero_title',
    language_code: 'zh',
    text: '欢迎来到',
  },
  {
    id: 68,
    keyname: 'hero_subtitle',
    language_code: 'th',
    text: 'ค้นพบสินค้าที่คุณต้องการและเริ่มการประมูลได้เลย',
  },
  {
    id: 69,
    keyname: 'hero_subtitle',
    language_code: 'en',
    text: 'Find the items you want and start bidding now',
  },
  {
    id: 70,
    keyname: 'hero_subtitle',
    language_code: 'zh',
    text: '找到您想要的商品并立即开始竞拍',
  },
  {
    id: 71,
    keyname: 'hero_search_placeholder',
    language_code: 'th',
    text: 'ค้นหาสินค้าที่ต้องการประมูล...',
  },
  {
    id: 72,
    keyname: 'hero_search_placeholder',
    language_code: 'en',
    text: 'Search for items to bid...',
  },
  {
    id: 73,
    keyname: 'hero_search_placeholder',
    language_code: 'zh',
    text: '搜索要竞拍的商品...',
  },

  // Categories
  {
    id: 74,
    keyname: 'categories_title',
    language_code: 'th',
    text: 'หมวดหมู่',
  },
  {
    id: 75,
    keyname: 'categories_title',
    language_code: 'en',
    text: 'Categories',
  },
  {
    id: 76,
    keyname: 'categories_title',
    language_code: 'zh',
    text: '类别',
  },
  {
    id: 77,
    keyname: 'category_all',
    language_code: 'th',
    text: 'ทั้งหมด',
  },
  {
    id: 78,
    keyname: 'category_all',
    language_code: 'en',
    text: 'All',
  },
  {
    id: 79,
    keyname: 'category_all',
    language_code: 'zh',
    text: '全部',
  },
  {
    id: 80,
    keyname: 'category_electronics',
    language_code: 'th',
    text: 'อิเล็กทรอนิกส์',
  },
  {
    id: 81,
    keyname: 'category_electronics',
    language_code: 'en',
    text: 'Electronics',
  },
  {
    id: 82,
    keyname: 'category_electronics',
    language_code: 'zh',
    text: '电子产品',
  },
  {
    id: 83,
    keyname: 'category_fashion',
    language_code: 'th',
    text: 'แฟชั่น',
  },
  {
    id: 84,
    keyname: 'category_fashion',
    language_code: 'en',
    text: 'Fashion',
  },
  {
    id: 85,
    keyname: 'category_fashion',
    language_code: 'zh',
    text: '时尚',
  },
  {
    id: 86,
    keyname: 'category_jewelry',
    language_code: 'th',
    text: 'เครื่องประดับ',
  },
  {
    id: 87,
    keyname: 'category_jewelry',
    language_code: 'en',
    text: 'Jewelry',
  },
  {
    id: 88,
    keyname: 'category_jewelry',
    language_code: 'zh',
    text: '珠宝',
  },
  {
    id: 89,
    keyname: 'category_vehicles',
    language_code: 'th',
    text: 'ยานยนต์',
  },
  {
    id: 90,
    keyname: 'category_vehicles',
    language_code: 'en',
    text: 'Vehicles',
  },
  {
    id: 91,
    keyname: 'category_vehicles',
    language_code: 'zh',
    text: '车辆',
  },
  {
    id: 92,
    keyname: 'category_collectibles',
    language_code: 'th',
    text: 'ของสะสม',
  },
  {
    id: 93,
    keyname: 'category_collectibles',
    language_code: 'en',
    text: 'Collectibles',
  },
  {
    id: 94,
    keyname: 'category_collectibles',
    language_code: 'zh',
    text: '收藏品',
  },

  // Status
  {
    id: 95,
    keyname: 'all_status',
    language_code: 'th',
    text: 'ทุกสถานะ',
  },
  {
    id: 96,
    keyname: 'all_status',
    language_code: 'en',
    text: 'All Status',
  },
  {
    id: 97,
    keyname: 'all_status',
    language_code: 'zh',
    text: '所有状态',
  },
  {
    id: 98,
    keyname: 'status_pending',
    language_code: 'th',
    text: 'รอการประมูล',
  },
  {
    id: 99,
    keyname: 'status_pending',
    language_code: 'en',
    text: 'Pending',
  },
  {
    id: 100,
    keyname: 'status_pending',
    language_code: 'zh',
    text: '待处理',
  },
  {
    id: 101,
    keyname: 'status_bidding',
    language_code: 'th',
    text: 'กำลังประมูล',
  },
  {
    id: 102,
    keyname: 'status_bidding',
    language_code: 'en',
    text: 'Bidding',
  },
  {
    id: 103,
    keyname: 'status_bidding',
    language_code: 'zh',
    text: '竞拍中',
  },
  {
    id: 104,
    keyname: 'status_ending_soon',
    language_code: 'th',
    text: 'ใกล้สิ้นสุด',
  },
  {
    id: 105,
    keyname: 'status_ending_soon',
    language_code: 'en',
    text: 'Ending Soon',
  },
  {
    id: 106,
    keyname: 'status_ending_soon',
    language_code: 'zh',
    text: '即将结束',
  },
  {
    id: 107,
    keyname: 'status_ended',
    language_code: 'th',
    text: 'สิ้นสุดประมูล',
  },
  {
    id: 108,
    keyname: 'status_ended',
    language_code: 'en',
    text: 'Ended',
  },
  {
    id: 109,
    keyname: 'status_ended',
    language_code: 'zh',
    text: '已结束',
  },
  {
    id: 110,
    keyname: 'status_cancelled',
    language_code: 'th',
    text: 'ยกเลิกประมูล',
  },
  {
    id: 111,
    keyname: 'status_cancelled',
    language_code: 'en',
    text: 'Cancelled',
  },
  {
    id: 112,
    keyname: 'status_cancelled',
    language_code: 'zh',
    text: '已取消',
  },

  // Forget Password texts
  {
    id: 113,
    keyname: 'forget_title',
    language_code: 'th',
    text: 'ลืมรหัสผ่าน',
  },
  {
    id: 114,
    keyname: 'forget_title',
    language_code: 'en',
    text: 'Forgot Password',
  },
  {
    id: 115,
    keyname: 'forget_title',
    language_code: 'zh',
    text: '忘记密码',
  },
  {
    id: 116,
    keyname: 'forget_subtitle',
    language_code: 'th',
    text: 'กรอกข้อมูลเพื่อรีเซ็ตรหัสผ่านของคุณ',
  },
  {
    id: 117,
    keyname: 'forget_subtitle',
    language_code: 'en',
    text: 'Enter your information to reset your password',
  },
  {
    id: 118,
    keyname: 'forget_subtitle',
    language_code: 'zh',
    text: '输入您的信息以重置密码',
  },
  {
    id: 119,
    keyname: 'forget_email_label',
    language_code: 'th',
    text: 'อีเมล',
  },
  {
    id: 120,
    keyname: 'forget_email_label',
    language_code: 'en',
    text: 'Email',
  },
  {
    id: 121,
    keyname: 'forget_email_label',
    language_code: 'zh',
    text: '电子邮件',
  },
  {
    id: 122,
    keyname: 'forget_email_placeholder',
    language_code: 'th',
    text: 'กรอกอีเมลของคุณ',
  },
  {
    id: 123,
    keyname: 'forget_email_placeholder',
    language_code: 'en',
    text: 'Enter your email',
  },
  {
    id: 124,
    keyname: 'forget_email_placeholder',
    language_code: 'zh',
    text: '输入您的电子邮件',
  },
  {
    id: 125,
    keyname: 'forget_new_password_label',
    language_code: 'th',
    text: 'รหัสผ่านใหม่',
  },
  {
    id: 126,
    keyname: 'forget_new_password_label',
    language_code: 'en',
    text: 'New Password',
  },
  {
    id: 127,
    keyname: 'forget_new_password_label',
    language_code: 'zh',
    text: '新密码',
  },
  {
    id: 128,
    keyname: 'forget_new_password_placeholder',
    language_code: 'th',
    text: 'กรอกรหัสผ่านใหม่',
  },
  {
    id: 129,
    keyname: 'forget_new_password_placeholder',
    language_code: 'en',
    text: 'Enter new password',
  },
  {
    id: 130,
    keyname: 'forget_new_password_placeholder',
    language_code: 'zh',
    text: '输入新密码',
  },
  {
    id: 131,
    keyname: 'forget_new_password_hint',
    language_code: 'th',
    text: 'อย่างน้อย 8 ตัวอักษร',
  },
  {
    id: 132,
    keyname: 'forget_new_password_hint',
    language_code: 'en',
    text: 'At least 8 characters',
  },
  {
    id: 133,
    keyname: 'forget_new_password_hint',
    language_code: 'zh',
    text: '至少8个字符',
  },
  {
    id: 134,
    keyname: 'forget_otp_label',
    language_code: 'th',
    text: 'รหัส OTP',
  },
  {
    id: 135,
    keyname: 'forget_otp_label',
    language_code: 'en',
    text: 'OTP Code',
  },
  {
    id: 136,
    keyname: 'forget_otp_label',
    language_code: 'zh',
    text: 'OTP验证码',
  },
  {
    id: 137,
    keyname: 'forget_otp_placeholder',
    language_code: 'th',
    text: '000000',
  },
  {
    id: 138,
    keyname: 'forget_otp_placeholder',
    language_code: 'en',
    text: '000000',
  },
  {
    id: 139,
    keyname: 'forget_otp_placeholder',
    language_code: 'zh',
    text: '000000',
  },
  {
    id: 140,
    keyname: 'forget_otp_hint',
    language_code: 'th',
    text: 'กรอกรหัส OTP 6 หลัก',
  },
  {
    id: 141,
    keyname: 'forget_otp_hint',
    language_code: 'en',
    text: 'Enter 6-digit OTP code',
  },
  {
    id: 142,
    keyname: 'forget_otp_hint',
    language_code: 'zh',
    text: '输入6位OTP验证码',
  },
  {
    id: 143,
    keyname: 'forget_button',
    language_code: 'th',
    text: 'รีเซ็ตรหัสผ่าน',
  },
  {
    id: 144,
    keyname: 'forget_button',
    language_code: 'en',
    text: 'Reset Password',
  },
  {
    id: 145,
    keyname: 'forget_button',
    language_code: 'zh',
    text: '重置密码',
  },
  {
    id: 146,
    keyname: 'forget_success_message',
    language_code: 'th',
    text: 'ระบบได้ทำการเปลี่ยนรหัสผ่านของท่านแล้ว',
  },
  {
    id: 147,
    keyname: 'forget_success_message',
    language_code: 'en',
    text: 'Your password has been successfully reset',
  },
  {
    id: 148,
    keyname: 'forget_success_message',
    language_code: 'zh',
    text: '您的密码已成功重置',
  },
  {
    id: 149,
    keyname: 'back_to_login',
    language_code: 'th',
    text: 'กลับไปหน้าเข้าสู่ระบบ',
  },
  {
    id: 150,
    keyname: 'back_to_login',
    language_code: 'en',
    text: 'Back to Login',
  },
  {
    id: 151,
    keyname: 'back_to_login',
    language_code: 'zh',
    text: '返回登录',
  },
];

// ฟังก์ชันสำหรับจัดกลุ่มข้อความตาม keyname
export function groupTextsByKey(texts: LanguageText[]) {
  const grouped: { [key: string]: { [lang: string]: string } } = {};

  texts.forEach((item) => {
    if (!grouped[item.keyname]) {
      grouped[item.keyname] = {};
    }
    grouped[item.keyname][item.language_code] = item.text;
  });

  return grouped;
}

// ข้อมูลที่จัดกลุ่มแล้วสำหรับแสดงในตาราง
export const groupedTranslations = groupTextsByKey(languageTexts);
