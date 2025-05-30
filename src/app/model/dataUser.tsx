export interface User {
    user_id: number;
    username: string;
    password: string;
    language_code: string;
    fullname: string;
    tax_id: string | null;
    address: string | null;
    email: string;
    phone: string;
    type: 'admin' | 'user';
    status: boolean;
    created_dt?: string;
    updated_dt?: string;
    login_count: number;
    is_locked: boolean;
    is_profile?: boolean;
  }
  
  export const initialUsers: User[] = [
    {
      user_id: 1,
      username: 'admin',
      password: 'admin123',
      language_code: 'th',
      fullname: 'ผู้ดูแลระบบ',
      tax_id: '1234567890123',
      address: 'กรุงเทพมหานคร',
      email: 'admin@example.com',
      phone: '0812345678',
      type: 'admin',
      status: true,
      created_dt: '2024-01-01 00:00:00',
      updated_dt: '2024-01-01 00:00:00',
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 2,
      username: 'user1',
      password: 'user123',
      language_code: 'th',
      fullname: 'ผู้ใช้งานทดสอบ 1',
      tax_id: '9876543210123',
      address: 'เชียงใหม่',
      email: 'user1@example.com',
      phone: '0823456789',
      type: 'user',
      status: true,
      created_dt: '2024-01-02 00:00:00',
      updated_dt: '2024-01-02 00:00:00',
      login_count: 5,
      is_locked: true
    },
    {
      user_id: 3,
      username: 'user2',
      password: 'user456',
      language_code: 'en',
      fullname: 'ผู้ใช้งานทดสอบ 2',
      tax_id: '4567890123456',
      address: 'ภูเก็ต',
      email: 'user2@example.com',
      phone: '0834567890',
      type: 'user',
      status: false,
      created_dt: '2024-01-03 00:00:00',
      updated_dt: '2024-01-03 00:00:00',
      login_count: 0,
      is_locked: false
    },
    // Regular users (IDs: 4-50)
    {
      user_id: 4,
      username: "natthaporn",
      password: "$2a$12$K8/4LK0CY/p6kqKx9",
      language_code: "th",
      fullname: "ณัฐพร สุวรรณศรี",
      tax_id: "3456789012345",
      address: "789 ถนนพระราม 4 แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
      email: "natthaporn@company.com",
      phone: "0844444444",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:03:00",
      updated_dt: "2024-03-20 10:03:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 5,
      username: "robert_th",
      password: "$2a$12$K8/4LK0CY/p6kqKx10",
      language_code: "en",
      fullname: "Robert Clark",
      tax_id: "4567890123456",
      address: "321 Rama IX Road, Huai Khwang, Bangkok 10310",
      email: "robert@global.com",
      phone: "0855555555",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:04:00",
      updated_dt: "2024-03-20 10:04:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 6,
      username: "pranee",
      password: "$2a$12$K8/4LK0CY/p6kqKx11",
      language_code: "th",
      fullname: "ปราณี สุขสมบูรณ์",
      tax_id: "5678901234567",
      address: "456 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500",
      email: "pranee@company.com",
      phone: "0866666666",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:05:00",
      updated_dt: "2024-03-20 10:05:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 7,
      username: "emma_th",
      password: "$2a$12$K8/4LK0CY/p6kqKx12",
      language_code: "en",
      fullname: "Emma Taylor",
      tax_id: "6789012345678",
      address: "789 Sathorn Road, Sathorn, Bangkok 10120",
      email: "emma@global.com",
      phone: "0877777777",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:06:00",
      updated_dt: "2024-03-20 10:06:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 8,
      username: "siriwan",
      password: "$2a$12$K8/4LK0CY/p6kqKx13",
      language_code: "th",
      fullname: "ศิริวรรณ พาณิชย์",
      tax_id: "7890123456789",
      address: "159 ถนนสาทร แขวงทุ่งมหาเมฆ เขตสาทร กรุงเทพฯ 10120",
      email: "siriwan@trade.co.th",
      phone: "0888888888",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:07:00",
      updated_dt: "2024-03-20 10:07:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 9,
      username: "william_th",
      password: "$2a$12$K8/4LK0CY/p6kqKx14",
      language_code: "en",
      fullname: "William Davis",
      tax_id: "8901234567890",
      address: "42 Wireless Road, Lumpini, Bangkok 10330",
      email: "william@global.com",
      phone: "0899999999",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:08:00",
      updated_dt: "2024-03-20 10:08:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 10,
      username: "supachai",
      password: "$2a$12$K8/4LK0CY/p6kqKx15",
      language_code: "th",
      fullname: "ศุภชัย วาณิชย์",
      tax_id: "9012345678901",
      address: "951 ถนนพหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400",
      email: "supachai@business.co.th",
      phone: "0810000000",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:09:00",
      updated_dt: "2024-03-20 10:09:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 11,
      username: "ratree",
      password: "$2a$12$K8/4LK0CY/p6kqKx16",
      language_code: "th",
      fullname: "ราตรี สว่างใจ",
      tax_id: "0123456789012",
      address: "147 ถนนเพชรเกษม แขวงหนองค้างพลู เขตหนองแขม กรุงเทพฯ 10160",
      email: "ratree@trading.com",
      phone: "0821111111",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:10:00",
      updated_dt: "2024-03-20 10:10:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 12,
      username: "david_th",
      password: "$2a$12$K8/4LK0CY/p6kqKx17",
      language_code: "en",
      fullname: "David Wilson",
      tax_id: "1234567890124",
      address: "88 Silom Road, Bangrak, Bangkok 10500",
      email: "david@company.com",
      phone: "0832222222",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:11:00",
      updated_dt: "2024-03-20 10:11:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 13,
      username: "piyarat",
      password: "$2a$12$K8/4LK0CY/p6kqKx18",
      language_code: "th",
      fullname: "ปิยรัตน์ ธุรกิจดี",
      tax_id: "2345678901235",
      address: "369 ถนนวิภาวดีรังสิต แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900",
      email: "piyarat@enterprise.co.th",
      phone: "0843333333",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:12:00",
      updated_dt: "2024-03-20 10:12:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 14,
      username: "sarah_th",
      password: "$2a$12$K8/4LK0CY/p6kqKx19",
      language_code: "en",
      fullname: "Sarah Brown",
      tax_id: "3456789012346",
      address: "77 Sathorn Road, Sathorn, Bangkok 10120",
      email: "sarah@global.com",
      phone: "0854444444",
      type: "user",
      status: false,
      created_dt: "2024-03-20 10:13:00",
      updated_dt: "2024-03-20 10:13:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 15,
      username: "manop",
      password: "$2a$12$K8/4LK0CY/p6kqKx20",
      language_code: "th",
      fullname: "มานพ สุขสันต์",
      tax_id: "4567890123457",
      address: "258 ถนนเจริญกรุง แขวงบางรัก เขตบางรัก กรุงเทพฯ 10500",
      email: "manop@trade.com",
      phone: "0865555555",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:14:00",
      updated_dt: "2024-03-20 10:14:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 16,
      username: "michael_th",
      password: "$2a$12$K8/4LK0CY/p6kqKx21",
      language_code: "en",
      fullname: "Michael Taylor",
      tax_id: "5678901234568",
      address: "123 Asoke Road, Klongtoey Nua, Wattana, Bangkok 10110",
      email: "michael@business.com",
      phone: "0876666666",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:15:00",
      updated_dt: "2024-03-20 10:15:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 17,
      username: "somying",
      password: "$2a$12$K8/4LK0CY/p6kqKx22",
      language_code: "th",
      fullname: "สมหญิง ใจดี",
      tax_id: "6789012345679",
      address: "741 ถนนลาดพร้าว แขวงจอมพล เขตจตุจักร กรุงเทพฯ 10900",
      email: "somying@commerce.co.th",
      phone: "0887777777",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:16:00",
      updated_dt: "2024-03-20 10:16:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 18,
      username: "emma_th",
      password: "$2a$12$K8/4LK0CY/p6kqKx23",
      language_code: "en",
      fullname: "Emma Davis",
      tax_id: "7890123456780",
      address: "55 Thonglor Road, Klongtan Nuea, Watthana, Bangkok 10110",
      email: "emma@international.com",
      phone: "0898888888",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:17:00",
      updated_dt: "2024-03-20 10:17:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 19,
      username: "preecha",
      password: "$2a$12$K8/4LK0CY/p6kqKx24",
      language_code: "th",
      fullname: "ปรีชา รุ่งเรือง",
      tax_id: "8901234567891",
      address: "852 ถนนรามคำแหง แขวงหัวหมาก เขตบางกะปิ กรุงเทพฯ 10240",
      email: "preecha@trading.co.th",
      phone: "0809999999",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:18:00",
      updated_dt: "2024-03-20 10:18:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 20,
      username: "james_th",
      password: "$2a$12$K8/4LK0CY/p6kqKx25",
      language_code: "en",
      fullname: "James Anderson",
      tax_id: "9012345678902",
      address: "33 Phetchaburi Road, Ratchathewi, Bangkok 10400",
      email: "james@company.com",
      phone: "0812345678",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:19:00",
      updated_dt: "2024-03-20 10:19:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 21,
      username: "wandee",
      password: "$2a$12$K8/4LK0CY/p6kqKx26",
      language_code: "th",
      fullname: "วันดี มั่นคง",
      tax_id: "0123456789013",
      address: "963 ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310",
      email: "wandee@business.co.th",
      phone: "0823456789",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:20:00",
      updated_dt: "2024-03-20 10:20:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 22,
      username: "oliver_th",
      password: "$2a$12$K8/4LK0CY/p6kqKx27",
      language_code: "en",
      fullname: "Oliver White",
      tax_id: "1234567890125",
      address: "44 Rama III Road, Yannawa, Bangkok 10120",
      email: "oliver@global.com",
      phone: "0834567890",
      type: "user",
      status: false,
      created_dt: "2024-03-20 10:21:00",
      updated_dt: "2024-03-20 10:21:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 23,
      username: "sompong",
      password: "$2a$12$K8/4LK0CY/p6kqKx28",
      language_code: "th",
      fullname: "สมพงษ์ พาณิชย์",
      tax_id: "2345678901236",
      address: "147 ถนนสุขสวัสดิ์ แขวงราษฎร์บูรณะ เขตราษฎร์บูรณะ กรุงเทพฯ 10140",
      email: "sompong@trade.com",
      phone: "0845678901",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:22:00",
      updated_dt: "2024-03-20 10:22:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 24,
      username: "sophia_th",
      password: "$2a$12$K8/4LK0CY/p6kqKx29",
      language_code: "en",
      fullname: "Sophia Lee",
      tax_id: "3456789012347",
      address: "99 Narathiwat Road, Sathorn, Bangkok 10120",
      email: "sophia@enterprise.com",
      phone: "0856789012",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:23:00",
      updated_dt: "2024-03-20 10:23:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 25,
      username: "malee",
      password: "$2a$12$K8/4LK0CY/p6kqKx30",
      language_code: "th",
      fullname: "มาลี สดใส",
      tax_id: "4567890123458",
      address: "258 ถนนเอกมัย แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110",
      email: "malee@commerce.co.th",
      phone: "0867890123",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:24:00",
      updated_dt: "2024-03-20 10:24:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 26,
      username: "william_th",
      password: "$2a$12$K8/4LK0CY/p6kqKx31",
      language_code: "en",
      fullname: "William Clark",
      tax_id: "5678901234569",
      address: "77 Sukhumvit 55, Klongton Nua, Watthana, Bangkok 10110",
      email: "william@international.com",
      phone: "0878901234",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:25:00",
      updated_dt: "2024-03-20 10:25:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 27,
      username: "suchart",
      password: "$2a$12$K8/4LK0CY/p6kqKx32",
      language_code: "th",
      fullname: "สุชาติ วานิช",
      tax_id: "6789012345670",
      address: "369 ถนนประชาราษฎร์ แขวงบางซื่อ เขตบางซื่อ กรุงเทพฯ 10800",
      email: "suchart@trading.co.th",
      phone: "0889012345",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:26:00",
      updated_dt: "2024-03-20 10:26:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 28,
      username: "isabella_th",
      password: "$2a$12$K8/4LK0CY/p6kqKx33",
      language_code: "en",
      fullname: "Isabella Martinez",
      tax_id: "7890123456781",
      address: "42 Charoen Krung Road, Bangrak, Bangkok 10500",
      email: "isabella@company.com",
      phone: "0890123456",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:27:00",
      updated_dt: "2024-03-20 10:27:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 29,
      username: "nattapong",
      password: "$2a$12$K8/4LK0CY/p6kqKx33",
      language_code: "th",
      fullname: "ณัฐพงศ์ วงศ์พาณิชย์",
      tax_id: "5432109876543",
      address: "789 ถนนลาดพร้าว แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900",
      email: "nattapong@trading.co.th",
      phone: "0891234567",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:27:00",
      updated_dt: "2024-03-20 10:27:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 30,
      username: "sarah_th",
      password: "$2a$12$K8/4LK0CY/p6kqKx34",
      language_code: "en",
      fullname: "Sarah Brown",
      tax_id: "6543210987654",
      address: "456 Rama IV Road, Khlong Toei, Bangkok 10110",
      email: "sarah@global.com",
      phone: "0892345678",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:28:00",
      updated_dt: "2024-03-20 10:28:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 31,
      username: "thanapon",
      password: "$2a$12$K8/4LK0CY/p6kqKx35",
      language_code: "th",
      fullname: "ธนพล รุ่งเรืองกิจ",
      tax_id: "7654321098765",
      address: "123 ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310",
      email: "thanapon@business.co.th",
      phone: "0893456789",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:29:00",
      updated_dt: "2024-03-20 10:29:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 32,
      username: "emma_th",
      password: "$2a$12$K8/4LK0CY/p6kqKx36",
      language_code: "en",
      fullname: "Emma Wilson",
      tax_id: "8765432109876",
      address: "789 Wireless Road, Lumpini, Bangkok 10330",
      email: "emma@global.com",
      phone: "0894567890",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:30:00",
      updated_dt: "2024-03-20 10:30:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 33,
      username: "sompong",
      password: "$2a$12$K8/4LK0CY/p6kqKx37",
      language_code: "th",
      fullname: "สมพงษ์ ศรีวิไล",
      tax_id: "9876543210987",
      address: "321 ถนนรัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400",
      email: "sompong@trading.co.th",
      phone: "0895678901",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:31:00",
      updated_dt: "2024-03-20 10:31:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 34,
      username: "robert_th",
      password: "$2a$12$K8/4LK0CY/p6kqKx38",
      language_code: "en",
      fullname: "Robert Clark",
      tax_id: "0987654321098",
      address: "123 Silom Road, Bangrak, Bangkok 10500",
      email: "robert@global.com",
      phone: "0896789012",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:32:00",
      updated_dt: "2024-03-20 10:32:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 35,
      username: "malee",
      password: "$2a$12$K8/4LK0CY/p6kqKx39",
      language_code: "th",
      fullname: "มาลี จันทร์เพ็ญ",
      tax_id: "1098765432109",
      address: "456 ถนนพระราม 3 แขวงช่องนนทรี เขตยานนาวา กรุงเทพฯ 10120",
      email: "malee@business.co.th",
      phone: "0897890123",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:33:00",
      updated_dt: "2024-03-20 10:33:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 36,
      username: "lisa_th",
      password: "$2a$12$K8/4LK0CY/p6kqKx40",
      language_code: "en",
      fullname: "Lisa Taylor",
      tax_id: "2109876543210",
      address: "789 Rama IV Road, Khlong Toei, Bangkok 10110",
      email: "lisa@global.com",
      phone: "0898901234",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:34:00",
      updated_dt: "2024-03-20 10:34:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 37,
      username: "somkiat",
      password: "$2a$12$K8/4LK0CY/p6kqKx41",
      language_code: "th",
      fullname: "สมเกียรติ วงศ์ทอง",
      tax_id: "3210987654321",
      address: "123 ถนนเพชรบุรี แขวงมักกะสัน เขตราชเทวี กรุงเทพฯ 10400",
      email: "somkiat@business.co.th",
      phone: "0899012345",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:35:00",
      updated_dt: "2024-03-20 10:35:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 38,
      username: "daniel_th",
      password: "$2a$12$K8/4LK0CY/p6kqKx42",
      language_code: "en",
      fullname: "Daniel White",
      tax_id: "4321098765432",
      address: "456 Silom Road, Bangrak, Bangkok 10500",
      email: "daniel@global.com",
      phone: "0899123456",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:36:00",
      updated_dt: "2024-03-20 10:36:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 39,
      username: "wandee",
      password: "$2a$12$K8/4LK0CY/p6kqKx43",
      language_code: "th",
      fullname: "วันดี มีสุข",
      tax_id: "5432109876543",
      address: "789 ถนนสุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพฯ 10110",
      email: "wandee@business.co.th",
      phone: "0899234567",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:37:00",
      updated_dt: "2024-03-20 10:37:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 40,
      username: "olivia_th",
      password: "$2a$12$K8/4LK0CY/p6kqKx44",
      language_code: "en",
      fullname: "Olivia Anderson",
      tax_id: "6543210987654",
      address: "123 Wireless Road, Lumpini, Bangkok 10330",
      email: "olivia@global.com",
      phone: "0899345678",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:38:00",
      updated_dt: "2024-03-20 10:38:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 41,
      username: "thomas_th",
      password: "$2a$12$K8/4LK0CY/p6kqKx108",
      language_code: "en",
      fullname: "Thomas Wilson",
      tax_id: "1098765432109",
      address: "789 Sathorn Road, Sathorn, Bangkok 10120",
      email: "thomas@enterprise.com",
      phone: "0987678901",
      type: "user",
      status: true,
      created_dt: "2024-03-20 11:42:00",
      updated_dt: "2024-03-20 11:42:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 42,
      username: "sunee",
      password: "$2a$12$K8/4LK0CY/p6kqKx109",
      language_code: "th",
      fullname: "สุนีย์ รักษ์ดี",
      tax_id: "2109876543210",
      address: "123 ถนนเยาวราช เขตสัมพันธวงศ์ กรุงเทพฯ 10100",
      email: "sunee@trading.co.th",
      phone: "0987789012",
      type: "user",
      status: true,
      created_dt: "2024-03-20 11:43:00",
      updated_dt: "2024-03-20 11:43:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 43,
      username: "james_th",
      password: "$2a$12$K8/4LK0CY/p6kqKx114",
      language_code: "en",
      fullname: "James Thompson",
      tax_id: "7654321098765",
      address: "456 Sukhumvit Road, Watthana, Bangkok 10110",
      email: "james@enterprise.com",
      phone: "0991234567",
      type: "user",
      status: true,
      created_dt: "2024-03-20 11:48:00",
      updated_dt: "2024-03-20 11:48:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 44,
      username: "naruemon",
      password: "$2a$12$K8/4LK0CY/p6kqKx115",
      language_code: "th",
      fullname: "นฤมล สุขสวัสดิ์",
      tax_id: "8765432109876",
      address: "789 ถนนเจริญกรุง เขตบางรัก กรุงเทพฯ 10500",
      email: "naruemon@trading.co.th",
      phone: "0992345678",
      type: "user",
      status: true,
      created_dt: "2024-03-20 11:49:00",
      updated_dt: "2024-03-20 11:49:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 45,
      username: "michael_th",
      password: "$2a$12$K8/4LK0CY/p6kqKx116",
      language_code: "en",
      fullname: "Michael Anderson",
      tax_id: "9876543210987",
      address: "789 Sathorn Road, Sathorn, Bangkok 10120",
      email: "michael@enterprise.com",
      phone: "0998765432",
      type: "user",
      status: true,
      created_dt: "2024-03-20 11:50:00",
      updated_dt: "2024-03-20 11:50:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 46,
      username: "siriporn",
      password: "$2a$12$K8/4LK0CY/p6kqKx117",
      language_code: "th",
      fullname: "ศิริพร ธนบดี",
      tax_id: "8765432109876",
      address: "321 ถนนเยาวราช เขตสัมพันธวงศ์ กรุงเทพฯ 10100",
      email: "siriporn@trading.co.th",
      phone: "0987654321",
      type: "user",
      status: true,
      created_dt: "2024-03-20 11:51:00",
      updated_dt: "2024-03-20 11:51:00",
      login_count: 0,
      is_locked: false
    },
    {
      user_id: 47,
      username: "sophia_th",
      password: "$2a$12$K8/4LK0CY/p6kqKx55",
      language_code: "en",
      fullname: "Sophia Lee",
      tax_id: "3456789012347",
      address: "99 Narathiwat Road, Sathorn, Bangkok 10120",
      email: "sophia@enterprise.com",
      phone: "0856789012",
      type: "user",
      status: true,
      created_dt: "2024-03-20 10:49:00",
      updated_dt: "2024-03-20 10:49:00",
      login_count: 0,
      is_locked: false
    }
  ];
  