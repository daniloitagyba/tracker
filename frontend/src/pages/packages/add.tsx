import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Link,
  Snackbar,
  Alert,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useAddPackage } from '../../hooks/useAddPackage';
import { useSnackbar } from '../../hooks/useSnackbar';
import { CarrierSelector } from '../../components/packages/CarrierSelector';
import { TrackingCodeVisualizer } from '../../components/packages/TrackingCodeVisualizer';

export function AddPackagePage() {
  const navigate = useNavigate();
  const { snackbar, showSuccess, showError, closeSnackbar } = useSnackbar();
  const {
    selectedCarrier,
    setSelectedCarrier,
    title,
    setTitle,
    trackingCode,
    isLoading,
    isValidTrackingCode,
    handleTrackingCodeChange,
    handlePaste,
    submit,
  } = useAddPackage();

  const handleSubmit = () => {
    if (!title.trim()) {
      showError('Informe um título para a encomenda');
      return;
    }
    if (!isValidTrackingCode) {
      showError('Código de rastreio inválido');
      return;
    }

    submit({
      onSuccess: () => {
        showSuccess('Encomenda adicionada com sucesso!');
        setTimeout(() => navigate('/packages'), 1000);
      },
      onError: () => {
        showError('Erro ao adicionar encomenda');
      },
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        pb: 4,
      }}
    >
      {/* Header */}
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
            Adicionar Rastreio
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
            Ver Dicas de Uso
          </Link>
        </Box>
      </Box>

      <Box sx={{ px: 2, py: 3 }}>
        <CarrierSelector selected={selectedCarrier} onSelect={setSelectedCarrier} />

        {/* Title */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <EditRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Título da Encomenda
            </Typography>
          </Box>
          <TextField
            fullWidth
            placeholder="Ex: Presente de aniversário"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper',
              },
            }}
          />
        </Box>

        {/* Tracking code */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LanguageRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Código de Rastreio
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

          <TrackingCodeVisualizer trackingCode={trackingCode} />
        </Box>
      </Box>

      {/* Submit */}
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
          {isLoading ? 'Adicionando...' : 'Adicionar Rastreio'}
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
