'use client';
import { useState } from 'react';
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
  useTheme,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';

export default function ResetPasswordPage() {
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to send reset link');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            Reset your password
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
            {success ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  If an account with that email exists, a password reset link has been sent.
                </Alert>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Please check your email inbox and follow the instructions to reset your password.
                </Typography>
                <Button
                  component={Link}
                  href="/login"
                  variant="contained"
                  fullWidth
                  sx={{ py: 1.5, fontWeight: 700 }}
                >
                  Back to Sign In
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit} noValidate>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </Typography>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isLoading || !email || !email.includes('@')}
                  sx={{ py: 1.5, fontWeight: 700 }}
                >
                  {isLoading ? 'Sending…' : 'Send Reset Link'}
                </Button>
              </Box>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2.5 }}>
              Remember your password?{' '}
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
