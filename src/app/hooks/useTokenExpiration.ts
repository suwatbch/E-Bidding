import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

export interface TokenExpirationInfo {
  isExpired: boolean;
  timeRemaining: string;
  timeRemainingMs: number;
  isExpiringSoon: boolean; // expires in less than 30 minutes
}

export const useTokenExpiration = (): TokenExpirationInfo => {
  const { tokenExpiresAt, isTokenExpired } = useAuth();
  const [timeInfo, setTimeInfo] = useState<TokenExpirationInfo>({
    isExpired: false,
    timeRemaining: '',
    timeRemainingMs: 0,
    isExpiringSoon: false,
  });

  useEffect(() => {
    if (!tokenExpiresAt) {
      setTimeInfo({
        isExpired: false,
        timeRemaining: 'ไม่มีข้อมูล',
        timeRemainingMs: 0,
        isExpiringSoon: false,
      });
      return;
    }

    const updateTimeInfo = () => {
      const now = new Date();
      const expirationTime = tokenExpiresAt;
      const timeDiff = expirationTime.getTime() - now.getTime();

      if (timeDiff <= 0) {
        setTimeInfo({
          isExpired: true,
          timeRemaining: 'หมดอายุแล้ว',
          timeRemainingMs: 0,
          isExpiringSoon: false,
        });
        return;
      }

      // Calculate time remaining
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      let timeRemainingText = '';
      if (hours > 0) {
        timeRemainingText = `${hours} ชั่วโมง ${minutes} นาที`;
      } else if (minutes > 0) {
        timeRemainingText = `${minutes} นาที ${seconds} วินาที`;
      } else {
        timeRemainingText = `${seconds} วินาที`;
      }

      const isExpiringSoon = timeDiff < 30 * 60 * 1000; // 30 minutes

      setTimeInfo({
        isExpired: false,
        timeRemaining: timeRemainingText,
        timeRemainingMs: timeDiff,
        isExpiringSoon,
      });
    };

    // Update immediately
    updateTimeInfo();

    // Update every second
    const interval = setInterval(updateTimeInfo, 1000);

    return () => clearInterval(interval);
  }, [tokenExpiresAt]);

  return timeInfo;
};

// Helper function to format expiration date
export const formatExpirationDate = (date: Date): string => {
  return date.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};
