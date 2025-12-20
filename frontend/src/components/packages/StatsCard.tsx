import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';

export type FilterType = 'all' | 'in_transit' | 'delivered';

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
  isMobile?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

const StatItem = ({ icon, value, label, color, isMobile, isActive, onClick }: StatItemProps) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0.5,
      flex: 1,
      py: isMobile ? 1.5 : 1,
      px: 1,
      borderRadius: 2,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor: isActive ? `${color}15` : 'transparent',
      border: '2px solid',
      borderColor: isActive ? color : 'transparent',
      '&:hover': {
        backgroundColor: `${color}10`,
        transform: 'scale(1.02)',
      },
      '&:active': {
        transform: 'scale(0.98)',
      },
    }}
  >
    <Box sx={{ color, fontSize: isMobile ? 24 : 28 }}>{icon}</Box>
    <Typography
      variant={isMobile ? 'h5' : 'h4'}
      sx={{
        fontWeight: 700,
        color: isActive ? color : 'text.primary',
        lineHeight: 1,
      }}
    >
      {value}
    </Typography>
    <Typography
      variant="caption"
      sx={{
        color: isActive ? color : 'text.secondary',
        fontSize: isMobile ? '0.7rem' : '0.75rem',
        textAlign: 'center',
        fontWeight: isActive ? 600 : 400,
      }}
    >
      {label}
    </Typography>
  </Box>
);

interface StatsCardProps {
  inTransit: number;
  delivered: number;
  total: number;
  activeFilter?: FilterType;
  onFilterChange?: (filter: FilterType) => void;
}

export const StatsCard = ({ 
  inTransit, 
  delivered, 
  total,
  activeFilter = 'in_transit',
  onFilterChange,
}: StatsCardProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleFilterClick = (filter: FilterType) => {
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: isMobile ? 1 : 0.5,
        backgroundColor: 'background.paper',
        borderRadius: 4,
        py: isMobile ? 2 : 2,
        px: 1.5,
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <StatItem
        icon={<LocalShippingRoundedIcon fontSize="inherit" />}
        value={inTransit}
        label="Em Trânsito"
        color="#3B82F6"
        isMobile={isMobile}
        isActive={activeFilter === 'in_transit'}
        onClick={() => handleFilterClick('in_transit')}
      />
      <StatItem
        icon={<CheckCircleRoundedIcon fontSize="inherit" />}
        value={delivered}
        label="Entregues"
        color="#10B981"
        isMobile={isMobile}
        isActive={activeFilter === 'delivered'}
        onClick={() => handleFilterClick('delivered')}
      />
      <StatItem
        icon={<Inventory2RoundedIcon fontSize="inherit" />}
        value={total}
        label="Total"
        color="#8B5CF6"
        isMobile={isMobile}
        isActive={activeFilter === 'all'}
        onClick={() => handleFilterClick('all')}
      />
    </Box>
  );
};

