import { LanguageCode } from '@/app/model/dataLanguage';

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

// ข้อมูลจำลอง
export const languageTexts: LanguageText[] = [
  // Auth
  {
    id: 1,
    keyname: 'login_title',
    language_code: 'th',
    text: 'เข้าสู่ระบบ E-Bidding',
  },
  {
    id: 2,
    keyname: 'login_title',
    language_code: 'en',
    text: 'Login to E-Bidding',
  },
  {
    id: 3,
    keyname: 'login_title',
    language_code: 'zh',
    text: '登录 E-Bidding',
  },
  {
    id: 4,
    keyname: 'login_subtitle',
    language_code: 'th',
    text: 'ระบบประมูลออนไลน์ที่คุณไว้วางใจ',
  },
  {
    id: 5,
    keyname: 'login_subtitle',
    language_code: 'en',
    text: 'The online auction system you can trust',
  },
  {
    id: 6,
    keyname: 'login_subtitle',
    language_code: 'zh',
    text: '值得信赖的在线拍卖系统',
  },
  {
    id: 7,
    keyname: 'email_label',
    language_code: 'th',
    text: 'อีเมล',
  },
  {
    id: 8,
    keyname: 'email_label',
    language_code: 'en',
    text: 'Email',
  },
  {
    id: 9,
    keyname: 'email_label',
    language_code: 'zh',
    text: '电子邮件',
  },
  {
    id: 10,
    keyname: 'email_placeholder',
    language_code: 'th',
    text: 'example@email.com',
  },
  {
    id: 11,
    keyname: 'email_placeholder',
    language_code: 'en',
    text: 'example@email.com',
  },
  {
    id: 12,
    keyname: 'email_placeholder',
    language_code: 'zh',
    text: 'example@email.com',
  },
  {
    id: 13,
    keyname: 'password_label',
    language_code: 'th',
    text: 'รหัสผ่าน',
  },
  {
    id: 14,
    keyname: 'password_label',
    language_code: 'en',
    text: 'Password',
  },
  {
    id: 15,
    keyname: 'password_label',
    language_code: 'zh',
    text: '密码',
  },
  {
    id: 16,
    keyname: 'password_placeholder',
    language_code: 'th',
    text: '••••••••',
  },
  {
    id: 17,
    keyname: 'password_placeholder',
    language_code: 'en',
    text: '••••••••',
  },
  {
    id: 18,
    keyname: 'password_placeholder',
    language_code: 'zh',
    text: '••••••••',
  },
  {
    id: 19,
    keyname: 'remember_me',
    language_code: 'th',
    text: 'จดจำฉัน',
  },
  {
    id: 20,
    keyname: 'remember_me',
    language_code: 'en',
    text: 'Remember me',
  },
  {
    id: 21,
    keyname: 'remember_me',
    language_code: 'zh',
    text: '记住我',
  },
  {
    id: 22,
    keyname: 'forgot_password',
    language_code: 'th',
    text: 'ลืมรหัสผ่าน?',
  },
  {
    id: 23,
    keyname: 'forgot_password',
    language_code: 'en',
    text: 'Forgot password?',
  },
  {
    id: 24,
    keyname: 'forgot_password',
    language_code: 'zh',
    text: '忘记密码？',
  },
  {
    id: 25,
    keyname: 'login_button',
    language_code: 'th',
    text: 'เข้าสู่ระบบ',
  },
  {
    id: 26,
    keyname: 'login_button',
    language_code: 'en',
    text: 'Login',
  },
  {
    id: 27,
    keyname: 'login_button',
    language_code: 'zh',
    text: '登录',
  },
  {
    id: 28,
    keyname: 'no_account',
    language_code: 'th',
    text: 'ยังไม่มีบัญชี? สามารถติดต่อผู้ดูแลระบบเพื่อสมัครสมาชิก',
  },
  {
    id: 29,
    keyname: 'no_account',
    language_code: 'en',
    text: 'No account? Please contact administrator to register',
  },
  {
    id: 30,
    keyname: 'no_account',
    language_code: 'zh',
    text: '没有账号？请联系管理员注册',
  },

  // Navbar
  {
    id: 31,
    keyname: 'auctions',
    language_code: 'th',
    text: 'ตลาดประมูล',
  },
  {
    id: 32,
    keyname: 'auctions',
    language_code: 'en',
    text: 'Auctions',
  },
  {
    id: 33,
    keyname: 'auctions',
    language_code: 'zh',
    text: '拍卖',
  },
  {
    id: 34,
    keyname: 'my_auctions',
    language_code: 'th',
    text: 'ประมูลของฉัน',
  },
  {
    id: 35,
    keyname: 'my_auctions',
    language_code: 'en',
    text: 'My Auctions',
  },
  {
    id: 36,
    keyname: 'my_auctions',
    language_code: 'zh',
    text: '我的拍卖',
  },
  {
    id: 37,
    keyname: 'notifications',
    language_code: 'th',
    text: 'แจ้งเตือน',
  },
  {
    id: 38,
    keyname: 'notifications',
    language_code: 'en',
    text: 'Notifications',
  },
  {
    id: 39,
    keyname: 'notifications',
    language_code: 'zh',
    text: '通知',
  },
  {
    id: 40,
    keyname: 'profile',
    language_code: 'th',
    text: 'โปรไฟล์',
  },
  {
    id: 41,
    keyname: 'profile',
    language_code: 'en',
    text: 'Profile',
  },
  {
    id: 42,
    keyname: 'profile',
    language_code: 'zh',
    text: '个人资料',
  },
  {
    id: 43,
    keyname: 'edit_profile',
    language_code: 'th',
    text: 'แก้ไขโปรไฟล์',
  },
  {
    id: 44,
    keyname: 'edit_profile',
    language_code: 'en',
    text: 'Edit Profile',
  },
  {
    id: 45,
    keyname: 'edit_profile',
    language_code: 'zh',
    text: '编辑资料',
  },
  {
    id: 46,
    keyname: 'logout',
    language_code: 'th',
    text: 'ออกจากระบบ',
  },
  {
    id: 47,
    keyname: 'logout',
    language_code: 'en',
    text: 'Logout',
  },
  {
    id: 48,
    keyname: 'logout',
    language_code: 'zh',
    text: '退出登录',
  },

  // Data Management
  {
    id: 49,
    keyname: 'data_management',
    language_code: 'th',
    text: 'จัดการข้อมูล',
  },
  {
    id: 50,
    keyname: 'data_management',
    language_code: 'en',
    text: 'Data Management',
  },
  {
    id: 51,
    keyname: 'data_management',
    language_code: 'zh',
    text: '数据管理',
  },
  {
    id: 52,
    keyname: 'company_info',
    language_code: 'th',
    text: 'ข้อมูลบริษัท',
  },
  {
    id: 53,
    keyname: 'company_info',
    language_code: 'en',
    text: 'Company Information',
  },
  {
    id: 54,
    keyname: 'company_info',
    language_code: 'zh',
    text: '公司信息',
  },
  {
    id: 55,
    keyname: 'user_info',
    language_code: 'th',
    text: 'ข้อมูลผู้ใช้งาน',
  },
  {
    id: 56,
    keyname: 'user_info',
    language_code: 'en',
    text: 'User Information',
  },
  {
    id: 57,
    keyname: 'user_info',
    language_code: 'zh',
    text: '用户信息',
  },
  {
    id: 58,
    keyname: 'language_info',
    language_code: 'th',
    text: 'ข้อมูลภาษา',
  },
  {
    id: 59,
    keyname: 'language_info',
    language_code: 'en',
    text: 'Language Information',
  },
  {
    id: 60,
    keyname: 'language_info',
    language_code: 'zh',
    text: '语言信息',
  },

  // Hero Section
  {
    id: 61,
    keyname: 'hero_title',
    language_code: 'th',
    text: 'ยินดีต้อนรับสู่',
  },
  {
    id: 62,
    keyname: 'hero_title',
    language_code: 'en',
    text: 'Welcome to',
  },
  {
    id: 63,
    keyname: 'hero_title',
    language_code: 'zh',
    text: '欢迎来到',
  },
  {
    id: 64,
    keyname: 'hero_subtitle',
    language_code: 'th',
    text: 'ค้นพบสินค้าที่คุณต้องการและเริ่มการประมูลได้เลย',
  },
  {
    id: 65,
    keyname: 'hero_subtitle',
    language_code: 'en',
    text: 'Find the items you want and start bidding now',
  },
  {
    id: 66,
    keyname: 'hero_subtitle',
    language_code: 'zh',
    text: '找到您想要的商品并立即开始竞拍',
  },
  {
    id: 67,
    keyname: 'hero_search_placeholder',
    language_code: 'th',
    text: 'ค้นหาสินค้าที่ต้องการประมูล...',
  },
  {
    id: 68,
    keyname: 'hero_search_placeholder',
    language_code: 'en',
    text: 'Search for items to bid...',
  },
  {
    id: 69,
    keyname: 'hero_search_placeholder',
    language_code: 'zh',
    text: '搜索要竞拍的商品...',
  },

  // Categories
  {
    id: 70,
    keyname: 'categories_title',
    language_code: 'th',
    text: 'หมวดหมู่',
  },
  {
    id: 71,
    keyname: 'categories_title',
    language_code: 'en',
    text: 'Categories',
  },
  {
    id: 72,
    keyname: 'categories_title',
    language_code: 'zh',
    text: '类别',
  },
  {
    id: 73,
    keyname: 'category_all',
    language_code: 'th',
    text: 'ทั้งหมด',
  },
  {
    id: 74,
    keyname: 'category_all',
    language_code: 'en',
    text: 'All',
  },
  {
    id: 75,
    keyname: 'category_all',
    language_code: 'zh',
    text: '全部',
  },
  {
    id: 76,
    keyname: 'category_electronics',
    language_code: 'th',
    text: 'อิเล็กทรอนิกส์',
  },
  {
    id: 77,
    keyname: 'category_electronics',
    language_code: 'en',
    text: 'Electronics',
  },
  {
    id: 78,
    keyname: 'category_electronics',
    language_code: 'zh',
    text: '电子产品',
  },
  {
    id: 79,
    keyname: 'category_fashion',
    language_code: 'th',
    text: 'แฟชั่น',
  },
  {
    id: 80,
    keyname: 'category_fashion',
    language_code: 'en',
    text: 'Fashion',
  },
  {
    id: 81,
    keyname: 'category_fashion',
    language_code: 'zh',
    text: '时尚',
  },
  {
    id: 82,
    keyname: 'category_jewelry',
    language_code: 'th',
    text: 'เครื่องประดับ',
  },
  {
    id: 83,
    keyname: 'category_jewelry',
    language_code: 'en',
    text: 'Jewelry',
  },
  {
    id: 84,
    keyname: 'category_jewelry',
    language_code: 'zh',
    text: '珠宝',
  },
  {
    id: 85,
    keyname: 'category_vehicles',
    language_code: 'th',
    text: 'ยานยนต์',
  },
  {
    id: 86,
    keyname: 'category_vehicles',
    language_code: 'en',
    text: 'Vehicles',
  },
  {
    id: 87,
    keyname: 'category_vehicles',
    language_code: 'zh',
    text: '车辆',
  },
  {
    id: 88,
    keyname: 'category_collectibles',
    language_code: 'th',
    text: 'ของสะสม',
  },
  {
    id: 89,
    keyname: 'category_collectibles',
    language_code: 'en',
    text: 'Collectibles',
  },
  {
    id: 90,
    keyname: 'category_collectibles',
    language_code: 'zh',
    text: '收藏品',
  },

  // Status
  {
    id: 91,
    keyname: 'all_status',
    language_code: 'th',
    text: 'ทุกสถานะ',
  },
  {
    id: 92,
    keyname: 'all_status',
    language_code: 'en',
    text: 'All Status',
  },
  {
    id: 93,
    keyname: 'all_status',
    language_code: 'zh',
    text: '所有状态',
  },
  {
    id: 94,
    keyname: 'status_pending',
    language_code: 'th',
    text: 'รอการประมูล',
  },
  {
    id: 95,
    keyname: 'status_pending',
    language_code: 'en',
    text: 'Pending',
  },
  {
    id: 96,
    keyname: 'status_pending',
    language_code: 'zh',
    text: '待处理',
  },
  {
    id: 97,
    keyname: 'status_bidding',
    language_code: 'th',
    text: 'กำลังประมูล',
  },
  {
    id: 98,
    keyname: 'status_bidding',
    language_code: 'en',
    text: 'Bidding',
  },
  {
    id: 99,
    keyname: 'status_bidding',
    language_code: 'zh',
    text: '竞拍中',
  },
  {
    id: 100,
    keyname: 'status_ending_soon',
    language_code: 'th',
    text: 'ใกล้สิ้นสุด',
  },
  {
    id: 101,
    keyname: 'status_ending_soon',
    language_code: 'en',
    text: 'Ending Soon',
  },
  {
    id: 102,
    keyname: 'status_ending_soon',
    language_code: 'zh',
    text: '即将结束',
  },
  {
    id: 103,
    keyname: 'status_ended',
    language_code: 'th',
    text: 'สิ้นสุดประมูล',
  },
  {
    id: 104,
    keyname: 'status_ended',
    language_code: 'en',
    text: 'Ended',
  },
  {
    id: 105,
    keyname: 'status_ended',
    language_code: 'zh',
    text: '已结束',
  },
  {
    id: 106,
    keyname: 'status_cancelled',
    language_code: 'th',
    text: 'ยกเลิกประมูล',
  },
  {
    id: 107,
    keyname: 'status_cancelled',
    language_code: 'en',
    text: 'Cancelled',
  },
  {
    id: 108,
    keyname: 'status_cancelled',
    language_code: 'zh',
    text: '已取消',
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
