/**
 * Navbar component - top navigation bar with branding, navigation links,
 * dark mode toggle, and responsive hamburger menu for mobile.
 */
'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Home as HomeIcon,
  AccountCircle as AccountsIcon,
  Receipt as OrdersIcon,
  Paid as PricesIcon,
  SupportAgent as SupportIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { useThemeMode } from '@/context/ThemeContext';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';

const DRAWER_WIDTH = 260;

interface NavLink {
  label: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const navLinks: NavLink[] = [
  { label: 'Home', path: '/', icon: <HomeIcon /> },
  { label: 'Accounts', path: '/accounts', icon: <AccountsIcon /> },
  { label: 'Orders', path: '/orders', icon: <OrdersIcon /> },
  { label: 'Prices', path: '/priced', icon: <PricesIcon /> },
  { label: 'Support', path: '/support', icon: <SupportIcon /> },
  { label: 'Admin', path: '/admin', icon: <AdminIcon />, adminOnly: true },
];

// BFoxNet Logo SVG
const BFoxLogo: React.FC<{ size?: number; color?: string }> = ({ size = 32, color = '#0088cc' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill={color} />
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle"
      fill="white" fontSize="18" fontWeight="700" fontFamily="Inter, sans-serif">
      B
    </text>
  </svg>
);

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { darkMode, toggleDarkMode } = useThemeMode();
  const { isAdmin } = useAdmin();
  const { isAuthenticated } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const visibleLinks = navLinks.filter(link => {
    if (link.adminOnly) return isAdmin;
    return true;
  });

  const handleNav = (path: string) => {
    router.push(path);
    setDrawerOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const drawerContent = (
    <Box sx={{ width: DRAWER_WIDTH, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Drawer Header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <BFoxLogo size={36} color={theme.palette.primary.main} />
          <Box>
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.1}>
              BFoxNet
            </Typography>
            <Typography variant="caption" color="text.secondary" lineHeight={1.2}>
              Account Platform
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={() => setDrawerOpen(false)}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Navigation Links */}
      <List sx={{ flex: 1, py: 1.5, px: 1 }}>
        {visibleLinks.map((link) => {
          const active = isActive(link.path);
          return (
            <ListItem key={link.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={active}
                onClick={() => handleNav(link.path)}
                sx={{
                  borderRadius: 2,
                  py: 1.25,
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    color: theme.palette.primary.main,
                    '& .MuiListItemIcon-root': { color: theme.palette.primary.main },
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.18) },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{link.icon}</ListItemIcon>
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{ fontWeight: active ? 600 : 500, fontSize: '0.9375rem' }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Theme toggle at bottom of drawer */}
      <Divider />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          {darkMode ? 'Dark Mode' : 'Light Mode'}
        </Typography>
        <IconButton onClick={toggleDarkMode} size="small">
          {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, md: 64 }, px: { xs: 2, md: 3 } }}>
          {/* Logo + Brand */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
            onClick={() => handleNav('/')}
          >
            <BFoxLogo size={32} color={theme.palette.primary.main} />
            <Typography
              variant="h6"
              fontWeight={700}
              color="text.primary"
              sx={{ letterSpacing: '-0.3px' }}
            >
              BFoxNet
            </Typography>
          </Box>

          {/* Desktop Nav Links */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 4, flex: 1 }}>
              {visibleLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Box
                    key={link.path}
                    onClick={() => handleNav(link.path)}
                    sx={{
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 1.5,
                      cursor: 'pointer',
                      fontWeight: active ? 600 : 500,
                      fontSize: '0.875rem',
                      color: active ? theme.palette.primary.main : theme.palette.text.secondary,
                      bgcolor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                      '&:hover': {
                        bgcolor: active
                          ? alpha(theme.palette.primary.main, 0.12)
                          : theme.palette.action.hover,
                        color: active ? theme.palette.primary.main : theme.palette.text.primary,
                      },
                      transition: 'all 0.15s ease',
                      userSelect: 'none',
                    }}
                  >
                    {link.label}
                  </Box>
                );
              })}
            </Box>
          )}

          <Box sx={{ flex: isMobile ? 1 : 'none' }} />

          {/* Right side actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {/* Dark Mode Toggle */}
            <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton onClick={toggleDarkMode} size="small" sx={{ color: 'text.secondary' }}>
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            {/* User Avatar (desktop) */}
            {!isMobile && isAuthenticated && (
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  ml: 0.5,
                  bgcolor: theme.palette.primary.main,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                }}
              >
                A
              </Avatar>
            )}

            {/* Hamburger (mobile only) */}
            {isMobile && (
              <IconButton
                size="small"
                sx={{ color: 'text.secondary', ml: 0.5 }}
                onClick={() => setDrawerOpen(true)}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { bgcolor: theme.palette.background.paper } }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};
