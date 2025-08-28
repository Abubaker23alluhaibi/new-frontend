import React, { useState, useEffect, useCallback } from 'react';
import './DoctorDashboard.css';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

import DoctorCalendar from './DoctorCalendar';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { normalizePhone } from './utils/phoneUtils';
import WorkTimesEditor from './WorkTimesEditor';
import AppointmentDurationEditor from './AppointmentDurationEditor';
import AdvertisementSlider from './components/AdvertisementSlider';

function getToday() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function DoctorDashboard() {
  console.log('🎬 DoctorDashboard: تم تحميل المكون');
  console.log('🎬 DoctorDashboard: سيتم عرض AdvertisementSlider في هذا المكون');
  const { profile, setProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);

  const [showNotif, setShowNotif] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  const [showSpecialAppointments, setShowSpecialAppointments] = useState(false);
  const [showEditSpecial, setShowEditSpecial] = useState(false);
  const [selectedAppointmentForEdit, setSelectedAppointmentForEdit] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  // أضف حالة لإظهار المودال
  const [showContactModal, setShowContactModal] = useState(false);
  // أضف حالة لإظهار نافذة التقويم
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // 1. أضف حالة state جديدة:
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [notePhone, setNotePhone] = useState('');
  const [noteValue, setNoteValue] = useState('');
  const { t, i18n } = useTranslation();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showWorkTimesModal, setShowWorkTimesModal] = useState(false);
  const [showAppointmentDurationModal, setShowAppointmentDurationModal] = useState(false);
  
  // حالات البحث
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // مراقبة حجم النافذة
  useEffect(() => {
    console.log('🔄 DoctorDashboard: useEffect - مراقبة حجم النافذة');
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // دالة لجلب الإشعارات
  const fetchNotifications = useCallback(async () => {
    console.log('🔔 DoctorDashboard: محاولة جلب الإشعارات');
    if (!profile?._id) {
      console.log('❌ DoctorDashboard: لا يوجد profile._id');
      return;
    }
    
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/notifications?doctorId=${profile._id}&t=${Date.now()}`);
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        setNotifications([]);
        setNotifCount(0);
        return;
      }
      
      setNotifications(data);
      setNotifCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error('❌ خطأ في جلب الإشعارات:', error);
    }
  }, [profile?._id]);

  // دالة موحدة لجلب جميع مواعيد الطبيب
  const fetchAllAppointments = useCallback(async () => {
    console.log('📅 DoctorDashboard: محاولة جلب المواعيد');
    if (!profile?._id) {
      console.log('❌ DoctorDashboard: لا يوجد profile._id');
      return;
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/doctor-appointments/${profile._id}?t=${Date.now()}`);
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('خطأ في جلب المواعيد:', err);
    }
  }, [profile?._id]);

  // دالة البحث في مواعيد اليوم
  const searchTodayAppointments = useCallback((query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    const today = getToday();
    const todayAppointments = appointments.filter(apt => apt.date === today);
    
    const queryLower = query.toLowerCase().trim();
    
    const results = todayAppointments.filter(apt => {
      // البحث في اسم المريض
      const patientName = (apt.patientName || apt.userId?.first_name || apt.userName || '').toLowerCase();
      
      // البحث في رقم الهاتف (إزالة المسافات والرموز)
      const patientPhone = (apt.patientPhone || apt.userId?.phone || '').replace(/[\s\-\(\)]/g, '');
      const searchPhone = queryLower.replace(/[\s\-\(\)]/g, '');
      
      // فحص إذا كان البحث عن اسم أو رقم
      const nameMatch = patientName.includes(queryLower);
      const phoneMatch = patientPhone.includes(searchPhone);
      
      console.log(`🔍 البحث: "${query}" | المريض: "${patientName}" | الهاتف: "${patientPhone}" | نتيجة الاسم: ${nameMatch} | نتيجة الهاتف: ${phoneMatch}`);
      
      return nameMatch || phoneMatch;
    });
    
    console.log(`📊 نتائج البحث: ${results.length} من أصل ${todayAppointments.length} مواعيد`);
    setSearchResults(results);
    setIsSearching(false);
  }, [appointments]);

  // دالة لتحديث البيانات
  const refreshData = useCallback(() => {
    console.log('🔄 تحديث بيانات الدكتور...');
    
    // تنظيف التخزين المؤقت
    if (window.caches) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('doctor') || name.includes('appointment') || name.includes('notification')) {
            caches.delete(name);
          }
        });
      });
    }
    
    // إعادة جلب البيانات
    fetchAllAppointments();
    fetchNotifications();
  }, [fetchAllAppointments, fetchNotifications]);

  // جلب إشعارات الدكتور
  useEffect(() => {
    console.log('🔄 DoctorDashboard: useEffect - جلب الإشعارات');
    fetchNotifications();
  }, [fetchNotifications]);

  // تعليم كل الإشعارات كمقروءة عند فتح نافذة الإشعارات
  useEffect(() => {
    if (showNotif && profile?._id && notifCount > 0) {
      setNotifCount(0); // تصفير العداد فوراً
      fetch(`${process.env.REACT_APP_API_URL}/notifications/mark-read?doctorId=${profile._id}`, { method: 'PUT' });
    }
  }, [showNotif, profile?._id, notifCount]);

  // جلب المواعيد عند تحميل الصفحة
  useEffect(() => {
    console.log('🔄 DoctorDashboard: useEffect - جلب المواعيد');
    fetchAllAppointments();
  }, [fetchAllAppointments]);

  // تنظيف نتائج البحث عند تغيير المواعيد
  useEffect(() => {
    setSearchResults([]);
    setSearchQuery('');
  }, [appointments]);

  // تحديث تلقائي كل 3 دقائق
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 180000); // 3 دقائق
    
    return () => clearInterval(interval);
  }, [refreshData]);

  // تحديث عند تغيير اللغة
  useEffect(() => {
    const handleLanguageChange = () => {
      console.log('🔄 تم تغيير اللغة، تحديث البيانات...');
      refreshData();
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, [i18n, refreshData]);

  // دالة لفتح نافذة الملاحظة
  const openNoteModal = (phone) => {
    setNotePhone(phone);
    const saved = localStorage.getItem('phoneNote_' + phone) || '';
    setNoteValue(saved);
    setShowNoteModal(true);
  };

  if (profile && profile.status === 'pending') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        background: '#f7fafd',
        padding: 0
      }}>
        <div
          style={{
            background: '#fff3e0',
            color: '#e65100',
            borderRadius: 16,
            boxShadow: '0 2px 16px #ff980022',
            padding: '1.5rem 1.2rem',
            fontWeight: 800,
            fontSize: 18,
            marginBottom: 32,
            width: '95%',
            maxWidth: 420,
            textAlign: 'center',
            position: 'fixed',
            left: '50%',
            bottom: 24,
            transform: 'translateX(-50%)',
            zIndex: 1000
          }}
        >
          {t('pending_account_message')}
        </div>
      </div>
    );
  }

  if (!profile || !profile._id) {
    return <div style={{textAlign:'center', marginTop:40}}>{t('loading_doctor_data')}</div>;
  }

  // استخدم appointmentsArray دائماً
  const appointmentsArray = Array.isArray(appointments) ? appointments : [];

  // حساب عدد مواعيد اليوم مع إزالة التكرار
  const today = getToday();
  
  // إزالة التكرار من المواعيد اليومية
  const todayAppointmentsMap = new Map();
  appointmentsArray
    .filter(a => a.date === today)
    .forEach(appointment => {
      // استخدام مفتاح فريد يجمع بين التاريخ والوقت واسم المريض
      const key = `${appointment.date}_${appointment.time}_${appointment.userName || appointment.userId?.first_name || ''}`;
      if (!todayAppointmentsMap.has(key)) {
        todayAppointmentsMap.set(key, appointment);
      }
    });
  
  const todayAppointments = Array.from(todayAppointmentsMap.values());
  const todayCount = todayAppointments.length;
  
  // إضافة console.log للتشخيص
  console.log('🔍 التاريخ الحالي:', today);
  console.log('🔍 مواعيد اليوم (بعد إزالة التكرار):', todayAppointments);
  console.log('🔍 جميع المواعيد:', appointmentsArray.map(a => ({ date: a.date, time: a.time, name: a.userId?.first_name || a.userName, type: a.type })));
  
  // حساب إحصائيات سريعة
  const totalAppointments = appointmentsArray.length;
  const upcomingAppointments = appointmentsArray.filter(a => new Date(a.date) > new Date(today));

  // دالة تنسيق التاريخ - إصلاح مشكلة اللغة
  const formatDate = (dateString) => {
    // إصلاح مشكلة المنطقة الزمنية - معالجة التاريخ بشكل صحيح
    let date;
    if (typeof dateString === 'string' && dateString.includes('-')) {
      // إذا كان التاريخ بصيغة YYYY-MM-DD، قم بإنشاء تاريخ محلي
      const [year, month, day] = dateString.split('-').map(Number);
      date = new Date(year, month - 1, day); // month - 1 لأن getMonth() يبدأ من 0
    } else {
      date = new Date(dateString);
    }
    
    // الحصول على اللغة الحالية
    const currentLang = i18n.language || 'ar';
    
    // محاولة الحصول على أيام الأسبوع والشهور من ملف الترجمة
    let weekdays, months;
    
    try {
      weekdays = t('weekdays', { returnObjects: true });
      months = t('months', { returnObjects: true });
      
      // التحقق من صحة البيانات
      if (!Array.isArray(weekdays) || !Array.isArray(months)) {
        throw new Error('Invalid translation data');
      }
    } catch (error) {
      // استخدام القيم الافتراضية حسب اللغة
      if (currentLang === 'ku') {
        weekdays = ['شەممە', 'یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'هەینی'];
        months = [
          'کانونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران',
          'تەمموز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانونی یەکەم'
        ];
      } else {
        // استخدام العربية كلغة افتراضية
        weekdays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        months = [
          'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
          'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'
        ];
      }
    }
    
    const weekday = weekdays[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    // تنسيق مختلف حسب اللغة
    if (currentLang === 'ku') {
      return `${weekday}، ${day}ی ${month} ${year}`;
    } else {
      return `${weekday}، ${day} ${month} ${year}`;
    }
  };



  // عرّف specialAppointments كمصفوفة مشتقة من appointments:
  const specialAppointments = Array.isArray(appointments) ? appointments.filter(a => a.type === 'special_appointment') : [];



  // تحديث حالة الحضور
  const handleAttendanceUpdate = async (appointmentId, attendance) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/appointments/${appointmentId}/attendance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance })
      });
      
      if (response.ok) {
        toast.success(t('attendance_updated'));
        // إعادة تحميل جميع المواعيد
        fetchAllAppointments();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'خطأ في تحديث حالة الحضور');
      }
    } catch (error) {
      toast.error('خطأ في تحديث حالة الحضور');
    }
  };

  return (
    <div style={{
      background: '#ffffff',
      minHeight: '100vh',
      position: 'relative',
      paddingBottom: '4.5rem',
    }}>
      {/* إزالة الخلفية الزرقاء */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'transparent',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      {/* شريط علوي مبسط مع أزرار */}
              <div style={{
          background: '#0A8F82',
          boxShadow: '0 2px 12px rgba(10, 143, 130, 0.3)',
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          padding: '0.4rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 48,
          position: 'relative',
          zIndex: 2
        }}>
        <div 
          onClick={() => navigate('/')}
          style={{
            display:'flex', 
            alignItems:'center', 
            gap:7, 
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <img src="/logo192.png" alt="Logo" style={{width: 32, height: 32, borderRadius: '50%', background: '#fff', border: '4px solid #fff', boxShadow: '0 2px 12px #00bcd455', objectFit: 'cover', marginRight: 4}} />
        </div>
        <div style={{display:'flex', alignItems:'center', gap:7}}>
          {/* زر الهامبرغر */}
          <button onClick={()=>{
            setShowSidebar(true);
            // إعادة تحميل المواعيد عند فتح القائمة
            fetchAllAppointments();
          }} style={{background:'none', border:'none', fontSize:28, color:'#ffffff', cursor:'pointer', marginLeft:4}} title="القائمة">
            <span role="img" aria-label="menu">☰</span>
          </button>
          {/* أيقونة الإشعارات مصغرة */}
          <div style={{position:'relative', cursor:'pointer'}} onClick={()=>{
            setShowNotif(v=>!v);
            // إعادة تحميل المواعيد عند فتح الإشعارات
            fetchAllAppointments();
          }} title="الإشعارات">
            <span style={{fontSize:22, color:'#ffffff'}} role="img" aria-label="notifications">🔔</span>
            {notifCount > 0 && (
              <span style={{position:'absolute', top:-8, right:-8, background:'#e53935', color:'#fff', borderRadius:'50%', fontSize:10, fontWeight:700, padding:'1px 5px', minWidth:18, textAlign:'center'}}>{notifCount}</span>
            )}
          </div>
        </div>
        {/* القائمة الجانبية (Sidebar) */}
        {showSidebar && (
          <div style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.18)', zIndex:3000, display:'flex'}} onClick={()=>{
            setShowSidebar(false);
            // إعادة تحميل المواعيد عند إغلاق القائمة
            fetchAllAppointments();
          }}>
            <div style={{background:'#fff', width:260, height:'100%', boxShadow:'2px 0 16px rgba(0,0,0,0.1)', padding:'2rem 1.2rem', display:'flex', flexDirection:'column', gap:18}} onClick={e=>e.stopPropagation()}>
              <button onClick={() => navigate('/')} style={{background: '#4caf50', color: '#fff', border: 'none', borderRadius: 12, padding: '0.7rem 1.2rem', fontWeight: 700, fontSize: 16, cursor: 'pointer', display:'flex', alignItems:'center', gap:8, transition:'all 0.3s ease'}}>
                <span role="img" aria-label="العودة للصفحة الرئيسية">🏠</span> {t('back_to_home')}
              </button>
              <button onClick={()=>{
                setShowAdd(true); 
                setShowSidebar(false);
                // إعادة تحميل المواعيد عند فتح إضافة موعد خاص
                fetchAllAppointments();
              }} style={{background: '#ff9800', color: '#fff', border: 'none', borderRadius: 12, padding: '0.7rem 1.2rem', fontWeight: 700, fontSize: 16, cursor: 'pointer', display:'flex', alignItems:'center', gap:8, transition:'all 0.3s ease'}}>
                <span role="img" aria-label="إضافة موعد خاص">⭐</span> {t('add_special_appointment')}
              </button>
              <button onClick={()=>{
                setShowContactModal(true); 
                setShowSidebar(false);
                // إعادة تحميل المواعيد عند فتح اتصل بنا
                fetchAllAppointments();
              }} style={{background: '#0A8F82', color: '#fff', border: 'none', borderRadius: 12, padding: '0.7rem 1.2rem', fontWeight: 700, fontSize: 16, cursor: 'pointer', display:'flex', alignItems:'center', gap:8, transition:'all 0.3s ease'}}>
                <span role="img" aria-label="اتصل بنا">📞</span> {t('contact_us')}
              </button>
              <button onClick={()=>{
                setShowWorkTimesModal(true); 
                setShowSidebar(false);
                // إعادة تحميل المواعيد عند فتح تعديل الدوام
                fetchAllAppointments();
              }} style={{background: '#ff9800', color: '#fff', border: 'none', borderRadius: 12, padding: '0.7rem 1.2rem', fontWeight: 700, fontSize: 16, cursor: 'pointer', display:'flex', alignItems:'center', gap:8, transition:'all 0.3s ease'}}>
                <span role="img" aria-label={t('doctor_dashboard.edit_schedule_vacations')}>📅</span> {t('doctor_dashboard.edit_schedule_vacations')}
              </button>
              <button onClick={()=>{
                setShowAppointmentDurationModal(true); 
                setShowSidebar(false);
                // إعادة تحميل المواعيد عند فتح تعديل مدة الموعد
                fetchAllAppointments();
              }} style={{background: '#0A8F82', color: '#fff', border: 'none', borderRadius: 12, padding: '0.7rem 1.2rem', fontWeight: 700, fontSize: 16, cursor: 'pointer', display:'flex', alignItems:'center', gap:8, transition:'all 0.3s ease'}}>
                <span role="img" aria-label={t('doctor_dashboard.edit_appointment_duration')}>⏱️</span> {t('doctor_dashboard.edit_appointment_duration')}
              </button>
              <button onClick={()=>{
                console.log('🔍 تم الضغط على الملف الشخصي');
                navigate('/doctor-profile'); 
                setShowSidebar(false);
                // إعادة تحميل المواعيد عند فتح الملف الشخصي
                fetchAllAppointments();
              }} style={{background: '#fff', color: '#0A8F82', border: '2px solid #0A8F82', borderRadius: 12, padding: '0.7rem 1.2rem', fontWeight: 700, fontSize: 16, cursor: 'pointer', display:'flex', alignItems:'center', gap:8, transition:'all 0.3s ease'}}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="#0A8F82" strokeWidth="2"/><path d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4" stroke="#0A8F82" strokeWidth="2"/></svg> {t('my_profile')}
              </button>
              <button onClick={()=>{
                signOut(); 
                setShowSidebar(false);
                // إعادة تحميل المواعيد عند تسجيل الخروج
                fetchAllAppointments();
              }} style={{background: '#e53935', color: '#fff', border: 'none', borderRadius: 12, padding: '0.7rem 1.2rem', fontWeight: 700, fontSize: 16, cursor: 'pointer', display:'flex', alignItems:'center', gap:8, marginTop: 18, transition:'all 0.3s ease'}}>
                <span role="img" aria-label="خروج">🚪</span> {t('logout')}
              </button>
              
              {/* زر تغيير اللغة */}
              <div style={{marginTop: 18}}>
                <label style={{fontWeight: 700, color: '#0A8F82', marginBottom: 8, display: 'block', fontSize: 14}}>🌐 {t('change_language')}</label>
                <select 
                  value={i18n.language || 'ar'} 
                  onChange={(e) => {
                    const newLang = e.target.value;
                    i18n.changeLanguage(newLang);
                    localStorage.setItem('selectedLanguage', newLang);
                  }} 
                  style={{
                    background: 'rgba(10, 143, 130, 0.1)', 
                    color: '#0A8F82', 
                    border: '2px solid #0A8F82', 
                    borderRadius: 8, 
                    padding: '0.5rem 0.8rem', 
                    fontWeight: 700, 
                    fontSize: 14, 
                    cursor: 'pointer', 
                    boxShadow: '0 2px 8px rgba(10, 143, 130, 0.2)',
                    width: '100%'
                  }}
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                  <option value="ku">کوردی</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
      <div style={{position:'relative', zIndex:1}}>
                        <h2 style={{textAlign:'center', color:'#0A8F82', marginTop:30, fontSize: '2.2rem', fontWeight: 800}}>{t('doctor_dashboard.title')}</h2>
        
        {/* الإعلانات المتحركة - في أعلى الصفحة بعد العنوان (العرض الوحيد المطلوب) */}
        <div style={{
          maxWidth: 800,
          margin: '2rem auto',
          padding: '0 1rem'
        }}>
          <AdvertisementSlider target="both" />
        </div>
        
        {/* الإحصائيات السريعة */}
        <div style={{maxWidth:700, margin:'1.5rem auto', padding:'0 1rem'}}>
          <div style={{
            display:'grid', 
            gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(auto-fit, minmax(120px, 1fr))', 
            gap: isMobile ? '0.5rem' : '0.8rem', 
            marginBottom:'2rem'
          }}>
            <div style={{
              background:'#fff', 
              borderRadius: isMobile ? 6 : 8, 
              boxShadow:'0 2px 8px rgba(0,0,0,0.08)', 
              padding: isMobile ? '0.5rem' : '0.8rem', 
              textAlign:'center', 
              border: '1px solid #f0f0f0'
            }}>
              <div style={{fontSize: isMobile ? '1rem' : '1.2rem', marginBottom:'0.3rem'}}>📅</div>
              <div style={{
                fontSize: isMobile ? '1.2rem' : '1.5rem', 
                fontWeight:900, 
                color:'#0A8F82', 
                marginBottom:'0.2rem', 
                direction:'ltr', 
                textAlign:'center', 
                unicodeBidi:'bidi-override'
              }}>{totalAppointments}</div>
              <div style={{fontSize: isMobile ? '8px' : '0.9rem', fontWeight:600, color:'#666'}}>{t('total_appointments')}</div>
            </div>
            <div style={{background:'#fff', borderRadius:8, boxShadow:'0 2px 8px rgba(0,0,0,0.08)', padding:'0.8rem', textAlign:'center', border: '1px solid #f0f0f0'}}>
              <div style={{fontSize:'1.2rem', marginBottom:'0.3rem'}}>🎯</div>
              <div style={{fontSize:'1.5rem', fontWeight:900, color:'#0A8F82', marginBottom:'0.2rem', direction:'ltr', textAlign:'center', unicodeBidi:'bidi-override'}}>{todayCount}</div>
              <div style={{fontSize:'0.9rem', fontWeight:600, color:'#666'}}>{t('today_appointments')}</div>
            </div>
            <div style={{background:'#fff', borderRadius:8, boxShadow:'0 2px 8px rgba(0,0,0,0.08)', padding:'0.8rem', textAlign:'center', border: '1px solid #f0f0f0'}}>
              <div style={{fontSize:'1.2rem', marginBottom:'0.3rem'}}>⏰</div>
              <div style={{fontSize:'1.5rem', fontWeight:900, color:'#0A8F82', marginBottom:'0.2rem', direction:'ltr', textAlign:'center', unicodeBidi:'bidi-override'}}>{upcomingAppointments.length}</div>
              <div style={{fontSize:'0.9rem', fontWeight:600, color:'#666'}}>{t('upcoming_appointments')}</div>
            </div>
            <div style={{background:'#fff', borderRadius:8, boxShadow:'0 2px 8px rgba(0,0,0,0.08)', padding:'0.8rem', textAlign:'center', border: '1px solid #f0f0f0'}}>
              <div style={{fontSize:'1.2rem', marginBottom:'0.3rem'}}>📊</div>
              <div style={{fontSize:'1.5rem', fontWeight:900, color:'#0A8F82', marginBottom:'0.2rem', direction:'ltr', textAlign:'center', unicodeBidi:'bidi-override'}}>{notifCount}</div>
              <div style={{fontSize:'0.9rem', fontWeight:600, color:'#666'}}>{t('new_notifications')}</div>
            </div>
          </div>
        </div>
        
        {/* أزرار المواعيد في الصفحة الرئيسية */}
        <div style={{maxWidth:700, margin:'1.5rem auto', padding:'0 1rem'}}>
                      <div style={{
              display:'grid', 
              gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(auto-fit, minmax(140px, 1fr))', 
              gap: isMobile ? '0.5rem' : '1rem',
              textAlign:'center'
            }}>
            {/* زر التقويم */}
            <button style={{
              background:'#0A8F82',
              color:'#fff',
              border:'none',
              borderRadius:'50%',
              width: isMobile ? 60 : 80,
              height: isMobile ? 60 : 80,
              cursor:'pointer',
              transition:'all 0.3s ease',
              display:'flex',
              flexDirection:'column',
              alignItems:'center',
              justifyContent:'center',
              gap:4,
              boxShadow:'0 4px 16px rgba(10, 143, 130, 0.3)',
              marginBottom: isMobile ? 8 : 12
            }} onClick={()=>{
          setShowCalendarModal(true);
          // إعادة تحميل المواعيد عند فتح التقويم
          fetchAllAppointments();
        }}>
              <div style={{fontSize: isMobile ? '1.2rem' : '1.6rem', color:'#fff'}}>📅</div>
            </button>
                            <div style={{fontSize: isMobile ? 11 : 13, fontWeight:700, color:'#0A8F82', marginTop:4}}>{t('doctor_dashboard.calendar')}</div>
            
            {/* زر كل المواعيد */}
            <button 
              onClick={() => {
                navigate('/doctor-appointments');
                // إعادة تحميل المواعيد عند فتح جميع المواعيد
                fetchAllAppointments();
              }}
              style={{
                background:'#0A8F82',
                color:'#fff',
                border:'none',
                borderRadius:'50%',
                width: isMobile ? 60 : 80,
                height: isMobile ? 60 : 80,
                cursor:'pointer',
                transition:'all 0.3s ease',
                display:'flex',
                flexDirection:'column',
                alignItems:'center',
                justifyContent:'center',
                gap:4,
                boxShadow:'0 4px 16px rgba(10, 143, 130, 0.3)',
                marginBottom: isMobile ? 8 : 12
              }}
            >
              <div style={{fontSize: isMobile ? '1.2rem' : '1.6rem', color:'#fff'}}>📋</div>
            </button>
                            <div style={{fontSize: isMobile ? 11 : 13, fontWeight:700, color:'#0A8F82', marginTop:4}}>{t('doctor_dashboard.all_appointments')}</div>

            {/* زر تحليل المواعيد */}
            <button 
              onClick={() => {
  navigate('/doctor-analytics');
}}
              style={{
                background:'#0A8F82',
                color:'#fff',
                border:'none',
                borderRadius:'50%',
                width: isMobile ? 60 : 80,
                height: isMobile ? 60 : 80,
                cursor:'pointer',
                transition:'all 0.3s ease',
                display:'flex',
                flexDirection:'column',
                alignItems:'center',
                justifyContent:'center',
                gap:4,
                boxShadow:'0 4px 16px rgba(10, 143, 130, 0.3)',
                marginBottom: isMobile ? 8 : 12
              }}
            >
              <div style={{fontSize: isMobile ? '1.2rem' : '1.6rem', color:'#fff'}}>📊</div>
            </button>
                            <div style={{fontSize: isMobile ? 11 : 13, fontWeight:700, color:'#0A8F82', marginTop:4}}>{t('doctor_dashboard.appointment_analysis')}</div>





            {/* زر الملف الشخصي */}
            <button 
              onClick={() => {
                navigate('/doctor-profile');
              }}
              style={{
                background:'#0A8F82',
                color:'#fff',
                border:'none',
                borderRadius:'50%',
                width: isMobile ? 60 : 80,
                height: isMobile ? 60 : 80,
                cursor:'pointer',
                transition:'all 0.3s ease',
                display:'flex',
                flexDirection:'column',
                alignItems:'center',
                justifyContent:'center',
                gap:4,
                boxShadow:'0 4px 16px rgba(10, 143, 130, 0.3)',
                marginBottom: isMobile ? 8 : 12
              }}
            >
              <div style={{fontSize: isMobile ? '1.2rem' : '1.6rem', color:'#fff'}}>👤</div>
            </button>
                            <div style={{fontSize: isMobile ? 11 : 13, fontWeight:700, color:'#0A8F82', marginTop:4}}>{t('doctor_dashboard.profile')}</div>
          </div>
        </div>

        {/* صندوق البحث */}
        <div style={{maxWidth:700, margin:'1.5rem auto', padding:'0 1rem'}}>
          <div style={{background:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(0,0,0,0.08)', padding:'1.5rem', border: '1px solid #f0f0f0'}}>
            <h3 style={{color:'#0A8F82', marginBottom:'1rem', textAlign:'center', fontWeight:700, fontSize: '1.2rem', direction:'rtl'}}>
              🔍 {t('doctor_dashboard.search_today_appointments')}
            </h3>
            
            {/* صندوق البحث */}
            <div style={{marginBottom:'1rem', position: 'relative'}}>
              <input
                type="text"
                placeholder={t('doctor_dashboard.search_placeholder')}
                value={searchQuery}
                onChange={(e) => {
                  const query = e.target.value;
                  setSearchQuery(query);
                  searchTodayAppointments(query);
                }}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  paddingRight: searchQuery.trim() ? '3rem' : '1rem',
                  borderRadius: '8px',
                  border: searchQuery.trim() ? '2px solid #0A8F82' : '2px solid #e0e0e0',
                  fontSize: '1rem',
                  background: searchQuery.trim() ? '#f0f9f8' : '#f8f9fa',
                  transition: 'all 0.3s ease',
                  direction: 'rtl',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.border = '2px solid #0A8F82';
                  e.target.style.background = '#f0f9f8';
                }}
                onBlur={(e) => {
                  if (!searchQuery.trim()) {
                    e.target.style.border = '2px solid #e0e0e0';
                    e.target.style.background = '#f8f9fa';
                  }
                }}
              />
              
              {/* زر مسح البحث */}
              {searchQuery.trim() && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#666',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    padding: '0.2rem',
                    borderRadius: '50%',
                    width: '2rem',
                    height: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#f0f0f0';
                    e.target.style.color = '#333';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'none';
                    e.target.style.color = '#666';
                  }}
                  title={t('doctor_dashboard.clear_search')}
                >
                  ✕
                </button>
              )}
            </div>

            {/* نتائج البحث */}
            {searchQuery.trim() && (
              <div style={{marginBottom:'1rem'}}>
                <h4 style={{color:'#666', marginBottom:'0.8rem', textAlign:'center', fontWeight:600, fontSize: '1rem', direction:'rtl'}}>
                  {t('doctor_dashboard.search_results')} ({searchResults.length})
                </h4>
                
                {searchResults.length > 0 ? (
                  <div style={{
                    display:'grid', 
                    gridTemplateColumns: isMobile ? 'repeat(auto-fit, minmax(280px, 1fr))' : 'repeat(auto-fit, minmax(300px, 1fr))', 
                    gap: isMobile ? '0.8rem' : '1rem'
                  }}>
                    {searchResults.map(appointment => (
                      <div key={appointment._id} style={{
                        background:'#fff3cd',
                        borderRadius: isMobile ? 8 : 12,
                        padding: isMobile ? '0.8rem' : '1rem',
                        border:'2px solid #ffc107',
                        boxShadow:'0 2px 8px rgba(255, 193, 7, 0.2)',
                        position:'relative',
                        transition: 'all 0.3s ease'
                      }}>
                        {/* شارة موعد خاص */}
                        {appointment.type === 'special_appointment' && (
                          <div style={{
                            position:'absolute',
                            top: isMobile ? 6 : 8,
                            left:8,
                            background:'#0A8F82',
                            color:'#fff',
                            borderRadius: isMobile ? 8 : 12,
                            padding: isMobile ? '0.15rem 0.5rem' : '0.2rem 0.6rem',
                            fontWeight:600,
                            fontSize: isMobile ? '0.7rem' : '0.75rem',
                            zIndex:2
                          }}>
                            {t('special_appointment')}
                          </div>
                        )}
                        
                        {/* معلومات المريض */}
                        <div style={{marginBottom:'0.8rem'}}>
                          {/* اسم المريض أولاً */}
                          <div style={{color:'#0A8F82', fontWeight:700, fontSize:'1.1rem', marginBottom:'0.3rem', direction:'rtl', textAlign:'right'}}>
                            👤 {appointment.isBookingForOther ? appointment.patientName : (appointment.userId?.first_name || appointment.userName || t('patient_name'))}
                          </div>
                          
                          {/* عرض عمر المريض */}
                          <div style={{fontSize:'0.9rem', color:'#666', marginBottom:'0.3rem', direction:'rtl', textAlign:'right'}}>
                            🎂 {t('common.age')}: {appointment.patientAge ? `${appointment.patientAge} ${t('common.years')}` : t('common.not_available')}
                          </div>
                          
                          {/* وقت وتاريخ الموعد */}
                          <div style={{marginBottom:'0.3rem'}}>
                            <div style={{fontWeight:600, fontSize:'1rem', color:'#333', marginBottom:'0.2rem', direction:'ltr', textAlign:'left', unicodeBidi:'bidi-override'}}>
                              🕐 {appointment.time}
                            </div>
                            <div style={{fontSize:'0.85rem', color:'#888', direction:'rtl', textAlign:'right'}}>
                              📅 {formatDate(appointment.date)}
                            </div>
                          </div>
                          
                          {/* عرض معلومات الحجز لشخص آخر */}
                          {appointment.isBookingForOther && (
                            <div style={{
                              background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                              border: '2px solid #4caf50',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              marginBottom: '8px'
                            }}>
                              <div style={{fontSize: '12px', fontWeight: 600, color: '#2e7d32', marginBottom: '4px'}}>
                                👥 {t('booking.booking_for_other_person')}
                              </div>
                              <div style={{fontSize: '11px', color: '#2e7d32'}}>
                                <strong>{t('booking.patient_name')}:</strong> {appointment.patientName} | 
                                <strong> {t('booking.patient_phone')}:</strong> {appointment.patientPhone}
                              </div>
                              <div style={{fontSize: '11px', color: '#2e7d32', fontStyle: 'italic'}}>
                                {t('booked_by')}: {appointment.bookerName || appointment.userName}
                              </div>
                            </div>
                          )}
                          
                          {/* عرض رقم الهاتف */}
                          {(appointment.patientPhone || appointment.userId?.phone || (/^\+?\d{10,}$/.test(appointment.notes))) && (
                            <div style={{fontSize:'0.9rem', color:'#666', marginBottom:'0.3rem', direction:'ltr', textAlign:'left', unicodeBidi:'bidi-override'}}>
                              📞 {appointment.patientPhone || appointment.userId?.phone || appointment.notes}
                            </div>
                          )}
                        </div>
                        
                        {/* ملاحظة أو سبب */}
                        {(appointment.type === 'special_appointment' && appointment.notes && !(/^\+?\d{10,}$/.test(appointment.notes))) && (
                          <div style={{fontSize:'0.85rem', color:'#0A8F82', marginBottom:'0.8rem', fontStyle:'italic', padding:'0.5rem', background:'#e8f5e8', borderRadius:6, direction:'rtl', textAlign:'right'}}>
                            📝 {appointment.notes}
                          </div>
                        )}
                        {appointment.reason && (
                          <div style={{fontSize:'0.85rem', color:'#666', marginBottom:'0.8rem', padding:'0.5rem', background:'#f5f5f5', borderRadius:6, direction:'rtl', textAlign:'right'}}>
                            💬 {appointment.reason}
                          </div>
                        )}
                        
                        {/* حالة الحضور */}
                        <div style={{marginBottom:'0.8rem'}}>
                          {appointment.attendance === 'present' ? (
                            <div style={{
                              background:'#4caf50',
                              color:'#fff',
                              padding:'0.3rem 0.6rem',
                              borderRadius:6,
                              fontSize:'0.75rem',
                              fontWeight:600,
                              textAlign:'center',
                              display:'inline-block'
                            }}>
                              ✅ {t('present')}
                            </div>
                          ) : appointment.attendance === 'absent' ? (
                            <div style={{
                              background:'#f44336',
                              color:'#fff',
                              padding:'0.3rem 0.6rem',
                              borderRadius:6,
                              fontSize:'0.75rem',
                              fontWeight:600,
                              textAlign:'center',
                              display:'inline-block'
                            }}>
                              ❌ {t('absent')}
                            </div>
                          ) : (
                            <div style={{
                              background:'#ff9800',
                              color:'#fff',
                              padding:'0.3rem 0.6rem',
                              borderRadius:6,
                              fontSize:'0.75rem',
                              fontWeight:600,
                              textAlign:'center',
                              display:'inline-block'
                            }}>
                              ⏳ {t('waiting')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '1rem',
                    color: '#666',
                    fontSize: '0.9rem',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    {t('doctor_dashboard.no_search_results')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* مواعيد اليوم */}
        {todayCount > 0 && (
          <div style={{maxWidth:700, margin:'1.5rem auto', padding:'0 1rem'}}>
            <div style={{background:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(0,0,0,0.08)', padding:'1.5rem', border: '1px solid #f0f0f0'}}>
              <h3 style={{color:'#0A8F82', marginBottom:'1.5rem', textAlign:'center', fontWeight:700, fontSize: '1.3rem', direction:'rtl'}}>
                🎯 {t('today_appointments')} ({formatDate(today)}) - {todayCount} {t('appointment')}
              </h3>
              <div style={{
                display:'grid', 
                gridTemplateColumns: isMobile ? 'repeat(auto-fit, minmax(280px, 1fr))' : 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: isMobile ? '0.8rem' : '1rem'
              }}>
                {todayAppointments.map(appointment => (
                  <div key={appointment._id} style={{
                    background:'#fff',
                    borderRadius: isMobile ? 8 : 12,
                    padding: isMobile ? '0.8rem' : '1rem',
                    border:'1px solid #e0e0e0',
                    boxShadow:'0 2px 8px rgba(0,0,0,0.06)',
                    position:'relative',
                    transition: 'all 0.3s ease'
                  }}>
                    {/* شارة "مؤكد" بلون أخضر */}
                    
                    
                    {/* شارة موعد خاص */}
                    {appointment.type === 'special_appointment' && (
                      <div style={{
                        position:'absolute',
                        top: isMobile ? 6 : 8,
                        left:8,
                        background:'#0A8F82',
                        color:'#fff',
                        borderRadius: isMobile ? 8 : 12,
                        padding: isMobile ? '0.15rem 0.5rem' : '0.2rem 0.6rem',
                        fontWeight:600,
                        fontSize: isMobile ? '0.7rem' : '0.75rem',
                        zIndex:2
                      }}>
                        {t('special_appointment')}
                      </div>
                    )}
                    
                    {/* معلومات المريض */}
                    <div style={{marginBottom:'0.8rem'}}>
                      {/* اسم المريض أولاً */}
                      <div style={{color:'#0A8F82', fontWeight:700, fontSize:'1.1rem', marginBottom:'0.3rem', direction:'rtl', textAlign:'right'}}>
                        👤 {appointment.isBookingForOther ? appointment.patientName : (appointment.userId?.first_name || appointment.userName || t('patient_name'))}
                      </div>
                      
                      {/* عرض عمر المريض */}
                      <div style={{fontSize:'0.9rem', color:'#666', marginBottom:'0.3rem', direction:'rtl', textAlign:'right'}}>
                        🎂 {t('common.age')}: {appointment.patientAge ? `${appointment.patientAge} ${t('common.years')}` : t('common.not_available')}
                      </div>
                      
                      {/* وقت وتاريخ الموعد */}
                      <div style={{marginBottom:'0.3rem'}}>
                        <div style={{fontWeight:600, fontSize:'1rem', color:'#333', marginBottom:'0.2rem', direction:'ltr', textAlign:'left', unicodeBidi:'bidi-override'}}>
                          🕐 {appointment.time}
                        </div>
                        <div style={{fontSize:'0.85rem', color:'#888', direction:'rtl', textAlign:'right'}}>
                          📅 {formatDate(appointment.date)}
                        </div>
                      </div>
                      
                      {/* عرض معلومات الحجز لشخص آخر */}
                      {appointment.isBookingForOther && (
                        <div style={{
                          background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                          border: '2px solid #4caf50',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          marginBottom: '8px'
                        }}>
                          <div style={{fontSize: '12px', fontWeight: 600, color: '#2e7d32', marginBottom: '4px'}}>
                            👥 {t('booking.booking_for_other_person')}
                          </div>
                          <div style={{fontSize: '11px', color: '#2e7d32'}}>
                            <strong>{t('booking.patient_name')}:</strong> {appointment.patientName} | 
                            <strong> {t('booking.patient_phone')}:</strong> {appointment.patientPhone}
                          </div>
                          <div style={{fontSize: '11px', color: '#2e7d32', fontStyle: 'italic'}}>
                            {t('booked_by')}: {appointment.bookerName || appointment.userName}
                          </div>
                        </div>
                      )}
                      
                      {/* عرض رقم الهاتف */}
                      {(appointment.patientPhone || appointment.userId?.phone || (/^\+?\d{10,}$/.test(appointment.notes))) && (
                        <div style={{fontSize:'0.9rem', color:'#666', marginBottom:'0.3rem', direction:'ltr', textAlign:'left', unicodeBidi:'bidi-override'}}>
                          📞 {appointment.patientPhone || appointment.userId?.phone || appointment.notes}
                        </div>
                      )}
                    </div>
                    
                    {/* ملاحظة أو سبب */}
                    {(appointment.type === 'special_appointment' && appointment.notes && !(/^\+?\d{10,}$/.test(appointment.notes))) && (
                      <div style={{fontSize:'0.85rem', color:'#0A8F82', marginBottom:'0.8rem', fontStyle:'italic', padding:'0.5rem', background:'#e8f5e8', borderRadius:6, direction:'rtl', textAlign:'right'}}>
                        📝 {appointment.notes}
                      </div>
                    )}
                    {appointment.reason && (
                      <div style={{fontSize:'0.85rem', color:'#666', marginBottom:'0.8rem', padding:'0.5rem', background:'#f5f5f5', borderRadius:6, direction:'rtl', textAlign:'right'}}>
                        💬 {appointment.reason}
                      </div>
                    )}
                    
                    {/* حالة الحضور */}
                    <div style={{marginBottom:'0.8rem'}}>
                      {appointment.attendance === 'present' ? (
                        <div style={{
                          background:'#4caf50',
                          color:'#fff',
                          padding:'0.3rem 0.6rem',
                          borderRadius:6,
                          fontSize:'0.75rem',
                          fontWeight:600,
                          textAlign:'center',
                          display:'inline-block'
                        }}>
                          ✅ {t('present')}
                        </div>
                      ) : (
                        <div style={{
                          background:'#f44336',
                          color:'#fff',
                          padding:'0.3rem 0.6rem',
                          borderRadius:6,
                          fontSize:'0.75rem',
                          fontWeight:600,
                          textAlign:'center',
                          display:'inline-block'
                        }}>
                          ❌ {t('absent')}
                        </div>
                      )}
                    </div>

                    {/* أزرار التحكم */}
                    <div style={{display:'flex', gap:'0.5rem', justifyContent:'flex-end', flexWrap:'wrap'}}>
                      {(!appointment.attendance || appointment.attendance === 'absent') && (
                        <button 
                          onClick={() => handleAttendanceUpdate(appointment._id, 'present')}
                          style={{
                            background:'#4caf50',
                            color:'#fff',
                            border:'none',
                            borderRadius:8,
                            padding:'0.4rem 0.8rem',
                            fontWeight:600,
                            cursor:'pointer',
                            fontSize:'0.8rem',
                            transition:'all 0.3s ease'
                          }}
                        >
                          ✅ {t('mark_present')}
                        </button>
                      )}
                      <button 
                        onClick={() => navigate('/doctor-appointments')}
                        style={{
                          background:'#0A8F82',
                          color:'#fff',
                          border:'none',
                          borderRadius:8,
                          padding:'0.4rem 0.8rem',
                          fontWeight:600,
                          cursor:'pointer',
                          fontSize:'0.8rem',
                          transition:'all 0.3s ease'
                        }}
                      >
                        {t('manage')}
                      </button>
                      <button 
                        onClick={() => openNoteModal(appointment.patientPhone || appointment.userId?.phone || appointment.notes)}
                        style={{
                          background:'#0A8F82',
                          color:'#fff',
                          border:'none',
                          borderRadius:8,
                          padding:'0.4rem 0.8rem',
                          fontWeight:600,
                          cursor:'pointer',
                          fontSize:'0.8rem',
                          transition:'all 0.3s ease'
                        }}
                      >
                        ملاحظة
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* نافذة الإشعارات */}
        {showNotif && (
          <div style={{
            position:'fixed',
            top: window.innerWidth < 500 ? 0 : 70,
            right: window.innerWidth < 500 ? 0 : 20,
            left: window.innerWidth < 500 ? 0 : 'auto',
            width: window.innerWidth < 500 ? '100vw' : 'auto',
            background:'#fff',
            borderRadius: window.innerWidth < 500 ? 0 : 12,
            boxShadow:'0 2px 16px #7c4dff22',
            padding: window.innerWidth < 500 ? '1rem 0.5rem' : '1.2rem 1.5rem',
            zIndex:1000,
            minWidth: window.innerWidth < 500 ? undefined : 260,
            maxWidth: window.innerWidth < 500 ? '100vw' : 350,
            maxHeight: window.innerWidth < 500 ? '60vh' : undefined,
            overflowY: window.innerWidth < 500 ? 'auto' : undefined
          }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
              <h4 style={{margin:'0', color:'#7c4dff', fontSize: window.innerWidth < 500 ? 17 : 20}}>{t('notifications')}</h4>
              <button onClick={()=>setShowNotif(false)} style={{background:'none', border:'none', color:'#e53935', fontSize:22, fontWeight:900, cursor:'pointer', marginRight:2, marginTop:-2}}>&times;</button>
            </div>
            {notifications.length === 0 ? (
              <div style={{color:'#888', fontSize: window.innerWidth < 500 ? 14 : 15}}>{t('no_notifications')}</div>
            ) : notifications.map(n => (
              <div key={n._id} style={{background:'#f7fafd', borderRadius:8, padding: window.innerWidth < 500 ? '0.5rem 0.7rem' : '0.7rem 1rem', marginBottom:7, color:'#444', fontWeight:600, fontSize: window.innerWidth < 500 ? 13 : 15}}>
                {n.type === 'new_appointment' ? renderNewAppointmentNotification(n.message, t) : n.message}
                <div style={{fontSize: window.innerWidth < 500 ? 11 : 12, color:'#888', marginTop:4}}>{formatKurdishDateTime(n.createdAt)}</div>
              </div>
            ))}
          </div>
        )}
        {/* نافذة إضافة موعد خاص */}
        {showAdd && (
          <div style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.18)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000}}>
            <div style={{background:'#fff', borderRadius:20, boxShadow:'0 8px 32px rgba(0,0,0,0.2)', padding:'2.5rem 2rem', minWidth:450, maxWidth:600, maxHeight:'90vh', overflowY:'auto'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
                <h3 style={{color:'#4caf50', fontWeight:800, fontSize:24, margin:0}}>➕ {t('add_special_appointment')}</h3>
                <button 
                  onClick={()=>{
  setShowAdd(false);
  // إعادة تحميل المواعيد عند إغلاق نافذة الإضافة
  fetchAllAppointments();
}}
                  style={{
                    background:'#e53935',
                    color:'#fff',
                    border:'none',
                    borderRadius:8,
                    padding:'0.5rem 1rem',
                    fontWeight:700,
                    fontSize:14,
                    cursor:'pointer'
                  }}
                >
                  {t('close')}
                </button>
              </div>
              
              <AddSpecialAppointmentForm 
                onClose={()=>{
  setShowAdd(false);
  // إعادة تحميل المواعيد عند إغلاق نافذة الإضافة
  fetchAllAppointments();
}} 
                onAdd={(newAppointment) => {
                  const updatedAppointments = [newAppointment, ...appointments];
                  setAppointments(updatedAppointments);
                  localStorage.setItem('specialAppointments', JSON.stringify(updatedAppointments));
                  setShowAdd(false);
                }}
                profile={profile}
              />
            </div>
          </div>
        )}
        {/* نافذة المواعيد الخاصة */}
        {showSpecialAppointments && (
          <div style={{
            position:'fixed',
            top: 60, // نزّل النافذة للأسفل قليلاً
            left:0,
            width:'100vw',
            height:'calc(100vh - 60px)',
            background:'rgba(0,0,0,0.18)',
            display:'flex',
            alignItems:'flex-start',
            justifyContent:'center',
            zIndex:2000,
            overflowY:'auto',
            padding: window.innerWidth < 500 ? '0.5rem' : '2rem',
          }}>
            <div style={{
              background:'#fff',
              borderRadius:20,
              boxShadow:'0 8px 32px rgba(0,0,0,0.2)',
              padding: window.innerWidth < 500 ? '1.2rem 0.7rem' : '2.5rem 2rem',
              minWidth: window.innerWidth < 500 ? 180 : 320,
              maxWidth: window.innerWidth < 500 ? '98vw' : 1200,
              maxHeight:'90vh',
              overflowX: window.innerWidth < 500 ? 'auto' : 'visible',
              overflowY:'auto',
              width: window.innerWidth < 500 ? '98vw' : undefined,
              position:'relative',
              marginTop: 10,
            }}>
              {/* أزرار علوية: إغلاق وتسجيل خروج */}
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: window.innerWidth < 500 ? 10 : 18}}>
                <button onClick={()=>{
  setShowSpecialAppointments(false);
  // إعادة تحميل المواعيد عند إغلاق نافذة المواعيد الخاصة
  fetchAllAppointments();
}} style={{background:'#e53935', color:'#fff', border:'none', borderRadius:8, padding:'0.4rem 1.1rem', fontWeight:700, fontSize:15, cursor:'pointer'}}>
                  {t('close')}
                </button>
                <button onClick={signOut} style={{background:'#009688', color:'#fff', border:'none', borderRadius:8, padding:'0.4rem 1.1rem', fontWeight:700, fontSize:15, cursor:'pointer'}}>
                  {t('logout')}
                </button>
              </div>
              <div style={{overflowX: window.innerWidth < 500 ? 'auto' : 'visible'}}>
                <SpecialAppointmentsList 
                  appointments={specialAppointments} 
                  onDelete={(id) => {
                    const updatedAppointments = appointments.filter(apt => apt.id !== id);
                    setAppointments(updatedAppointments);
                    localStorage.setItem('specialAppointments', JSON.stringify(updatedAppointments));
                    // إعادة تحميل المواعيد من الخادم
                    fetchAllAppointments();
                  }}
                  onEdit={(appointment) => {
                    setSelectedAppointmentForEdit(appointment);
                    setShowEditSpecial(true);
                  }}
                  onOpenNote={openNoteModal}
                />
              </div>
            </div>
          </div>
        )}
        {/* نافذة تعديل الموعد الخاص */}
        {showEditSpecial && selectedAppointmentForEdit && (
          <div style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.18)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, overflowY:'auto', padding:'2rem'}}>
            <div style={{background:'#fff', borderRadius:20, boxShadow:'0 8px 32px rgba(0,0,0,0.2)', padding:'2.5rem 2rem', minWidth:450, maxWidth:600, maxHeight:'90vh', overflowY:'auto'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
                <h3 style={{color:'#ff9800', fontWeight:800, fontSize:24, margin:0, display:'flex', alignItems:'center', gap:'0.5rem'}}>
                  ✏️ {t('edit_special_appointment')}
                </h3>
                <button 
                  onClick={() => {
  setShowEditSpecial(false); 
  setSelectedAppointmentForEdit(null);
  // إعادة تحميل المواعيد عند إغلاق نافذة التعديل
  fetchAllAppointments();
}}
                  style={{
                    background:'#e53935',
                    color:'#fff',
                    border:'none',
                    borderRadius:8,
                    padding:'0.5rem 1rem',
                    fontWeight:700,
                    fontSize:14,
                    cursor:'pointer'
                  }}
                >
                  {t('close')}
                </button>
              </div>
              
              <EditSpecialAppointmentForm 
                appointment={selectedAppointmentForEdit}
                onSubmit={(updatedData) => {
                  const updatedAppointments = appointments.map(apt => 
                    apt.id === selectedAppointmentForEdit.id 
                      ? { ...apt, ...updatedData }
                      : apt
                  );
                  setAppointments(updatedAppointments);
                  localStorage.setItem('specialAppointments', JSON.stringify(updatedAppointments));
                  setShowEditSpecial(false);
                  setSelectedAppointmentForEdit(null);
                  alert(t('special_appointment_updated_successfully'));
                  // إعادة تحميل المواعيد من الخادم
                  fetchAllAppointments();
                }}
                onClose={() => {
  setShowEditSpecial(false); 
  setSelectedAppointmentForEdit(null);
  // إعادة تحميل المواعيد عند إغلاق نافذة التعديل
  fetchAllAppointments();
}}
              />
            </div>
          </div>
        )}


        {/* نافذة التواصل */}
        {showContactModal && (
          <div style={{
            position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.18)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:3000
          }} onClick={()=>{
  setShowContactModal(false);
  // إعادة تحميل المواعيد عند إغلاق نافذة الاتصال
  fetchAllAppointments();
}}>
            <div style={{
              background:'#fff',
              borderRadius:18,
              boxShadow:'0 4px 24px #7c4dff33',
              padding: window.innerWidth < 500 ? '1.2rem 0.7rem' : '2.2rem 1.5rem',
              minWidth: window.innerWidth < 500 ? 180 : 260,
              maxWidth: window.innerWidth < 500 ? 240 : 350,
              textAlign:'center',
              position:'relative',
              width: window.innerWidth < 500 ? '90vw' : undefined
            }} onClick={e=>e.stopPropagation()}>
              <button onClick={()=>{
  setShowContactModal(false);
  // إعادة تحميل المواعيد عند إغلاق نافذة الاتصال
  fetchAllAppointments();
}} style={{position:'absolute', top:10, left:10, background:'none', border:'none', color:'#e53935', fontSize:window.innerWidth < 500 ? 18 : 22, fontWeight:900, cursor:'pointer'}}>&times;</button>
              <h3 style={{color:'#4caf50', marginBottom:14, fontWeight:800, fontSize:window.innerWidth < 500 ? 16 : 22}}>{t('contact_info_title')}</h3>
              <div style={{display:'flex', flexDirection:'column', gap:window.innerWidth < 500 ? 10 : 18}}>
                <button onClick={()=>window.open('mailto:tabibiqapp@gmail.com','_blank')} style={{background:'#4caf50', color:'#fff', border:'none', borderRadius:14, padding:window.innerWidth < 500 ? '0.6rem 0.7rem' : '1rem 1.2rem', fontWeight:800, fontSize:window.innerWidth < 500 ? 13 : 16, display:'flex', alignItems:'center', gap:8, boxShadow:'0 2px 12px rgba(76, 175, 80, 0.3)', cursor:'pointer'}}>
                  <span style={{fontSize:window.innerWidth < 500 ? 16 : 22}}>📧</span> {t('email')}: tabibiqapp@gmail.com
                </button>
                <button onClick={()=>window.open('https://wa.me/9647769012619','_blank')} style={{background:'#ff9800', color:'#fff', border:'none', borderRadius:14, padding:window.innerWidth < 500 ? '0.6rem 0.7rem' : '1rem 1.2rem', fontWeight:800, fontSize:window.innerWidth < 500 ? 13 : 16, display:'flex', alignItems:'center', gap:8, boxShadow:'0 2px 12px rgba(255, 152, 0, 0.3)', cursor:'pointer'}}>
                  <span style={{fontSize:window.innerWidth < 500 ? 16 : 22}}>💬</span> {t('whatsapp')}: +964 776 901 2619
                </button>
              </div>
            </div>
          </div>
        )}
        {/* نافذة تقويم المواعيد المنبثقة */}
        {showCalendarModal && (
          <div style={{
            position:'fixed',
            top:0,
            left:0,
            width:'100vw',
            height:'100vh',
            background:'rgba(0,0,0,0.18)',
            display:'flex',
            alignItems:'flex-start',
            justifyContent:'center',
            zIndex:3000,
            overflowY:'auto',
          }}>
            <div style={{
              background:'#fff',
              borderRadius: window.innerWidth < 500 ? 12 : 20,
              boxShadow:'0 8px 32px rgba(0,0,0,0.2)',
              padding: window.innerWidth < 500 ? '1.2rem 0.5rem' : '2.5rem 2rem',
              minWidth: window.innerWidth < 500 ? '98vw' : 320,
              maxWidth: window.innerWidth < 500 ? '100vw' : 600,
              width: window.innerWidth < 500 ? '100vw' : '95vw',
              position:'relative',
              maxHeight:'85vh',
              overflowY:'auto',
              display:'flex',
              flexDirection:'column',
              marginTop: window.innerWidth < 500 ? 24 : 32
            }}>
              <button onClick={()=>{
  setShowCalendarModal(false);
  // إعادة تحميل المواعيد عند إغلاق نافذة التقويم
  fetchAllAppointments();
}} style={{
                position:'sticky',
                top:0,
                left:0,
                background:'none',
                border:'none',
                color:'#e53935',
                fontSize:22,
                fontWeight:900,
                cursor:'pointer',
                zIndex:10,
                alignSelf:'flex-start',
                marginBottom:8
              }}>&times;</button>
              <DoctorCalendar appointments={appointments} />
            </div>
          </div>
        )}
        {showNoteModal && (
          <div style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.18)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:4000}}>
            <div style={{background:'#fff', borderRadius:16, boxShadow:'0 8px 32px rgba(0,0,0,0.2)', padding:'2rem 1.5rem', minWidth:300, maxWidth:400, width:'95vw', position:'relative'}}>
              <button onClick={()=>{
  setShowNoteModal(false);
  // إعادة تحميل المواعيد عند إغلاق نافذة الملاحظة
  fetchAllAppointments();
}} style={{position:'absolute', top:10, left:10, background:'none', border:'none', color:'#e53935', fontSize:22, fontWeight:900, cursor:'pointer'}}>&times;</button>
              <h3 style={{color:'#7c4dff', marginBottom:18, fontWeight:700, fontSize:20}}>{t('patient_note')}</h3>
              {!notePhone ? (
                <div style={{marginBottom:14}}>
                  <input type="tel" placeholder={t('patient_phone')} value={notePhone} onChange={e=>setNotePhone(e.target.value)} style={{width:'100%', borderRadius:8, border:'1.5px solid #7c4dff', padding:'0.7rem', fontSize:15, marginBottom:8}} />
                  <button onClick={()=>{
                    const saved = localStorage.getItem('phoneNote_' + notePhone) || '';
                    setNoteValue(saved);
                    // إعادة تحميل المواعيد عند البحث عن الملاحظة
                    fetchAllAppointments();
                  }} style={{background:'#7c4dff', color:'#fff', border:'none', borderRadius:8, padding:'0.5rem 1.2rem', fontWeight:700, fontSize:15, cursor:'pointer'}}>{t('search')}</button>
                </div>
              ) : (
                <>
                  <div style={{color:'#888', fontSize:15, marginBottom:10}}>{t('patient_phone')}: <b>{notePhone}</b></div>
                  <textarea value={noteValue} onChange={e=>setNoteValue(e.target.value)} rows={5} style={{width:'100%', borderRadius:8, border:'1.5px solid #7c4dff', padding:'0.7rem', fontSize:15, marginBottom:14}} placeholder={t('patient_note') + '...'} />
                  <div style={{display:'flex', gap:10, justifyContent:'flex-end'}}>
                    <button onClick={()=>{
                      localStorage.setItem('phoneNote_' + notePhone, noteValue);
                      setShowNoteModal(false);
                      // إعادة تحميل المواعيد عند حفظ الملاحظة
                      fetchAllAppointments();
                    }} style={{background:'#7c4dff', color:'#fff', border:'none', borderRadius:8, padding:'0.6rem 1.2rem', fontWeight:700, fontSize:15, cursor:'pointer'}}>{t('save_note')}</button>
                    {noteValue && (
                      <button onClick={()=>{
                        localStorage.removeItem('phoneNote_' + notePhone);
                        setNoteValue('');
                        setShowNoteModal(false);
                        // إعادة تحميل المواعيد عند حذف الملاحظة
                        fetchAllAppointments();
                      }} style={{background:'#e53935', color:'#fff', border:'none', borderRadius:8, padding:'0.6rem 1.2rem', fontWeight:700, fontSize:15, cursor:'pointer'}}>{t('delete_note')}</button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* مودال تعديل الدوام */}
      {showWorkTimesModal && (
        <div style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.5)', zIndex:5000, display:'flex', alignItems:'center', justifyContent:'center'}} onClick={()=>setShowWorkTimesModal(false)}>
          <div style={{background:'#fff', borderRadius:16, padding:'2rem', maxWidth:'90vw', maxHeight:'80vh', overflow:'auto', width:400}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
                              <h3 style={{color:'#0A8F82', margin:0, fontWeight:700}}>📅 {t('doctor_dashboard.edit_schedule_vacations')}</h3>
              <button onClick={()=>setShowWorkTimesModal(false)} style={{background:'#e53935', color:'#fff', border:'none', borderRadius:8, fontSize:20, fontWeight:900, padding:'0.2rem 0.8rem', cursor:'pointer'}}>×</button>
            </div>
            <WorkTimesEditor 
              profile={profile} 
              onClose={()=>setShowWorkTimesModal(false)}
              onUpdate={(updatedData) => {
                console.log('🔄 DoctorDashboard: استلام البيانات المحدثة:', updatedData);
                setShowWorkTimesModal(false);
                
                // تحديث البيانات المحلية مباشرة مع الحفاظ على الصورة الشخصية
                if (updatedData) {
                  const updatedProfile = { 
                    ...profile, 
                    workTimes: updatedData.workTimes || profile.workTimes,
                    vacationDays: updatedData.vacationDays || profile.vacationDays,
                    lastUpdated: updatedData.lastUpdated || new Date().toISOString()
                  };
                  
                  console.log('💾 DoctorDashboard: حفظ البيانات المحدثة في localStorage:', updatedProfile);
                  localStorage.setItem('profile', JSON.stringify(updatedProfile));
                  
                  // تحديث state فوراً
                  setProfile(updatedProfile);
                  
                  // إعادة جلب المواعيد بعد تأخير قصير للتأكد من تحديث البيانات
                  setTimeout(() => {
                    fetchAllAppointments();
                  }, 300);
                  
                  // إضافة timestamp منفصل للتأكد من تحديث البيانات
                  localStorage.setItem('profile_lastUpdated', updatedProfile.lastUpdated);
                }
              }}
              fetchAllAppointments={fetchAllAppointments}
            />
          </div>
        </div>
      )}
      
      {/* مودال تعديل مدة الموعد */}
      {showAppointmentDurationModal && (
        <div style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.5)', zIndex:5000, display:'flex', alignItems:'center', justifyContent:'center'}} onClick={()=>setShowAppointmentDurationModal(false)}>
          <div style={{background:'#fff', borderRadius:16, padding:'2rem', maxWidth:'90vw', maxHeight:'80vh', overflow:'auto', width:400}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
                              <h3 style={{color:'#7c4dff', margin:0, fontWeight:700}}>⏱️ {t('doctor_dashboard.edit_appointment_duration_title')}</h3>
              <button onClick={()=>setShowAppointmentDurationModal(false)} style={{background:'#e53935', color:'#fff', border:'none', borderRadius:8, fontSize:20, fontWeight:900, padding:'0.2rem 0.8rem', cursor:'pointer'}}>×</button>
            </div>
            <AppointmentDurationEditor 
              profile={profile} 
              onClose={()=>setShowAppointmentDurationModal(false)}
              onUpdate={(updatedDuration) => {
                setShowAppointmentDurationModal(false);
                // تحديث البيانات المحلية مباشرة مع الحفاظ على الصورة الشخصية
                if (updatedDuration) {
                  const updatedProfile = { 
                    ...profile, 
                    appointmentDuration: updatedDuration 
                  };
                  localStorage.setItem('profile', JSON.stringify(updatedProfile));
                  // تحديث state بدلاً من إعادة تحميل الصفحة
                  setProfile(updatedProfile);
                  // إعادة جلب المواعيد لتحديث البيانات
                  fetchAllAppointments();
                }
              }}
            />
          </div>
        </div>
      )}
      {/* الإعلانات المتحركة */}
      {(() => {
        console.log('🎬 DoctorDashboard: قبل عرض AdvertisementSlider');
        return (
          <div style={{
            marginBottom: '1rem', 
            border: '2px solid #4CAF50', 
            padding: '1rem', 
            background: '#f8fff8',
            borderRadius: '12px'
          }}>
            {console.log('🎬 DoctorDashboard: محاولة عرض AdvertisementSlider مع target="both"')}
            <div style={{
              color: '#2E7D32', 
              marginBottom: '1rem', 
              fontSize: '1.1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📢 منطقة الإعلانات - يجب أن تظهر الإعلانات هنا
            </div>

          </div>
        );
      })()}
    </div>
  );
}

// مكون قائمة المواعيد الخاصة
function SpecialAppointmentsList({ appointments, onDelete, onEdit, onOpenNote }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // تصفية وترتيب المواعيد
  const filteredAppointments = appointments
    .filter(apt => {
      const matchesSearch = apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           apt.patientPhone.includes(searchTerm) ||
                           apt.reason.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date) - new Date(b.date);
        case 'name':
          return a.patientName.localeCompare(b.patientName);
        case 'priority':
          const priorityOrder = { urgent: 3, follow_up: 2, normal: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return new Date(a.date) - new Date(b.date);
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'cancelled': return '#e53935';
      default: return '#666';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#e53935';
      case 'follow_up': return '#ff9800';
      case 'normal': return '#4caf50';
      default: return '#666';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'urgent': return 'عاجلة';
      case 'follow_up': return 'متابعة';
      case 'normal': return 'عادية';
      default: return 'عادية';
    }
  };

  const formatDate = (dateString) => {
    // إصلاح مشكلة المنطقة الزمنية - معالجة التاريخ بشكل صحيح
    let date;
    if (typeof dateString === 'string' && dateString.includes('-')) {
      // إذا كان التاريخ بصيغة YYYY-MM-DD، قم بإنشاء تاريخ محلي
      const [year, month, day] = dateString.split('-').map(Number);
      date = new Date(year, month - 1, day); // month - 1 لأن getMonth() يبدأ من 0
    } else {
      date = new Date(dateString);
    }
    
    return date.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (appointments.length === 0) {
    return (
      <div style={{textAlign:'center', padding:'3rem'}}>
        <div style={{fontSize:'4rem', marginBottom:'1rem'}}>⭐</div>
        <h3 style={{color:'#ff5722', marginBottom:'0.5rem'}}>لا توجد مواعيد خاصة</h3>
        <p style={{color:'#666', marginBottom:'2rem'}}>لم يتم إضافة أي موعد خاص بعد</p>
        <button 
          onClick={() => window.location.reload()}
          style={{background:'#ff5722', color:'#fff', border:'none', borderRadius:8, padding:'1rem 2rem', fontWeight:700, cursor:'pointer'}}
        >
          إضافة موعد جديد
        </button>
      </div>
    );
  }

  return (
    <div style={{display:'flex', flexDirection:'column', gap:'1.5rem'}}>
      {/* أدوات البحث والتصفية */}
      <div style={{background:'#f8f9fa', borderRadius:12, padding:'1.5rem'}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1rem', alignItems:'end'}}>
          <div>
            <label style={{display:'block', marginBottom:'0.5rem', color:'#333', fontWeight:600, fontSize:14}}>🔍 البحث</label>
            <input
              type="text"
              placeholder="البحث بالاسم أو رقم الهاتف أو السبب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width:'100%',
                padding:'0.8rem',
                borderRadius:8,
                border:'2px solid #e0e0e0',
                fontSize:14
              }}
            />
          </div>
          <div>
            <label style={{display:'block', marginBottom:'0.5rem', color:'#333', fontWeight:600, fontSize:14}}>📊 تصفية حسب الحالة</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                width:'100%',
                padding:'0.8rem',
                borderRadius:8,
                border:'2px solid #e0e0e0',
                fontSize:14,
                backgroundColor:'#fff'
              }}
            >
              <option value="all">جميع المواعيد</option>
              <option value="confirmed">مؤكد</option>
              <option value="pending">في الانتظار</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
          <div>
            <label style={{display:'block', marginBottom:'0.5rem', color:'#333', fontWeight:600, fontSize:14}}>🔄 الترتيب حسب</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width:'100%',
                padding:'0.8rem',
                borderRadius:8,
                border:'2px solid #e0e0e0',
                fontSize:14,
                backgroundColor:'#fff'
              }}
            >
              <option value="date">التاريخ</option>
              <option value="name">اسم المريض</option>
              <option value="priority">الأولوية</option>
            </select>
          </div>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'1rem'}}>
        <div style={{background:'#fff', borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.1)', padding:'1rem', textAlign:'center'}}>
          <div style={{fontSize:'1.5rem', marginBottom:'0.5rem'}}>📊</div>
          <div style={{fontSize:'1.2rem', fontWeight:700, color:'#ff5722', marginBottom:'0.5rem'}}>{appointments.length}</div>
          <div style={{color:'#666', fontSize:'0.9rem'}}>إجمالي المواعيد</div>
        </div>
        <div style={{background:'#fff', borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.1)', padding:'1rem', textAlign:'center'}}>
          <div style={{fontSize:'1.5rem', marginBottom:'0.5rem'}}>✅</div>
          <div style={{fontSize:'1.2rem', fontWeight:700, color:'#4caf50', marginBottom:'0.5rem'}}>
            {appointments.filter(apt => apt.status === 'confirmed').length}
          </div>
          <div style={{color:'#666', fontSize:'0.9rem'}}>مؤكد</div>
        </div>
        <div style={{background:'#fff', borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.1)', padding:'1rem', textAlign:'center'}}>
          <div style={{fontSize:'1.5rem', marginBottom:'0.5rem'}}>⏳</div>
          <div style={{fontSize:'1.2rem', fontWeight:700, color:'#ff9800', marginBottom:'0.5rem'}}>
            {appointments.filter(apt => apt.status === 'pending').length}
          </div>
          <div style={{color:'#666', fontSize:'0.9rem'}}>في الانتظار</div>
        </div>
        <div style={{background:'#fff', borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.1)', padding:'1rem', textAlign:'center'}}>
          <div style={{fontSize:'1.5rem', marginBottom:'0.5rem'}}>🚨</div>
          <div style={{fontSize:'1.2rem', fontWeight:700, color:'#e53935', marginBottom:'0.5rem'}}>
            {appointments.filter(apt => apt.priority === 'urgent').length}
          </div>
          <div style={{color:'#666', fontSize:'0.9rem'}}>عاجلة</div>
        </div>
      </div>

      {/* قائمة المواعيد */}
      <div style={{background:'#fff', borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.1)', overflow:'hidden'}}>
        <div style={{background:'#f8f9fa', padding:'1rem', borderBottom:'1px solid #e0e0e0'}}>
          <span style={{color:'#333', fontWeight:700, fontSize:16}}>
            📋 المواعيد الخاصة ({filteredAppointments.length})
          </span>
        </div>
        <div style={{maxHeight:'400px', overflowY:'auto'}}>
          {filteredAppointments.length === 0 ? (
            <div style={{textAlign:'center', padding:'2rem', color:'#666'}}>
              لا توجد مواعيد تطابق البحث
            </div>
          ) : (
            filteredAppointments.map((appointment, index) => (
              <div key={appointment.id} style={{
                padding:'1.5rem',
                borderBottom:'1px solid #f0f0f0',
                background: index % 2 === 0 ? '#fff' : '#fafafa',
                position:'relative'
              }}>
                {/* شارة الموعد الخاص */}
                <div style={{
                  position:'absolute',
                  top:10,
                  left:10,
                  background:'#ff9800',
                  color:'#fff',
                  borderRadius:8,
                  padding:'0.2rem 0.8rem',
                  fontWeight:800,
                  fontSize:'0.9rem',
                  letterSpacing:1
                }}>
                  موعد خاص
                </div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem'}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex', alignItems:'center', gap:'1rem', marginBottom:'0.5rem', flexWrap:'wrap'}}>
                      <h4 style={{color:'#333', margin:0, fontSize:'1.1rem', fontWeight:700}}>
                        👤 {appointment.patientName || appointment.userId?.first_name || appointment.userName || 'غير محدد'}
                        <button onClick={()=>onOpenNote(appointment.patientPhone || appointment.userId?.phone)} style={{marginRight:7, background:'none', border:'none', color:'#7c4dff', cursor:'pointer', fontSize:18}} title="ملاحظة الطبيب">📝</button>
                      </h4>
                      <span style={{
                        background: getStatusColor(appointment.status),
                        color:'#fff',
                        padding:'0.2rem 0.8rem',
                        borderRadius:12,
                        fontSize:'0.8rem',
                        fontWeight:700
                      }}>
                        {appointment.status === 'confirmed' ? 'مؤكد' : 
                         appointment.status === 'pending' ? 'في الانتظار' : 'ملغي'}
                      </span>
                      <span style={{
                        background: getPriorityColor(appointment.priority),
                        color:'#fff',
                        padding:'0.2rem 0.8rem',
                        borderRadius:12,
                        fontSize:'0.8rem',
                        fontWeight:700
                      }}>
                        {getPriorityText(appointment.priority)}
                      </span>
                    </div>
                    
                    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1rem', marginBottom:'0.5rem'}}>
                      <div style={{color:'#666', fontSize:'0.9rem'}}>
                        📞 {appointment.patientPhone || appointment.userId?.phone || 'غير محدد'}
                      </div>
                      <div style={{color:'#666', fontSize:'0.9rem'}}>
                        📅 {formatDate(appointment.date)}
                      </div>
                      <div style={{color:'#666', fontSize:'0.9rem'}}>
                        🕐 {appointment.time} ({appointment.duration || 30} دقيقة)
                      </div>
                    </div>
                    
                    {appointment.reason && (
                      <div style={{color:'#333', fontSize:'0.9rem', marginBottom:'0.5rem'}}>
                        💬 {appointment.reason}
                      </div>
                    )}
                    
                    {appointment.notes && (
                      <div style={{color:'#666', fontSize:'0.8rem', fontStyle:'italic'}}>
                        📝 {appointment.notes}
                      </div>
                    )}
                  </div>
                  
                  <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
                    <button
                      onClick={() => onEdit(appointment)}
                      style={{
                        background:'#00bcd4',
                        color:'#fff',
                        border:'none',
                        borderRadius:6,
                        padding:'0.5rem 1rem',
                        fontWeight:700,
                        cursor:'pointer',
                        fontSize:'0.8rem'
                      }}
                    >
                      ✏️ تعديل
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
                          onDelete(appointment.id);
                        }
                      }}
                      style={{
                        background:'#e53935',
                        color:'#fff',
                        border:'none',
                        borderRadius:6,
                        padding:'0.5rem 1rem',
                        fontWeight:700,
                        cursor:'pointer',
                        fontSize:'0.8rem'
                      }}
                    >
                      🗑️ حذف
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// مكون إضافة موعد خاص
function AddSpecialAppointmentForm({ onClose, onAdd, profile }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    date: getToday(),
    time: '09:00',
    reason: '',
    notes: '',
    priority: 'normal', // normal, urgent, follow-up
    duration: '30', // 15, 30, 45, 60 minutes
    status: 'confirmed' // confirmed, pending, cancelled
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUnregisteredPhone, setIsUnregisteredPhone] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // دالة فحص إذا كان الرقم غير مسجل (مبدئيًا: تحقق من عدم وجود userId)
  const checkPhoneRegistered = async (phone) => {
    if (!phone) return false;
    try {
      // توحيد الرقم قبل الفحص
      const normalizedPhone = normalizePhone(phone);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/check-phone-registered?phone=${normalizedPhone}`);
      const data = await res.json();
      return data.registered;
    } catch {
      return false;
    }
  };

  // عند تغيير رقم الهاتف، تحقق إذا كان مسجل
  const handlePhoneChange = async (value) => {
    console.log('🔍 الرقم المدخل:', value);
    
    // توحيد الرقم العراقي
    let normalizedPhone = normalizePhone(value);
    console.log('🔍 الرقم الموحد:', normalizedPhone);
    
    // إزالة +964 من العرض في الحقل
    let displayPhone = normalizedPhone.replace('+964', '');
    if (displayPhone.startsWith('0')) {
      displayPhone = displayPhone.substring(1);
    }
    console.log('🔍 الرقم للعرض:', displayPhone);
    
    handleInputChange('patientPhone', displayPhone);
    
    if (normalizedPhone.length >= 10) {
      const registered = await checkPhoneRegistered(normalizedPhone);
      console.log('🔍 هل الرقم مسجل:', registered);
      setIsUnregisteredPhone(!registered);
    } else {
      setIsUnregisteredPhone(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // توحيد رقم الهاتف العراقي
      const normalizedPhone = normalizePhone(formData.patientPhone);
      console.log('🔍 الرقم الأصلي:', formData.patientPhone);
      console.log('🔍 الرقم الموحد:', normalizedPhone);
      
      // تجهيز بيانات الموعد الخاص
      const specialAppointmentData = {
        userId: null, // يمكن ربطه لاحقاً إذا كان هناك مستخدم
        doctorId: profile?._id,
        userName: formData.patientName,
        doctorName: profile?.name || 'الطبيب',
        date: formData.date,
        time: formData.time,
        reason: formData.reason,
        notes: formData.notes, // الملاحظات الأصلية
        priority: formData.priority,
        duration: formData.duration,
        status: formData.status,
        patientPhone: normalizedPhone // دائماً نحفظ الرقم الموحد في patientPhone
      };
      // إرسال البيانات إلى الباكند
      const res = await fetch(`${process.env.REACT_APP_API_URL}/add-special-appointment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(specialAppointmentData)
      });
      const result = await res.json();
              if (!result.success) throw new Error(result.error || t('error_adding_special_appointment'));
      // إعادة جلب المواعيد للطبيب
      if (typeof window.fetchDoctorAppointments === 'function') {
        window.fetchDoctorAppointments();
      }
      alert('تم إضافة الموعد الخاص بنجاح!');
      onClose();
    } catch (err) {
              setError(t('error_adding_special_appointment') + ': ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.patientName.trim() && formData.patientPhone.trim() && formData.date && formData.time;

  return (
    <form onSubmit={handleSubmit} style={{
      display:'flex',
      flexDirection:'column',
      gap:'1.2rem',
      maxWidth:400,
      width:'100%',
      margin:'0 auto',
      background:'#fff',
      borderRadius:14,
      boxShadow:'0 2px 12px #00bcd422',
      padding:'1.2rem 1.1rem',
      fontSize:15
    }}>
      {/* معلومات المريض */}
      <div style={{background:'#f8f9fa', borderRadius:10, padding:'1rem', marginBottom:8}}>
        <h4 style={{color:'#00bcd4', marginBottom:'0.7rem', fontWeight:700, fontSize:18, display:'flex', alignItems:'center', gap:'0.5rem'}}>
          👤 {t('patient_info')}
        </h4>
        <div style={{display:'flex', flexDirection:'column', gap:'0.7rem'}}>
          <div>
            <label style={{display:'block', marginBottom:'0.3rem', color:'#333', fontWeight:600, fontSize:13}}>
              {t('patient_name')} *
            </label>
            <input
              type="text"
              placeholder={t('enter_patient_name')}
              value={formData.patientName}
              onChange={(e) => handleInputChange('patientName', e.target.value)}
              style={{
                width:'100%',
                padding:'0.7rem',
                borderRadius:7,
                border:'1.5px solid #e0e0e0',
                fontSize:14,
                transition:'border-color 0.3s'
              }}
              required
            />
          </div>
          <div>
            <label style={{display:'block', marginBottom:'0.3rem', color:'#333', fontWeight:600, fontSize:13}}>
              {t('patient_phone')} *
            </label>
            <input
              type="tel"
              placeholder={t('enter_patient_phone')}
              value={formData.patientPhone}
              onChange={e => handlePhoneChange(e.target.value)}
              style={{
                width:'100%',
                padding:'0.7rem',
                borderRadius:7,
                border:'1.5px solid #e0e0e0',
                fontSize:14
              }}
              required
            />
          </div>
        </div>
      </div>
      {/* باقي الحقول */}
      <div style={{display:'flex', flexDirection:'column', gap:'0.7rem'}}>
        <div>
          <label style={{display:'block', marginBottom:'0.3rem', color:'#333', fontWeight:600, fontSize:13}}>
            {t('date')} *
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={e => handleInputChange('date', e.target.value)}
            style={{width:'100%', padding:'0.7rem', borderRadius:7, border:'1.5px solid #e0e0e0', fontSize:14}}
            required
          />
        </div>
        <div>
          <label style={{display:'block', marginBottom:'0.3rem', color:'#333', fontWeight:600, fontSize:13}}>
            {t('time')} *
          </label>
          <input
            type="time"
            value={formData.time}
            onChange={e => handleInputChange('time', e.target.value)}
            style={{width:'100%', padding:'0.7rem', borderRadius:7, border:'1.5px solid #e0e0e0', fontSize:14}}
            required
          />
        </div>
        <div>
          <label style={{display:'block', marginBottom:'0.3rem', color:'#333', fontWeight:600, fontSize:13}}>
            {t('reason')}
          </label>
          <input
            type="text"
            placeholder={t('reason_optional')}
            value={formData.reason}
            onChange={e => handleInputChange('reason', e.target.value)}
            style={{width:'100%', padding:'0.7rem', borderRadius:7, border:'1.5px solid #e0e0e0', fontSize:14}}
          />
        </div>
        {/* إظهار حقل الملاحظة فقط إذا كان الرقم مسجل */}
        {!isUnregisteredPhone && (
          <div>
            <label style={{display:'block', marginBottom:'0.3rem', color:'#333', fontWeight:600, fontSize:13}}>
              {t('notes')}
            </label>
            <textarea
              placeholder={isUnregisteredPhone ? 'إضافة رقم إذا كان غير مسجل' : t('notes_optional')}
              value={formData.notes}
              onChange={e => handleInputChange('notes', e.target.value)}
              style={{width:'100%', padding:'0.7rem', borderRadius:7, border:'1.5px solid #e0e0e0', fontSize:14, minHeight:50}}
            />
          </div>
        )}
      </div>
      <button type="submit" disabled={loading || !isFormValid} style={{
        background:'linear-gradient(90deg,#00bcd4 0%,#009688 100%)',
        color:'#fff',
        border:'none',
        borderRadius:8,
        padding:'0.9rem',
        fontWeight:700,
        fontSize:17,
        marginTop:10,
        cursor: loading ? 'not-allowed' : 'pointer',
        boxShadow:'0 2px 8px #00bcd422',
        transition:'background 0.3s'
      }}>
        {loading ? t('saving') : t('save_appointment')}
      </button>
      {error && <div style={{color:'#e53935', fontWeight:600, marginTop:7, fontSize:14}}>{error}</div>}
    </form>
  );
}

// مكون تعديل الموعد الخاص
function EditSpecialAppointmentForm({ appointment, onSubmit, onClose }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    patientName: appointment.patientName || '',
    patientPhone: appointment.patientPhone || '',
    date: appointment.date || getToday(),
    time: appointment.time || '09:00',
    duration: appointment.duration || '30',
    priority: appointment.priority || 'normal',
    status: appointment.status || 'confirmed',
    reason: appointment.reason || '',
    notes: appointment.notes || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // التحقق من صحة البيانات
      if (!formData.patientName.trim() || !formData.patientPhone.trim() || !formData.date || !formData.time) {
        throw new Error('يرجى ملء جميع الحقول المطلوبة');
      }

      // إرسال إشعار للمريض عن التعديل
      await sendNotificationToPatient(formData, 'update');

      await onSubmit(formData);
    } catch (err) {
              setError(err.message || t('error_updating_special_appointment'));
    } finally {
      setLoading(false);
    }
  };

  const sendNotificationToPatient = async (appointmentData, type = 'update') => {
    try {

      
      await fetch(`${process.env.REACT_APP_API_URL}/send-special-appointment-notification`, {
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientPhone: appointmentData.patientPhone,
          patientName: appointmentData.patientName,
          newDate: appointmentData.date,
          newTime: appointmentData.time,
          doctorName: 'الطبيب',
          reason: appointmentData.reason || 'موعد خاص',
          notes: appointmentData.notes || '',
          type: type
        })
      });
    } catch (err) {
      
      // لا نوقف العملية إذا فشل الإشعار
    }
  };

  const isFormValid = formData.patientName.trim() && formData.patientPhone.trim() && formData.date && formData.time;

  return (
    <form onSubmit={handleSubmit} style={{
      display:'flex',
      flexDirection:'column',
      gap:'1.2rem',
      maxWidth:400,
      width:'100%',
      margin:'0 auto',
      background:'#fff',
      borderRadius:14,
      boxShadow:'0 2px 12px #00bcd422',
      padding:'1.2rem 1.1rem',
      fontSize:15
    }}>
      {/* معلومات المريض */}
      <div style={{background:'#f8f9fa', borderRadius:10, padding:'1rem', marginBottom:8}}>
        <h4 style={{color:'#ff5722', marginBottom:'0.7rem', fontWeight:700, fontSize:18, display:'flex', alignItems:'center', gap:'0.5rem'}}>
          👤 معلومات المريض
        </h4>
        <div style={{display:'flex', flexDirection:'column', gap:'0.7rem'}}>
          <div>
            <label style={{display:'block', marginBottom:'0.3rem', color:'#333', fontWeight:600, fontSize:13}}>
              اسم المريض *
            </label>
            <input
              type="text"
              placeholder="أدخل اسم المريض"
              value={formData.patientName}
              onChange={(e) => handleInputChange('patientName', e.target.value)}
              style={{
                width:'100%',
                padding:'0.7rem',
                borderRadius:7,
                border:'1.5px solid #e0e0e0',
                fontSize:14,
                transition:'border-color 0.3s'
              }}
              required
            />
          </div>
          <div>
            <label style={{display:'block', marginBottom:'0.3rem', color:'#333', fontWeight:600, fontSize:13}}>
              رقم الهاتف *
            </label>
            <input
              type="tel"
              placeholder="7xxxxxxxxx (بدون صفر في البداية)"
              value={formData.patientPhone}
              onChange={e => {
                let value = e.target.value.replace(/\D/g, '');
                handleInputChange('patientPhone', value);
              }}
              style={{
                width:'100%',
                padding:'0.7rem',
                borderRadius:7,
                border:'1.5px solid #e0e0e0',
                fontSize:14
              }}
              required
            />
          </div>
        </div>
      </div>
      {/* باقي الحقول */}
      <div style={{display:'flex', flexDirection:'column', gap:'0.7rem'}}>
        <div>
          <label style={{display:'block', marginBottom:'0.3rem', color:'#333', fontWeight:600, fontSize:13}}>
            التاريخ *
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={e => handleInputChange('date', e.target.value)}
            style={{width:'100%', padding:'0.7rem', borderRadius:7, border:'1.5px solid #e0e0e0', fontSize:14}}
            required
          />
        </div>
        <div>
          <label style={{display:'block', marginBottom:'0.3rem', color:'#333', fontWeight:600, fontSize:13}}>
            الوقت *
          </label>
          <input
            type="time"
            value={formData.time}
            onChange={e => handleInputChange('time', e.target.value)}
            style={{width:'100%', padding:'0.7rem', borderRadius:7, border:'1.5px solid #e0e0e0', fontSize:14}}
            required
          />
        </div>
        <div>
          <label style={{display:'block', marginBottom:'0.3rem', color:'#333', fontWeight:600, fontSize:13}}>
            سبب الموعد
          </label>
          <input
            type="text"
            placeholder="سبب الموعد (اختياري)"
            value={formData.reason}
            onChange={e => handleInputChange('reason', e.target.value)}
            style={{width:'100%', padding:'0.7rem', borderRadius:7, border:'1.5px solid #e0e0e0', fontSize:14}}
          />
        </div>
        <div>
          <label style={{display:'block', marginBottom:'0.3rem', color:'#333', fontWeight:600, fontSize:13}}>
            ملاحظات
          </label>
          <textarea
            placeholder="ملاحظات إضافية (اختياري)"
            value={formData.notes}
            onChange={e => handleInputChange('notes', e.target.value)}
            style={{width:'100%', padding:'0.7rem', borderRadius:7, border:'1.5px solid #e0e0e0', fontSize:14, minHeight:50}}
          />
        </div>
      </div>
      <button type="submit" disabled={loading || !isFormValid} style={{
        background:'linear-gradient(90deg,#ff5722 0%,#e53935 100%)',
        color:'#fff',
        border:'none',
        borderRadius:8,
        padding:'0.9rem',
        fontWeight:700,
        fontSize:17,
        marginTop:10,
        cursor: loading ? 'not-allowed' : 'pointer',
        boxShadow:'0 2px 8px #e5393522',
        transition:'background 0.3s'
      }}>
        {loading ? 'جاري التحديث...' : '✏️ تحديث الموعد'}
      </button>
      {error && <div style={{color:'#e53935', fontWeight:600, marginTop:7, fontSize:14}}>{error}</div>}
    </form>
  );
}

export default DoctorDashboard;

 

// دالة تعريب التاريخ والوقت للإشعارات - إصلاح مشكلة المنطقة الزمنية
function formatKurdishDateTime(dateString) {
  // إصلاح مشكلة المنطقة الزمنية - معالجة التاريخ بشكل صحيح
  let date;
  if (typeof dateString === 'string' && dateString.includes('-')) {
    // إذا كان التاريخ بصيغة YYYY-MM-DD، قم بإنشاء تاريخ محلي
    const [year, month, day] = dateString.split('-').map(Number);
    date = new Date(year, month - 1, day); // month - 1 لأن getMonth() يبدأ من 0
  } else {
    date = new Date(dateString);
  }
  
  const day = date.getDate();
  const year = date.getFullYear();
  const hour = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const sec = String(date.getSeconds()).padStart(2, '0');
  return `${day}/${date.getMonth()+1}/${year} ${hour}:${min}:${sec}`;
}

function renderNewAppointmentNotification(message, t) {
  // مثال: "تم حجز موعد جديد من قبل عثمان f;v في 2025-07-26 الساعة 08:00"
  const match = message.match(/من قبل (.+) في ([0-9-]+) الساعة ([0-9:]+)/);
  if (match) {
    const [, name, date, time] = match;
    return t('notification_new_appointment', { name, date, time });
  }
  return message;
}