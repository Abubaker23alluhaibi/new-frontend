// Service Worker للإشعارات الفورية
const CACHE_NAME = 'tabibiq-notifications-v1';
const NOTIFICATION_ICON = '/logo192.png';

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting();
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(self.clients.claim());
});

// معالجة الرسائل من التطبيق
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, {
      icon: NOTIFICATION_ICON,
      badge: NOTIFICATION_ICON,
      tag: 'tabibiq-notification',
      requireInteraction: true,
      silent: false,
      ...options
    });
  }
});

// معالجة الإشعارات
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  // فتح التطبيق عند النقر على الإشعار
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // إذا كان التطبيق مفتوح، ركز عليه
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // إذا لم يكن مفتوح، افتحه
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// معالجة الإشعارات المغلقة
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});

// معالجة push notifications (إذا تم إضافة FCM لاحقاً)
self.addEventListener('push', (event) => {
  console.log('Push message received:', event);
  
  if (event.data) {
    const data = event.data.json();
    const title = data.title || 'إشعار جديد';
    const options = {
      body: data.body || 'لديك إشعار جديد',
      icon: NOTIFICATION_ICON,
      badge: NOTIFICATION_ICON,
      tag: data.tag || 'tabibiq-push',
      requireInteraction: true,
      silent: false,
      data: data.data || {}
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

// معالجة الأخطاء
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event);
});

// معالجة الأخطاء غير المعالجة
self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event);
});