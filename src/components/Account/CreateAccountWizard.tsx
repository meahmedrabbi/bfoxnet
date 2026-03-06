/**
 * CreateAccountWizard component - step-by-step Telegram account creation.
 * Implements proper Telegram-like login flow:
 * 1. Submit phone number → Backend sends verification code
 * 2. Submit verification code → Check if 2FA is needed
 * 3. Submit 2FA password (only if required)
 */
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Typography,
  Alert,
} from '@mui/material';
import { useAccounts } from '@/hooks/useAccounts';
import { CreateAccountData } from '@/types';
import { triggerHaptic } from '@/lib/telegram';
import { telegramApi } from '@/lib/api';

interface CreateAccountWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateAccountWizard: React.FC<CreateAccountWizardProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { createAccount } = useAccounts();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needs2FA, setNeeds2FA] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateAccountData>({
    session_name: '',
    phone: '',
    api_id: 0,
    api_hash: '',
    phone_code: '',
    phone_code_hash: undefined,
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'cancel' | 'back' | null>(null);

  const handleChange = (field: keyof CreateAccountData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'api_id' ? parseInt(event.target.value) || 0 : event.target.value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    // Clear general error message
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\+?\d{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Invalid phone number format';
      }
    } else if (step === 1) {
      if (!formData.phone_code || !formData.phone_code.trim()) {
        newErrors.phone_code = 'Verification code is required';
      }
    } else if (step === 2) {
      if (!formData.password || !formData.password.trim()) {
        newErrors.password = '2FA password is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneSubmit = async () => {
    if (!validateStep(0)) {
      triggerHaptic('notification', 'error');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Try to send code by calling backend with phone only
      const response = await createAccount({
        ...formData,
        phone_code: '', // No code yet
        phone_code_hash: undefined, // No hash yet
        password: '',
      });
      
      const data = response.data;
      
      // Check if response is pending (needs code)
      if ('status' in data && data.status === 'pending_code') {
        // Store the phone_code_hash and session_name for next step
        // session_id format is 'session_{session_name}'
        const sessionName = data.session_name || '';
        setCurrentSessionId(sessionName ? `session_${sessionName}` : null);
        setFormData(prev => ({
          ...prev,
          phone_code_hash: data.phone_code_hash || '',
          session_name: sessionName,
        }));
        triggerHaptic('selection');
        setActiveStep(1); // Move to verification code step
      } else {
        // Unexpected: session created on first call (rare but possible if already authorized)
        triggerHaptic('notification', 'success');
        onSuccess?.();
        handleClose();
      }
    } catch (error: any) {
      const errMsg = error?.response?.data?.error || error?.response?.data?.detail || 'Failed to send verification code';
      setErrorMessage(errMsg);
      triggerHaptic('notification', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeSubmit = async () => {
    if (!validateStep(1)) {
      triggerHaptic('notification', 'error');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Submit phone + verification code + phone_code_hash
      const response = await createAccount({
        ...formData,
        password: '', // No password yet
      });
      
      const data = response.data;
      
      // Check if 2FA is required
      if ('status' in data && data.status === 'pending_2fa') {
        setNeeds2FA(true);
        triggerHaptic('selection');
        setActiveStep(2); // Move to 2FA password step
      } else {
        // Success! Account created
        triggerHaptic('notification', 'success');
        onSuccess?.();
        handleClose();
      }
    } catch (error: any) {
      const errMsg = error?.response?.data?.error || error?.response?.data?.detail || 'Verification failed';
      setErrorMessage(errMsg);
      triggerHaptic('notification', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handle2FASubmit = async () => {
    if (!validateStep(2)) {
      triggerHaptic('notification', 'error');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Submit phone + code + password
      await createAccount(formData);
      
      // Success!
      triggerHaptic('notification', 'success');
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      const errMsg = error?.response?.data?.error || error?.response?.data?.detail || 'Authentication failed';
      setErrorMessage(errMsg);
      triggerHaptic('notification', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackWithConfirmation = () => {
    // Show confirmation dialog if we're past step 0 (OTP has been sent)
    if (activeStep > 0) {
      setConfirmAction('back');
      setShowConfirmDialog(true);
    } else {
      handleBack();
    }
  };

  const handleCloseWithConfirmation = () => {
    // Show confirmation dialog if we're past step 0 (OTP has been sent)
    if (activeStep > 0) {
      setConfirmAction('cancel');
      setShowConfirmDialog(true);
    } else {
      handleClose();
    }
  };

  const handleConfirmAction = async () => {
    setShowConfirmDialog(false);
    if (confirmAction === 'back') {
      // When going back, we keep the session alive - user might continue
      handleBack();
    } else if (confirmAction === 'cancel') {
      // When canceling, clean up the session from storage
      await handleCloseAndCleanup();
    }
    setConfirmAction(null);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const handleBack = () => {
    triggerHaptic('selection');
    setActiveStep((prev) => prev - 1);
    setErrorMessage('');
  };

  const handleCloseAndCleanup = async () => {
    // Clean up the session from storage if we have an active session
    if (currentSessionId) {
      try {
        await telegramApi.closeSession(currentSessionId);
      } catch {
        // Ignore errors - session might already be closed
      }
    }
    handleClose();
  };

  const handleClose = () => {
    setActiveStep(0);
    setNeeds2FA(false);
    setCurrentSessionId(null);
    setFormData({
      session_name: '',
      phone: '',
      api_id: 0,
      api_hash: '',
      phone_code: '',
      phone_code_hash: undefined,
      password: '',
    });
    setErrors({});
    setErrorMessage('');
    setShowConfirmDialog(false);
    setConfirmAction(null);
    onClose();
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Enter your phone number with country code. We'll send you a verification code via Telegram.
            </Typography>
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange('phone')}
              error={!!errors.phone}
              helperText={errors.phone || 'Include country code (e.g., +1234567890)'}
              margin="normal"
              autoFocus
              disabled={isSubmitting}
            />
          </>
        );

      case 1:
        return (
          <>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Enter the verification code sent to your Telegram app
            </Typography>
            <TextField
              fullWidth
              label="Verification Code"
              value={formData.phone_code}
              onChange={handleChange('phone_code')}
              error={!!errors.phone_code}
              helperText={errors.phone_code || '5-digit code from Telegram'}
              margin="normal"
              autoFocus
              disabled={isSubmitting}
            />
          </>
        );

      case 2:
        return (
          <>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Your account has Two-Factor Authentication enabled. Please enter your password.
            </Typography>
            <TextField
              fullWidth
              label="2FA Password"
              type="password"
              value={formData.password}
              onChange={handleChange('password')}
              error={!!errors.password}
              helperText={errors.password || 'Enter your cloud password'}
              margin="normal"
              autoFocus
              disabled={isSubmitting}
            />
          </>
        );

      default:
        return null;
    }
  };

  const handleNextStep = () => {
    if (activeStep === 0) {
      handlePhoneSubmit();
    } else if (activeStep === 1) {
      handleCodeSubmit();
    } else if (activeStep === 2) {
      handle2FASubmit();
    }
  };

  const getButtonText = () => {
    if (activeStep === 0) return 'Send Code';
    if (activeStep === 1) return 'Verify';
    if (activeStep === 2) return 'Add Account';
    return 'Next';
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={(event, reason) => {
          // Prevent closing on backdrop click or escape key during submission
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            if (!isSubmitting) {
              handleCloseWithConfirmation();
            }
            return;
          }
          handleCloseWithConfirmation();
        }}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Add Telegram Account</DialogTitle>
        <DialogContent>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Box sx={{ minHeight: 150, mt: 2 }}>
            {renderStepContent(activeStep)}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWithConfirmation} disabled={isSubmitting}>
            Cancel
          </Button>
          {activeStep > 0 && (
            <Button onClick={handleBackWithConfirmation} disabled={isSubmitting}>
              Back
            </Button>
          )}
          <Button
            onClick={handleNextStep}
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : getButtonText()}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation dialog for canceling or going back during verification */}
      <Dialog
        open={showConfirmDialog}
        onClose={handleCancelConfirmation}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {confirmAction === 'cancel' ? 'Cancel Verification?' : 'Go Back?'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {confirmAction === 'cancel'
              ? 'Verification is in progress. Are you sure you want to cancel? You can try again later with the same number.'
              : 'Going back will reset the current verification step. Are you sure you want to go back?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelConfirmation}>
            Continue Verification
          </Button>
          <Button onClick={handleConfirmAction} color="error">
            {confirmAction === 'cancel' ? 'Yes, Cancel' : 'Yes, Go Back'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
