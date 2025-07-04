import React, { useState, useEffect } from 'react';
import {
  handlePriceFocus,
  handlePriceBlur,
  handlePriceChange,
} from '@/app/utils/globalFunction';

interface BidPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bidAmount: number) => void;
  isLoading?: boolean;
}

const BidPopup: React.FC<BidPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [bidAmount, setBidAmount] = useState<string>('0.00');
  const [bidAmountDisplay, setBidAmountDisplay] = useState<string>('0.00');
  const [bidAmountFocused, setBidAmountFocused] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Reset ค่าเป็น 0.00 ทุกครั้งที่เปิด popup
  useEffect(() => {
    if (isOpen) {
      setBidAmount('0.00');
      setBidAmountDisplay('0.00');
      setBidAmountFocused(false);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const amount = parseFloat(bidAmountDisplay.replace(/,/g, ''));

    // Validation
    if (!bidAmountDisplay || isNaN(amount) || amount <= 0) {
      setError('กรุณากรอกราคาที่ถูกต้อง');
      return;
    }

    setError('');
    onSubmit(amount);
  };

  const handleClose = () => {
    setBidAmount('0.00');
    setBidAmountDisplay('0.00');
    setBidAmountFocused(false);
    setError('');
    onClose();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // อนุญาตให้กรอกได้แค่ตัวเลขและจุดทศนิยม
    if (!/^[0-9.]*$/.test(value)) {
      return; // ถ้าไม่ใช่ตัวเลขหรือจุด ไม่อัปเดต state
    }

    if (bidAmountFocused) {
      // เมื่อ focus อยู่ ให้ user พิมพ์ได้อย่างอิสระ (จะ format เมื่อ blur)
      setBidAmount(value);
      setBidAmountDisplay(value);
    } else {
      // เมื่อไม่ focus ใช้ handlePriceChange เพื่อ format
      const formattedValue = handlePriceChange(value);
      setBidAmount(formattedValue);
      setBidAmountDisplay(formattedValue);
    }
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
        <h3 className="text-xl font-bold mb-4 text-gray-800">เสนอราคา</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ราคาที่เสนอ
          </label>
          <input
            type="text"
            value={bidAmountFocused ? bidAmount : bidAmountDisplay}
            onFocus={(e) => {
              setBidAmountFocused(true);
              handlePriceFocus(bidAmountDisplay, (formattedValue) => {
                setBidAmount(formattedValue);
                setBidAmountDisplay(formattedValue);
              });
              e.target.select();
            }}
            onChange={handleAmountChange}
            onBlur={() => {
              setBidAmountFocused(false);
              handlePriceBlur(bidAmount, (formattedValue) => {
                setBidAmount(formattedValue);
                setBidAmountDisplay(formattedValue);
              });
            }}
            onKeyDown={handleKeyDown}
            placeholder="0.00"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-1.5">
              <svg
                className={`w-4 h-4 ${
                  isLoading
                    ? 'text-gray-400'
                    : 'text-gray-500 group-hover:text-gray-600'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              ยกเลิก
            </div>
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              isLoading || !bidAmountDisplay || bidAmountDisplay === '0.00'
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-1.5">
              {isLoading ? (
                <>
                  <svg
                    className="w-4 h-4 text-white animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  ยืนยัน
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BidPopup;
