import { Refine, Authenticated } from '@refinedev/core';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import routerProvider from '@refinedev/react-router-v6';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

import { authProvider } from './providers/authProvider';
import { dataProvider } from './providers/dataProvider';
import { LoginPage } from './pages/login';
import { AuthCallbackPage } from './pages/auth/callback';
import { PackageListPage } from './pages/packages/list';
import { AddPackagePage } from './pages/packages/add';
import { ThemeModeProvider, useThemeMode } from './context/ThemeContext';
import { darkTheme, lightTheme } from './theme/theme';

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
      <Refine
        routerProvider={routerProvider}
        authProvider={authProvider}
        dataProvider={dataProvider}
        resources={[
          {
            name: 'packages',
            list: '/packages',
            create: '/packages/add',
            meta: {
              label: 'Encomendas',
              icon: <LocalShippingIcon />,
            },
          },
        ]}
        options={{
          syncWithLocation: true,
          warnWhenUnsavedChanges: true,
        }}
      >
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          
          <Route
            element={
              <Authenticated
                key="authenticated-routes"
                fallback={<Navigate to="/login" />}
              >
                <Outlet />
              </Authenticated>
            }
          >
            <Route index element={<Navigate to="/packages" replace />} />
            <Route path="/packages" element={<PackageListPage />} />
            <Route path="/packages/add" element={<AddPackagePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/packages" />} />
        </Routes>
      </Refine>
    </ThemeProvider>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeModeProvider>
        <AppContent />
      </ThemeModeProvider>
    </BrowserRouter>
  );
};

export default App;