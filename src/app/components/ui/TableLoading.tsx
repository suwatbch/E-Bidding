import React from 'react';

interface TableLoadingProps {
  colSpan?: number;
}

export default function TableLoading({ colSpan = 8 }: TableLoadingProps) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </td>
    </tr>
  );
} 