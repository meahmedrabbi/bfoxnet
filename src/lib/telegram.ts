/**
 * Telegram WebApp utilities.
 * Handles integration with Telegram Mini App SDK.
 */

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    query_id?: string;
    auth_date?: number;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    setParams: (params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  onEvent: (eventType: string, callback: () => void) => void;
  offEvent: (eventType: string, callback: () => void) => void;
  sendData: (data: string) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  showPopup: (params: {
    title?: string;
    message: string;
    buttons?: Array<{ type?: string; text?: string; id?: string }>;
  }, callback?: (buttonId: string) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
}

/**
 * Check if running inside Telegram WebApp
 */
export const isTelegramWebApp = (): boolean => {
  const isAvailable = typeof window !== 'undefined' && !!window.Telegram?.WebApp;
  console.log('[telegram] isTelegramWebApp:', isAvailable);
  return isAvailable;
};

/**
 * Get Telegram WebApp instance
 */
export const getTelegramWebApp = (): TelegramWebApp | null => {
  if (typeof window === 'undefined') {
    console.log('[telegram] getTelegramWebApp: window is undefined');
    return null;
  }
  const webApp = (window.Telegram?.WebApp as TelegramWebApp) || null;
  console.log('[telegram] getTelegramWebApp:', !!webApp);
  return webApp;
};

/**
 * Initialize Telegram WebApp
 */
export const initTelegramWebApp = (): TelegramWebApp | null => {
  console.log('[telegram] initTelegramWebApp called');
  const tg = getTelegramWebApp();
  if (tg) {
    console.log('[telegram] Telegram WebApp initialized, calling ready() and expand()');
    tg.ready();
    tg.expand();
    return tg;
  }
  console.log('[telegram] Telegram WebApp not available');
  return null;
};

/**
 * Get init data for authentication
 */
export const getTelegramInitData = (): string | null => {
  const tg = getTelegramWebApp();
  const initData = tg?.initData || null;
  console.log('[telegram] getTelegramInitData:', initData ? `present (${initData.length} chars)` : 'null');
  return initData;
};

/**
 * Get current user from Telegram
 */
export const getTelegramUser = (): TelegramUser | null => {
  const tg = getTelegramWebApp();
  return tg?.initDataUnsafe?.user || null;
};

/**
 * Get color scheme (light/dark)
 */
export const getTelegramColorScheme = (): 'light' | 'dark' => {
  const tg = getTelegramWebApp();
  return tg?.colorScheme || 'light';
};

/**
 * Show Telegram alert
 */
export const showTelegramAlert = (message: string, callback?: () => void): void => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.showAlert(message, callback);
  } else {
    alert(message);
    callback?.();
  }
};

/**
 * Show Telegram confirm dialog
 */
export const showTelegramConfirm = (message: string, callback?: (confirmed: boolean) => void): void => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.showConfirm(message, callback);
  } else {
    const confirmed = confirm(message);
    callback?.(confirmed);
  }
};

/**
 * Trigger haptic feedback
 */
export const triggerHaptic = (type: 'impact' | 'notification' | 'selection', style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'error' | 'success' | 'warning'): void => {
  const tg = getTelegramWebApp();
  if (tg?.HapticFeedback) {
    if (type === 'impact') {
      tg.HapticFeedback.impactOccurred((style as 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') || 'medium');
    } else if (type === 'notification') {
      tg.HapticFeedback.notificationOccurred((style as 'error' | 'success' | 'warning') || 'success');
    } else if (type === 'selection') {
      tg.HapticFeedback.selectionChanged();
    }
  }
};

/**
 * Close Telegram WebApp
 */
export const closeTelegramWebApp = (): void => {
  const tg = getTelegramWebApp();
  tg?.close();
};

// Make Telegram available globally
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}
