import { LanguageCode } from '@/app/model/dataLanguage';

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
    auctions: 'ตลาดประมูล',
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

    // Auction List
    search_placeholder: 'ค้นหารายการประมูล...',
    all_categories: 'ทั้งหมด',
    electronics: 'อิเล็กทรอนิกส์',
    fashion: 'แฟชั่น',
    jewelry: 'เครื่องประดับ',
    vehicles: 'ยานยนต์',
    collectibles: 'ของสะสม',
    table_title: 'รายการที่กำลังประมูล',
    table_header_item: 'รายการ',
    table_header_category: 'หมวดหมู่',
    table_header_start_price: 'ราคาเริ่มต้น',
    table_header_current_bid: 'ราคาปัจจุบัน',
    table_header_bid_count: 'จำนวนบิด',
    table_header_end_time: 'เวลาสิ้นสุด',
    table_header_status: 'สถานะ',
    time_left: 'เหลือเวลา',
    days: 'วัน',
    hours: 'ชั่วโมง',
    minutes: 'นาที',
    seconds: 'วินาที',
    bid_count: 'บิด',

    // Hero Section
    hero_title: 'ยินดีต้อนรับสู่',
    hero_subtitle: 'ค้นพบสินค้าที่คุณต้องการและเริ่มการประมูลได้เลย',
    hero_search_placeholder: 'ค้นหาสินค้าที่ต้องการประมูล...',

    // Categories
    categories_title: 'หมวดหมู่',
    category_all: 'ทั้งหมด',
    category_electronics: 'อิเล็กทรอนิกส์',
    category_fashion: 'แฟชั่น',
    category_jewelry: 'เครื่องประดับ',
    category_vehicles: 'ยานยนต์',
    category_collectibles: 'ของสะสม',

    // Status
    all_status: 'ทุกสถานะ',
    status_pending: 'รอการประมูล',
    status_bidding: 'กำลังประมูล',
    status_ending_soon: 'ใกล้สิ้นสุด',
    status_ended: 'สิ้นสุดประมูล',
    status_cancelled: 'ยกเลิกประมูล',

    // Data Management
    data_management: 'จัดการข้อมูล',
    company_info: 'ข้อมูลบริษัท',
    user_info: 'ข้อมูลผู้ใช้งาน',
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

    // Auction List
    search_placeholder: 'Search auctions...',
    all_categories: 'All Categories',
    electronics: 'Electronics',
    fashion: 'Fashion',
    jewelry: 'Jewelry',
    vehicles: 'Vehicles',
    collectibles: 'Collectibles',
    table_title: 'Active Auctions',
    table_header_item: 'Item',
    table_header_category: 'Category',
    table_header_start_price: 'Start Price',
    table_header_current_bid: 'Current Bid',
    table_header_bid_count: 'Bid Count',
    table_header_end_time: 'End Time',
    table_header_status: 'Status',
    time_left: 'Time Left',
    days: 'days',
    hours: 'hrs',
    minutes: 'min',
    seconds: 'sec',
    bid_count: 'bids',

    // Hero Section
    hero_title: 'Welcome to',
    hero_subtitle: 'Find the items you want and start bidding now',
    hero_search_placeholder: 'Search for items to bid...',

    // Categories
    categories_title: 'Categories',
    category_all: 'All',
    category_electronics: 'Electronics',
    category_fashion: 'Fashion',
    category_jewelry: 'Jewelry',
    category_vehicles: 'Vehicles',
    category_collectibles: 'Collectibles',

    // Status
    all_status: 'All Status',
    status_pending: 'Pending',
    status_bidding: 'Bidding',
    status_ending_soon: 'Ending Soon',
    status_ended: 'Ended',
    status_cancelled: 'Cancelled',

    // Data Management
    data_management: 'Data Management',
    company_info: 'Company Information',
    user_info: 'User Information',
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
    auctions: '拍卖',
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
    back_to_login: '返回登录页面',

    // Auction List
    search_placeholder: '搜索拍卖...',
    all_categories: '所有类别',
    electronics: '电子产品',
    fashion: '时尚',
    jewelry: '珠宝',
    vehicles: '车辆',
    collectibles: '收藏品',
    table_title: '正在进行的拍卖',
    table_header_item: '物品',
    table_header_category: '类别',
    table_header_start_price: '起拍价',
    table_header_current_bid: '当前出价',
    table_header_bid_count: '出价次数',
    table_header_end_time: '结束时间',
    table_header_status: '状态',
    time_left: '剩余时间',
    days: '天',
    hours: '小时',
    minutes: '分钟',
    seconds: '秒',
    bid_count: '次出价',

    // Hero Section
    hero_title: '欢迎来到',
    hero_subtitle: '找到您想要的商品并立即开始竞拍',
    hero_search_placeholder: '搜索要竞拍的商品...',

    // Categories
    categories_title: '类别',
    category_all: '全部',
    category_electronics: '电子产品',
    category_fashion: '时尚',
    category_jewelry: '珠宝',
    category_vehicles: '车辆',
    category_collectibles: '收藏品',

    // Status
    all_status: '所有状态',
    status_pending: '待处理',
    status_bidding: '竞拍中',
    status_ending_soon: '即将结束',
    status_ended: '已结束',
    status_cancelled: '已取消',

    // Data Management
    data_management: '数据管理',
    company_info: '公司信息',
    user_info: '用户信息',
  },
}; 