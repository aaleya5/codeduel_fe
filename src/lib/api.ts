import axios, { AxiosInstance, AxiosError } from "axios";

// API Base URL - Change this to your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isAuthRequest =
      error.config?.url?.includes("/api/auth/login") ||
      error.config?.url?.includes("/api/auth/register");

    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// API Response types
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    username: string;
    leetcodeUsername: string;
    createdAt: string;
  };
  token: string;
}

interface RegisterResponse extends LoginResponse {}

interface ChallengeResponse {
  id: string;
  inviteCode?: string;
  name: string;
  description: string;
  minSubmissionsPerDay: number;
  difficultyFilter: string[] | null;
  uniqueProblemConstraint: boolean;
  penaltyAmount: number;
  startDate: string;
  endDate: string;
  status: string;
  ownerId: string;
  createdAt: string;
  members?: any[];
}

interface DashboardResponse {
  summary: {
    totalChallenges: number;
    activeChallenges: number;
    completedChallenges: number;
    totalPenalties: number;
  };
  activeChallenges: any[];
  recentActivity: any[];
}

interface TodayStatusResponse {
  date: string;
  challenges: any[];
  summary: {
    totalChallenges: number;
    completed: number;
    pending: number;
    failed: number;
  };
}

// ============================================================================
// AUTH APIs
// ============================================================================
export const authApi = {
  login: async (emailOrUsername: string, password: string) => {
    const response = await api.post<ApiResponse<LoginResponse>>(
      "/api/auth/login",
      {
        emailOrUsername,
        password,
      }
    );
    return response.data;
  },

  register: async (
    email: string,
    username: string,
    password: string,
    leetcodeUsername: string
  ) => {
    const response = await api.post<ApiResponse<RegisterResponse>>(
      "/api/auth/register",
      {
        email,
        username,
        password,
        leetcodeUsername,
      }
    );
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get<ApiResponse<any>>("/api/auth/profile");
    return response.data;
  },

  updateProfile: async (data: { leetcodeUsername?: string }) => {
    const response = await api.put<ApiResponse<any>>("/api/auth/profile", data);
    return response.data;
  },
};

