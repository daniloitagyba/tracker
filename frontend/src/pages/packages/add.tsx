import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreate } from '@refinedev/core';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Link,
  LinearProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import type { Package, CarrierType } from '../../types';

interface CarrierOption {
  id: CarrierType;
  name: string;
  country: string;
  icon: React.ReactNode;
}

const carriers: CarrierOption[] = [
  {
    id: 'correios',
    name: 'Correios',
    country: 'Brazil',
    icon: <Box component="span" sx={{ fontSize: '1.2rem' }}>🇧🇷</Box>,
  },
];

const TRACKING_CODE_MAX_LENGTH = 13;

export function AddPackagePage() {
  const navigate = useNavigate();
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierType>('correios');
  const [title, setTitle] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { mutate: createPackage, isLoading } = useCreate<Package>();

  const formatTrackingCode = (value: string): string => {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, TRACKING_CODE_MAX_LENGTH);
  };

  const handleTrackingCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTrackingCode(e.target.value);
    setTrackingCode(formatted);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const formatted = formatTrackingCode(text);
      setTrackingCode(formatted);
    } catch {
      
    }
  };

  const isValidTrackingCode = trackingCode.length === TRACKING_CODE_MAX_LENGTH;

  const handleSubmit = () => {
    if (!title.trim()) {
      setSnackbar({ open: true, message: 'Enter a title for the package', severity: 'error' });
      return;
    }
    if (!isValidTrackingCode) {
      setSnackbar({ open: true, message: 'Invalid tracking code', severity: 'error' });
      return;
    }

    createPackage(
      {
        resource: 'packages',
        values: {
          description: title,
          trackingCode,
          carrier: selectedCarrier,
        },
        invalidates: ['list'],
      },
      {
        onSuccess: () => {
          setSnackbar({ open: true, message: 'Package added successfully!', severity: 'success' });
          setTimeout(() => navigate('/packages'), 1000);
        },
        onError: () => {
          setSnackbar({ open: true, message: 'Error adding package', severity: 'error' });
        },
      }
    );
  };

  const getTrackingCodeParts = () => {
    const letters1 = trackingCode.slice(0, 2);
    const numbers = trackingCode.slice(2, 11);
    const letters2 = trackingCode.slice(11, 13);
    return { letters1, numbers, letters2 };
  };

  const parts = getTrackingCodeParts();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        pb: 4,
      }}
    >
      {}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 2,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <IconButton onClick={() => navigate('/packages')} sx={{ color: 'text.primary' }}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Add Tracking
          </Typography>
          <Link
            href="#"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: 'primary.main',
              textDecoration: 'none',
              fontSize: '0.875rem',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            <OpenInNewRoundedIcon sx={{ fontSize: 16 }} />
            See Usage Tips
          </Link>
        </Box>
      </Box>

      {}
      <Box sx={{ px: 2, py: 3 }}>
        {}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LocalShippingRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Carrier
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {carriers.map((carrier) => (
              <Box
                key={carrier.id}
                onClick={() => setSelectedCarrier(carrier.id)}
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1.5,
                  py: 1.5,
                  px: 2,
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: selectedCarrier === carrier.id ? 'primary.main' : 'background.paper',
                  border: '1px solid',
                  borderColor: selectedCarrier === carrier.id ? 'primary.main' : 'divider',
                  '&:hover': {
                    borderColor: selectedCarrier === carrier.id ? 'primary.main' : 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                {carrier.icon}
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: selectedCarrier === carrier.id ? 'white' : 'text.primary',
                  }}
                >
                  {carrier.name}
                  {selectedCarrier === carrier.id && ' ✓'}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <EditRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Package Title
            </Typography>
          </Box>
          <TextField
            fullWidth
            placeholder="Ex: Birthday gift"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper',
              },
            }}
          />
        </Box>

        {}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LanguageRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Tracking Code
            </Typography>
          </Box>
          <TextField
            fullWidth
            placeholder="Ex: AB123456789CD"
            value={trackingCode}
            onChange={handleTrackingCodeChange}
            InputProps={{
              endAdornment: (
                <IconButton onClick={handlePaste} size="small" sx={{ color: 'text.secondary' }}>
                  <ContentCopyRoundedIcon />
                </IconButton>
              ),
              sx: {
                fontFamily: '"JetBrains Mono", monospace',
                letterSpacing: '2px',
                fontSize: '1.1rem',
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper',
              },
            }}
          />

          {}
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: 'background.paper',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: parts.letters1.length > 0 ? 'primary.main' : 'text.secondary',
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  {parts.letters1 || 'AA'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  2 letters
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                〉
              </Typography>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: parts.numbers.length > 0 ? 'warning.main' : 'text.secondary',
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  {parts.numbers || '123456789'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  9 numbers
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                〉
              </Typography>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: parts.letters2.length > 0 ? 'secondary.main' : 'text.secondary',
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  {parts.letters2 || 'BB'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  2 letters
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={(trackingCode.length / TRACKING_CODE_MAX_LENGTH) * 100}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 2,
                    backgroundColor: isValidTrackingCode ? 'success.main' : 'primary.main',
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textAlign: 'right',
                  mt: 0.5,
                  color: 'text.secondary',
                }}
              >
                {trackingCode.length}/{TRACKING_CODE_MAX_LENGTH}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {}
      <Box sx={{ px: 2, position: 'fixed', bottom: 24, left: 0, right: 0 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={isLoading || !title.trim() || !isValidTrackingCode}
          startIcon={<AddRoundedIcon />}
          sx={{
            py: 1.75,
            fontSize: '1rem',
            fontWeight: 600,
            borderRadius: 3,
            backgroundColor: isLoading ? 'action.disabled' : 'grey.700',
            '&:hover': {
              backgroundColor: 'grey.600',
            },
            '&.Mui-disabled': {
              backgroundColor: 'grey.800',
              color: 'grey.500',
            },
          }}
        >
          {isLoading ? 'Adding...' : 'Add Tracking'}
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
