import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Login from './Login';
import UserSignUp from './UserSignUp';
import DoctorSignUp from './DoctorSignUp';
import UserHome from './UserHome';
import DoctorDashboard from './DoctorDashboard';
import DoctorDetails from './DoctorDetails';
import MyAppointments from './MyAppointments';
import UserProfile from './UserProfile';
import DoctorProfile from './DoctorProfile';
import DoctorAppointments from './DoctorAppointments';
import AdminDashboard from './AdminDashboard';
import AdminLogin from './AdminLogin';
import MedicineReminder from './MedicineReminder';
import HealthCenters from './HealthCenters';
import CenterLogin from './CenterLogin';
import CenterHome from './CenterHome';
import DoctorCalendar from './DoctorCalendar';
import DoctorAnalyticsPage from './DoctorAnalyticsPage';
import BookingsForOthersStats from './BookingsForOthersStats';
import EmployeeManager from './components/EmployeeManager';
import UserTypeSelector from './components/UserTypeSelector';

import LandingPage from './LandingPage';
import DashboardPreview from './DashboardPreview';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import i18n from './i18n';
import { clearAllCaches, clearTranslationCache, startPeriodicCleanup, stopPeriodicCleanup } from './utils/cacheUtils';

function App() {
  // حالة مركزية للمواعيد للطبيب
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  
  // استرجاع اللغة المحفوظة من localStorage أو استخدام العربية كافتراضية
  const [lang, setLang] = React.useState(() => {
    const savedLang = localStorage.getItem('selectedLanguage');
    return savedLang || 'ar';
  });

  // دالة لتحديث البيانات
  const refreshAppData = useCallback(async () => {
    console.log('🔄 App: تحديث بيانات التطبيق...');
    
    try {
      // تنظيف التخزين المؤقت
      await clearAllCaches();
      
      // إعادة تحميل الترجمة
      i18n.reloadResources();
      
      // تحديث timestamp
      localStorage.setItem('appLastUpdate', Date.now().toString());
      
      console.log('✅ App: تم تحديث البيانات بنجاح');
    } catch (error) {
      console.error('❌ App: خطأ في تحديث البيانات:', error);
    }
  }, []);

  // حفظ اللغة في localStorage وتطبيقها
  const handleLangChange = async (e) => {
    const newLang = e.target.value;
    console.log('🔄 App: تغيير اللغة إلى:', newLang);
    
    try {
      // تنظيف cache الترجمة أولاً
      await clearTranslationCache();
      
      setLang(newLang);
      localStorage.setItem('selectedLanguage', newLang);
      localStorage.setItem('lastLanguageChange', Date.now().toString());
      
      // تطبيق اللغة الجديدة
      await i18n.changeLanguage(newLang);
      
      // تحديث البيانات
      refreshAppData();
      
    } catch (error) {
      console.error('❌ App: خطأ في تغيير اللغة:', error);
    }
  };

  // تطبيق اللغة المحفوظة عند تحميل التطبيق
  useEffect(() => {
    console.log('🌐 App: تطبيق اللغة:', lang);
    
    const applyLanguage = async () => {
      try {
        await i18n.changeLanguage(lang);
        console.log('✅ App: تم تطبيق اللغة بنجاح');
      } catch (error) {
        console.error('❌ App: خطأ في تطبيق اللغة:', error);
      }
    };
    
    applyLanguage();
  }, [lang]);

  // جلب المواعيد عند الدخول
  useEffect(() => {
    console.log('📅 App: جلب المواعيد للطبيب...');
    
    const fetchAppointments = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/doctor-appointments/1?t=${Date.now()}`);
        const data = await res.json();
        console.log('✅ App: تم جلب المواعيد:', data);
        setDoctorAppointments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('❌ App: خطأ في جلب المواعيد:', error);
      }
    };
    
    fetchAppointments();
  }, []);

  // إضافة console.log عند تحميل التطبيق
  useEffect(() => {
    console.log('🚀 App: تم تحميل التطبيق بنجاح');
    console.log('🔗 App: API URL:', process.env.REACT_APP_API_URL);
    
    // بدء التنظيف الدوري
    const cleanupInterval = startPeriodicCleanup(300000); // 5 دقائق
    
    // تنظيف أولي
    refreshAppData();
    
    return () => {
      stopPeriodicCleanup(cleanupInterval);
    };
  }, [refreshAppData]);

  // تحديث تلقائي كل 10 دقائق
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAppData();
    }, 600000); // 10 دقائق
    
    return () => clearInterval(interval);
  }, [refreshAppData]);

  // تحديث عند تغيير اللغة في localStorage
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'selectedLanguage') {
        console.log('🔄 App: تم اكتشاف تغيير في اللغة');
        refreshAppData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshAppData]);

  return (
    <AuthProvider>
      <Router>

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/preview" element={<DashboardPreview />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<UserSignUp />} />
          <Route path="/signup-doctor" element={<DoctorSignUp />} />
          <Route path="/home" element={
            <ProtectedRoute requiredUserType="user">
              <UserHome />
            </ProtectedRoute>
          } />
          <Route path="/doctor-dashboard" element={
            <ProtectedRoute requiredUserType="doctor">
              <DoctorDashboard appointments={doctorAppointments} setAppointments={setDoctorAppointments} />
            </ProtectedRoute>
          } />
          <Route path="/doctor/:id" element={<DoctorDetails />} />
          <Route path="/my-appointments" element={
            <ProtectedRoute requiredUserType="user">
              <MyAppointments />
            </ProtectedRoute>
          } />
          <Route path="/medicine-reminder" element={
            <ProtectedRoute requiredUserType="user">
              <MedicineReminder />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute requiredUserType="user">
              <UserProfile />
            </ProtectedRoute>
          } />
          <Route path="/doctor-profile" element={
            <ProtectedRoute requiredUserType="doctor">
              <DoctorProfile />
            </ProtectedRoute>
          } />
          <Route path="/doctor-appointments" element={
            <ProtectedRoute requiredUserType="doctor">
              <DoctorAppointments />
            </ProtectedRoute>
          } />
          <Route path="/doctor-calendar" element={<DoctorCalendar appointments={doctorAppointments} />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute requiredUserType="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/health-centers" element={
            <ProtectedRoute requiredUserType="user">
              <HealthCenters />
            </ProtectedRoute>
          } />
          <Route path="/center-login" element={<CenterLogin />} />
          <Route path="/center-home" element={<CenterHome />} />
          <Route path="/doctor-analytics" element={
            <ProtectedRoute requiredUserType="doctor">
              <DoctorAnalyticsPage />
            </ProtectedRoute>
          } />
          <Route path="/bookings-for-others-stats" element={
            <ProtectedRoute requiredUserType="doctor">
              <BookingsForOthersStats />
            </ProtectedRoute>
          } />
          <Route path="/user-type-selector" element={
            <ProtectedRoute requiredUserType="doctor">
              <UserTypeSelector />
            </ProtectedRoute>
          } />
          <Route path="/employee-manager" element={
            <ProtectedRoute requiredUserType="doctor">
              <EmployeeManager />
            </ProtectedRoute>
          } />

        </Routes>
      </Router>
    </AuthProvider>
  );
}
export default App;