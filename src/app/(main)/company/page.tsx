"use client";

import React, { useState } from 'react';

interface Company {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
}

const initialCompanies: Company[] = [
  {
    id: 1,
    name: 'บริษัท อี-บิดดิ้ง จำกัด',
    address: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
    phone: '02-123-4567',
    email: 'info@ebidding.co.th',
  },
  {
    id: 2,
    name: 'บริษัท สมาร์ทเทค จำกัด',
    address: '456 ถนนพระราม 4 แขวงมหาพฤฒาราม เขตบางรัก กรุงเทพมหานคร 10500',
    phone: '02-987-6543',
    email: 'contact@smarttech.co.th',
  },
];

export default function CompanyInfoPage() {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [form, setForm] = useState({ name: '', address: '', phone: '', email: '' });

  const openAddModal = () => {
    setEditCompany(null);
    setForm({ name: '', address: '', phone: '', email: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (company: Company) => {
    setEditCompany(company);
    setForm({ name: company.name, address: company.address, phone: company.phone, email: company.email });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditCompany(null);
    setForm({ name: '', address: '', phone: '', email: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editCompany) {
      setCompanies(companies.map(c => c.id === editCompany.id ? { ...editCompany, ...form } : c));
    } else {
      setCompanies([...companies, { id: Date.now(), ...form }]);
    }
    closeModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('คุณต้องการลบข้อมูลบริษัทนี้ใช่หรือไม่?')) {
      setCompanies(companies.filter(c => c.id !== id));
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ข้อมูลบริษัท</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
          onClick={openAddModal}
        >
          + เพิ่มบริษัท
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">ชื่อบริษัท</th>
              <th className="py-2 px-4 border-b">ที่อยู่</th>
              <th className="py-2 px-4 border-b">โทรศัพท์</th>
              <th className="py-2 px-4 border-b">อีเมล</th>
              <th className="py-2 px-4 border-b">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {companies.map(company => (
              <tr key={company.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{company.name}</td>
                <td className="py-2 px-4 border-b">{company.address}</td>
                <td className="py-2 px-4 border-b">{company.phone}</td>
                <td className="py-2 px-4 border-b">{company.email}</td>
                <td className="py-2 px-4 border-b space-x-2">
                  <button
                    className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                    onClick={() => openEditModal(company)}
                  >แก้ไข</button>
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => handleDelete(company.id)}
                  >ลบ</button>
                </td>
              </tr>
            ))}
            {companies.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-400">ไม่มีข้อมูลบริษัท</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={closeModal}
            >✕</button>
            <h2 className="text-xl font-bold mb-4">{editCompany ? 'แก้ไขข้อมูลบริษัท' : 'เพิ่มบริษัท'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">ชื่อบริษัท</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ที่อยู่</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">โทรศัพท์</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">อีเมล</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={closeModal}
                >ยกเลิก</button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >{editCompany ? 'บันทึก' : 'เพิ่ม'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 