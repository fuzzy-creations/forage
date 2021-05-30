import React from 'react';
import './sass/main.scss';

import Router from './components/Router';

import { AuthProvider } from './contexts/Auth.context';
import { DateTimeProvider } from './contexts/DateTime.context';

function App() {
  return (
    <DateTimeProvider>
    <AuthProvider>
        <Router />
    </AuthProvider>
    </DateTimeProvider>
  );
}

export default App;
