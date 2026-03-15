import { Box, Typography } from '@mui/material';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import type { CarrierType } from '../../types';

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
    country: 'Brasil',
    icon: <Box component="span" sx={{ fontSize: '1.2rem' }}>🇧🇷</Box>,
  },
];

interface CarrierSelectorProps {
  selected: CarrierType;
  onSelect: (carrier: CarrierType) => void;
}

export function CarrierSelector({ selected, onSelect }: CarrierSelectorProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <LocalShippingRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Transportadora
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        {carriers.map((carrier) => (
          <Box
            key={carrier.id}
            onClick={() => onSelect(carrier.id)}
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
              backgroundColor: selected === carrier.id ? 'primary.main' : 'background.paper',
              border: '1px solid',
              borderColor: selected === carrier.id ? 'primary.main' : 'divider',
              '&:hover': {
                borderColor: selected === carrier.id ? 'primary.main' : 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            {carrier.icon}
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: selected === carrier.id ? 'white' : 'text.primary',
              }}
            >
              {carrier.name}
              {selected === carrier.id && ' ✓'}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
