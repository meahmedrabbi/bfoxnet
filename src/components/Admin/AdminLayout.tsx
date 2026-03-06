/**
 * AdminLayout component - responsive admin panel layout.
 * Permanent sidebar on desktop, hamburger drawer + bottom nav on mobile.
 */
'use client';

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Avatar,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Public as PublicIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Science as ScienceIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  Campaign as CampaignIcon,
  Storage as StorageIcon,
  SupportAgent as SupportIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  AccountBalanceWallet as WithdrawalsIcon,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { useThemeMode } from '@/context/ThemeContext';

const DRAWER_WIDTH = 260;
const BOTTOM_NAV_HEIGHT = 56;

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  showInBottomNav?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/admin', showInBottomNav: true },
  { label: 'Countries', icon: <PublicIcon />, path: '/admin/countries', showInBottomNav: true },
  { label: 'Users', icon: <PeopleIcon />, path: '/admin/users', showInBottomNav: true },
  { label: 'Sessions', icon: <StorageIcon />, path: '/admin/sessions', showInBottomNav: true },
  { label: 'Withdrawals', icon: <WithdrawalsIcon />, path: '/admin/withdrawals', showInBottomNav: false },
  { label: 'Support', icon: <SupportIcon />, path: '/admin/support', showInBottomNav: false },
  { label: 'Broadcast', icon: <CampaignIcon />, path: '/admin/broadcast', showInBottomNav: false },
  { label: 'Test Area', icon: <ScienceIcon />, path: '/admin/test-area', showInBottomNav: false },
  { label: 'Settings', icon: <SettingsIcon />, path: '/admin/settings', showInBottomNav: false },
];

const bottomNavItems = navItems.filter(item => item.showInBottomNav);

// BFoxNet Logo
const BFoxLogo: React.FC<{ size?: number; color?: string }> = ({ size = 32, color = '#0088cc' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill={color} />
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle"
      fill="white" fontSize="18" fontWeight="700" fontFamily="Inter, sans-serif">
      B
    </text>
  </svg>
);

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = 'Admin Panel' }) => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { darkMode, toggleDarkMode } = useThemeMode();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleNavigation = (path: string) => {
    router.push(path);
    setDrawerOpen(false);
  };

  const handleBack = () => router.push('/');

  const currentNavIndex = bottomNavItems.findIndex(item => pathname === item.path);

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 100%)`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <BFoxLogo size={36} color={theme.palette.primary.main} />
          <Box>
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.1}>
              BFoxNet
            </Typography>
            <Typography variant="caption" color="text.secondary" lineHeight={1.2}>
              Admin Panel
            </Typography>
          </Box>
        </Box>
        {isMobile && (
          <IconButton onClick={() => setDrawerOpen(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Nav Items */}
      <List sx={{ flex: 1, py: 1.5, px: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.25 }}>
              <ListItemButton
                selected={isActive}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 1.1,
                  '&.Mui-selected': {
                    bgcolor: theme.palette.primary.main,
                    color: '#fff',
                    '&:hover': { bgcolor: theme.palette.primary.dark },
                    '& .MuiListItemIcon-root': { color: '#fff' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: isActive ? '#fff' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: isActive ? 600 : 500, fontSize: '0.9rem' }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />
      {/* Footer actions */}
      <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ListItemButton
          onClick={handleBack}
          sx={{ borderRadius: 2, py: 1, flex: 1 }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <ArrowBackIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Back to App"
            primaryTypographyProps={{ fontWeight: 500, fontSize: '0.875rem' }}
          />
        </ListItemButton>
        <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
          <IconButton onClick={toggleDarkMode} size="small" sx={{ color: 'text.secondary' }}>
            {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Toolbar sx={{ minHeight: 56 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <BFoxLogo size={28} color={theme.palette.primary.main} />
              <Typography variant="h6" fontWeight={600} color="text.primary" fontSize="1rem">
                {title}
              </Typography>
            </Box>
            <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
              <IconButton onClick={toggleDarkMode} size="small" sx={{ color: 'text.secondary' }}>
                {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{ color: 'text.primary', ml: 0.5 }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      {/* Desktop Permanent Sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Temporary Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: '85%',
              maxWidth: DRAWER_WIDTH,
              bgcolor: 'background.paper',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          pt: { xs: 2, md: 3 },
          pb: { xs: `${BOTTOM_NAV_HEIGHT + 16}px`, md: 3 },
          mt: { xs: '56px', md: 0 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          overflow: 'auto',
        }}
      >
        {/* Desktop Title */}
        {!isMobile && (
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {title}
            </Typography>
            <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton onClick={toggleDarkMode} sx={{ color: 'text.secondary' }}>
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        )}
        {children}
      </Box>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.appBar,
            borderTop: `1px solid ${theme.palette.divider}`,
            borderRadius: 0,
          }}
          elevation={0}
        >
          <BottomNavigation
            value={currentNavIndex >= 0 ? currentNavIndex : -1}
            onChange={(_, newValue) => {
              if (newValue >= 0 && newValue < bottomNavItems.length) {
                handleNavigation(bottomNavItems[newValue].path);
              }
            }}
            sx={{
              height: BOTTOM_NAV_HEIGHT,
              bgcolor: 'background.paper',
              '& .MuiBottomNavigationAction-root.Mui-selected': {
                color: theme.palette.primary.main,
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.625rem',
                fontWeight: 500,
                '&.Mui-selected': { fontSize: '0.625rem', fontWeight: 600 },
              },
            }}
            showLabels
          >
            {bottomNavItems.map((item) => (
              <BottomNavigationAction
                key={item.path}
                label={item.label}
                icon={item.icon}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
};
