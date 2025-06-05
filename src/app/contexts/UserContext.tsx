'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, initialUsers } from '@/app/model/dataUser';

interface UserContextType {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  updateUser: (updatedUser: User) => void;
  profile: User | null;
  updateProfile: (updatedProfile: User) => void;
  isProfileLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [profile, setProfile] = useState<User | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // เพิ่มฟังก์ชันสำหรับอัพเดทข้อมูลให้ตรงกับ initialUsers
  const syncWithInitialData = (userData: User): User => {
    const initialUser = initialUsers.find(
      (u) => u.user_id === userData.user_id
    );
    if (initialUser) {
      // อัพเดทข้อมูลโดยใช้ค่าจาก initialUsers ถ้ามีค่าว่างหรือ undefined
      return {
        ...userData,
        image: userData.image || initialUser.image || '',
        tax_id: userData.tax_id || initialUser.tax_id || '',
        address: userData.address || initialUser.address || '',
        language_code:
          userData.language_code || initialUser.language_code || 'th',
        status: userData.status ?? initialUser.status,
        is_locked: userData.is_locked ?? initialUser.is_locked,
        type: userData.type || initialUser.type,
      };
    }
    return userData;
  };

  useEffect(() => {
    try {
      setIsProfileLoading(true);

      // โหลดข้อมูลผู้ใช้เมื่อคอมโพเนนต์ถูกโหลด
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
          // อัพเดทข้อมูลแต่ละ user ให้ตรงกับ initialUsers
          const updatedUsers = parsedUsers.map((user) =>
            syncWithInitialData(user)
          );
          setUsers(updatedUsers);
          localStorage.setItem('users', JSON.stringify(updatedUsers));
        } else {
          setUsers(initialUsers);
          localStorage.setItem('users', JSON.stringify(initialUsers));
        }
      } else {
        setUsers(initialUsers);
        localStorage.setItem('users', JSON.stringify(initialUsers));
      }

      // โหลดข้อมูลโปรไฟล์
      const storedProfile = localStorage.getItem('profile');
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        // อัพเดทข้อมูล profile ให้ตรงกับ initialUsers
        const updatedProfile = syncWithInitialData(parsedProfile);
        setProfile(updatedProfile);
        localStorage.setItem('profile', JSON.stringify(updatedProfile));
      } else {
        // ถ้าไม่มีข้อมูลโปรไฟล์ใน localStorage ให้ใช้ข้อมูลเริ่มต้นจาก initialUsers
        const defaultProfile = initialUsers.find((user) => user.user_id === 1);
        if (defaultProfile) {
          setProfile(defaultProfile);
          localStorage.setItem('profile', JSON.stringify(defaultProfile));
        }
      }

      setIsProfileLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setUsers(initialUsers);
      localStorage.setItem('users', JSON.stringify(initialUsers));

      // กรณีเกิด error ให้ใช้ข้อมูลเริ่มต้นจาก initialUsers
      const defaultProfile = initialUsers.find((user) => user.user_id === 1);
      if (defaultProfile) {
        setProfile(defaultProfile);
        localStorage.setItem('profile', JSON.stringify(defaultProfile));
      }

      setIsProfileLoading(false);
    }
  }, []);

  const updateUser = (updatedUser: User) => {
    // อัพเดทข้อมูลให้ตรงกับ initialUsers ก่อนบันทึก
    const syncedUser = syncWithInitialData(updatedUser);
    const newUsers = users.map((user) =>
      user.user_id === syncedUser.user_id ? syncedUser : user
    );
    setUsers(newUsers);
    localStorage.setItem('users', JSON.stringify(newUsers));
  };

  const updateProfile = (updatedProfile: User) => {
    // อัพเดทข้อมูลให้ตรงกับ initialUsers ก่อนบันทึก
    const syncedProfile = syncWithInitialData(updatedProfile);

    // อัพเดทโปรไฟล์
    setProfile(syncedProfile);
    localStorage.setItem('profile', JSON.stringify(syncedProfile));

    // อัพเดทรายการผู้ใช้ โดยรีเซ็ต is_profile เป็น false ทั้งหมด
    const newUsers = users.map((user) => ({
      ...user,
      is_profile: false,
    }));
    setUsers(newUsers);
    localStorage.setItem('users', JSON.stringify(newUsers));
  };

  return (
    <UserContext.Provider
      value={{
        users,
        setUsers,
        updateUser,
        profile,
        updateProfile,
        isProfileLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
