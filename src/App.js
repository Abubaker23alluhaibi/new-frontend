import React, { useState, useEffect } from 'react';
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
import i18n from './i18n';

function App() {
  // حالة مركزية للمواعيد للطبيب
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  
  // استرجاع اللغة المحفوظة من localStorage أو استخدام العربية كافتراضية
  const [lang, setLang] = React.useState(() => {
    const savedLang = localStorage.getItem('selectedLanguage');
    return savedLang || 'ar';
  });

  // حفظ اللغة في localStorage وتطبيقها
  const handleLangChange = (e) => {
    const newLang = e.target.value;
    setLang(newLang);
    localStorage.setItem('selectedLanguage', newLang);
    i18n.changeLanguage(newLang);
  };

  // تطبيق اللغة المحفوظة عند تحميل التطبيق
  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang]);

  // جلب المواعيد عند الدخول
  useEffect(() => {
    // يمكن تحسين هذا لاحقاً ليعتمد على تسجيل الدخول
    fetch(`${process.env.REACT_APP_API_URL}/doctor-appointments/1`)
      .then(res => res.json())
      .then(data => setDoctorAppointments(Array.isArray(data) ? data : []));
  }, []);

  return (
    <AuthProvider>
      <Router>

        <Routes>
          <Route path="/" element={<Login />} />
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
          <Route path="/doctor/:id" element={
            <ProtectedRoute requiredUserType="user">
              <DoctorDetails />
            </ProtectedRoute>
          } />
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
        </Routes>
      </Router>
    </AuthProvider>
  );
}
export default App;