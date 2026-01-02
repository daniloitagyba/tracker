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
            Rastreie suas encomendas de forma simples e rápida
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Erro na autenticação
              </Typography>
              <Typography variant="body2" component="div">
                {decodeURIComponent(error).includes('OAuth client was deleted') ? (
                  <>
                    O cliente OAuth foi deletado. Por favor:
                    <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
                      <li>Crie um novo cliente OAuth no Google Cloud Console</li>
                      <li>Adicione a URI de redirecionamento: <code style={{ fontSize: '0.85em' }}>http://localhost:3001/auth/google/callback</code></li>
                      <li>Atualize o arquivo <code style={{ fontSize: '0.85em' }}>backend/.env</code> com as novas credenciais</li>
                    </ul>
                  </>
                ) : decodeURIComponent(error).includes('Invalid OAuth client credentials') ? (
                  <>
                    Credenciais OAuth inválidas. Verifique se <code style={{ fontSize: '0.85em' }}>GOOGLE_CLIENT_ID</code> e <code style={{ fontSize: '0.85em' }}>GOOGLE_CLIENT_SECRET</code> estão corretos no arquivo <code style={{ fontSize: '0.85em' }}>backend/.env</code>.
                  </>
                ) : decodeURIComponent(error).includes('Redirect URI mismatch') ? (
                  <>
                    URI de redirecionamento não corresponde. Adicione <code style={{ fontSize: '0.85em' }}>http://localhost:3001/auth/google/callback</code> às URIs autorizadas no Google Cloud Console.
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
            {isLoading ? 'Conectando...' : 'Entrar com Google'}
          </Button>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 3, display: 'block' }}
          >
            Ao entrar, você concorda com nossos termos de uso
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

