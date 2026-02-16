import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';
import { Typography, Box, Chip, Container } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import type { TrackingInfo } from '../../types';

interface TrackingTimelineProps {
  tracking: TrackingInfo;
  description?: string;
}

export const TrackingTimeline = ({ tracking, description }: TrackingTimelineProps) => {
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            p: 3,
            textAlign: 'center',
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Typography color="text.secondary">
            No tracking events found.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 3 },
        minHeight: '100vh',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          mb: 4,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              fontFamily: '"JetBrains Mono", monospace',
              letterSpacing: '1px',
              fontSize: { xs: '1rem', sm: '1.5rem' },
              wordBreak: 'break-all',
            }}
          >
            {tracking.code}
          </Typography>
          {tracking.isDelivered && (
            <Chip
              icon={<CheckCircleRoundedIcon />}
              label="Delivered"
              color="success"
              size="medium"
              sx={{ borderRadius: 2 }}
            />
          )}
        </Box>
        {description && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            {description}
          </Typography>
        )}
      </Box>

      <Timeline position="alternate">
        {tracking.events.map((event, index) => (
          <TimelineItem key={index}>
            <TimelineOppositeContent
              sx={{ m: 'auto 0' }}
              align="right"
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

            <TimelineSeparator>
              <TimelineConnector
                sx={{
                  bgcolor: index === 0 ? getStatusColor(event.status) : 'divider',
                }}
              />
              <TimelineDot
                color={getStatusColor(event.status)}
                variant={index === 0 ? 'filled' : 'outlined'}
              >
                {getStatusIcon(event.status, index === 0)}
              </TimelineDot>
              <TimelineConnector
                sx={{
                  bgcolor: index === tracking.events.length - 1 ? 'transparent' : 'divider',
                }}
              />
            </TimelineSeparator>

            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Typography variant="h6" component="span">
                {event.status}
              </Typography>
              {event.description && (
                <Typography color="text.secondary">
                  {event.description}
                </Typography>
              )}
              {event.location && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mt: 1 }}
                >
                  📍 {event.location}
                </Typography>
              )}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Container>
  );
};