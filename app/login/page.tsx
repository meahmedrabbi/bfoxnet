'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Tab,
  Tabs,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const theme = useTheme();
  const router = useRouter();
  const { loginWithCredentials, register, isLoading, error, clearError } = useAuthStore();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    firstName: '',
  });
  const [registerError, setRegisterError] = useState<string | null>(null);

  const handleTabChange = (_: React.SyntheticEvent, value: 'login' | 'register') => {
    setTab(value);
    clearError();
    setRegisterError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await loginWithCredentials(loginForm.email, loginForm.password);
    if (ok) router.replace('/');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }
    const ok = await register({
      email: registerForm.email,
      password: registerForm.password,
      username: registerForm.username || undefined,
      firstName: registerForm.firstName || undefined,
    });
    if (ok) router.replace('/');
  };

  const brandGradient = `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)'
          : 'linear-gradient(135deg, #e8eaf6 0%, #f3e5f5 50%, #e3f2fd 100%)',
        p: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 440 }}>
        {/* Brand header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: 3,
              background: brandGradient,
              mb: 2,
              boxShadow: `0 8px 24px ${theme.palette.primary.main}40`,
            }}
          >
            <Typography sx={{ fontSize: 28, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>
              B
            </Typography>
          </Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              background: brandGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
            }}
          >
            BFoxNet
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {tab === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </Typography>
        </Box>

        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(10px)',
            background: theme.palette.mode === 'dark'
              ? 'rgba(30,30,48,0.9)'
              : 'rgba(255,255,255,0.95)',
          }}
        >
          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: `1px solid ${theme.palette.divider}`,
              '& .MuiTab-root': { fontWeight: 700, py: 2 },
            }}
          >
            <Tab label="Sign In" value="login" />
            <Tab label="Register" value="register" />
          </Tabs>

          <CardContent sx={{ p: 3 }}>
            {/* ── Login Tab ── */}
            {tab === 'login' && (
              <Box component="form" onSubmit={handleLogin} noValidate>
                {error && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={clearError}>
                    {error}
                  </Alert>
                )}
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  autoComplete="email"
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" size="small">
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isLoading || !loginForm.email || !loginForm.password}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 700,
                    background: brandGradient,
                    '&:hover': { opacity: 0.9 },
                  }}
                >
                  {isLoading ? 'Signing in…' : 'Sign In'}
                </Button>

                <Divider sx={{ my: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Don&apos;t have an account?
                  </Typography>
                </Divider>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleTabChange({} as React.SyntheticEvent, 'register')}
                  sx={{ borderRadius: 2, fontWeight: 600 }}
                >
                  Create Account
                </Button>
              </Box>
            )}

            {/* ── Register Tab ── */}
            {tab === 'register' && (
              <Box component="form" onSubmit={handleRegister} noValidate>
                {(error || registerError) && (
                  <Alert
                    severity="error"
                    sx={{ mb: 2, borderRadius: 2 }}
                    onClose={() => { clearError(); setRegisterError(null); }}
                  >
                    {registerError ?? error}
                  </Alert>
                )}
                <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={registerForm.firstName}
                    onChange={(e) => setRegisterForm((f) => ({ ...f, firstName: e.target.value }))}
                    autoComplete="given-name"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Username"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm((f) => ({ ...f, username: e.target.value }))}
                    autoComplete="username"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>@</Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  autoComplete="email"
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  autoComplete="new-password"
                  helperText="Minimum 8 characters"
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" size="small">
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  required
                  autoComplete="new-password"
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={
                    isLoading ||
                    !registerForm.email ||
                    !registerForm.password ||
                    !registerForm.confirmPassword
                  }
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 700,
                    background: brandGradient,
                    '&:hover': { opacity: 0.9 },
                  }}
                >
                  {isLoading ? 'Creating account…' : 'Create Account'}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
          © {new Date().getFullYear()} BFoxNet. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
