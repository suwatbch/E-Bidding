import React from 'react';

export default function CompanyInfoPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">ข้อมูลบริษัท</h1>
      <div className="space-y-2 text-gray-700">
        <div><strong>ชื่อบริษัท:</strong> บริษัท อี-บิดดิ้ง จำกัด</div>
        <div><strong>ที่อยู่:</strong> 123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110</div>
        <div><strong>โทรศัพท์:</strong> 02-123-4567</div>
        <div><strong>อีเมล:</strong> info@ebidding.co.th</div>
        <div><strong>เว็บไซต์:</strong> www.ebidding.co.th</div>
      </div>
    </div>
  );
} 