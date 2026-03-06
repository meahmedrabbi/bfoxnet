/**
 * Admin Sessions Page - Session export management with country overview.
 */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  useTheme,
  Skeleton,
  Snackbar,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FileDownload as ExportIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/Admin/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { adminSessionsApi, CountrySessionCountResponse } from '@/lib/api';
import { triggerHaptic } from '@/lib/telegram';
import { getCountryFlag } from '@/lib/country';

export default function AdminSessionsPage() {
  const router = useRouter();
  const theme = useTheme();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isAdmin, checkAdminStatus } = useAdmin();

  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<CountrySessionCountResponse[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountrySessionCountResponse | null>(null);
  const [exportQuantity, setExportQuantity] = useState('');
  const [exporting, setExporting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminSessionsApi.getCountsByCountry();
      setCountries(response.data.countries);
      setTotalSessions(response.data.total_sessions);
    } catch (error) {
      console.error('Error fetching session counts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      checkAdminStatus();
    }
  }, [isAuthenticated, checkAdminStatus]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, fetchData]);

  const handleRefresh = () => {
    fetchData();
    triggerHaptic('impact', 'light');
  };

  const handleOpenExportDialog = (country: CountrySessionCountResponse) => {
    setSelectedCountry(country);
    setExportQuantity(country.session_count.toString());
    setExportDialogOpen(true);
    triggerHaptic('impact', 'light');
  };

  const handleCloseExportDialog = () => {
    setExportDialogOpen(false);
    setSelectedCountry(null);
    setExportQuantity('');
  };

  const handleExport = async () => {
    if (!selectedCountry || !exportQuantity) return;

    const quantity = parseInt(exportQuantity, 10);
    if (isNaN(quantity) || quantity < 1 || quantity > selectedCountry.session_count) {
      setSnackbar({
        open: true,
        message: `Please enter a valid quantity (1-${selectedCountry.session_count})`,
        severity: 'error',
      });
      return;
    }

    try {
      setExporting(true);
      const response = await adminSessionsApi.exportSessions({
        country_iso2: selectedCountry.country_iso2,
        quantity,
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: `Successfully exported ${response.data.session_count} sessions. Check your Telegram for the file.`,
          severity: 'success',
        });
        handleCloseExportDialog();
        fetchData(); // Refresh the counts
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || 'Export failed',
          severity: 'error',
        });
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || 'Export failed',
        severity: 'error',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleNavigateToLogs = () => {
    router.push('/admin/sessions/export-logs');
    triggerHaptic('impact', 'light');
  };

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" p={2}>
        <Alert severity="warning" sx={{ maxWidth: 400 }}>
          <AlertTitle>Not Authenticated</AlertTitle>
          Sign in to access this page
        </Alert>
      </Box>
    );
  }

  if (isAdmin === null) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" gap={2}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Checking admin status...
        </Typography>
      </Box>
    );
  }

  if (!isAdmin) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" p={2}>
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          <AlertTitle>Access Denied</AlertTitle>
          You do not have admin privileges.
        </Alert>
      </Box>
    );
  }

  return (
    <AdminLayout title="Sessions">
      <Box>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Session Export
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalSessions} exportable sessions
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={handleNavigateToLogs}
              size="small"
              sx={{
                bgcolor: 'background.paper',
                boxShadow: 1,
              }}
            >
              <HistoryIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={handleRefresh}
              disabled={loading}
              size="small"
              sx={{
                bgcolor: 'background.paper',
                boxShadow: 1,
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Session counts by country */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Country</TableCell>
                    <TableCell align="right">Sessions</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton width={150} />
                        </TableCell>
                        <TableCell align="right">
                          <Skeleton width={50} />
                        </TableCell>
                        <TableCell align="center">
                          <Skeleton width={80} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : countries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography color="text.secondary" sx={{ py: 4 }}>
                          No exportable sessions found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    countries.map((country) => (
                      <TableRow key={country.country_iso2} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography fontSize="1.25rem">
                              {getCountryFlag(country.country_iso2)}
                            </Typography>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {country.country_iso2}
                              </Typography>
                              {country.country_name && (
                                <Typography variant="caption" color="text.secondary">
                                  {country.country_name}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={country.session_count}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<ExportIcon />}
                            onClick={() => handleOpenExportDialog(country)}
                            disabled={country.session_count === 0}
                          >
                            Export
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Export Dialog */}
        <Dialog open={exportDialogOpen} onClose={handleCloseExportDialog} maxWidth="xs" fullWidth>
          <DialogTitle>
            Export Sessions - {selectedCountry?.country_iso2}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Available: {selectedCountry?.session_count || 0} sessions
              </Typography>
              <TextField
                label="Quantity to Export"
                type="number"
                fullWidth
                value={exportQuantity}
                onChange={(e) => setExportQuantity(e.target.value)}
                inputProps={{
                  min: 1,
                  max: selectedCountry?.session_count || 1000,
                }}
                helperText="The zip file will be sent to your Telegram"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseExportDialog} disabled={exporting}>
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              variant="contained"
              disabled={exporting || !exportQuantity}
              startIcon={exporting ? <CircularProgress size={16} /> : <ExportIcon />}
            >
              {exporting ? 'Exporting...' : 'Export'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </AdminLayout>
  );
}
