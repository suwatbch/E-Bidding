import axios, { AxiosResponse } from 'axios';

// Base URL configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// Create axios instance for auctions API
const auctionsApi = axios.create({
  baseURL: `${API_BASE_URL}/api/auctions`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to get auth token from cookie first, then localStorage
const getAuthTokenFromStorage = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // 1. ลองดึงจาก cookie ก่อน (เพื่อความเร็วและความแม่นยำ)
    const allCookies = document.cookie.split('; ');
    const authTokenCookie = allCookies.find((row) =>
      row.startsWith('auth_token=')
    );
    const cookieToken = authTokenCookie?.split('=')[1];

    if (cookieToken) {
      return cookieToken;
    }

    // 2. Fallback: ดึงจาก localStorage
    const localToken = localStorage.getItem('auth_token');
    return localToken;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Add request interceptor to include auth token
auctionsApi.interceptors.request.use(
  (config) => {
    const token = getAuthTokenFromStorage();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
auctionsApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.error('🚫 Unauthorized: Please login again');
    } else if (status === 403) {
      console.error('🔒 Forbidden: Insufficient permissions');
    } else if (status >= 500) {
      console.error('🔥 Server Error:', error.response?.data?.message);
    }

    return Promise.reject(error);
  }
);

// Types
export interface Auction {
  auction_id: number;
  name: string;
  auction_type_id: number;
  start_dt: string;
  end_dt: string;
  reserve_price: number;
  currency: number;
  status: number;
  is_deleted: number;
  remark?: string;
  created_dt: string;
  updated_dt: string;
}

export interface AuctionType {
  auction_type_id: number;
  name: string;
  description?: string;
  status: number;
}

export interface AuctionParticipant {
  id: number;
  auction_id: number;
  user_id: number;
  status: number;
  is_connected: boolean;
  joined_dt: string;
}

// Bid interface
export interface AuctionBid {
  bid_id: number;
  auction_id: number;
  user_id: number;
  bid_amount: number;
  bid_time: string;
  status: string;
  attempt: number;
  is_winning: boolean;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  total?: number;
}

export interface AuctionsResponse extends ApiResponse {
  data: Auction[];
}

export interface AuctionTypesResponse extends ApiResponse {
  data: AuctionType[];
}

export interface AuctionParticipantsResponse extends ApiResponse {
  data: AuctionParticipant[];
}

export interface AuctionBidsResponse extends ApiResponse {
  data: AuctionBid[];
}

export interface SingleAuctionResponse extends ApiResponse {
  data: Auction;
}

export interface CreateAuctionRequest {
  name: string;
  auction_type_id: number;
  start_dt: string;
  end_dt: string;
  reserve_price: number;
  currency: number;
  status?: number;
  remark?: string;
}

export interface UpdateAuctionRequest extends CreateAuctionRequest {
  auction_id: number;
}

export interface CreateBidRequest {
  auction_id: number;
  bid_amount: number;
}

// Bid Status Constants
export const BidStatus = {
  ACCEPT: 'accept',
  REJECTED: 'rejected',
  CANCELED: 'canceled',
} as const;

export type BidStatusType = (typeof BidStatus)[keyof typeof BidStatus];

// Bid Status Utility Functions
export const getBidStatusText = (status: string): string => {
  switch (status) {
    case BidStatus.ACCEPT:
      return 'ยอมรับ';
    case BidStatus.REJECTED:
      return 'ปฏิเสธ';
    case BidStatus.CANCELED:
      return 'ยกเลิก';
    default:
      return 'ไม่ทราบสถานะ';
  }
};

export const getBidStatusColor = (status: string): string => {
  switch (status) {
    case BidStatus.ACCEPT:
      return 'text-green-600 bg-green-100';
    case BidStatus.REJECTED:
      return 'text-red-600 bg-red-100';
    case BidStatus.CANCELED:
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Error handling helpers
const handleAuctionsApiError = (
  error: any,
  operation: string
): AuctionsResponse => {
  console.error(`Error ${operation}:`, error);

  const status = error.response?.status;
  const serverMessage = error.response?.data?.message;
  let userMessage = `เกิดข้อผิดพลาดในการ${operation}`;

  if (status === 400) {
    userMessage = serverMessage || 'ข้อมูลไม่ถูกต้อง';
  } else if (status === 401) {
    userMessage = 'กรุณาเข้าสู่ระบบใหม่';
  } else if (status === 403) {
    userMessage = 'คุณไม่มีสิทธิ์ในการดำเนินการนี้';
  } else if (status === 404) {
    userMessage = 'ไม่พบข้อมูลที่ต้องการ';
  } else if (status >= 500) {
    userMessage = 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์';
  } else if (error.code === 'ECONNABORTED') {
    userMessage = 'การเชื่อมต่อใช้เวลาเกินกำหนด';
  } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
    userMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
  }

  return {
    success: false,
    message: userMessage,
    data: [],
  };
};

const handleAuctionTypesApiError = (
  error: any,
  operation: string
): AuctionTypesResponse => {
  console.error(`Error ${operation}:`, error);

  const status = error.response?.status;
  const serverMessage = error.response?.data?.message;
  let userMessage = `เกิดข้อผิดพลาดในการ${operation}`;

  if (status === 400) {
    userMessage = serverMessage || 'ข้อมูลไม่ถูกต้อง';
  } else if (status === 401) {
    userMessage = 'กรุณาเข้าสู่ระบบใหม่';
  } else if (status === 403) {
    userMessage = 'คุณไม่มีสิทธิ์ในการดำเนินการนี้';
  } else if (status === 404) {
    userMessage = 'ไม่พบข้อมูลที่ต้องการ';
  } else if (status >= 500) {
    userMessage = 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์';
  } else if (error.code === 'ECONNABORTED') {
    userMessage = 'การเชื่อมต่อใช้เวลาเกินกำหนด';
  } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
    userMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
  }

  return {
    success: false,
    message: userMessage,
    data: [],
  };
};

const handleParticipantsApiError = (
  error: any,
  operation: string
): AuctionParticipantsResponse => {
  console.error(`Error ${operation}:`, error);

  const status = error.response?.status;
  const serverMessage = error.response?.data?.message;
  let userMessage = `เกิดข้อผิดพลาดในการ${operation}`;

  if (status === 400) {
    userMessage = serverMessage || 'ข้อมูลไม่ถูกต้อง';
  } else if (status === 401) {
    userMessage = 'กรุณาเข้าสู่ระบบใหม่';
  } else if (status === 403) {
    userMessage = 'คุณไม่มีสิทธิ์ในการดำเนินการนี้';
  } else if (status === 404) {
    userMessage = 'ไม่พบข้อมูลที่ต้องการ';
  } else if (status >= 500) {
    userMessage = 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์';
  } else if (error.code === 'ECONNABORTED') {
    userMessage = 'การเชื่อมต่อใช้เวลาเกินกำหนด';
  } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
    userMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
  }

  return {
    success: false,
    message: userMessage,
    data: [],
  };
};

