/**
 * Countries Management Page - Mobile-first admin design.
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
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  useTheme,
  useMediaQuery,
  Skeleton,
  Avatar,
  Pagination,
  alpha,
  Collapse,
  Divider,
  Fab,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Public as PublicIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon,
  Devices as DevicesIcon,
  Settings as SettingsIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { AdminLayout } from '@/components/Admin/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import {
  countriesApi,
  CountryResponse,
  CountryCreate,
  CountryUpdate,
  ApiTypeEnum,
  QualityPrices,
} from '@/lib/api';
import toast from 'react-hot-toast';
import { triggerHaptic } from '@/lib/telegram';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';

// Register English locale for i18n-iso-countries
countries.registerLocale(enLocale);

const API_TYPES: { value: ApiTypeEnum; label: string }[] = [
  { value: 'WINDOWS_OFFICIAL', label: 'Windows (Official)' },
  { value: 'ANDROID_OFFICIAL', label: 'Android (Official)' },
  { value: 'ANDROIDX_OFFICIAL', label: 'AndroidX (Official)' },
  { value: 'IOS_OFFICIAL', label: 'iOS (Official)' },
  { value: 'MACOS_OFFICIAL', label: 'MacOS (Official)' },
  { value: 'WINDOWS', label: 'Windows' },
  { value: 'ANDROID', label: 'Android' },
  { value: 'IOS', label: 'iOS' },
  { value: 'MACOS', label: 'MacOS' },
];
// Only SPAM and LIMIT - FREE uses base price
const QUALITY_TYPES_FOR_FORM: (keyof QualityPrices)[] = ['SPAM', 'LIMIT'];
const QUALITY_TYPES: (keyof QualityPrices)[] = ['FREE', 'SPAM', 'LIMIT'];

// Helper to get API type display label
const getApiTypeLabel = (value: ApiTypeEnum): string => {
  return API_TYPES.find(t => t.value === value)?.label || value;
};

// Default quality prices
const DEFAULT_QUALITY_PRICES: QualityPrices = {
  FREE: 0,
  SPAM: 0,
  LIMIT: 0,
};

// Quality type colors
const QUALITY_COLORS: Record<keyof QualityPrices, 'success' | 'warning' | 'error'> = {
  FREE: 'success',
  SPAM: 'warning',
  LIMIT: 'error',
};

// Quality type labels (shorter for compact form)
const QUALITY_LABELS: Record<keyof QualityPrices, string> = {
  FREE: 'Base/Free',
  SPAM: 'Spam',
  LIMIT: 'Limit',
};

// Get country name from ISO2 code using i18n-iso-countries library
const getCountryName = (iso2: string): string => {
  return countries.getName(iso2.toUpperCase(), 'en') || '';
};

interface CountryCardProps {
  country: CountryResponse;
  onEdit: (country: CountryResponse) => void;
  onDelete: (country: CountryResponse) => void;
}

const CountryCard: React.FC<CountryCardProps> = ({ country, onEdit, onDelete }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  
  // Get quality prices from country
  const qualityPrices = country.quality_price_percentage || DEFAULT_QUALITY_PRICES;

  return (
    <Card
      sx={{
        mb: 1.5,
        transition: 'all 0.2s ease',
        boxShadow: 1,
        '&:hover': {
          boxShadow: 2,
        },
      }}
    >
      <CardContent sx={{ p: 2, pb: '16px !important' }}>
        {/* Main Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 700,
              fontSize: '0.875rem',
            }}
          >
            {country.iso2}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '0.9375rem',
              }}
            >
              {country.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25, flexWrap: 'wrap' }}>
              {QUALITY_TYPES.map((type) => (
                <Chip
                  key={type}
                  label={`${type}: $${(qualityPrices[type] || 0).toFixed(2)}`}
                  size="small"
                  color={QUALITY_COLORS[type]}
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.625rem' }}
                />
              ))}
            </Box>
          </Box>

          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        {/* Expanded Details */}
        <Collapse in={expanded}>
          <Divider sx={{ my: 1.5 }} />

          {/* Quality Prices */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, fontWeight: 600 }}>
              Quality Prices
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {QUALITY_TYPES.map((type) => (
                <Box key={type} sx={{ textAlign: 'center', p: 1, borderRadius: 1, bgcolor: alpha(theme.palette[QUALITY_COLORS[type]].main, 0.1) }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {type}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette[QUALITY_COLORS[type]].main }}>
                    ${(qualityPrices[type] || 0).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Settings Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 1.5,
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Capacity
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {country.capacity || 0}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Claim Time
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                {country.claim_time || 0} min
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                API Type
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {getApiTypeLabel(country.api_type)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Proxy
              </Typography>
              <Chip
                label={country.is_proxy_enabled ? 'Enabled' : 'Disabled'}
                size="small"
                color={country.is_proxy_enabled ? 'success' : 'default'}
                sx={{ height: 22, mt: 0.25 }}
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Random Info
              </Typography>
              <Chip
                label={country.random_info_enabled ? 'Enabled' : 'Disabled'}
                size="small"
                color={country.random_info_enabled ? 'success' : 'default'}
                sx={{ height: 22, mt: 0.25 }}
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Contact Check
              </Typography>
              <Chip
                label={country.is_contact_permission_check ? 'Enabled' : 'Disabled'}
                size="small"
                color={country.is_contact_permission_check ? 'success' : 'default'}
                sx={{ height: 22, mt: 0.25 }}
              />
            </Box>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => onEdit(country)}
              sx={{ flex: 1 }}
            >
              Edit
            </Button>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(country)}
              sx={{
                bgcolor: alpha(theme.palette.error.main, 0.08),
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.15),
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

const CountryCardSkeleton: React.FC = () => {
  return (
    <Card sx={{ mb: 1.5 }}>
      <CardContent sx={{ p: 2, pb: '16px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Skeleton variant="circular" width={44} height={44} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="50%" height={24} />
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              <Skeleton width={60} height={20} sx={{ borderRadius: 4 }} />
              <Skeleton width={80} height={20} sx={{ borderRadius: 4 }} />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default function CountriesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { isAdmin, checkAdminStatus } = useAdmin();

  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<CountryResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(20);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<CountryResponse | null>(null);
  const [countryToDelete, setCountryToDelete] = useState<CountryResponse | null>(null);

  // Form state - quality_price_percentage is now a JSON object with prices for each quality type
  const [formData, setFormData] = useState<CountryCreate>({
    iso2: '',
    name: '',
    price: 0,
    quality_price_percentage: { ...DEFAULT_QUALITY_PRICES },
    capacity: 0,
    claim_time: 0,
    is_proxy_enabled: false,
    random_info_enabled: false,
    api_type: 'ANDROID_OFFICIAL',
    is_contact_permission_check: false,
  });

  const totalPages = Math.ceil(total / rowsPerPage);

  // Check admin status
  useEffect(() => {
    if (isAuthenticated) {
      checkAdminStatus();
    }
  }, [isAuthenticated, checkAdminStatus]);

  // Fetch countries
  const fetchCountries = useCallback(async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const response = await countriesApi.list(page, rowsPerPage);
      setCountries(response.data.countries);
      setTotal(response.data.total);
    } catch {
      toast.error('Failed to fetch countries');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, page, rowsPerPage]);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const handleOpenDialog = (country?: CountryResponse) => {
    if (country) {
      setEditingCountry(country);
      setFormData({
        iso2: country.iso2,
        name: country.name,
        price: country.quality_price_percentage?.FREE ?? country.price,
        quality_price_percentage: country.quality_price_percentage || { ...DEFAULT_QUALITY_PRICES },
        capacity: country.capacity || 0,
        claim_time: country.claim_time || 0,
        is_proxy_enabled: country.is_proxy_enabled,
        random_info_enabled: country.random_info_enabled,
        api_type: country.api_type,
        is_contact_permission_check: country.is_contact_permission_check,
      });
    } else {
      setEditingCountry(null);
      setFormData({
        iso2: '',
        name: '',
        price: 0,
        quality_price_percentage: { ...DEFAULT_QUALITY_PRICES },
        capacity: 0,
        claim_time: 0,
        is_proxy_enabled: false,
        random_info_enabled: false,
        api_type: 'ANDROID_OFFICIAL',
        is_contact_permission_check: false,
      });
    }
    setDialogOpen(true);
    triggerHaptic('impact', 'light');
  };

  // Handle ISO2 change - auto-fill country name
  const handleIso2Change = (value: string) => {
    const iso2 = value.toUpperCase().slice(0, 2);
    const countryName = getCountryName(iso2);
    setFormData({
      ...formData,
      iso2,
      name: countryName || formData.name,
    });
  };

  // Handle base price change - also updates FREE price
  const handleBasePriceChange = (value: number) => {
    setFormData({
      ...formData,
      price: value,
      quality_price_percentage: {
        ...(formData.quality_price_percentage || DEFAULT_QUALITY_PRICES),
        FREE: value,
      },
    });
  };

  // Handle quality price change for SPAM and LIMIT only
  const handleQualityPriceChange = (type: keyof QualityPrices, value: number) => {
    setFormData({
      ...formData,
      quality_price_percentage: {
        ...(formData.quality_price_percentage || DEFAULT_QUALITY_PRICES),
        [type]: value,
      },
    });
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCountry(null);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editingCountry) {
        const updateData: CountryUpdate = {
          name: formData.name,
          price: formData.price,
          quality_price_percentage: formData.quality_price_percentage,
          capacity: formData.capacity,
          claim_time: formData.claim_time,
          is_proxy_enabled: formData.is_proxy_enabled,
          random_info_enabled: formData.random_info_enabled,
          api_type: formData.api_type,
          is_contact_permission_check: formData.is_contact_permission_check,
        };
        await countriesApi.update(editingCountry.id, updateData);
        toast.success('Country updated');
      } else {
        await countriesApi.create(formData);
        toast.success('Country created');
      }
      triggerHaptic('notification', 'success');
      handleCloseDialog();
      fetchCountries();
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to save country');
      triggerHaptic('notification', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (country: CountryResponse) => {
    setCountryToDelete(country);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!countryToDelete) return;

    setLoading(true);
    try {
      await countriesApi.delete(countryToDelete.id);
      toast.success('Country deleted');
      triggerHaptic('notification', 'success');
      setDeleteDialogOpen(false);
      setCountryToDelete(null);
      fetchCountries();
    } catch {
      toast.error('Failed to delete country');
      triggerHaptic('notification', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
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
    <AdminLayout title="Countries">
      <Box sx={{ pb: 10 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: 'text.secondary' }}
          >
            {total} countries
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={fetchCountries}
              disabled={loading}
              size="small"
              sx={{
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': { bgcolor: 'background.paper' },
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
            {!isMobile && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add
              </Button>
            )}
          </Box>
        </Box>

        {/* Countries List */}
        {loading && countries.length === 0 ? (
          <>
            {[...Array(5)].map((_, i) => (
              <CountryCardSkeleton key={i} />
            ))}
          </>
        ) : countries.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <PublicIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">
              No countries found. Add your first country.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ mt: 2 }}
            >
              Add Country
            </Button>
          </Card>
        ) : (
          <>
            {countries.map((country) => (
              <CountryCard
                key={country.id}
                country={country}
                onEdit={handleOpenDialog}
                onDelete={handleDeleteClick}
              />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size={isMobile ? 'small' : 'medium'}
                  siblingCount={isMobile ? 0 : 1}
                />
              </Box>
            )}
          </>
        )}

        {/* Floating Add Button (Mobile) */}
        {isMobile && countries.length > 0 && (
          <Fab
            color="primary"
            aria-label="add country"
            onClick={() => handleOpenDialog()}
            sx={{
              position: 'fixed',
              bottom: 80,
              right: 16,
              zIndex: theme.zIndex.appBar + 1,
            }}
          >
            <AddIcon />
          </Fab>
        )}

        {/* Add/Edit Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
          PaperProps={{
            sx: isMobile ? {} : { borderRadius: 3, m: 2 },
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 2,
              px: 2.5,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  width: 40,
                  height: 40,
                }}
              >
                <PublicIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                  {editingCountry ? 'Edit Country' : 'Add Country'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {editingCountry ? `Editing ${editingCountry.name}` : 'Configure country settings'}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ px: 2.5, py: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Country Information Section */}
              <Card variant="outlined" sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PublicIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Country Information
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <TextField
                    label="ISO2 Code"
                    value={formData.iso2}
                    onChange={(e) => handleIso2Change(e.target.value)}
                    disabled={!!editingCountry}
                    inputProps={{ maxLength: 2, style: { textTransform: 'uppercase' } }}
                    required
                    size="small"
                    sx={{ width: 100 }}
                    helperText="2-letter code"
                  />
                  <TextField
                    label="Country Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    size="small"
                    sx={{ flex: 1 }}
                    helperText="Auto-fills from ISO2"
                  />
                </Box>
              </Card>

              {/* Pricing Section */}
              <Card variant="outlined" sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.02) }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{ 
                    width: 20, 
                    height: 20, 
                    borderRadius: '50%', 
                    bgcolor: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}>
                    $
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Pricing Configuration
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Base Price */}
                  <TextField
                    label="Base Price (FREE Quality)"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleBasePriceChange(parseFloat(e.target.value) || 0)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    inputProps={{ min: 0, step: 0.01 }}
                    size="small"
                    fullWidth
                    helperText="This price is used for FREE quality accounts"
                  />
                  {/* Quality Prices Grid */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    {QUALITY_TYPES_FOR_FORM.map((type) => (
                      <TextField
                        key={type}
                        label={`${QUALITY_LABELS[type]} Price`}
                        type="number"
                        value={(formData.quality_price_percentage as QualityPrices)?.[type] ?? 0}
                        onChange={(e) =>
                          handleQualityPriceChange(type, parseFloat(e.target.value) || 0)
                        }
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        inputProps={{ min: 0, step: 0.01 }}
                        size="small"
                        fullWidth
                      />
                    ))}
                  </Box>
                </Box>
              </Card>

              {/* Capacity & Claim Time Section */}
              <Card variant="outlined" sx={{ p: 2, bgcolor: alpha(theme.palette.secondary.main, 0.02) }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <ScheduleIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Capacity & Claim Time
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Capacity"
                    type="number"
                    value={formData.capacity || 0}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    inputProps={{ min: 0, step: 1 }}
                    size="small"
                    fullWidth
                    helperText="Maximum capacity for this country"
                  />
                  <TextField
                    label="Claim Time (Minutes)"
                    type="number"
                    value={formData.claim_time || 0}
                    onChange={(e) => setFormData({ ...formData, claim_time: parseInt(e.target.value) || 0 })}
                    inputProps={{ min: 0, step: 1 }}
                    size="small"
                    fullWidth
                  />
                </Box>
              </Card>

              {/* API Configuration Section */}
              <Card variant="outlined" sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.02) }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <DevicesIcon sx={{ fontSize: 20, color: 'info.main' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    API Configuration
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>API Type</InputLabel>
                    <Select
                      value={formData.api_type}
                      label="API Type"
                      onChange={(e) =>
                        setFormData({ ...formData, api_type: e.target.value as ApiTypeEnum })
                      }
                    >
                      {API_TYPES.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Card>

              {/* Feature Toggles Section */}
              <Card variant="outlined" sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.02) }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <SettingsIcon sx={{ fontSize: 20, color: 'warning.main' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Feature Toggles
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_proxy_enabled}
                        onChange={(e) =>
                          setFormData({ ...formData, is_proxy_enabled: e.target.checked })
                        }
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Proxy Enabled
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Use proxy for this country&apos;s connections
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, alignItems: 'flex-start' }}
                  />
                  <Divider />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.random_info_enabled}
                        onChange={(e) =>
                          setFormData({ ...formData, random_info_enabled: e.target.checked })
                        }
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Random Info
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Generate random information for accounts
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, alignItems: 'flex-start' }}
                  />
                  <Divider />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_contact_permission_check}
                        onChange={(e) =>
                          setFormData({ ...formData, is_contact_permission_check: e.target.checked })
                        }
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Contact Permission Check
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Verify contact permissions before processing
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, alignItems: 'flex-start' }}
                  />
                </Box>
              </Card>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button onClick={handleCloseDialog} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={loading || !formData.iso2 || !formData.name}
              startIcon={loading ? <CircularProgress size={16} /> : null}
            >
              {editingCountry ? 'Update Country' : 'Add Country'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3, m: 2 },
          }}
        >
          <DialogTitle 
            sx={{ 
              pb: 1.5,
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
                width: 40,
                height: 40,
              }}
            >
              <DeleteIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                Delete Country
              </Typography>
              <Typography variant="caption" color="text.secondary">
                This action cannot be undone
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 2.5 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Are you sure you want to delete{' '}
                <strong>
                  {countryToDelete?.name} ({countryToDelete?.iso2})
                </strong>
                ?
              </Typography>
            </Alert>
            <Typography variant="body2" color="text.secondary">
              This will remove all pricing and configuration data for this country.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <DeleteIcon />}
            >
              Delete Country
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}
