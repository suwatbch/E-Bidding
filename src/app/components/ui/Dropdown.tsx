'use client';

import { useRef, useEffect } from 'react';
import { NavArrowDownIcon } from './icons';

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  variant?: 'navbar' | 'mobile';
}

export default function Dropdown({
  isOpen,
  onClose,
  trigger,
  children,
  variant = 'navbar',
}: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const styles = {
    navbar: {
      container: 'relative',
      dropdown:
        'absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg py-1.5 border border-white/20',
      item: 'flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50/50 transition-all duration-300',
    },
    mobile: {
      container: 'w-full',
      dropdown:
        'w-full mt-1 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg py-1.5 border border-white/20',
      item: 'flex items-center justify-between w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50/50 transition-all duration-300',
    },
  };

  const currentStyle = styles[variant];

  return (
    <div className={currentStyle.container} ref={dropdownRef}>
      {trigger}

      {isOpen && <div className={currentStyle.dropdown}>{children}</div>}
    </div>
  );
}
