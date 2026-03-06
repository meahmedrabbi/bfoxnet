/**
 * Admin Export Logs Page - View history of session exports.
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
  TablePagination,
  Chip,
  Skeleton,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/Admin/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { adminSessionsApi, ExportLogResponse } from '@/lib/api';
import { triggerHaptic } from '@/lib/telegram';
import { getCountryFlag, formatFileSize } from '@/lib/country';

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AdminExportLogsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isAdmin, checkAdminStatus } = useAdmin();

  const [loading, setLoading] = useState(true);
  const [exports, setExports] = useState<ExportLogResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminSessionsApi.getExportLogs(page + 1, rowsPerPage);
      setExports(response.data.exports);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching export logs:', error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

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

  const handleBack = () => {
    router.push('/admin/sessions');
    triggerHaptic('impact', 'light');
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
    <AdminLayout title="Export Logs">
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={handleBack} size="small">
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Export Logs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {total} exports
              </Typography>
            </Box>
          </Box>
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

        {/* Export logs table */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Country</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>Sessions</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>File</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>Size</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Admin TG ID</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton width={60} /></TableCell>
                        <TableCell align="right"><Skeleton width={30} /></TableCell>
                        <TableCell><Skeleton width={180} /></TableCell>
                        <TableCell align="right"><Skeleton width={50} /></TableCell>
                        <TableCell><Skeleton width={80} /></TableCell>
                        <TableCell><Skeleton width={120} /></TableCell>
                      </TableRow>
                    ))
                  ) : exports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary" sx={{ py: 4 }}>
                          No exports found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    exports.map((exportLog) => (
                      <TableRow key={exportLog.id} hover>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography fontSize="1rem">
                              {getCountryFlag(exportLog.country_iso2)}
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {exportLog.country_iso2}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          <Chip
                            label={exportLog.session_count}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'monospace',
                            }}
                          >
                            {exportLog.zip_filename}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          <Typography variant="caption">
                            {formatFileSize(exportLog.file_size_bytes)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Chip
                            label={exportLog.exported_by_telegram_id || 'N/A'}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(exportLog.created_at)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 20, 50]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </CardContent>
        </Card>
      </Box>
    </AdminLayout>
  );
}
