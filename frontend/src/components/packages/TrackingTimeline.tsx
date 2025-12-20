import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  Paper,
  Typography,
  Box,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import type { TrackingInfo } from '../../types';

interface TrackingTimelineProps {
  tracking: TrackingInfo;
}

export const TrackingTimeline = ({ tracking }: TrackingTimelineProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getStatusIcon = (status: string, isFirst: boolean) => {
    const lowerStatus = status.toLowerCase();
    
    if (lowerStatus.includes('entregue') || lowerStatus.includes('delivered')) {
      return <CheckCircleRoundedIcon />;
    }
    if (lowerStatus.includes('saiu') || lowerStatus.includes('em trânsito')) {
      return <LocalShippingRoundedIcon />;
    }
    if (isFirst) {
      return <LocalShippingRoundedIcon />;
    }
    return <Inventory2RoundedIcon />;
  };

  const getStatusColor = (status: string): 'success' | 'primary' | 'grey' => {
    const lowerStatus = status.toLowerCase();
    
    if (lowerStatus.includes('entregue') || lowerStatus.includes('delivered')) {
      return 'success';
    }
    if (lowerStatus.includes('saiu') || lowerStatus.includes('em trânsito')) {
      return 'primary';
    }
    return 'grey';
  };

  if (tracking.events.length === 0) {
    return (
      <Paper 
        sx={{ 
          p: 3, 
          textAlign: 'center',
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography color="text.secondary">
          Nenhum evento de rastreamento encontrado.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1, sm: 2 }, 
          mb: { xs: 2, sm: 3 },
          flexWrap: 'wrap',
        }}
      >
        <Typography 
          variant={isMobile ? 'subtitle1' : 'h6'}
          sx={{ 
            fontWeight: 600,
            fontFamily: '"JetBrains Mono", monospace',
            letterSpacing: '1px',
            fontSize: { xs: '0.85rem', sm: '1.125rem' },
            wordBreak: 'break-all',
          }}
        >
          {tracking.code}
        </Typography>
        {tracking.isDelivered && (
          <Chip
            icon={<CheckCircleRoundedIcon />}
            label="Entregue"
            color="success"
            size="small"
            sx={{ borderRadius: 2 }}
          />
        )}
      </Box>

      <Timeline position={isMobile ? 'right' : 'alternate'}>
        {tracking.events.map((event, index) => (
          <TimelineItem key={index}>
            {!isMobile && (
              <TimelineOppositeContent
                sx={{ m: 'auto 0' }}
                variant="body2"
                color="text.secondary"
              >
                <Typography variant="body2" fontWeight={500}>
                  {event.date}
                </Typography>
                <Typography variant="caption">
                  {event.time}
                </Typography>
              </TimelineOppositeContent>
            )}

            <TimelineSeparator>
              <TimelineConnector 
                sx={{ 
                  bgcolor: index === 0 ? 'primary.main' : 'divider',
                }} 
              />
              <TimelineDot 
                color={getStatusColor(event.status)} 
                variant={index === 0 ? 'filled' : 'outlined'}
                sx={{
                  boxShadow: index === 0 ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : 'none',
                  width: isMobile ? 32 : 40,
                  height: isMobile ? 32 : 40,
                  '& svg': {
                    fontSize: isMobile ? 16 : 20,
                  },
                }}
              >
                {getStatusIcon(event.status, index === 0)}
              </TimelineDot>
              <TimelineConnector sx={{ bgcolor: 'divider' }} />
            </TimelineSeparator>

            <TimelineContent sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 1.5, sm: 2 } }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  backgroundColor: index === 0 ? 'rgba(59, 130, 246, 0.1)' : 'background.paper',
                  border: '1px solid',
                  borderColor: index === 0 ? 'primary.main' : 'divider',
                  borderRadius: 2,
                }}
              >
                {isMobile && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      display: 'block', 
                      mb: 0.5,
                      fontSize: '0.7rem',
                    }}
                  >
                    {event.date} às {event.time}
                  </Typography>
                )}
                <Typography 
                  variant="subtitle2" 
                  fontWeight={600}
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  {event.status}
                </Typography>
                {event.description && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mt: 0.5,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    }}
                  >
                    {event.description}
                  </Typography>
                )}
                {event.location && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    display="block" 
                    sx={{ 
                      mt: 1,
                      fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    }}
                  >
                    📍 {event.location}
                  </Typography>
                )}
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  );
};
