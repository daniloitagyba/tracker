import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from './context/AuthContext';
import { AuthGuard } from './components/AuthGuard';
import { LoginPage } from './pages/login';
import { AuthCallbackPage } from './pages/auth/callback';
import { PackageListPage } from './pages/packages/list';
import { AddPackagePage } from './pages/packages/add';
import { ThemeModeProvider, useThemeMode } from './context/ThemeContext';
import { darkTheme, lightTheme } from './theme/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const globalStyles = (
  <GlobalStyles
    styles={{
      '*': {
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
      },
      html: {
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
    }}
  />
);

function AppContent() {
  const { mode } = useThemeMode();
  const theme = mode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {globalStyles}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        <Route element={<AuthGuard />}>
          <Route index element={<Navigate to="/packages" replace />} />
          <Route path="/packages" element={<PackageListPage />} />
          <Route path="/packages/add" element={<AddPackagePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/packages" />} />
      </Routes>
    </ThemeProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeModeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeModeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
