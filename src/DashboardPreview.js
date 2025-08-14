import React, { useState } from 'react';
import './DoctorDashboard.css';

function DashboardPreview() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // بيانات تجريبية للمعاينة
  const mockData = {
    totalAppointments: 156,
    todayCount: 8,
    upcomingCount: 23,
    notifCount: 3,
    todayAppointments: [
      {
        _id: '1',
        time: '09:00',
        date: '2024-01-15',
        userName: 'أحمد محمد',
        patientPhone: '+964 750 123 4567',
        reason: 'فحص دوري',
        type: 'regular'
      },
      {
        _id: '2',
        time: '10:30',
        date: '2024-01-15',
        userName: 'فاطمة علي',
        patientPhone: '+964 750 987 6543',
        reason: 'متابعة علاج',
        type: 'special_appointment',
        notes: 'مريضة حامل - تحتاج رعاية خاصة'
      },
      {
        _id: '3',
        time: '14:00',
        date: '2024-01-15',
        userName: 'محمد كريم',
        patientPhone: '+964 750 555 1234',
        reason: 'استشارة طبية',
        type: 'regular'
      }
    ]
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const weekdays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const months = [
      'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
      'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'
    ];
    const weekday = weekdays[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${weekday}، ${day} ${month} ${year}`;
  };

  return (
    <div className="dashboard-container">
      {/* الشريط العلوي */}
      <div className="dashboard-header">
        <div style={{display:'flex', alignItems:'center', gap:7}}>
          <img src="/logo192.png" alt="Logo" style={{width: 32, height: 32, borderRadius: '50%', background: '#fff', border: '4px solid #fff', boxShadow: '0 2px 12px rgba(76, 175, 80, 0.3)', objectFit: 'cover', marginRight: 4}} />
                     <span style={{fontWeight: 700, color: '#0A8F82', fontSize: '1.2rem'}}>TabibiQ</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:7}}>
          <button onClick={() => setShowSidebar(true)} style={{background:'none', border:'none', fontSize:28, color:'#0A8F82', cursor:'pointer', marginLeft:4}} title="القائمة">
            <span role="img" aria-label="menu">☰</span>
          </button>
                     <div style={{position:'relative', cursor:'pointer'}} onClick={() => setShowNotif(!showNotif)} title="الإشعارات">
             <span style={{fontSize:22, color:'#ffffff'}} role="img" aria-label="notifications">🔔</span>
            {mockData.notifCount > 0 && (
              <span style={{position:'absolute', top:-8, right:-8, background:'#e53935', color:'#fff', borderRadius:'50%', fontSize:10, fontWeight:700, padding:'1px 5px', minWidth:18, textAlign:'center'}}>{mockData.notifCount}</span>
            )}
          </div>
        </div>
      </div>

      <div style={{position:'relative', zIndex:1}}>
        <h2 className="dashboard-title">لوحة الطبيب - معاينة التصميم</h2>
        
        {/* الإحصائيات السريعة */}
        <div className="stats-container">
          <div className="stats-grid">
            <div className="stat-card hover-lift">
              <div className="stat-icon">📅</div>
              <div className="stat-number total">{mockData.totalAppointments}</div>
              <div className="stat-label">إجمالي المواعيد</div>
            </div>
            <div className="stat-card hover-lift">
              <div className="stat-icon">🎯</div>
              <div className="stat-number today">{mockData.todayCount}</div>
              <div className="stat-label">مواعيد اليوم</div>
            </div>
            <div className="stat-card hover-lift">
              <div className="stat-icon">⏰</div>
              <div className="stat-number upcoming">{mockData.upcomingCount}</div>
              <div className="stat-label">المواعيد القادمة</div>
            </div>
            <div className="stat-card hover-lift">
              <div className="stat-icon">📊</div>
              <div className="stat-number notifications">{mockData.notifCount}</div>
              <div className="stat-label">إشعارات جديدة</div>
            </div>
          </div>
        </div>
        
                 {/* أزرار الوظائف الرئيسية */}
         <div className="actions-container">
           <div className="actions-grid">
                           <button className="action-button hover-lift">
                <div className="action-icon">📅</div>
                <div className="action-text">التقويم</div>
              </button>

              <button className="action-button hover-lift">
                <div className="action-icon">📋</div>
                <div className="action-text">كل المواعيد</div>
              </button>

              <button className="action-button hover-lift">
                <div className="action-icon">📊</div>
                <div className="action-text">تحليل المواعيد</div>
              </button>

              <button className="action-button hover-lift">
                <div className="action-icon">👤</div>
                <div className="action-text">الملف الشخصي</div>
              </button>
           </div>
         </div>

        {/* مواعيد اليوم */}
        {mockData.todayAppointments.length > 0 && (
          <div className="appointments-container">
            <div className="appointments-card">
              <h3 className="appointments-title">
                🎯 مواعيد اليوم ({formatDate(mockData.todayAppointments[0].date)}) - {mockData.todayAppointments.length} موعد
              </h3>
              <div className="appointments-grid">
                {mockData.todayAppointments.map(appointment => (
                  <div key={appointment._id} className="appointment-card hover-lift">

                    
                    {/* شارة موعد خاص */}
                    {appointment.type === 'special_appointment' && (
                      <div className="appointment-badge badge-special">
                        موعد خاص
                      </div>
                    )}
                    
                    {/* معلومات المريض */}
                    <div className="patient-info">
                      <div className="patient-name">
                        👤 {appointment.userName}
                      </div>
                      <div className="patient-phone">
                        📞 {appointment.patientPhone}
                      </div>
                    </div>
                    
                    {/* وقت وتاريخ الموعد */}
                    <div className="appointment-time">
                      <div className="time-display">
                        🕐 {appointment.time}
                      </div>
                      <div className="date-display">
                        📅 {formatDate(appointment.date)}
                      </div>
                    </div>
                    
                    {/* ملاحظة أو سبب */}
                    {appointment.type === 'special_appointment' && appointment.notes && (
                      <div className="appointment-notes">
                        📝 {appointment.notes}
                      </div>
                    )}
                    {appointment.reason && (
                      <div className="appointment-reason">
                        💬 {appointment.reason}
                      </div>
                    )}
                    
                    {/* أزرار التحكم */}
                    <div className="appointment-actions">
                      <button className="action-btn btn-manage">
                        إدارة
                      </button>
                      <button className="action-btn btn-note">
                        ملاحظة
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* رسالة توضيحية */}
        <div style={{maxWidth:700, margin:'2rem auto', padding:'0 1rem', textAlign:'center'}}>
                      <div style={{background:'#f8f9fa', borderRadius:16, padding:'2rem', border: '2px dashed #0A8F82'}}>
            <h3 style={{color:'#0A8F82', marginBottom:'1rem'}}>🎨 معاينة التصميم الجديد</h3>
            <p style={{color:'#666', lineHeight:1.6}}>
              هذه صفحة معاينة تعرض التصميم المحسن للوحة الطبيب.<br/>
              يمكنك رؤية الألوان الجديدة والتصميم المحسن بدون الحاجة لتسجيل الدخول.<br/>
              <strong>الألوان المستخدمة:</strong> الأخضر (#4caf50) والبرتقالي (#ff9800) على خلفية بيضاء.
            </p>
            <div style={{marginTop:'1.5rem', display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap'}}>
              <div style={{background:'#0A8F82', color:'#fff', padding:'0.5rem 1rem', borderRadius:8, fontWeight:600}}>أخضر</div>
              <div style={{background:'#ff9800', color:'#fff', padding:'0.5rem 1rem', borderRadius:8, fontWeight:600}}>برتقالي</div>
              <div style={{background:'#fff', color:'#333', padding:'0.5rem 1rem', borderRadius:8, fontWeight:600, border:'2px solid #e0e0e0'}}>أبيض</div>
            </div>
          </div>
        </div>
      </div>

      {/* القائمة الجانبية */}
      {showSidebar && (
        <div style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.18)', zIndex:3000, display:'flex'}} onClick={() => setShowSidebar(false)}>
          <div className="sidebar" onClick={e => e.stopPropagation()}>
            <button className="sidebar-button primary">
              <span role="img" aria-label="العودة للصفحة الرئيسية">🏠</span> العودة للصفحة الرئيسية
            </button>
            <button className="sidebar-button secondary">
              <span role="img" aria-label="إضافة موعد خاص">⭐</span> إضافة موعد خاص
            </button>
            <button className="sidebar-button primary">
              <span role="img" aria-label="اتصل بنا">📞</span> اتصل بنا
            </button>
            <button className="sidebar-button secondary">
              <span role="img" aria-label="تعديل الدوام">⏰</span> تعديل الدوام
            </button>
            <button className="sidebar-button primary">
              <span role="img" aria-label="تعديل مدة الموعد">⏱️</span> تعديل مدة الموعد
            </button>
            <button className="sidebar-button outline">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="#4caf50" strokeWidth="2"/><path d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4" stroke="#4caf50" strokeWidth="2"/></svg> ملفي الشخصي
            </button>
            <button className="sidebar-button danger">
              <span role="img" aria-label="خروج">🚪</span> تسجيل خروج
            </button>
            
            {/* زر تغيير اللغة */}
            <div className="language-selector">
              <label className="language-label">🌐 تغيير اللغة</label>
              <select className="language-select">
                <option value="AR">العربية</option>
                <option value="EN">English</option>
                <option value="KU">کوردی</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الإشعارات */}
      {showNotif && (
        <div style={{
          position:'fixed',
          top: 70,
          right: 20,
          background:'#fff',
          borderRadius: 12,
          boxShadow:'0 2px 16px rgba(0,0,0,0.1)',
          padding:'1.2rem 1.5rem',
          zIndex:1000,
          minWidth: 260,
          maxWidth: 350
        }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
            <h4 style={{margin:'0', color:'#0A8F82', fontSize: 20}}>الإشعارات</h4>
            <button onClick={() => setShowNotif(false)} style={{background:'none', border:'none', color:'#e53935', fontSize:22, fontWeight:900, cursor:'pointer', marginRight:2, marginTop:-2}}>&times;</button>
          </div>
          <div style={{color:'#888', fontSize: 15}}>لا توجد إشعارات جديدة</div>
        </div>
      )}
    </div>
  );
}

export default DashboardPreview;
