import { Box, Typography, IconButton, useMediaQuery, useTheme } from '@mui/material';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import type { Package, PackageStatus } from '../../types';

interface PackageCardProps {
  pkg: Package;
  onClick?: (pkg: Package) => void;
}

const statusConfig: Record<PackageStatus, { icon: React.ReactNode; color: string; bgColor: string }> = {
  in_transit: {
    icon: <LocalShippingRoundedIcon />,
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
  },
  delivered: {
    icon: <CheckCircleRoundedIcon />,
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
  },
  pending: {
    icon: <WarningAmberRoundedIcon />,
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.15)',
  },
  on_route: {
    icon: <LocalShippingRoundedIcon />,
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
  },
};

const formatTimeAgo = (dateString?: string | null): string | null => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) return 'há alguns minutos';
  if (diffInHours < 24) return `há cerca de ${diffInHours} horas`;
  if (diffInDays === 1) return 'há 1 dia';
  return `há ${diffInDays} dias`;
};

export const PackageCard = ({ pkg, onClick }: PackageCardProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Determine status based on isDelivered or fallback
  const status: PackageStatus = pkg.isDelivered ? 'delivered' : (pkg.status || 'in_transit');
  const config = statusConfig[status] || statusConfig.in_transit;
  
  const timeAgo = formatTimeAgo(pkg.lastUpdate);

  return (
    <Box
      onClick={() => onClick?.(pkg)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 1.5, sm: 2 },
        p: { xs: 2, sm: 2.5 },
        backgroundColor: 'background.paper',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: '4px solid',
        borderLeftColor: config.color,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': onClick ? {
          transform: 'translateX(4px)',
          borderColor: 'rgba(255, 255, 255, 0.12)',
        } : {},
        '&:active': onClick && isMobile ? {
          transform: 'scale(0.98)',
          backgroundColor: 'action.hover',
        } : {},
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant={isMobile ? 'subtitle1' : 'h6'}
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            mb: 0.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: { xs: '0.95rem', sm: '1.125rem' },
          }}
        >
          {pkg.description}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            mb: 1,
          }}
        >
          <LanguageRoundedIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: 'text.secondary' }} />
          <Typography
            variant="body2"
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              color: 'text.secondary',
              letterSpacing: '0.5px',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {pkg.trackingCode}
          </Typography>
        </Box>

        {pkg.lastStatus && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              mb: 0.75,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }}
            >
              ↳ {pkg.lastStatus}
            </Typography>
          </Box>
        )}

        {/* Show location or time info */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {pkg.lastLocation ? (
            <>
              <PlaceRoundedIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: 'text.secondary' }} />
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {pkg.lastLocation}
                {timeAgo && ` • ${timeAgo}`}
              </Typography>
            </>
          ) : timeAgo ? (
            <>
              <AccessTimeRoundedIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: 'text.secondary' }} />
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                }}
              >
                {timeAgo}
              </Typography>
            </>
          ) : (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontStyle: 'italic',
                fontSize: { xs: '0.65rem', sm: '0.75rem' },
              }}
            >
              Clique para rastrear
            </Typography>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 0.5, sm: 1 },
        }}
      >
        <Box
          sx={{
            width: { xs: 40, sm: 48 },
            height: { xs: 40, sm: 48 },
            borderRadius: 2,
            backgroundColor: config.bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: config.color,
            '& svg': {
              fontSize: { xs: 20, sm: 24 },
            },
          }}
        >
          {config.icon}
        </Box>

        {onClick && !isMobile && (
          <IconButton
            size="small"
            sx={{
              color: 'text.secondary',
            }}
          >
            <ChevronRightRoundedIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};
