import { useLogin } from '@refinedev/core';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useSearchParams } from 'react-router-dom';

export function LoginPage() {
  const { mutate: login, isLoading } = useLogin();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  const handleLogin = () => {
    login({});
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 420,
          width: '100%',
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'visible',
        }}
      >
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              mt: -7,
              boxShadow: '0 8px 24px rgba(26, 35, 126, 0.4)',
            }}
          >
            <LocalShippingIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>

          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 1,
              background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Tracker
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Track your packages simply and quickly
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Authentication Error
              </Typography>
              <Typography variant="body2" component="div">
                {decodeURIComponent(error).includes('OAuth client was deleted') ? (
                  <>
                    OAuth client was deleted. Please:
                    <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
                      <li>Create a new OAuth client in Google Cloud Console</li>
                      <li>Add the redirect URI: <code style={{ fontSize: '0.85em' }}>http://localhost:3001/auth/google/callback</code></li>
                      <li>Update the <code style={{ fontSize: '0.85em' }}>backend/.env</code> file with new credentials</li>
                    </ul>
                  </>
                ) : decodeURIComponent(error).includes('Invalid OAuth client credentials') ? (
                  <>
                    Invalid OAuth credentials. Check if <code style={{ fontSize: '0.85em' }}>GOOGLE_CLIENT_ID</code> and <code style={{ fontSize: '0.85em' }}>GOOGLE_CLIENT_SECRET</code> are correct in the <code style={{ fontSize: '0.85em' }}>backend/.env</code> file.
                  </>
                ) : decodeURIComponent(error).includes('Redirect URI mismatch') ? (
                  <>
                    Redirect URI mismatch. Add <code style={{ fontSize: '0.85em' }}>http://localhost:3001/auth/google/callback</code> to authorized URIs in Google Cloud Console.
                  </>
                ) : (
                  decodeURIComponent(error)
                )}
              </Typography>
            </Alert>
          )}

          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<GoogleIcon />}
            onClick={handleLogin}
            disabled={isLoading}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              backgroundColor: '#4285F4',
              '&:hover': {
                backgroundColor: '#357ABD',
              },
            }}
          >
            {isLoading ? 'Connecting...' : 'Sign in with Google'}
          </Button>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 3, display: 'block' }}
          >
            By signing in, you agree to our terms of use
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
