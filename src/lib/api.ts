/**
 * Mock API client.
 * All endpoints return mock data - no real backend calls are made.
 */

// Token storage (kept for compatibility - not used in mock mode)
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
};

export const getAccessToken = () => accessToken;
export const getRefreshToken = () => refreshToken;

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
};

// Helper to simulate async API response
const mockResponse = <T>(data: T, delay = 150): Promise<{ data: T }> =>
  new Promise((resolve) => setTimeout(() => resolve({ data }), delay));

// Import mock data
import {
  mockTokens,
  mockProfile,
  mockChannelMembership,
  mockSessions,
  mockTelegramLoginResponse,
  mockTelegramCodeResponse,
  mockTelegramSessions,
  mockAdminCheck,
  mockAdminStats,
  mockAdminSessions,
  mockAdminTelegramSessions,
  mockAccounts,
  mockAccountCounts,
  mockPublicCountries,
  mockCountryList,
  mockSettings,
  mockWithdrawalSettings,
  mockWithdrawals,
  mockWithdrawalSessions,
  mockSupportTickets,
  mockSupportTicketDetail,
  mockBroadcasts,
  mockExportLogs,
  mockSessionCountsByCountry,
  mockUsers,
} from './mockData';


// ====== API Types ======


export interface TelegramAuthRequest {
  init_data: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserProfileResponse {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  photo_url: string | null;
  balance: number;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionCreate {
  session_name: string;
  phone: string;
  api_id: number;
  api_hash: string;
  phone_code?: string;
  phone_code_hash?: string;
  password?: string;
}

export interface SessionResponse {
  id: number;
  user_id: number;
  session_name: string;
  phone: string;
  api_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionPendingResponse {
  status: 'pending_code' | 'pending_2fa';
  phone: string;
  phone_code_hash?: string;
  message: string;
  session_name?: string;
}

export interface SessionListResponse {
  sessions: SessionResponse[];
  total: number;
  page: number;
  per_page: number;
}

export interface SessionValidateResponse {
  is_valid: boolean;
  is_connected: boolean;
  message: string;
}

export interface SessionInfoResponse {
  id: number;
  session_name: string;
  phone: string;
  is_active: boolean;
  is_connected: boolean;
  user_info?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    phone: string;
  } | null;
  created_at: string;
}

// ====== TelertX API Types (Telethon-based Telegram Login) ======

export interface TelegramLoginRequest {
  phone: string;
  session_name?: string;
  platform?: string;  // android, iphone, desktop
}

export interface TelegramCodeRequest {
  session_id: string;
  code: string;
}

export interface TelegramPasswordRequest {
  session_id: string;
  password: string;
}

export interface TelegramLoginResponse {
  success: boolean;
  message: string;
  session_id?: string;
  status: string;
  data?: Record<string, unknown>;
}

export interface TelegramSessionInfo {
  session_id: string;
  phone: string;
  is_authorized: boolean;
  created_at: string;
  last_used: string;
  device_model?: string;
  system_version?: string;
}

export interface TelegramSessionListResponse {
  sessions: TelegramSessionInfo[];
  total: number;
}

// ====== Channel Membership API Types ======

export interface ChannelInfo {
  type: 'main' | 'backup';
  username: string;
  is_member: boolean;
}

export interface ChannelMembershipResponse {
  all_joined: boolean;
  channels: ChannelInfo[];
}

// Authentication API

// Legacy Sessions API (for backward compatibility)

// TelertX Telegram API (Telethon-based)

// ====== Admin API Types ======

export interface AdminSessionResponse {
  id: number;
  session_name: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_telegram_id?: number;
  user_username?: string;
  user_first_name?: string;
}

export interface AdminStatsResponse {
  total_users: number;
  total_sessions: number;
  active_sessions: number;
  inactive_sessions: number;
  ready_sessions: number;  // Sessions that are ready and can be exported
  pending_accounts: number;  // Accounts with pending status
  pending_withdrawals: number;  // Withdrawals with pending status
  open_support_tickets: number;  // Open support tickets
}

export interface AdminSessionListResponse {
  sessions: AdminSessionResponse[];
  total: number;
  page: number;
  per_page: number;
}

export interface AdminTelegramSessionResponse {
  session_id: string;
  phone: string;
  is_authorized: boolean;
  created_at: string;
  last_used: string;
  device_model?: string;
  system_version?: string;
}

export interface AdminTelegramSessionListResponse {
  sessions: AdminTelegramSessionResponse[];
  total: number;
}

// ====== Country API Types ======

export type ApiTypeEnum = 'WINDOWS_OFFICIAL' | 'ANDROID_OFFICIAL' | 'ANDROIDX_OFFICIAL' | 'IOS_OFFICIAL' | 'MACOS_OFFICIAL' | 'WINDOWS' | 'ANDROID' | 'IOS' | 'MACOS';

// Quality prices for each quality level (FREE=Best, SPAM=Medium, LIMIT=Low)
export interface QualityPrices {
  FREE: number;
  SPAM: number;
  LIMIT: number;
}

export interface CountryResponse {
  id: number;
  iso2: string;
  name: string;
  price: number;
  quality_price_percentage: QualityPrices;
  capacity: number;
  claim_time: number;
  is_proxy_enabled: boolean;
  random_info_enabled: boolean;
  api_type: ApiTypeEnum;
  is_contact_permission_check: boolean;
  created_at: string;
  updated_at: string;
}

export interface CountryCreate {
  iso2: string;
  name: string;
  price?: number;
  quality_price_percentage?: QualityPrices;
  capacity?: number;
  claim_time?: number;
  is_proxy_enabled?: boolean;
  random_info_enabled?: boolean;
  api_type?: ApiTypeEnum;
  is_contact_permission_check?: boolean;
}

export interface CountryUpdate {
  name?: string;
  price?: number;
  quality_price_percentage?: QualityPrices;
  capacity?: number;
  claim_time?: number;
  is_proxy_enabled?: boolean;
  random_info_enabled?: boolean;
  api_type?: ApiTypeEnum;
  is_contact_permission_check?: boolean;
}

export interface CountryListResponse {
  countries: CountryResponse[];
  total: number;
  page: number;
  per_page: number;
}

// Public Country Types (user-facing)
export interface PublicCountryResponse {
  iso2: string;
  name: string;
  quality_prices: QualityPrices;
}

export interface PublicCountryListResponse {
  countries: PublicCountryResponse[];
  total: number;
}

// ====== Settings API Types ======

export interface SettingsResponse {
  id: number;
  twofa_enabled: string;
  is_card_withdraw_enabled: boolean;
  is_crypto_withdraw_enabled: boolean;
  is_binance_pay_withdraw_enabled: boolean;
  min_withdraw_card: number;
  min_withdraw_crypto: number;
  min_withdraw_binance: number;
  claim_channel_id: string | null;
  withdraw_channel_id: string | null;
  main_channel_username: string | null;
  backup_channel_username: string | null;
  created_at: string;
  updated_at: string;
}

export interface SettingsUpdate {
  twofa_enabled?: string;
  is_card_withdraw_enabled?: boolean;
  is_crypto_withdraw_enabled?: boolean;
  is_binance_pay_withdraw_enabled?: boolean;
  min_withdraw_card?: number;
  min_withdraw_crypto?: number;
  min_withdraw_binance?: number;
  claim_channel_id?: string | null;
  withdraw_channel_id?: string | null;
  main_channel_username?: string | null;
  backup_channel_username?: string | null;
}

// ====== User Admin API Types ======

export interface UserAdminResponse {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  photo_url: string | null;
  balance: number;
  is_banned: boolean;
  sessions_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserListResponse {
  users: UserAdminResponse[];
  total: number;
  page: number;
  per_page: number;
}

export interface UserBalanceUpdate {
  amount: number;
  operation: 'add' | 'deduct';
}

export interface UserBanUpdate {
  is_banned: boolean;
}

// Admin API

// Test Data Types
export interface TestDataRequest {
  user_telegram_id: number;
  balance_amount?: number;
  num_sessions?: number;
  session_status?: 'pending' | 'success' | 'rejected';
  country_code?: string;
  session_price?: number;
}

export interface TestDataResponse {
  success: boolean;
  message: string;
  user_telegram_id: number;
  balance_added: number;
  sessions_created: number;
  new_balance: number;
}

// Countries API (admin only)

// Settings API (admin only)

// Users Admin API

// ====== User Accounts API Types ======

export type AccountStatusType = 'pending' | 'success' | 'rejected';
export type AccountQualityType = 'FREE' | 'REGISTERED' | 'LIMITED' | 'FROZEN';

export interface AccountResponse {
  id: number;
  user_id: number;
  session_name: string;
  phone: string;
  api_id: number;
  is_active: boolean;
  account_status: AccountStatusType;
  country_iso2: string | null;
  price: number;
  claim_time_end: string | null;
  balance_added: boolean;
  quality: AccountQualityType | null;
  quality_checked_at: string | null;
  quality_reason: string | null;
  working_session_path: string | null;
  working_json_path: string | null;
  ready_session_path: string | null;
  ready_json_path: string | null;
  is_exported: boolean;
  is_withdrawn: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountListResponse {
  accounts: AccountResponse[];
  total: number;
  page: number;
  per_page: number;
  status_filter: AccountStatusType | null;
}

export interface AccountCountsResponse {
  pending: number;
  success: number;
  rejected: number;
  total: number;
}

// User Accounts API

// ====== Proxy Test API Types ======

export interface ProxyTestIpInfo {
  ip: string;
  country: string;
  country_code: string;
  region: string;
  city: string;
  isp: string;
  org: string;
  timezone: string;
}

export interface ProxyTestResponse {
  success: boolean;
  country_requested: string;
  response_time_ms?: number;
  error?: string;
  ip_info?: ProxyTestIpInfo;
  proxy_config?: {
    host: string;
    port: number;
    username: string;
  };
  used_fallback: boolean;
  original_country?: string;
  primary_error?: string;
  fallback_attempts?: Array<{
    country: string;
    success: boolean;
    error?: string;
  }>;
  tested_at: string;
}

export interface ProxyConfigResponse {
  host: string;
  port: number;
  fallback_countries: string[];
}

// Proxy Test API (admin only)

// ====== Broadcast API Types ======

export type BroadcastStatusType = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

export interface BroadcastResponse {
  id: number;
  message: string;
  photo_url: string | null;
  document_url: string | null;
  status: BroadcastStatusType;
  total_users: number;
  sent_count: number;
  failed_count: number;
  error_message: string | null;
  created_by_id: number;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface BroadcastListResponse {
  broadcasts: BroadcastResponse[];
  total: number;
  page: number;
  per_page: number;
}

export interface BroadcastCreate {
  message: string;
  photo_url?: string | null;
  document_url?: string | null;
}

export interface BroadcastPreviewRequest {
  message: string;
  photo_url?: string | null;
  document_url?: string | null;
}

export interface BroadcastPreviewResponse {
  preview_html: string;
  photo_url: string | null;
  document_url: string | null;
  total_users: number;
  estimated_time_minutes: number;
}

// Broadcast API (admin only)

// ====== Admin Sessions Export API Types ======

export interface CountrySessionCountResponse {
  country_iso2: string;
  country_name: string | null;
  session_count: number;
}

export interface SessionCountsByCountryResponse {
  countries: CountrySessionCountResponse[];
  total_sessions: number;
}

export interface ExportSessionsRequest {
  country_iso2: string;
  quantity: number;
}

export interface ExportSessionsResponse {
  success: boolean;
  message: string;
  export_id: number | null;
  zip_filename: string | null;
  session_count: number;
  file_size_bytes: number | null;
}

export interface ExportLogResponse {
  id: number;
  country_iso2: string;
  session_count: number;
  zip_filename: string;
  zip_path: string;
  file_size_bytes: number | null;
  exported_session_ids: string | null;
  exported_by_id: number | null;
  exported_by_telegram_id: number | null;
  created_at: string;
}

export interface ExportLogListResponse {
  exports: ExportLogResponse[];
  total: number;
  page: number;
  per_page: number;
}

// Admin Sessions Export API

// ====== Withdrawal API Types ======

export type WithdrawalMethodType = 'card' | 'crypto' | 'binance';
export type CryptoChannelType = 'TRC20' | 'BEP20';
export type WithdrawalStatusType = 'pending' | 'completed' | 'rejected';

export interface WithdrawalSettingsResponse {
  is_card_withdraw_enabled: boolean;
  is_crypto_withdraw_enabled: boolean;
  is_binance_pay_withdraw_enabled: boolean;
  min_withdraw_card: number;
  min_withdraw_crypto: number;
  min_withdraw_binance: number;
}

export interface WithdrawalCreate {
  method: WithdrawalMethodType;
  address: string;
  crypto_channel?: CryptoChannelType;
}

export interface WithdrawalResponse {
  id: number;
  user_id: number;
  transaction_id: string;
  amount: number;
  method: WithdrawalMethodType;
  address: string;
  crypto_channel: CryptoChannelType | null;
  status: WithdrawalStatusType;
  rejection_reason: string | null;
  total_accounts: number;
  accounts_by_country: Record<string, number> | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface WithdrawalListResponse {
  withdrawals: WithdrawalResponse[];
  total: number;
  page: number;
  per_page: number;
}

export interface WithdrawalAdminListResponse {
  withdrawals: WithdrawalDetailResponse[];
  total: number;
  page: number;
  per_page: number;
}

export interface WithdrawalDetailResponse extends WithdrawalResponse {
  user_telegram_id: number | null;
  user_username: string | null;
  user_first_name: string | null;
  user_balance: number | null;
}

export interface WithdrawalAdminUpdate {
  status: 'completed' | 'rejected';
  rejection_reason?: string;
}

export interface SessionWithdrawalInfo {
  id: number;
  phone: string;
  country_iso2: string | null;
  price: number;
  account_status: string;
  quality: string | null;
  is_withdrawn: boolean;
  created_at: string;
}

export interface WithdrawalSessionsResponse {
  success_sessions: SessionWithdrawalInfo[];
  rejected_sessions: SessionWithdrawalInfo[];
  total_success: number;
  total_rejected: number;
}

// Withdrawals API (user)

// Admin Withdrawals API

// ====== Support Ticket API Types ======

export type TicketStatusType = 'open' | 'closed';

export interface SupportMessageResponse {
  id: number;
  ticket_id: number;
  message: string;
  is_from_admin: boolean;
  admin_id: number | null;
  admin_username: string | null;
  created_at: string;
}

export interface SupportTicketResponse {
  id: number;
  user_id: number;
  subject: string;
  status: TicketStatusType;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  messages_count: number;
  last_message: SupportMessageResponse | null;
}

export interface SupportTicketDetailResponse extends SupportTicketResponse {
  messages: SupportMessageResponse[];
  user_telegram_id: number | null;
  user_username: string | null;
  user_first_name: string | null;
}

export interface SupportTicketListResponse {
  tickets: SupportTicketResponse[];
  total: number;
  page: number;
  per_page: number;
}

export interface AdminSupportTicketListResponse {
  tickets: SupportTicketDetailResponse[];
  total: number;
  page: number;
  per_page: number;
}

export interface SupportTicketCreate {
  subject: string;
  message: string;
}

export interface SupportMessageCreate {
  message: string;
}

// Support API (user)

// Admin Support API

// ====== API Implementations (Mock) ======

// Authentication API
export const authApi = {
  telegram: (_data: TelegramAuthRequest) => mockResponse(mockTokens),
  refresh: (_refresh_token: string) => mockResponse(mockTokens),
  getProfile: async (): Promise<{ data: UserProfileResponse }> => {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (!res.ok) throw new Error('Not authenticated');
    const body = await res.json();
    const u = body.user;
    // Map AuthUser → UserProfileResponse shape expected by pages
    const profile: UserProfileResponse = {
      id: u.id,
      telegram_id: u.id,
      username: u.username ?? null,
      first_name: u.firstName ?? null,
      photo_url: null,
      balance: u.balance,
      is_banned: u.isBanned,
      created_at: u.createdAt,
      updated_at: u.updatedAt,
    };
    return { data: profile };
  },
  checkChannelMembership: () => mockResponse(mockChannelMembership),
};

// Legacy Sessions API
export const sessionsApi = {
  create: (_data: SessionCreate) => mockResponse(mockSessions.sessions[0] as SessionResponse | SessionPendingResponse),
  list: (_params?: { skip?: number; limit?: number; active_only?: boolean }) =>
    mockResponse(mockSessions),
  delete: (_sessionId: number) => mockResponse({}),
  validate: (_sessionId: number) =>
    mockResponse({ is_valid: true, is_connected: true, message: 'Session is valid' }),
  getInfo: (sessionId: number) =>
    mockResponse({
      id: sessionId,
      session_name: 'session_1',
      phone: '+8801712345678',
      is_active: true,
      is_connected: true,
      user_info: null,
      created_at: '2024-02-20T10:00:00Z',
    }),
};

// TelertX Telegram API (Telethon-based)
export const telegramApi = {
  login: (_data: TelegramLoginRequest) => mockResponse(mockTelegramLoginResponse),
  submitCode: (_data: TelegramCodeRequest) => mockResponse(mockTelegramCodeResponse),
  submitPassword: (_data: TelegramPasswordRequest) => mockResponse(mockTelegramCodeResponse),
  listSessions: () => mockResponse(mockTelegramSessions),
  getSession: (sessionId: string) =>
    mockResponse({
      session_id: sessionId,
      phone: '+8801712345678',
      is_authorized: true,
      created_at: '2024-02-20T10:00:00Z',
      last_used: '2024-03-01T12:00:00Z',
    }),
  closeSession: (_sessionId: string) => mockResponse({}),
  closeAllSessions: () => mockResponse({}),
};

// Admin API
export const adminApi = {
  checkAdmin: () => mockResponse(mockAdminCheck),
  getStats: () => mockResponse(mockAdminStats),
  listSessions: (_page = 1, _perPage = 20) => mockResponse(mockAdminSessions),
  listTelegramSessions: () => mockResponse(mockAdminTelegramSessions),
  deleteSession: (_sessionId: number) => mockResponse({}),
  deleteTelegramSession: (_sessionId: string) => mockResponse({}),
  pushTestData: (data: TestDataRequest) =>
    mockResponse({
      success: true,
      message: 'Test data pushed successfully',
      user_telegram_id: data.user_telegram_id,
      balance_added: data.balance_amount || 0,
      sessions_created: data.num_sessions || 0,
      new_balance: (data.balance_amount || 0),
    }),
};

// Countries API (admin only)
export const countriesApi = {
  list: (_page = 1, _perPage = 50) => mockResponse(mockCountryList),
  get: (countryId: number) =>
    mockResponse({ ...mockCountryList.countries[0], id: countryId }),
  getByIso2: (iso2: string) =>
    mockResponse(mockCountryList.countries.find(c => c.iso2 === iso2) || mockCountryList.countries[0]),
  create: (data: CountryCreate) =>
    mockResponse({ ...mockCountryList.countries[0], ...data, id: 99 }),
  update: (countryId: number, data: CountryUpdate) =>
    mockResponse({ ...mockCountryList.countries[0], ...data, id: countryId }),
  delete: (_countryId: number) => mockResponse({}),
};

// Settings API (admin only)
export const settingsApi = {
  get: () => mockResponse(mockSettings),
  update: (data: SettingsUpdate) => mockResponse({ ...mockSettings, ...data }),
};

// Users Admin API
export const usersAdminApi = {
  list: (_page = 1, _perPage = 50, _search?: string) => mockResponse(mockUsers),
  get: (userId: number) => mockResponse({ ...mockUsers.users[0], id: userId }),
  updateBalance: (userId: number, _data: UserBalanceUpdate) =>
    mockResponse({ ...mockUsers.users[0], id: userId }),
  updateBanStatus: (userId: number, data: UserBanUpdate) =>
    mockResponse({ ...mockUsers.users[0], id: userId, is_banned: data.is_banned }),
  delete: (_userId: number) => mockResponse({}),
};

// User Accounts API
export const accountsApi = {
  list: (_status?: AccountStatusType, _page = 1, _perPage = 20) => mockResponse(mockAccounts),
  getCounts: () => mockResponse(mockAccountCounts),
  get: (accountId: number) =>
    mockResponse({ ...mockAccounts.accounts[0], id: accountId }),
  getCountry: (iso2: string) =>
    mockResponse(mockCountryList.countries.find(c => c.iso2 === iso2) || mockCountryList.countries[0]),
  listCountries: () => mockResponse(mockPublicCountries),
};

// Proxy Test API (admin only)
export const proxyApi = {
  getConfig: () =>
    mockResponse({ host: 'proxy.example.com', port: 8080, fallback_countries: ['BD', 'PK'] }),
  test: (iso2: string, _useFallback = true, _timeout = 10) =>
    mockResponse({
      success: true,
      country_requested: iso2,
      response_time_ms: 120,
      ip_info: {
        ip: '192.168.1.1',
        country: 'Bangladesh',
        country_code: iso2,
        region: 'Dhaka',
        city: 'Dhaka',
        isp: 'Mock ISP',
        org: 'Mock Org',
        timezone: 'Asia/Dhaka',
      },
      error: undefined,
      used_fallback: false,
      tested_at: new Date().toISOString(),
    }),
  testBatch: (countries: string[]) =>
    mockResponse({
      results: Object.fromEntries(
        countries.map(c => [c, { success: true, response_time_ms: 100 + Math.random() * 100 }])
      ),
      tested_at: new Date().toISOString(),
    }),
};

// Broadcast API (admin only)
export const broadcastApi = {
  create: (data: BroadcastCreate) =>
    mockResponse({
      id: 1,
      ...data,
      photo_url: data.photo_url || null,
      document_url: data.document_url || null,
      status: 'pending' as BroadcastStatusType,
      total_users: 142,
      sent_count: 0,
      failed_count: 0,
      error_message: null,
      created_by_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      started_at: null,
      completed_at: null,
    }),
  list: (_page = 1, _perPage = 20) => mockResponse(mockBroadcasts),
  get: (broadcastId: number) =>
    mockResponse({
      id: broadcastId,
      message: 'Mock broadcast',
      photo_url: null,
      document_url: null,
      status: 'completed' as BroadcastStatusType,
      total_users: 142,
      sent_count: 140,
      failed_count: 2,
      error_message: null,
      created_by_id: 1,
      created_at: '2024-03-01T10:00:00Z',
      updated_at: '2024-03-01T11:00:00Z',
      started_at: '2024-03-01T10:05:00Z',
      completed_at: '2024-03-01T11:00:00Z',
    }),
  cancel: (_broadcastId: number) => mockResponse({}),
  preview: (data: BroadcastPreviewRequest) =>
    mockResponse({
      preview_html: `<p>${data.message}</p>`,
      photo_url: data.photo_url || null,
      document_url: data.document_url || null,
      total_users: 142,
      estimated_time_minutes: 2,
    }),
  delete: (_broadcastId: number) => mockResponse({}),
};

// Admin Sessions Export API
export const adminSessionsApi = {
  getCountsByCountry: () => mockResponse(mockSessionCountsByCountry),
  exportSessions: (data: ExportSessionsRequest) =>
    mockResponse({
      success: true,
      message: `Exported ${data.quantity} sessions from ${data.country_iso2}`,
      export_id: 1,
      zip_filename: `${data.country_iso2}_sessions.zip`,
      session_count: data.quantity,
      file_size_bytes: data.quantity * 1024,
    }),
  getExportLogs: (_page = 1, _perPage = 20) => mockResponse(mockExportLogs),
  getExportLog: (exportId: number) =>
    mockResponse({
      id: exportId,
      country_iso2: 'BD',
      session_count: 10,
      zip_filename: 'BD_sessions.zip',
      zip_path: '/exports/BD_sessions.zip',
      file_size_bytes: 10240,
      exported_session_ids: null,
      exported_by_id: 1,
      exported_by_telegram_id: 123456789,
      created_at: '2024-03-01T10:00:00Z',
    }),
};

// Withdrawals API (user)
export const withdrawalsApi = {
  getSettings: () => mockResponse(mockWithdrawalSettings),
  create: (_data: WithdrawalCreate) => mockResponse(mockWithdrawals.withdrawals[0]),
  list: (_status?: WithdrawalStatusType, _page = 1, _perPage = 20) => mockResponse(mockWithdrawals),
  get: (withdrawalId: number) =>
    mockResponse({ ...mockWithdrawals.withdrawals[0], id: withdrawalId }),
  getSessions: (_withdrawalId: number) => mockResponse(mockWithdrawalSessions),
};

// Admin Withdrawals API
export const adminWithdrawalsApi = {
  list: (_status?: WithdrawalStatusType, _page = 1, _perPage = 20, _search?: string, _userTelegramId?: number) =>
    mockResponse({ withdrawals: [] as WithdrawalDetailResponse[], total: 0, page: 1, per_page: 20 }),
  getPendingCount: () => mockResponse({ pending_count: 5 }),
  get: (withdrawalId: number) =>
    mockResponse({
      ...mockWithdrawals.withdrawals[0],
      id: withdrawalId,
      user_telegram_id: 123456789,
      user_username: 'alexuser',
      user_first_name: 'Alex',
      user_balance: 125.50,
    }),
  updateStatus: (withdrawalId: number, data: WithdrawalAdminUpdate) =>
    mockResponse({
      ...mockWithdrawals.withdrawals[0],
      id: withdrawalId,
      status: data.status,
      rejection_reason: data.rejection_reason || null,
      user_telegram_id: 123456789,
      user_username: 'alexuser',
      user_first_name: 'Alex',
      user_balance: 125.50,
    }),
  getSessions: (_withdrawalId: number) => mockResponse(mockWithdrawalSessions),
};

// Support API (user)
export const supportApi = {
  create: (data: SupportTicketCreate) =>
    mockResponse({
      ...mockSupportTicketDetail,
      id: 99,
      subject: data.subject,
      messages: [
        {
          id: 99,
          ticket_id: 99,
          message: data.message,
          is_from_admin: false,
          admin_id: null,
          admin_username: null,
          created_at: new Date().toISOString(),
        },
      ],
    }),
  list: (_status?: TicketStatusType, _page = 1, _perPage = 20) => mockResponse(mockSupportTickets),
  get: (_ticketId: number) => mockResponse(mockSupportTicketDetail),
  addMessage: (ticketId: number, data: SupportMessageCreate) =>
    mockResponse({
      id: Math.floor(Math.random() * 1000),
      ticket_id: ticketId,
      message: data.message,
      is_from_admin: false,
      admin_id: null,
      admin_username: null,
      created_at: new Date().toISOString(),
    }),
  getOpenCount: () => mockResponse({ open_count: 1 }),
  getUnreadCount: () => mockResponse({ unread_count: 1 }),
};

// Admin Support API
export const adminSupportApi = {
  list: (_status?: TicketStatusType, _userId?: number, _page = 1, _perPage = 20) =>
    mockResponse({ tickets: [], total: 0, page: 1, per_page: 20 }),
  getOpenCount: () => mockResponse({ open_count: 3 }),
  get: (_ticketId: number) => mockResponse(mockSupportTicketDetail),
  reply: (ticketId: number, data: SupportMessageCreate) =>
    mockResponse({
      id: Math.floor(Math.random() * 1000),
      ticket_id: ticketId,
      message: data.message,
      is_from_admin: true,
      admin_id: 1,
      admin_username: 'admin',
      created_at: new Date().toISOString(),
    }),
  close: (_ticketId: number) => mockResponse({ ...mockSupportTicketDetail, status: 'closed' as TicketStatusType }),
  reopen: (_ticketId: number) => mockResponse({ ...mockSupportTicketDetail, status: 'open' as TicketStatusType }),
};

export default {};
