import { useState } from 'react';
import { useGetIdentity, useLogout } from '@refinedev/core';
import { Box, Typography, Avatar, IconButton, Menu, MenuItem, ListItemIcon, Divider } from '@mui/material';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useThemeMode } from '../../context/ThemeContext';

interface Identity {
  id: string;
  name: string;
  avatar?: string;
}

export const HomeHeader = () => {
  const { data: identity } = useGetIdentity<Identity>();
  const { mode, toggleTheme } = useThemeMode();
  const { mutate: logout } = useLogout();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

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
          onClick={handleAvatarClick}
          sx={{
            width: 56,
            height: 56,
            border: '3px solid',
            borderColor: 'primary.main',
            backgroundColor: 'primary.dark',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            },
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

      {/* Avatar Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 180,
            borderRadius: 2,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            '& .MuiMenuItem-root': {
              py: 1.5,
              px: 2,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {identity?.name}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <Typography color="error.main">Sair</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

