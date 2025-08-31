// Minimal Service Worker for Tabib IQ
// This is a very simple service worker to avoid mobile issues

self.addEventListener('install', (event) => {
  console.log('Simple Service Worker: Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Simple Service Worker: Activating...');
  event.waitUntil(self.clients.claim());
});

// Minimal fetch handling - just pass through
self.addEventListener('fetch', (event) => {
  // Do nothing - let the browser handle all requests normally
  return;
});
