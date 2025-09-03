// خدمة الإشعارات المحسنة
class NotificationService {
  constructor() {
    this.isSupported = 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
    this.registration = null;
  }

  // طلب أذونات الإشعارات
  async requestPermission() {
    if (!this.isSupported) {
      console.warn('الإشعارات غير مدعومة في هذا المتصفح');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    } catch (error) {
      console.error('خطأ في طلب أذونات الإشعارات:', error);
      return false;
    }
  }

  // إرسال إشعار فوري
  async sendImmediateNotification(title, options = {}) {
    if (!this.isSupported || this.permission !== 'granted') {
      console.warn('الإشعارات غير متاحة');
      return false;
    }

    try {
      const notification = new Notification(title, {
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: 'tabibiq-notification',
        requireInteraction: true,
        silent: false,
        ...options
      });

      // إغلاق الإشعار تلقائياً بعد 10 ثوان
      setTimeout(() => {
        notification.close();
      }, 10000);

      return true;
    } catch (error) {
      console.error('خطأ في إرسال الإشعار:', error);
      return false;
    }
  }

  // إرسال إشعار إلغاء الموعد
  async sendAppointmentCancellationNotification(doctorName, date, time) {
    const title = 'إلغاء الموعد';
    const body = `تم إلغاء موعدك مع ${doctorName} في ${date} الساعة ${time}. يرجى اختيار موعد آخر.`;
    
    return await this.sendImmediateNotification(title, {
      body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'appointment-cancelled',
      requireInteraction: true,
      actions: [
        {
          action: 'book-new',
          title: 'احجز موعد جديد'
        },
        {
          action: 'view-appointments',
          title: 'عرض مواعيدي'
        }
      ]
    });
  }

  // إرسال إشعار موعد جديد للدكتور
  async sendNewAppointmentNotification(patientName, bookerName, date, time, reason, patientAge, isBookingForOther) {
    const title = 'موعد جديد';
    let body;
    
    if (isBookingForOther) {
      body = `تم حجز موعد جديد من قبل ${bookerName} للمريض ${patientName} (عمر: ${patientAge}) في ${date} الساعة ${time}`;
    } else {
      body = `تم حجز موعد جديد من قبل ${patientName} (عمر: ${patientAge}) في ${date} الساعة ${time}`;
    }
    
    if (reason) {
      body += `\nالسبب: ${reason}`;
    }
    
    return await this.sendImmediateNotification(title, {
      body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'new-appointment',
      requireInteraction: true,
      actions: [
        {
          action: 'view-appointments',
          title: 'عرض المواعيد'
        },
        {
          action: 'view-dashboard',
          title: 'لوحة التحكم'
        }
      ]
    });
  }

  // إرسال إشعار موعد خاص للمريض
  async sendSpecialAppointmentNotification(doctorName, date, time, reason, notes) {
    const title = 'موعد خاص جديد';
    let body = `تم حجز موعد خاص لك مع الطبيب ${doctorName} في ${date} الساعة ${time}`;
    
    if (reason) {
      body += `\nالسبب: ${reason}`;
    }
    
    if (notes) {
      body += `\nملاحظات: ${notes}`;
    }
    
    return await this.sendImmediateNotification(title, {
      body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'special-appointment',
      requireInteraction: true,
      actions: [
        {
          action: 'view-appointments',
          title: 'عرض مواعيدي'
        },
        {
          action: 'view-details',
          title: 'تفاصيل الموعد'
        }
      ]
    });
  }

  // إعداد Service Worker للإشعارات
  async setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker مسجل بنجاح');
        return true;
      } catch (error) {
        console.error('خطأ في تسجيل Service Worker:', error);
        return false;
      }
    }
    return false;
  }

  // إرسال إشعار عبر Service Worker
  async sendServiceWorkerNotification(title, options = {}) {
    if (this.registration && this.registration.active) {
      try {
        await this.registration.active.postMessage({
          type: 'NOTIFICATION',
          title,
          options
        });
        return true;
      } catch (error) {
        console.error('خطأ في إرسال إشعار Service Worker:', error);
        return false;
      }
    }
    return false;
  }
}

// إنشاء instance واحد للخدمة
const notificationService = new NotificationService();

export default notificationService;
