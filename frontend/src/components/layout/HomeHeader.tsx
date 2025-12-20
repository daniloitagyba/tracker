import { useGetIdentity } from '@refinedev/core';
import { Box, Typography, Avatar, IconButton } from '@mui/material';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import { useThemeMode } from '../../context/ThemeContext';

interface Identity {
  id: string;
  name: string;
  avatar?: string;
}

export const HomeHeader = () => {
  const { data: identity } = useGetIdentity<Identity>();
  const { mode, toggleTheme } = useThemeMode();

  const firstName = identity?.name?.split(' ')[0] || 'Usuário';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, md: 3 },
        py: 2,
        maxWidth: 'md',
        mx: 'auto',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src={identity?.avatar}
          alt={identity?.name}
          sx={{
            width: 56,
            height: 56,
            border: '3px solid',
            borderColor: 'primary.main',
            backgroundColor: 'primary.dark',
          }}
        >
          {identity?.name?.charAt(0)}
        </Avatar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Inventory2RoundedIcon sx={{ color: 'primary.main', fontSize: 28 }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
            }}
          >
            Suas Encomendas
          </Typography>
        </Box>
      </Box>

      <IconButton
        onClick={toggleTheme}
        sx={{
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          width: 48,
          height: 48,
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        {mode === 'dark' ? (
          <DarkModeRoundedIcon sx={{ color: 'text.primary' }} />
        ) : (
          <LightModeRoundedIcon sx={{ color: 'text.primary' }} />
        )}
      </IconButton>
    </Box>
  );
};

