import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import type { Package } from '../../types';

interface PackageFormData {
  description: string;
  trackingCode: string;
}

interface PackageFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PackageFormData) => void;
  initialData?: Package | null;
  isLoading?: boolean;
}

export const PackageForm = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: PackageFormProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PackageFormData>({
    defaultValues: {
      description: initialData?.description || '',
      trackingCode: initialData?.trackingCode || '',
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (data: PackageFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>
        {initialData ? 'Editar Encomenda' : 'Nova Encomenda'}
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Controller
              name="description"
              control={control}
              rules={{ required: 'Descrição é obrigatória' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Descrição"
                  placeholder="Ex: iPhone 15 da Amazon"
                  fullWidth
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  autoFocus
                />
              )}
            />

            <Controller
              name="trackingCode"
              control={control}
              rules={{ 
                required: 'Código de rastreio é obrigatório',
                minLength: {
                  value: 5,
                  message: 'Código deve ter pelo menos 5 caracteres',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Código de Rastreio"
                  placeholder="Ex: AA361812099BR"
                  fullWidth
                  error={!!errors.trackingCode}
                  helperText={errors.trackingCode?.message}
                  inputProps={{
                    style: { fontFamily: 'monospace' },
                  }}
                />
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? 'Salvando...' : initialData ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

