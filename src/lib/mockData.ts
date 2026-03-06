/**
 * Mock data for standalone website mode.
 * All API calls return this data instead of hitting a real backend.
 */

export const mockTokens = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  token_type: 'Bearer',
  expires_in: 3600,
};

export const mockProfile = {
  id: 1,
  telegram_id: 123456789,
  username: 'alexuser',
  first_name: 'Alex',
  photo_url: null,
  balance: 125.50,
  is_banned: false,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-03-01T15:30:00Z',
};

export const mockChannelMembership = {
  all_joined: true,
  channels: [],
};

export const mockSessions = {
  sessions: [
    {
      id: 1,
      user_id: 1,
      session_name: 'my_account_1',
      phone: '+8801712345678',
      api_id: 12345,
      is_active: true,
      created_at: '2024-02-20T10:00:00Z',
      updated_at: '2024-02-20T10:05:00Z',
    },
    {
      id: 2,
      user_id: 1,
      session_name: 'my_account_2',
      phone: '+8801987654321',
      api_id: 67890,
      is_active: false,
      created_at: '2024-02-18T08:00:00Z',
      updated_at: '2024-02-18T08:10:00Z',
    },
  ],
  total: 2,
  page: 1,
  per_page: 20,
};

export const mockTelegramLoginResponse = {
  success: true,
  message: 'Verification code sent to your Telegram app',
  session_id: 'mock-session-id-001',
  status: 'awaiting_code',
};

export const mockTelegramCodeResponse = {
  success: true,
  message: 'Successfully authenticated!',
  session_id: 'mock-session-id-001',
  status: 'authorized',
};

export const mockTelegramSessions = {
  sessions: [],
  total: 0,
};

export const mockAdminCheck = {
  telegram_id: 123456789,
  is_admin: true,
};

export const mockAdminStats = {
  total_users: 142,
  total_sessions: 318,
  active_sessions: 287,
  inactive_sessions: 31,
  ready_sessions: 42,
  pending_accounts: 17,
  pending_withdrawals: 5,
  open_support_tickets: 3,
};

export const mockAdminSessions = {
  sessions: [
    {
      id: 1,
      session_name: 'my_account_1',
      phone: '+8801712345678',
      is_active: true,
      created_at: '2024-02-20T10:00:00Z',
      updated_at: '2024-02-20T10:05:00Z',
      user_telegram_id: 123456789,
      user_username: 'alexuser',
      user_first_name: 'Alex',
    },
  ],
  total: 1,
  page: 1,
  per_page: 20,
};

export const mockAdminTelegramSessions = {
  sessions: [],
  total: 0,
};

export const mockAccounts = {
  accounts: [
    {
      id: 1,
      user_id: 1,
      session_name: 'bd_account_1',
      phone: '+8801712345678',
      api_id: 12345,
      is_active: true,
      account_status: 'success' as const,
      country_iso2: 'BD',
      price: 1.50,
      claim_time_end: null,
      balance_added: true,
      quality: 'FREE' as const,
      quality_checked_at: '2024-02-21T10:00:00Z',
      quality_reason: 'Account is clean and active.',
      working_session_path: null,
      working_json_path: null,
      ready_session_path: null,
      ready_json_path: null,
      is_exported: false,
      is_withdrawn: false,
      created_at: '2024-02-20T10:00:00Z',
      updated_at: '2024-02-21T10:00:00Z',
    },
    {
      id: 2,
      user_id: 1,
      session_name: 'bd_account_2',
      phone: '+8801987654321',
      api_id: 67890,
      is_active: true,
      account_status: 'pending' as const,
      country_iso2: 'BD',
      price: 1.50,
      claim_time_end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      balance_added: false,
      quality: null,
      quality_checked_at: null,
      quality_reason: null,
      working_session_path: null,
      working_json_path: null,
      ready_session_path: null,
      ready_json_path: null,
      is_exported: false,
      is_withdrawn: false,
      created_at: '2024-02-22T08:00:00Z',
      updated_at: '2024-02-22T08:00:00Z',
    },
    {
      id: 3,
      user_id: 1,
      session_name: 'pk_account_1',
      phone: '+923001234567',
      api_id: 11111,
      is_active: false,
      account_status: 'rejected' as const,
      country_iso2: 'PK',
      price: 1.20,
      claim_time_end: null,
      balance_added: false,
      quality: 'FROZEN' as const,
      quality_checked_at: '2024-02-19T12:00:00Z',
      quality_reason: 'Account is frozen.',
      working_session_path: null,
      working_json_path: null,
      ready_session_path: null,
      ready_json_path: null,
      is_exported: false,
      is_withdrawn: false,
      created_at: '2024-02-18T06:00:00Z',
      updated_at: '2024-02-19T12:00:00Z',
    },
  ],
  total: 3,
  page: 1,
  per_page: 30,
  status_filter: null,
};

