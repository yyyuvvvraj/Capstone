import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { TelemetryProvider } from './contexts/TelemetryContext';
import AppRoutes from './AppRoutes';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <TelemetryProvider>
          <AppRoutes />
        </TelemetryProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