// ============================================================================
// CHALLENGE APIs
// ============================================================================
export const challengeApi = {
  create: async (data: {
    name: string;
    description: string;
    minSubmissionsPerDay: number;
    difficultyFilter: string[];
    uniqueProblemConstraint: boolean;
    penaltyAmount: number;
    startDate: string;
    endDate: string;
  }) => {
    const response = await api.post<ApiResponse<ChallengeResponse>>(
      "/api/challenges",
      data
    );
    return response.data;
  },

  getAll: async (params?: { status?: string; owned?: boolean }) => {
    const response = await api.get<ApiResponse<ChallengeResponse[]>>(
      "/api/challenges",
      { params }
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<ChallengeResponse>>(
      `/api/challenges/${id}`
    );
    return response.data;
  },

  join: async (id: string) => {
    const response = await api.post<ApiResponse<any>>(
      `/api/challenges/${id}/join`
    );
    return response.data;
  },

  getInviteDetails: async (inviteCode: string) => {
    const response = await api.get<ApiResponse<any>>(
      `/api/challenges/invite/${encodeURIComponent(inviteCode)}`
    );
    return response.data;
  },

  requestToJoinByInvite: async (inviteCode: string) => {
    const response = await api.post<ApiResponse<any>>(
      `/api/challenges/invite/${encodeURIComponent(inviteCode)}/request`
    );
    return response.data;
  },

  getJoinRequests: async (id: string) => {
    const response = await api.get<ApiResponse<any[]>>(
      `/api/challenges/${id}/join-requests`
    );
    return response.data;
  },

  resolveJoinRequest: async (
    id: string,
    requestId: string,
    decision: "APPROVED" | "REJECTED"
  ) => {
    const response = await api.patch<ApiResponse<any>>(
      `/api/challenges/${id}/join-requests/${requestId}`,
      { decision }
    );
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.patch<ApiResponse<ChallengeResponse>>(
      `/api/challenges/${id}/status`,
      {
        status,
      }
    );
    return response.data;
  },

  updateRules: async (
    id: string,
    data: Partial<{
      name: string;
      description: string;
      minSubmissionsPerDay: number;
      difficultyFilter: string[];
      uniqueProblemConstraint: boolean;
      penaltyAmount: number;
      endDate: string;
    }>
  ) => {
    const response = await api.patch<ApiResponse<ChallengeResponse>>(
      `/api/challenges/${id}`,
      data
    );
    return response.data;
  },

  removeMember: async (id: string, memberId: string) => {
    const response = await api.delete<ApiResponse<any>>(
      `/api/challenges/${id}/members/${memberId}`
    );
    return response.data;
  },

  adjustMemberPenalty: async (
    id: string,
    memberId: string,
    amount: number,
    reason: string
  ) => {
    const response = await api.post<ApiResponse<any>>(
      `/api/challenges/${id}/members/${memberId}/penalty-adjustment`,
      { amount, reason }
    );
    return response.data;
  },

  disputePenalty: async (id: string, penaltyId: string, reason: string) => {
    const response = await api.post<ApiResponse<any>>(
      `/api/challenges/${id}/penalties/${penaltyId}/dispute`,
      { reason }
    );
    return response.data;
  },

  getDisputes: async (id: string) => {
    const response = await api.get<ApiResponse<any[]>>(
      `/api/challenges/${id}/disputes`
    );
    return response.data;
  },

  resolveDispute: async (
    id: string,
    penaltyId: string,
    action: "UPHOLD" | "WAIVE",
    note?: string
  ) => {
    const response = await api.post<ApiResponse<any>>(
      `/api/challenges/${id}/penalties/${penaltyId}/resolve`,
      { action, note }
    );
    return response.data;
  },
};

// ============================================================================
// NOTIFICATION APIs
// ============================================================================
export const notificationApi = {
  getAll: async (unreadOnly?: boolean) => {
    const response = await api.get<ApiResponse<any[]>>("/api/notifications", {
      params: unreadOnly ? { unreadOnly: "true" } : undefined,
    });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get<ApiResponse<{ count: number }>>(
      "/api/notifications/unread-count"
    );
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch<ApiResponse<any>>(
      `/api/notifications/${id}/read`
    );
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch<ApiResponse<any>>(
      "/api/notifications/read-all"
    );
    return response.data;
  },
};

// ============================================================================
// DASHBOARD APIs
// ============================================================================
export const dashboardApi = {
  getOverview: async () => {
    const response = await api.get<ApiResponse<DashboardResponse>>(
      "/api/dashboard"
    );
    return response.data;
  },

  getTodayStatus: async () => {
    const response = await api.get<ApiResponse<TodayStatusResponse>>(
      "/api/dashboard/today"
    );
    return response.data;
  },

  getChallengeProgress: async (challengeId: string) => {
    const response = await api.get<ApiResponse<any>>(
      `/api/dashboard/challenge/${challengeId}`
    );
    return response.data;
  },

  getChallengeLeaderboard: async (challengeId: string) => {
    const response = await api.get<ApiResponse<any>>(
      `/api/dashboard/challenge/${challengeId}/leaderboard`
    );
    return response.data;
  },

  getActivityHeatmap: async () => {
    const response = await api.get<ApiResponse<any>>(
      "/api/dashboard/activity-heatmap"
    );
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<ApiResponse<any>>("/api/dashboard/stats");
    return response.data;
  },

  getSubmissionChart: async () => {
    const response = await api.get<ApiResponse<any>>(
      "/api/dashboard/submission-chart"
    );
    return response.data;
  },

  getGlobalLeaderboard: async () => {
    const response = await api.get<ApiResponse<any>>(
      "/api/dashboard/leaderboard"
    );
    return response.data;
  },

  getChallengeChart: async (challengeId: string) => {
    const response = await api.get<ApiResponse<any>>(
      `/api/dashboard/challenge/${challengeId}/chart`
    );
    return response.data;
  },
};

// ============================================================================
// LEETCODE APIs
// ============================================================================
export const leetcodeApi = {
  storeSession: async (
    cookie: string,
    csrfToken: string,
    expiresAt: string
  ) => {
    const response = await api.post<ApiResponse<any>>("/api/leetcode/session", {
      cookie,
      csrfToken,
      expiresAt,
    });
    return response.data;
  },

  getSessionStatus: async () => {
    const response = await api.get<ApiResponse<any>>("/api/leetcode/session");
    return response.data;
  },

  invalidateSession: async () => {
    const response = await api.delete<ApiResponse<any>>(
      "/api/leetcode/session"
    );
    return response.data;
  },

  getProfile: async (username: string) => {
    const response = await api.get<ApiResponse<any>>(
      `/api/leetcode/profile/${username}`
    );
    return response.data;
  },

  getSubmissionsForDate: async (username: string, date: string) => {
    const response = await api.get<ApiResponse<any[]>>(
      `/api/leetcode/submissions/${username}`,
      { params: { date } }
    );
    return response.data;
  },

  testConnection: async (username: string) => {
    const response = await api.get<ApiResponse<any>>(
      `/api/leetcode/test/${username}`
    );
    return response.data;
  },

  getProblemMetadata: async (titleSlug: string) => {
    const response = await api.get<ApiResponse<any>>(
      `/api/leetcode/problem/${titleSlug}`
    );
    return response.data;
  },
};

// ============================================================================
// PAYMENT APIs (Razorpay)
// ============================================================================
export const paymentApi = {
  createOrder: async (memberId: string, amount: number) => {
    const response = await api.post<
      ApiResponse<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
        challengeName: string;
      }>
    >("/api/payments/create-order", { memberId, amount });
    return response.data;
  },

  verifyPayment: async (payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    const response = await api.post<ApiResponse<any>>(
      "/api/payments/verify",
      payload
    );
    return response.data;
  },

  getHistory: async (memberId: string) => {
    const response = await api.get<ApiResponse<any[]>>(
      `/api/payments/history/${memberId}`
    );
    return response.data;
  },

  recordManualPayment: async (
    challengeId: string,
    memberId: string,
    amount: number,
    note?: string
  ) => {
    const response = await api.post<ApiResponse<any>>("/api/payments/manual", {
      challengeId,
      memberId,
      amount,
      note,
    });
    return response.data;
  },

  getFullLedger: async (memberId: string) => {
    const response = await api.get<
      ApiResponse<{
        challengeName: string;
        totalPenalties: number;
        totalPaid: number;
        outstanding: number;
        events: Array<{
          type: "PENALTY" | "PAYMENT";
          id: string;
          amount: number;
          date: string;
          runningBalance: number;
          reason?: string;
          disputed?: boolean;
          disputeStatus?: string;
          disputeReason?: string;
          resolutionNote?: string;
          method?: string;
          note?: string;
        }>;
      }>
    >(`/api/payments/ledger/${memberId}`);
    return response.data;
  },
};

export default api;
