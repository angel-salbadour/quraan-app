import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker with silent auto-update for Android & iPhone offline support
registerSW({
  immediate: true,
  onRegisterError() {
    // Ignore registration errors in restricted preview iframes
  },
});

createRoot(document.getElementById('root')!).render(<App />);
