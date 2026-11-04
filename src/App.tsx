import React, { useState } from 'react';
import { Login } from './pages/auth/Login';
import { AuthSession } from './types/auth';

export const App: React.FC = () => {
  const [, setSession] = useState<AuthSession | null>(null);

  return (
    <div className="attendance-portal-app">
      <Login
        onLoginSuccess={(newSession) => {
          setSession(newSession);
        }}
      />
    </div>
  );
};
