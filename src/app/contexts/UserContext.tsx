'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, initialUsers } from '@/app/model/dataUser';

interface UserContextType {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  updateUser: (updatedUser: User) => void;
  profile: User | null;
  updateProfile: (updatedProfile: User) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    try {
      // โหลดข้อมูลผู้ใช้เมื่อคอมโพเนนต์ถูกโหลด
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
          // ตรวจสอบและรีเซ็ต is_profile เป็น false ทั้งหมด
          const usersWithoutProfile = parsedUsers.map(user => ({
            ...user,
            is_profile: false
          }));
          setUsers(usersWithoutProfile);
          localStorage.setItem('users', JSON.stringify(usersWithoutProfile));
        } else {
          setUsers(initialUsers);
          localStorage.setItem('users', JSON.stringify(initialUsers));
        }
      } else {
        localStorage.setItem('users', JSON.stringify(initialUsers));
      }

      // โหลดข้อมูลโปรไฟล์
      const storedProfile = localStorage.getItem('profile');
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        setProfile(parsedProfile);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setUsers(initialUsers);
      localStorage.setItem('users', JSON.stringify(initialUsers));
    }
  }, []);

  const updateUser = (updatedUser: User) => {
    const newUsers = users.map(user => 
      user.user_id === updatedUser.user_id ? updatedUser : user
    );
    setUsers(newUsers);
    localStorage.setItem('users', JSON.stringify(newUsers));
  };

  const updateProfile = (updatedProfile: User) => {
    // อัพเดทโปรไฟล์
    setProfile(updatedProfile);
    localStorage.setItem('profile', JSON.stringify(updatedProfile));

    // อัพเดทรายการผู้ใช้ โดยรีเซ็ต is_profile เป็น false ทั้งหมด
    const newUsers = users.map(user => ({
      ...user,
      is_profile: false
    }));
    setUsers(newUsers);
    localStorage.setItem('users', JSON.stringify(newUsers));
  };

  return (
    <UserContext.Provider value={{ users, setUsers, updateUser, profile, updateProfile }}>
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