// Handle Bids API Error
const handleBidsApiError = (
  error: any,
  operation: string
): AuctionBidsResponse => {
  console.error(`Error ${operation}:`, error);

  const status = error.response?.status;
  const serverMessage = error.response?.data?.message;
  let userMessage = `เกิดข้อผิดพลาดในการ${operation}`;

  if (status === 400) {
    userMessage = serverMessage || 'ข้อมูลไม่ถูกต้อง';
  } else if (status === 401) {
    userMessage = 'กรุณาเข้าสู่ระบบใหม่';
  } else if (status === 403) {
    userMessage = 'คุณไม่มีสิทธิ์ในการดำเนินการนี้';
  } else if (status === 404) {
    userMessage = 'ไม่พบข้อมูลที่ต้องการ';
  } else if (status >= 500) {
    userMessage = 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์';
  } else if (error.code === 'ECONNABORTED') {
    userMessage = 'การเชื่อมต่อใช้เวลาเกินกำหนด';
  } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
    userMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
  }

  return {
    success: false,
    message: userMessage,
    data: [],
  };
};

// Auctions Service
export const auctionsService = {
  /**
   * ดึงข้อมูลประมูลทั้งหมด
   */
  getAllAuctions: async (): Promise<AuctionsResponse> => {
    try {
      const response: AxiosResponse<AuctionsResponse> = await auctionsApi.get(
        '/'
      );
      return response.data;
    } catch (error: any) {
      return handleAuctionsApiError(error, 'ดึงข้อมูลประมูล');
    }
  },

  /**
   * ดึงข้อมูลประมูลที่เปิดใช้งานเท่านั้น
   */
  getActiveAuctions: async (): Promise<AuctionsResponse> => {
    try {
      const response: AxiosResponse<AuctionsResponse> = await auctionsApi.get(
        '/',
        {
          params: { active_only: 'true' },
        }
      );
      return response.data;
    } catch (error: any) {
      return handleAuctionsApiError(error, 'ดึงข้อมูลประมูลที่เปิดใช้งาน');
    }
  },

  /**
   * ค้นหาประมูล
   */
  searchAuctions: async (searchTerm: string): Promise<AuctionsResponse> => {
    try {
      if (!searchTerm.trim()) {
        return auctionsService.getAllAuctions();
      }

      const response: AxiosResponse<AuctionsResponse> = await auctionsApi.get(
        '/',
        {
          params: { search: searchTerm.trim() },
        }
      );
      return response.data;
    } catch (error: any) {
      return handleAuctionsApiError(error, 'ค้นหาประมูล');
    }
  },

  /**
   * ดึงข้อมูลประมูลตาม ID
   */
  getAuctionById: async (id: number): Promise<SingleAuctionResponse> => {
    try {
      const response: AxiosResponse<SingleAuctionResponse> =
        await auctionsApi.get(`/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching auction by ID:', error);
      return {
        success: false,
        message:
          error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลประมูล',
        data: {} as Auction,
      };
    }
  },

  /**
   * สร้างประมูลใหม่
   */
  createAuction: async (
    auctionData: CreateAuctionRequest
  ): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await auctionsApi.post(
        '/',
        auctionData
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating auction:', error);
      return {
        success: false,
        message:
          error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างประมูล',
      };
    }
  },

  /**
   * อัพเดทข้อมูลประมูล
   */
  updateAuction: async (
    id: number,
    auctionData: UpdateAuctionRequest
  ): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await auctionsApi.post(
        `/update/${id}`,
        auctionData
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating auction:', error);
      return {
        success: false,
        message:
          error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัพเดทประมูล',
      };
    }
  },

  /**
   * ลบประมูล (soft delete)
   */
  deleteAuction: async (id: number): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await auctionsApi.post(
        `/delete/${id}`,
        {}
      );
      return response.data;
    } catch (error: any) {
      console.error('Error deleting auction:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบประมูล',
      };
    }
  },

  /**
   * ดึงข้อมูลประเภทประมูลทั้งหมด
   */
  getAuctionTypes: async (): Promise<AuctionTypesResponse> => {
    try {
      const response: AxiosResponse<AuctionTypesResponse> =
        await auctionsApi.get('/types');
      return response.data;
    } catch (error: any) {
      return handleAuctionTypesApiError(error, 'ดึงข้อมูลประเภทประมูล');
    }
  },

  /**
   * ดึงข้อมูลผู้เข้าร่วมประมูล
   */
  getAuctionParticipants: async (
    auctionId?: number
  ): Promise<AuctionParticipantsResponse> => {
    try {
      const params = auctionId ? { auction_id: auctionId } : {};
      const response: AxiosResponse<AuctionParticipantsResponse> =
        await auctionsApi.get('/participants', { params });
      return response.data;
    } catch (error: any) {
      return handleParticipantsApiError(error, 'ดึงข้อมูลผู้เข้าร่วมประมูล');
    }
  },

  /**
   * ดึงข้อมูลการเสนอราคาทั้งหมดในประมูล
   */
  getAuctionBids: async (auctionId: number): Promise<AuctionBidsResponse> => {
    try {
      const response: AxiosResponse<AuctionBidsResponse> =
        await auctionsApi.get(`/${auctionId}/bids`);
      return response.data;
    } catch (error: any) {
      return handleBidsApiError(error, 'ดึงข้อมูลการเสนอราคา');
    }
  },

  /**
   * ดึงข้อมูลการเสนอราคาที่ยอมรับแล้ว
   */
  getAcceptedBids: async (auctionId: number): Promise<AuctionBidsResponse> => {
    try {
      const response: AxiosResponse<AuctionBidsResponse> =
        await auctionsApi.get(`/${auctionId}/bids`, {
          params: { status: 'accept' },
        });
      return response.data;
    } catch (error: any) {
      return handleBidsApiError(error, 'ดึงข้อมูลการเสนอราคาที่ยอมรับ');
    }
  },

  /**
   * ดึงข้อมูลการเสนอราคาของผู้ใช้
   */
  getUserBids: async (
    auctionId: number,
    userId: number
  ): Promise<AuctionBidsResponse> => {
    try {
      const response: AxiosResponse<AuctionBidsResponse> =
        await auctionsApi.get(`/${auctionId}/bids`, {
          params: { user_id: userId },
        });
      return response.data;
    } catch (error: any) {
      return handleBidsApiError(error, 'ดึงข้อมูลการเสนอราคาของผู้ใช้');
    }
  },

  /**
   * สร้างการเสนอราคาใหม่
   */
  createBid: async (bidData: CreateBidRequest): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await auctionsApi.post(
        `/bids`,
        bidData
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating bid:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการเสนอราคา',
      };
    }
  },

  // =============================================================================
  // BID UTILITY FUNCTIONS (using mock data until API is ready)
  // =============================================================================

  /**
   * ดึงการเสนอราคาล่าสุดของแต่ละบริษัท
   */
  getLatestBidByCompany: async (auctionId: number): Promise<AuctionBid[]> => {
    try {
      const response = await auctionsService.getAcceptedBids(auctionId);
      if (response.success) {
        const bids = response.data;
        const latestBids: { [companyId: number]: AuctionBid } = {};

        bids.forEach((bid) => {
          // Note: This will need company mapping logic
          const companyId = bid.user_id; // Placeholder until company mapping is available
          if (
            !latestBids[companyId] ||
            new Date(bid.bid_time) > new Date(latestBids[companyId].bid_time)
          ) {
            latestBids[companyId] = bid;
          }
        });

        return Object.values(latestBids).sort(
          (a, b) => a.bid_amount - b.bid_amount
        );
      }
      return [];
    } catch (error) {
      console.error('Error getting latest bids by company:', error);
      return [];
    }
  },

  /**
   * ดึงราคาเสนอต่ำสุด
   */
  getLowestBid: async (auctionId: number): Promise<AuctionBid | null> => {
    try {
      const latestBids = await auctionsService.getLatestBidByCompany(auctionId);
      return latestBids.length > 0 ? latestBids[0] : null;
    } catch (error) {
      console.error('Error getting lowest bid:', error);
      return null;
    }
  },

  /**
   * ดึงราคาเสนอที่ชนะ (is_winning = true)
   */
  getWinningBid: async (auctionId: number): Promise<AuctionBid | null> => {
    try {
      const response = await auctionsService.getAuctionBids(auctionId);
      if (response.success) {
        const winningBid = response.data.find((bid) => bid.is_winning);
        return winningBid || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting winning bid:', error);
      return null;
    }
  },

  /**
   * ดึงสถิติการเสนอราคาตามสถานะ
   */
  getBidStatsByStatus: async (auctionId: number) => {
    try {
      const response = await auctionsService.getAuctionBids(auctionId);
      if (response.success) {
        const bids = response.data;
        return {
          accept: bids.filter((bid) => bid.status === BidStatus.ACCEPT).length,
          rejected: bids.filter((bid) => bid.status === BidStatus.REJECTED)
            .length,
          canceled: bids.filter((bid) => bid.status === BidStatus.CANCELED)
            .length,
          total: bids.length,
        };
      }
      return { accept: 0, rejected: 0, canceled: 0, total: 0 };
    } catch (error) {
      console.error('Error getting bid stats by status:', error);
      return { accept: 0, rejected: 0, canceled: 0, total: 0 };
    }
  },

  /**
   * ตรวจสอบว่าผู้ใช้มีการเสนอราคาหรือไม่
   */
  hasUserBid: async (auctionId: number, userId: number): Promise<boolean> => {
    try {
      const response = await auctionsService.getUserBids(auctionId, userId);
      if (response.success) {
        return response.data.some((bid) => bid.status === BidStatus.ACCEPT);
      }
      return false;
    } catch (error) {
      console.error('Error checking if user has bid:', error);
      return false;
    }
  },
};
