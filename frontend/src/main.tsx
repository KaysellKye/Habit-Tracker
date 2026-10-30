import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { App } from './App';
import './index.css';

const customId =
  typeof window !== 'undefined'
    ? localStorage.getItem('custom_google_client_id') || ''
    : '';
const envId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
const rawId = customId || envId;
const isGoogleConfigured = Boolean(
  rawId &&
    !rawId.includes('YOUR_GOOGLE_CLIENT_ID') &&
    rawId.includes('.apps.googleusercontent.com')
);

const RootApp: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isGoogleConfigured ? (
      <GoogleOAuthProvider clientId={rawId}>
        <RootApp />
      </GoogleOAuthProvider>
    ) : (
      <RootApp />
    )}
  </React.StrictMode>
);
