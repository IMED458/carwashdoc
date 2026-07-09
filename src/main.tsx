import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import SignPage from './components/signatures/SignPage';
import './index.css';

// hash-router: საჯარო ხელმოწერის ბმული #/sign/{token} — ავტორიზაციის გარეშე
function Root() {
  const m = window.location.hash.match(/^#\/sign\/([^/?#]+)/);
  if (m) return <SignPage token={m[1]} />;
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
