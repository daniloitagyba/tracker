import { Box, Typography, IconButton, useMediaQuery, useTheme, CircularProgress } from '@mui/material';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import NearMeRoundedIcon from '@mui/icons-material/NearMeRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import type { Package, PackageStatus } from '../../types';
import { formatTimeAgo } from '../../utils/packageHelpers';

interface PackageCardProps {
  pkg: Package;
  onClick?: (pkg: Package) => void;
  onUpdate?: (pkg: Package) => void;
  isUpdating?: boolean;
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
};

export const PackageCard = ({ pkg, onClick, onUpdate, isUpdating = false }: PackageCardProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const status: PackageStatus = pkg.isDelivered ? 'delivered' : 'in_transit';
  const config = statusConfig[status];
  
  const timeAgo = formatTimeAgo(pkg.lastUpdate);

  const handleUpdateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate?.(pkg);
  };

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

        {pkg.lastDestination && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              mb: 0.75,
            }}
          >
            <NearMeRoundedIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: 'text.secondary' }} />
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              Destino: {pkg.lastDestination}
            </Typography>
          </Box>
        )}

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
              Encomenda não encontrada
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

        {onUpdate && (
          <IconButton
            size="small"
            onClick={handleUpdateClick}
            disabled={isUpdating}
            sx={{
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
                color: 'primary.contrastText',
              },
              '&:disabled': {
                color: 'text.disabled',
              },
            }}
            aria-label="Atualizar encomenda"
          >
            {isUpdating ? (
              <CircularProgress size={16} sx={{ color: 'inherit' }} />
            ) : (
              <RefreshRoundedIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
            )}
          </IconButton>
        )}

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