export const mockAccountCounts = {
  pending: 1,
  success: 1,
  rejected: 1,
  total: 3,
};

export const mockPublicCountries = {
  countries: [
    { iso2: 'BD', name: 'Bangladesh', quality_prices: { FREE: 1.50, SPAM: 0.80, LIMIT: 0.50 } },
    { iso2: 'PK', name: 'Pakistan', quality_prices: { FREE: 1.20, SPAM: 0.70, LIMIT: 0.40 } },
    { iso2: 'IN', name: 'India', quality_prices: { FREE: 2.00, SPAM: 1.00, LIMIT: 0.60 } },
    { iso2: 'NG', name: 'Nigeria', quality_prices: { FREE: 1.80, SPAM: 0.90, LIMIT: 0.55 } },
    { iso2: 'GH', name: 'Ghana', quality_prices: { FREE: 1.60, SPAM: 0.85, LIMIT: 0.50 } },
    { iso2: 'KE', name: 'Kenya', quality_prices: { FREE: 1.70, SPAM: 0.88, LIMIT: 0.52 } },
    { iso2: 'ET', name: 'Ethiopia', quality_prices: { FREE: 1.40, SPAM: 0.75, LIMIT: 0.45 } },
    { iso2: 'RU', name: 'Russia', quality_prices: { FREE: 2.50, SPAM: 1.20, LIMIT: 0.80 } },
    { iso2: 'UA', name: 'Ukraine', quality_prices: { FREE: 2.20, SPAM: 1.10, LIMIT: 0.70 } },
    { iso2: 'KZ', name: 'Kazakhstan', quality_prices: { FREE: 2.00, SPAM: 1.00, LIMIT: 0.65 } },
  ],
  total: 10,
};

export const mockCountryList = {
  countries: mockPublicCountries.countries.map((c, idx) => ({
    id: idx + 1,
    iso2: c.iso2,
    name: c.name,
    price: c.quality_prices.FREE,
    quality_price_percentage: c.quality_prices,
    capacity: 100,
    claim_time: 7200,
    is_proxy_enabled: true,
    random_info_enabled: false,
    api_type: 'ANDROID_OFFICIAL' as const,
    is_contact_permission_check: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  })),
  total: 10,
  page: 1,
  per_page: 50,
};

