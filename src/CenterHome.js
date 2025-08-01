import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function CenterHome() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ doctors: 0, appointments: 0 });
  const [notifications, setNotifications] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // جلب بيانات المركز من localStorage
    const center = localStorage.getItem('centerProfile');
    if (center) setProfile(JSON.parse(center));
    // جلب الإحصائيات من الباكند (مثال)
    fetch(process.env.REACT_APP_API_URL + '/center/stats', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('centerToken') }
    })
      .then(res => res.json())
      .then(data => setStats(data));
    // جلب الإشعارات
    fetch(process.env.REACT_APP_API_URL + '/center/notifications', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('centerToken') }
    })
      .then(res => res.json())
      .then(data => setNotifications(data));
    // جلب الأطباء
    fetch(process.env.REACT_APP_API_URL + '/center/doctors', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('centerToken') }
    })
      .then(res => res.json())
      .then(data => setDoctors(data));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('centerToken');
    localStorage.removeItem('centerProfile');
    navigate('/center-login');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(90deg, #00bcd4 0%, #7c4dff 100%)', padding: '2rem' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '2rem', maxWidth: 900, margin: '0 auto', boxShadow: '0 2px 12px #7c4dff22' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: '#333' }}>🏥 لوحة تحكم المركز/المستشفى</h2>
          <button onClick={handleLogout} style={{ background: '#ff6b35', color: 'white', border: 'none', borderRadius: 8, padding: '0.6rem 1.5rem', fontWeight: 'bold', cursor: 'pointer' }}>تسجيل الخروج</button>
        </div>
        {profile && (
          <div style={{ marginBottom: 24, color: '#555', fontWeight: 600 }}>
            <span>اسم المركز: {profile.name}</span> | <span>البريد: {profile.email}</span> | <span>الهاتف: {profile.phone}</span>
          </div>
        )}
        {/* إحصائيات */}
        <div style={{ display: 'flex', gap: '2rem', marginBottom: 32 }}>
          <div style={{ background: '#e3f2fd', borderRadius: 12, padding: '1.5rem', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 32, color: '#1976d2', marginBottom: 8 }}>👨‍⚕️</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>عدد الأطباء</div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>{stats.doctors}</div>
          </div>
          <div style={{ background: '#fff3e0', borderRadius: 12, padding: '1.5rem', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 32, color: '#ff9800', marginBottom: 8 }}>📅</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>عدد الحجوزات</div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>{stats.appointments}</div>
          </div>
        </div>
        {/* إشعارات */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ color: '#7c4dff', marginBottom: 12 }}>🔔 الإشعارات</h3>
          {Array.isArray(notifications) && notifications.length > 0 ? (
            notifications.map((notif, idx) => (
              <div key={idx} style={{ background: '#f3e5f5', borderRadius: 8, padding: '0.7rem 1rem', marginBottom: 8, color: '#7b1fa2' }}>{notif.message}</div>
            ))
          ) : (
            <div style={{ color: '#888' }}>{t('no_notifications')}</div>
          )}
        </div>
        {/* قائمة الأطباء */}
        <div>
          <h3 style={{ color: '#00bcd4', marginBottom: 12 }}>👨‍⚕️ قائمة الأطباء</h3>
          {Array.isArray(doctors) && doctors.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {doctors.map((doc, idx) => (
                <div key={idx} style={{ background: '#f8f9fa', borderRadius: 10, padding: '1rem', border: '1px solid #e0e0e0' }}>
                  <div style={{ fontWeight: 700, color: '#333', marginBottom: 6 }}>{doc.name}</div>
                  <div style={{ color: '#555', marginBottom: 4 }}>{doc.specialty}</div>
                  <div style={{ color: '#888', fontSize: 14 }}>📞 {doc.phone}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#888' }}>لا يوجد أطباء مرتبطين بالمركز حالياً</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CenterHome; 