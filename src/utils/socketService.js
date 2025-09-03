// خدمة WebSocket للإشعارات الفورية
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  // الاتصال بالخادم
  connect() {
    if (this.socket && this.isConnected) {
      console.log('🔌 WebSocket متصل بالفعل');
      return this.socket;
    }

    if (this.socket && !this.isConnected) {
      console.log('🔄 إعادة الاتصال بـ WebSocket...');
      this.socket.connect();
      return this.socket;
    }

    const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    console.log('🔌 إنشاء اتصال WebSocket جديد...');
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: false, // تغيير من true إلى false لتجنب إنشاء اتصالات متعددة
      autoConnect: true
    });

    // معالجة الاتصال
    this.socket.on('connect', () => {
      console.log('🔌 متصل بـ WebSocket');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    // معالجة انقطاع الاتصال
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 انقطع الاتصال:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // الخادم قطع الاتصال، حاول إعادة الاتصال
        this.socket.connect();
      }
    });

    // معالجة أخطاء الاتصال
    this.socket.on('connect_error', (error) => {
      console.error('❌ خطأ في الاتصال:', error);
      this.isConnected = false;
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => {
          console.log(`🔄 محاولة إعادة الاتصال ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
          this.socket.connect();
        }, this.reconnectDelay * this.reconnectAttempts);
      }
    });

    // معالجة إعادة الاتصال
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ تم إعادة الاتصال بعد ${attemptNumber} محاولة`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    return this.socket;
  }

  // انضمام المستخدم إلى غرفته الخاصة
  joinUserRoom(userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_user_room', userId);
      console.log(`👤 انضم المستخدم ${userId} إلى غرفته الخاصة`);
    }
  }

  // انضمام الطبيب إلى غرفته الخاصة
  joinDoctorRoom(doctorId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_doctor_room', doctorId);
      console.log(`👨‍⚕️ انضم الطبيب ${doctorId} إلى غرفته الخاصة`);
    }
  }

  // الاستماع لإشعارات إلغاء الموعد
  onAppointmentCancelled(callback) {
    if (this.socket) {
      this.socket.on('appointment_cancelled', (data) => {
        console.log('📱 تم استلام إشعار إلغاء الموعد:', data);
        callback(data);
      });
    }
  }

  // الاستماع لإشعارات المواعيد الجديدة
  onNewAppointment(callback) {
    if (this.socket) {
      this.socket.on('new_appointment', (data) => {
        console.log('📱 تم استلام إشعار موعد جديد:', data);
        callback(data);
      });
    }
  }

  // الاستماع لإشعارات المواعيد الخاصة
  onSpecialAppointment(callback) {
    if (this.socket) {
      this.socket.on('special_appointment', (data) => {
        console.log('📱 تم استلام إشعار موعد خاص:', data);
        callback(data);
      });
    }
  }

  // قطع الاتصال
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      this._appointmentCancelledListener = false;
      console.log('🔌 تم قطع الاتصال بـ WebSocket');
    }
  }

  // الحصول على حالة الاتصال
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id
    };
  }
}

// إنشاء instance واحد للخدمة
const socketService = new SocketService();

export default socketService;
