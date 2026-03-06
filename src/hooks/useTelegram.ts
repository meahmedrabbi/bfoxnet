/**
 * Custom hook for Telegram WebApp integration.
 */
import { useEffect, useState } from 'react';
import { 
  initTelegramWebApp, 
  getTelegramUser, 
  getTelegramColorScheme,
  TelegramWebApp,
  TelegramUser 
} from '@/lib/telegram';

export const useTelegram = () => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Initialize Telegram WebApp
    const tg = initTelegramWebApp();
    
    if (tg) {
      // Update state in a batch to avoid multiple renders
      setWebApp(tg);
      
      // Get user info
      const telegramUser = getTelegramUser();
      setUser(telegramUser);

      // Get color scheme
      const scheme = getTelegramColorScheme();
      setColorScheme(scheme);

      // Listen for theme changes
      const handleThemeChanged = () => {
        const newScheme = getTelegramColorScheme();
        setColorScheme(newScheme);
      };

      tg.onEvent('themeChanged', handleThemeChanged);

      return () => {
        tg.offEvent('themeChanged', handleThemeChanged);
      };
    } else {
      setWebApp(null);
    }
  }, []);

  return {
    webApp,
    user,
    colorScheme,
    isReady: !!webApp,
  };
};
