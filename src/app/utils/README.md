# Date Utilities Documentation

ชุด utility functions สำหรับจัดการวันที่และเวลาในแอปพลิเคชัน E-Bidding

## ภาพรวม

ไฟล์ `dateUtils.ts` ประกอบด้วยฟังก์ชันต่าง ๆ ที่ช่วยในการจัดการวันที่และเวลา โดยเฉพาะการใช้งานร่วมกับ `ThaiDatePicker` component

## ฟังก์ชันหลัก

### 1. `formatDateForData(date: Date): string`

แปลง Date object เป็น string สำหรับเก็บข้อมูลในฐานข้อมูล

**รูปแบบผลลัพธ์:** `"YYYY-MM-DD HH:mm:ss"`

```typescript
const dateString = formatDateForData(new Date());
// ผลลัพธ์: "2025-06-20 14:30:00"
```

### 2. `formatDateForDisplay(date: Date, includeTime?: boolean): string`

แปลง Date object เป็น string สำหรับแสดงผลให้ผู้ใช้

**รูปแบบผลลัพธ์:**

- `includeTime = false`: `"DD/MM/YYYY"`
- `includeTime = true`: `"DD/MM/YYYY HH:mm"`

```typescript
const date = new Date();
formatDateForDisplay(date, false); // "20/06/2025"
formatDateForDisplay(date, true); // "20/06/2025 14:30"
```

### 3. `safeParseDate(dateString: string): Date`

แปลง string เป็น Date object พร้อมจัดการ timezone และข้อผิดพลาด

```typescript
// ใช้กับ ThaiDatePicker
<ThaiDatePicker selected={safeParseDate(formData.event_date)} />
```

### 4. `createDateChangeHandler(setFormData, updateTimestampField?): Function`

สร้าง handler function สำหรับจัดการการเปลี่ยนแปลงวันที่ในฟอร์ม

```typescript
const [formData, setFormData] = useState(initialData);
const handleDateChange = createDateChangeHandler(setFormData);

// ใช้กับ ThaiDatePicker
<ThaiDatePicker
  selected={safeParseDate(formData.start_date)}
  onChange={(date) => handleDateChange('start_date', date)}
/>;
```

### 5. `getCurrentDateTime(): string`

สร้าง timestamp ปัจจุบันในรูปแบบ string

```typescript
const now = getCurrentDateTime(); // "2025-06-20 14:30:00"
```

### 6. `isValidDate(date: Date): boolean`

ตรวจสอบว่า Date object ถูกต้องหรือไม่

```typescript
const isValid = isValidDate(new Date()); // true
```

## การใช้งานในหน้าต่าง ๆ

### หน้าฟอร์ม (เช่น auctionform)

```typescript
import {
  createDateChangeHandler,
  safeParseDate,
  getCurrentDateTime,
} from '@/app/utils/dateUtils';

const [formData, setFormData] = useState({
  name: '',
  start_dt: getCurrentDateTime(),
  end_dt: getCurrentDateTime(),
  updated_dt: getCurrentDateTime(),
});

const handleDateChange = createDateChangeHandler(setFormData);

return (
  <ThaiDatePicker
    selected={safeParseDate(formData.start_dt)}
    onChange={(date) => handleDateChange('start_dt', date)}
    showTimeSelect={true}
  />
);
```

### หน้าแสดงรายการ (เช่น auctions)

```typescript
import { formatDateForDisplay, safeParseDate } from '@/app/utils/dateUtils';

const formatDateTime = (dateTimeStr: string) => {
  return formatDateForDisplay(safeParseDate(dateTimeStr), true);
};

// ในการแสดงผล
<td>{formatDateTime(auction.start_dt)}</td>;
```

## ข้อดีของการใช้ Utility Functions

1. **ความสอดคล้อง:** รูปแบบการจัดการวันที่เหมือนกันทั่วทั้งแอป
2. **ลดการซ้ำซ้อนของโค้ด:** ไม่ต้องเขียนโค้ดเดิม ๆ ซ้ำ
3. **จัดการ Timezone:** แก้ไขปัญหาการเปลี่ยน timezone อัตโนมัติ
4. **ป้องกันข้อผิดพลาด:** จัดการกรณีที่วันที่ไม่ถูกต้อง
5. **ง่ายต่อการบำรุงรักษา:** แก้ไขการทำงานได้ที่เดียว

## ไฟล์ที่ใช้งาน

- ✅ `src/app/(main)/(auc)/auctionform/page.tsx` - ใช้ครบทุกฟังก์ชัน
- ✅ `src/app/(main)/(auc)/auctions/page.tsx` - ใช้ formatDateForDisplay, safeParseDate
- ✅ `src/app/(main)/(auc)/example-usage/page.tsx` - ตัวอย่างการใช้งานทั้งหมด

## หมายเหตุสำคัญ

