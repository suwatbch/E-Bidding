'use client';

import React from 'react';
import { User } from '@/app/model/dataUser';
import { uploadImage } from '@/app/services/uploadImage';

interface FormData {
  username: string;
  password: string;
  language_code: string;
  fullname: string;
  tax_id: string;
  address: string;
  email: string;
  phone: string;
  type: 'admin' | 'user';
  status: boolean;
  is_locked: boolean;
  is_profile: boolean;
  image?: string;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  editUser: User | null;
  initialForm: FormData;
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  isFromProfileMenu?: boolean;
}

export default function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  editUser,
  initialForm,
  form,
  setForm,
  isFromProfileMenu = false
}: UserFormModalProps) {
  if (!isOpen) return null;

  console.log('UserFormModal - Current form data:', form);
  console.log('UserFormModal - Image URL:', form.image);
  console.log('UserFormModal - Edit user data:', editUser);

  // เช็คว่าเป็น admin หรือไม่
  const isAdmin = form.type === 'admin';
  // เช็คว่ามาจากเมนูโปรไฟล์หรือไม่
  const isProfileEdit = isFromProfileMenu;
  // ถ้าเป็น user และมาจากเมนูโปรไฟล์ จะแสดงเฉพาะฟิลด์พื้นฐาน
  const showBasicFieldsOnly = !isAdmin && isProfileEdit;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // กำหนดชื่อไฟล์ใหม่ตาม user_id หรือเวลาปัจจุบัน
        const fileName = editUser?.user_id 
          ? `${editUser.user_id}-${Date.now()}.${file.name.split('.').pop()}`
          : `new-user-${Date.now()}.${file.name.split('.').pop()}`;

        // กำหนด path ตามประเภทการใช้งาน
        const uploadPath = isFromProfileMenu ? '/uploads/profiles/' : '/uploads/users/';
        
        // แสดงรูปภาพชั่วคราวก่อนอัพโหลด
        const tempImageUrl = URL.createObjectURL(file);
        setForm(prev => ({
          ...prev,
          image: tempImageUrl
        }));

        // อัพโหลดรูปภาพผ่าน service
        const result = await uploadImage({
          file,
          fileName,
          uploadPath
        });

        if (result.success && result.imageUrl) {
          // อัพเดท form state ด้วย path ของรูปภาพ (ไม่รวม API URL)
          const imageUrl = result.imageUrl;
          setForm(prev => ({
            ...prev,
            image: imageUrl.replace(process.env.NEXT_PUBLIC_API_URL || '', '')
          }));
        } else {
          throw new Error(result.message || 'Upload failed');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        // TODO: แสดง error message ให้ user ทราบ
        setForm(prev => ({
          ...prev,
          image: undefined // ลบรูปภาพชั่วคราวออกถ้าอัพโหลดไม่สำเร็จ
        }));
      }
    }
  };

  const getModalTitle = () => {
    if (editUser) {
      if (isFromProfileMenu) {
        return {
          title: "แก้ไขโปรไฟล์",
          subtitle: "กรุณากรอกข้อมูลที่ต้องการแก้ไข",
          icon: (
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: "bg-purple-100"
        };
      }
      return {
        title: "แก้ไขข้อมูลผู้ใช้งาน",
        subtitle: "กรุณากรอกข้อมูลที่ต้องการแก้ไข",
        icon: (
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
        bgColor: "bg-yellow-100"
      };
    }
    return {
      title: "เพิ่มผู้ใช้งาน",
      subtitle: "กรุณากรอกข้อมูลผู้ใช้งานใหม่",
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      bgColor: "bg-blue-100"
    };
  };

  const modalTitle = getModalTitle();

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-50 via-white to-blue-50 py-4 px-5 border-b border-blue-100/50">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors duration-200 
              hover:bg-gray-100/80 rounded-lg p-1"
            onClick={onClose}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-lg font-bold text-gray-900">
            <div className="flex items-center gap-2">
              <div className={`${modalTitle.bgColor} p-1.5 rounded-lg`}>
                {modalTitle.icon}
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{modalTitle.title}</div>
                <div className="text-xs text-gray-500 font-normal">{modalTitle.subtitle}</div>
              </div>
            </div>
          </h2>
        </div>

        {/* Modal Content */}
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-5 py-4">
          <form id="userForm" onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload Section */}
            <div className="flex flex-col items-center space-y-2">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-blue-500/20">
                {form.image ? (
                  <img 
                    src={form.image.startsWith('blob:') || form.image.startsWith('http') 
                      ? form.image 
                      : form.image.startsWith('/') 
                        ? `${process.env.NEXT_PUBLIC_API_URL}${form.image}`
                        : form.image
                    } 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Error loading image:', form.image);
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // prevent infinite loop
                      target.src = ''; // clear the broken image
                      // You might want to set a default image here
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <label className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 transition-colors">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  อัพโหลดรูปภาพ
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  ชื่อผู้ใช้
                </div>
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  รหัสผ่าน {editUser && '(เว้นว่างถ้าไม่ต้องการเปลี่ยน)'}
                </div>
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:border-transparent"
                required={!editUser}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ภาษา
                </div>
              </label>
              <select
                name="language_code"
                value={form.language_code}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="th">ภาษาไทย</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ชื่อ-นามสกุล
                </div>
              </label>
              <input
                type="text"
                name="fullname"
                value={form.fullname}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  เลขประจำตัวผู้เสียภาษี
                </div>
              </label>
              <input
                type="text"
                name="tax_id"
                value={form.tax_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:border-transparent"
                maxLength={13}
                placeholder="0000000000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  ที่อยู่
                </div>
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  อีเมล
                </div>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  โทรศัพท์
                </div>
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            {!showBasicFieldsOnly && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      ประเภทผู้ใช้งาน
                    </div>
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as 'admin' | 'user' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="user">ผู้ใช้งาน</option>
                    <option value="admin">ผู้ดูแลระบบ</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="status"
                      checked={form.status}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      เปิดใช้งาน
                    </label>
                  </div>
                  {!isProfileEdit && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_profile"
                        checked={form.is_profile}
                        onChange={(e) => {
                          if (e.target.checked && localStorage.getItem('profile_id') && localStorage.getItem('profile_id') !== editUser?.user_id.toString()) {
                            if (!window.confirm('มีโปรไฟล์อื่นอยู่แล้ว ต้องการเปลี่ยนเป็นโปรไฟล์นี้หรือไม่?')) {
                              return;
                            }
                          }
                          setForm(prev => ({ ...prev, is_profile: e.target.checked }));
                        }}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 flex items-center gap-2 text-sm text-gray-700">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ตั้งเป็นโปรไฟล์
                      </label>
                    </div>
                  )}
                  {editUser && !isProfileEdit && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_locked"
                        checked={form.is_locked}
                        onChange={(e) => {
                          const newIsLocked = e.target.checked;
                          const newLoginCount = newIsLocked ? 5 : (editUser.login_count >= 5 ? 0 : editUser.login_count);
                          
                          setForm(prev => ({
                            ...prev,
                            is_locked: newIsLocked,
                            login_count: newLoginCount
                          }));
                        }}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 flex items-center gap-2 text-sm text-gray-700">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        {form.is_locked ? 'ปลดล็อก' : 'ล็อก'}
                      </label>
                    </div>
                  )}
                </div>
              </>
            )}
          </form>
        </div>

        {/* Modal Footer */}
        <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 py-3 px-5 border-t border-gray-100">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="group px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 
                rounded-lg hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                ยกเลิก
              </div>
            </button>
            <button
              type="submit"
              form="userForm"
              className="group px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 
                border border-transparent rounded-lg hover:from-blue-700 hover:to-blue-600 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-1.5">
                {editUser ? (
                  <>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    บันทึกการแก้ไข
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    เพิ่มผู้ใช้งาน
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 