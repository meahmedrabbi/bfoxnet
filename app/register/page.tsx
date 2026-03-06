'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  useTheme,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { useAuthStore } from '@/store/authStore';

export default function RegisterPage() {
  const theme = useTheme();
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    firstName: '',
  });
  const [registerError, setRegisterError] = useState<string | null>(null);

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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
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
              width: 56,
              height: 56,
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              mb: 2,
            }}
          >
            <Typography sx={{ fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>
              B
            </Typography>
          </Box>
          <Typography
            variant="h4"
            fontWeight={800}
            color="text.primary"
            sx={{ letterSpacing: '-0.5px' }}
          >
            BFoxNet
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Create a new account
          </Typography>
        </Box>

        <Card
          elevation={0}
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleRegister} noValidate>
              {(error || registerError) && (
                <Alert
                  severity="error"
                  sx={{ mb: 2 }}
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
                  registerForm.password.length < 8 ||
                  !registerForm.confirmPassword
                }
                sx={{ py: 1.5, fontWeight: 700 }}
              >
                {isLoading ? 'Creating account…' : 'Create Account'}
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2.5 }}>
              Already have an account?{' '}
              <Typography
                component={Link}
                href="/login"
                variant="body2"
                color="primary"
                fontWeight={600}
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Sign In
              </Typography>
            </Typography>
          </CardContent>
        </Card>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
          © {new Date().getFullYear()} BFoxNet. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
