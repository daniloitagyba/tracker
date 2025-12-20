import { useGetIdentity, useLogout } from '@refinedev/core';
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useState } from 'react';

interface Identity {
  id: string;
  name: string;
  avatar?: string;
}

export const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: identity } = useGetIdentity<Identity>();
  const { mutate: logout } = useLogout();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
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
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Toolbar>
        <LocalShippingIcon sx={{ mr: 1.5, fontSize: 28 }} />
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            flexGrow: 1, 
            fontWeight: 700,
            letterSpacing: '-0.5px',
          }}
        >
          {isMobile ? 'Tracker' : 'Tracker - Rastreamento'}
        </Typography>

        {identity && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isMobile && (
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {identity.name}
              </Typography>
            )}
            <IconButton
              size="small"
              onClick={handleMenu}
              sx={{ p: 0.5 }}
            >
              <Avatar
                src={identity.avatar}
                alt={identity.name}
                sx={{ 
                  width: 36, 
                  height: 36,
                  border: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                {identity.name?.charAt(0)}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 150,
                },
              }}
            >
              <MenuItem disabled sx={{ opacity: 0.7 }}>
                {identity.name}
              </MenuItem>
              <MenuItem onClick={handleLogout}>Sair</MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

