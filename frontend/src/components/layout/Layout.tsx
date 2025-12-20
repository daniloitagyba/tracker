import { Box, Container } from '@mui/material';
import { HomeHeader } from './HomeHeader';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

export const Layout = ({ children, showHeader = true }: LayoutProps) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      {showHeader && <HomeHeader />}
      <Container 
        maxWidth="md" 
        sx={{ 
          py: { xs: 2, md: 3 },
          px: { xs: 2, md: 3 },
        }}
      >
        {children}
      </Container>
    </Box>
  );
};
