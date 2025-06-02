import { writeFile } from 'fs/promises';
import path from 'path';

interface UploadImageParams {
  file: File;
  fileName: string;
  uploadPath: string;
}

interface UploadImageResponse {
  success: boolean;
  imageUrl?: string;
  message?: string;
}

export async function uploadImage({ file, fileName, uploadPath }: UploadImageParams): Promise<UploadImageResponse> {
  try {
    if (!file || !fileName || !uploadPath) {
      return {
        success: false,
        message: 'Missing required fields'
      };
    }

    // สร้าง FormData สำหรับส่งไฟล์
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);
    formData.append('uploadPath', uploadPath);

    // ส่งไฟล์ไปยัง API หลังบ้าน
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      imageUrl: data.imageUrl,
      message: data.message
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error uploading file'
    };
  }
}

// ฟังก์ชันสำหรับลบรูปภาพ
export async function deleteImage(filePath: string): Promise<UploadImageResponse> {
  try {
    if (!filePath) {
      return {
        success: false,
        message: 'File path is required'
      };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ filePath })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Delete failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message
    };
  } catch (error) {
    console.error('Error deleting file:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error deleting file'
    };
  }
} 