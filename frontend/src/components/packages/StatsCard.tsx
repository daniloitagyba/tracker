import { Box, Typography } from '@mui/material';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}

const StatItem = ({ icon, value, label, color }: StatItemProps) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0.5,
      flex: 1,
      position: 'relative',
      '&:not(:last-child)::after': {
        content: '""',
        position: 'absolute',
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        height: '60%',
        width: '1px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
    }}
  >
    <Box sx={{ color, fontSize: 28 }}>{icon}</Box>
    <Typography
      variant="h4"
      sx={{
        fontWeight: 700,
        color: 'text.primary',
        lineHeight: 1,
      }}
    >
      {value}
    </Typography>
    <Typography
      variant="caption"
      sx={{
        color: 'text.secondary',
        fontSize: '0.75rem',
        textAlign: 'center',
      }}
    >
      {label}
    </Typography>
  </Box>
);

interface StatsCardProps {
  onRoute: number;
  inTransit: number;
  delivered: number;
  total: number;
}

export const StatsCard = ({ onRoute, inTransit, delivered, total }: StatsCardProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'background.paper',
        borderRadius: 4,
        py: 3,
        px: 2,
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <StatItem
        icon={<RouteRoundedIcon fontSize="inherit" />}
        value={onRoute}
        label="Em rota"
        color="#F59E0B"
      />
      <StatItem
        icon={<LocalShippingRoundedIcon fontSize="inherit" />}
        value={inTransit}
        label="Em Trânsito"
        color="#3B82F6"
      />
      <StatItem
        icon={<CheckCircleRoundedIcon fontSize="inherit" />}
        value={delivered}
        label="Entregues"
        color="#10B981"
      />
      <StatItem
        icon={<Inventory2RoundedIcon fontSize="inherit" />}
        value={total}
        label="Total"
        color="#3B82F6"
      />
    </Box>
  );
};

