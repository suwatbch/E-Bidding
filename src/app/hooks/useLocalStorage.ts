import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // ใช้ callback function ใน useState เพื่อให้ทำงานเฉพาะครั้งแรกที่ render
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // ตรวจสอบว่าอยู่ใน browser environment
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // อัพเดท localStorage เมื่อค่าเปลี่ยน
  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
} 