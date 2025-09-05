import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './i18n';
import { secureConsole, preventClickjacking } from './utils/securityUtils';

// تطبيق الحماية الأمنية
secureConsole();
preventClickjacking();

// Register Service Worker for cache control (with fallback options)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Try the simple service worker first to avoid mobile issues
    const serviceWorkerPath = '/sw-simple.js';
    
    navigator.serviceWorker.register(serviceWorkerPath)
      .then((registration) => {
        // console.log('Simple Service Worker registered successfully');
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // console.log('New content available, reloading...');
              window.location.reload();
            }
          });
        });
      })
      .catch((error) => {
        // console.log('Simple Service Worker failed, trying main one:', error);
        
        // Fallback to main service worker
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            // console.log('Main Service Worker registered successfully');
          })
          .catch((fallbackError) => {
            // console.log('All Service Workers failed:', fallbackError);
            // Continue without service worker
          });
      });
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