export const mockSettings = {
  id: 1,
  twofa_enabled: 'optional',
  is_card_withdraw_enabled: true,
  is_crypto_withdraw_enabled: true,
  is_binance_pay_withdraw_enabled: true,
  min_withdraw_card: 10.00,
  min_withdraw_crypto: 5.00,
  min_withdraw_binance: 5.00,
  claim_channel_id: null,
  withdraw_channel_id: null,
  main_channel_username: null,
  backup_channel_username: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockWithdrawalSettings = {
  is_card_withdraw_enabled: true,
  is_crypto_withdraw_enabled: true,
  is_binance_pay_withdraw_enabled: true,
  min_withdraw_card: 10.00,
  min_withdraw_crypto: 5.00,
  min_withdraw_binance: 5.00,
};

export const mockWithdrawals = {
  withdrawals: [
    {
      id: 1,
      user_id: 1,
      transaction_id: 'TXN-20240301-001',
      amount: 50.00,
      method: 'crypto' as const,
      address: 'TQn5V8T...xAbCd',
      crypto_channel: 'TRC20' as const,
      status: 'completed' as const,
      rejection_reason: null,
      total_accounts: 33,
      accounts_by_country: { BD: 20, PK: 13 } as Record<string, number>,
      created_at: '2024-03-01T10:00:00Z',
      updated_at: '2024-03-01T14:00:00Z',
      completed_at: '2024-03-01T14:00:00Z',
    },
    {
      id: 2,
      user_id: 1,
      transaction_id: 'TXN-20240302-002',
      amount: 75.50,
      method: 'binance' as const,
      address: '123456789',
      crypto_channel: null,
      status: 'pending' as const,
      rejection_reason: null,
      total_accounts: 50,
      accounts_by_country: { BD: 30, IN: 20 } as Record<string, number>,
      created_at: '2024-03-02T09:00:00Z',
      updated_at: '2024-03-02T09:00:00Z',
      completed_at: null,
    },
  ],
  total: 2,
  page: 1,
  per_page: 20,
};

export const mockWithdrawalSessions = {
  success_sessions: [],
  rejected_sessions: [],
  total_success: 0,
  total_rejected: 0,
};

export const mockSupportTickets = {
  tickets: [
    {
      id: 1,
      user_id: 1,
      subject: 'Account verification issue',
      status: 'open' as const,
      created_at: '2024-02-28T10:00:00Z',
      updated_at: '2024-03-01T09:00:00Z',
      closed_at: null,
      messages_count: 2,
      last_message: {
        id: 2,
        ticket_id: 1,
        message: 'We are looking into your issue.',
        is_from_admin: true,
        admin_id: 1,
        admin_username: 'admin',
        created_at: '2024-03-01T09:00:00Z',
      },
    },
  ],
  total: 1,
  page: 1,
  per_page: 20,
};

export const mockSupportTicketDetail = {
  id: 1,
  user_id: 1,
  subject: 'Account verification issue',
  status: 'open' as const,
  created_at: '2024-02-28T10:00:00Z',
  updated_at: '2024-03-01T09:00:00Z',
  closed_at: null,
  messages_count: 2,
  last_message: null,
  messages: [
    {
      id: 1,
      ticket_id: 1,
      message: 'My account has been pending for more than 24 hours. Can you please check?',
      is_from_admin: false,
      admin_id: null,
      admin_username: null,
      created_at: '2024-02-28T10:00:00Z',
    },
    {
      id: 2,
      ticket_id: 1,
      message: 'We are looking into your issue.',
      is_from_admin: true,
      admin_id: 1,
      admin_username: 'admin',
      created_at: '2024-03-01T09:00:00Z',
    },
  ],
  user_telegram_id: 123456789,
  user_username: 'alexuser',
  user_first_name: 'Alex',
};

export const mockBroadcasts = {
  broadcasts: [],
  total: 0,
  page: 1,
  per_page: 20,
};

export const mockExportLogs = {
  exports: [],
  total: 0,
  page: 1,
  per_page: 20,
};

export const mockSessionCountsByCountry = {
  countries: [
    { country_iso2: 'BD', country_name: 'Bangladesh', session_count: 42 },
    { country_iso2: 'PK', country_name: 'Pakistan', session_count: 28 },
  ],
  total_sessions: 70,
};

export const mockUsers = {
  users: [
    {
      id: 1,
      telegram_id: 123456789,
      username: 'alexuser',
      first_name: 'Alex',
      photo_url: null,
      balance: 125.50,
      is_banned: false,
      sessions_count: 2,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-03-01T15:30:00Z',
    },
  ],
  total: 1,
  page: 1,
  per_page: 50,
};
