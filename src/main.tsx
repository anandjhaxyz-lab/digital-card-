import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

registerSW({ 
  immediate: true,
  onRegistered(r) {
    console.log('Service Worker registered successfully:', r);
  },
  onRegisterError(error) {
    console.error('Service Worker registration failed:', error);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