1. **Timezone:** ทุกฟังก์ชันใช้ local timezone ของผู้ใช้
2. **Format เก็บข้อมูล:** ใช้ `"YYYY-MM-DD HH:mm:ss"` สำหรับฐานข้อมูล
3. **Format แสดงผล:** ใช้ `"DD/MM/YYYY HH:mm"` สำหรับ UI
4. **Error Handling:** ทุกฟังก์ชันจัดการกรณี input ผิดพลาด

## ตัวอย่างผลลัพธ์

| ฟังก์ชัน                           | Input                             | Output                  |
| ---------------------------------- | --------------------------------- | ----------------------- |
| `formatDateForData`                | `new Date('2025-06-20T14:30:00')` | `"2025-06-20 14:30:00"` |
| `formatDateForDisplay` (ไม่มีเวลา) | `new Date('2025-06-20T14:30:00')` | `"20/06/2025"`          |
| `formatDateForDisplay` (มีเวลา)    | `new Date('2025-06-20T14:30:00')` | `"20/06/2025 14:30"`    |
| `safeParseDate`                    | `"2025-06-20 14:30:00"`           | `Date object`           |
| `getCurrentDateTime`               | -                                 | `"2025-06-20 14:30:00"` |

# Global Functions Documentation

## URL Encoding Functions

### createSecureUrl()

ฟังก์ชันสำหรับสร้าง URL พร้อมเข้ารหัส ID parameter เพื่อความปลอดภัย

```typescript
createSecureUrl(basePath: string, id: number | string, paramName?: string): string
```

**Parameters:**

- `basePath` - path หลักของ URL (เช่น '/auctionform?id=', '/edituser?userId=', '/auctionform')
- `id` - ID ที่ต้องการเข้ารหัส
- `paramName` - ชื่อ parameter (default: 'id') - ใช้เฉพาะเมื่อ basePath ไม่มี query parameter

**Examples:**

```typescript
// แบบที่ 1: ส่ง basePath พร้อม query parameter (แนะนำ)
createSecureUrl('/auctionform?id=', 123);
// Result: "/auctionform?id=enc_MTIzXzE3MzU2NDk4NzY1NDM=_end"

createSecureUrl('/edituser?userId=', 456);
// Result: "/edituser?userId=enc_NDU2XzE3MzU2NDk4NzY1NDM=_end"

// แบบที่ 2: ส่ง basePath ธรรมดา (แบบเดิม)
createSecureUrl('/editcompany', 789);
// Result: "/editcompany?id=enc_Nzg5XzE3MzU2NDk4NzY1NDM=_end"

// แบบที่ 3: ใช้ parameter name ที่กำหนดเอง
createSecureUrl('/profile', 123, 'userId');
// Result: "/profile?userId=enc_MTIzXzE3MzU2NDk4NzY1NDM=_end"
```

### encodeId() และ decodeId()

ฟังก์ชันสำหรับเข้ารหัสและถอดรหัส ID

```typescript
// เข้ารหัส ID
const encoded = encodeId(123);
// Result: "enc_MTIzXzE3MzU2NDk4NzY1NDM=_end"

// ถอดรหัส ID
const decoded = decodeId('enc_MTIzXzE3MzU2NDk4NzY1NDM=_end');
// Result: 123
```

## การใช้งานในหน้าต่างๆ

### 1. หน้าตลาดประมูล (auctions)

```typescript
import { createSecureUrl } from '@/app/utils/globalFunction';

// ปุ่มเพิ่มตลาดใหม่ (แบบใหม่ - แนะนำ)
<Link href={createSecureUrl('/auctionform?id=', 0)}>เพิ่มตลาด</Link>

// ปุ่มแก้ไข (แบบใหม่ - แนะนำ)
<Link href={createSecureUrl('/auctionform?id=', auction.id)}>แก้ไข</Link>
```

### 2. หน้าจัดการผู้ใช้ (สมมติ)

```typescript
import { createSecureUrl } from '@/app/utils/globalFunction';

// ปุ่มแก้ไขผู้ใช้
<Link href={createSecureUrl('/userform', user.id)}>แก้ไข</Link>

// ปุ่มดูโปรไฟล์
<Link href={createSecureUrl('/profile', user.id, 'userId')}>ดูโปรไฟล์</Link>
```

### 3. หน้าจัดการบริษัท (สมมติ)

```typescript
import { createSecureUrl } from '@/app/utils/globalFunction';

// ปุ่มแก้ไขบริษัท
<Link href={createSecureUrl('/companyform', company.id)}>แก้ไข</Link>;
```

### 4. การถอดรหัสในหน้าปลายทาง

```typescript
import { decodeId } from '@/app/utils/globalFunction';

export default function EditPage() {
  const searchParams = useSearchParams();
  const encodedId = searchParams.get('id');

  // ถอดรหัส ID
  const realId = encodedId ? decodeId(encodedId) : null;
  const isEdit = realId !== null && realId !== 0;

  // ใช้ realId ในการดึงข้อมูล
  if (isEdit && realId) {
    loadData(realId);
  }
}
```
