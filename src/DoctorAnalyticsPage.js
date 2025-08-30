import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Login.css';

function DoctorAnalyticsPage() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeFilter, setTimeFilter] = useState('all'); // all, weekly, monthly, yearly
  const [isMobile, setIsMobile] = useState(false);
  const [topUsersForOthers, setTopUsersForOthers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserSelection, setShowUserSelection] = useState(false);

  // مراقبة حجم النافذة
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 500);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // جلب جميع المواعيد
  const fetchAllAppointments = useCallback(async () => {
    if (!profile?._id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctor-appointments/${profile._id}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setAppointments(data);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.error('خطأ في جلب المواعيد:', err);
      setError(t('error_fetching_appointments'));
    } finally {
      setLoading(false);
    }
  }, [profile?._id, t]);

  // جلب إحصائيات المستخدمين الذين حجزوا لشخص آخر
  const fetchTopUsersForOthers = useCallback(async () => {
    if (!profile?._id) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctor-top-users-booking-for-others/${profile._id}`);
      const data = await response.json();
      
      if (data.success) {
        setTopUsersForOthers(data.data);
      } else {
        console.error('خطأ في جلب إحصائيات المستخدمين:', data.error);
      }
    } catch (err) {
      console.error('خطأ في جلب إحصائيات المستخدمين:', err);
    }
  }, [profile?._id]);

  useEffect(() => {
    fetchAllAppointments();
    fetchTopUsersForOthers();
  }, [profile?._id, fetchAllAppointments, fetchTopUsersForOthers]);

  // دالة التصفية الزمنية
  const getHourFromTime = (timeString) => {
    if (!timeString) return 0;
    const time = timeString.split(':');
    return parseInt(time[0]) || 0;
  };

  const filterAppointmentsByTime = (appointments, filter) => {
    if (filter === 'all') return appointments;
    
    const now = new Date();
    const filtered = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      
      switch (filter) {
        case 'weekly':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return aptDate >= weekAgo;
        case 'monthly':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return aptDate >= monthAgo;
        case 'yearly':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          return aptDate >= yearAgo;
        default:
          return true;
      }
    });
    
    return filtered;
  };

  const getTimeFilterText = (filter) => {
    switch (filter) {
      case 'weekly': return t('weekly');
      case 'monthly': return t('monthly');
      case 'yearly': return t('yearly');
      default: return t('all_time');
    }
  };

  // دالة التحليل
  const getAnalytics = () => {
    const appointmentsArray = Array.isArray(appointments) ? appointments : [];
    const filteredAppointments = filterAppointmentsByTime(appointmentsArray, timeFilter);
    
    const analytics = {
      totalAppointments: filteredAppointments.length,
      todayAppointments: filteredAppointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length,
      upcomingAppointments: filteredAppointments.filter(apt => new Date(apt.date) > new Date()).length,
      pastAppointments: filteredAppointments.filter(apt => new Date(apt.date) < new Date()).length,
      
      // إحصائيات الحضور والغياب
      attendanceStats: {
        present: filteredAppointments.filter(apt => apt.attendance === 'present').length,
        absent: filteredAppointments.filter(apt => apt.attendance === 'absent' || !apt.attendance).length
      },
      
      // تحليل حسب الأيام
      appointmentsByDay: {},
      appointmentsByMonth: {},
      appointmentsByHour: {},
      
      // إحصائيات إضافية
      mostBusyDay: null,
      mostBusyHour: null,
      averageAppointmentsPerDay: 0,
      totalPatients: new Set(),
      
      // إحصائيات الحجز لشخص آخر
      bookingForOthersStats: {
        total: filteredAppointments.filter(apt => apt.isBookingForOther).length,
        percentage: filteredAppointments.length > 0 ? 
          ((filteredAppointments.filter(apt => apt.isBookingForOther).length / filteredAppointments.length) * 100).toFixed(1) : 0,
        uniqueBookers: new Set(filteredAppointments.filter(apt => apt.isBookingForOther).map(apt => apt.userId?._id || apt.userId)).size,
        uniquePatients: new Set(filteredAppointments.filter(apt => apt.isBookingForOther).map(apt => apt.patientName || apt.userName)).size
      }
    };

    // تحليل حسب الأيام
    filteredAppointments.forEach(apt => {
      const date = new Date(apt.date);
      const dayName = date.toLocaleDateString('ar-EG', { weekday: 'long' });
      const monthName = date.toLocaleDateString('ar-EG', { month: 'long' });
      const hour = getHourFromTime(apt.time);
      
      analytics.appointmentsByDay[dayName] = (analytics.appointmentsByDay[dayName] || 0) + 1;
      analytics.appointmentsByMonth[monthName] = (analytics.appointmentsByMonth[monthName] || 0) + 1;
      analytics.appointmentsByHour[hour] = (analytics.appointmentsByHour[hour] || 0) + 1;
      
      // إضافة المريض إلى المجموعة
      if (apt.isBookingForOther && apt.patientName) {
        analytics.totalPatients.add(apt.patientName);
      } else if (apt.userId?.first_name) {
        analytics.totalPatients.add(apt.userId.first_name);
      }
    });

    // حساب أكثر الأيام والأوقات ازدحاماً
    analytics.mostBusyDay = Object.keys(analytics.appointmentsByDay).reduce((a, b) => 
      analytics.appointmentsByDay[a] > analytics.appointmentsByDay[b] ? a : b, null);
    
    analytics.mostBusyHour = Object.keys(analytics.appointmentsByHour).reduce((a, b) => 
      analytics.appointmentsByHour[a] > analytics.appointmentsByHour[b] ? a : b, null);
    
    analytics.averageAppointmentsPerDay = analytics.totalAppointments / 30;
    analytics.totalPatients = analytics.totalPatients.size;

    return analytics;
  };

  // دالة اختيار المستخدمين من كارت الموعد
  const handleUserSelection = (user) => {
    if (selectedUsers.find(u => u.userId === user.userId)) {
      setSelectedUsers(selectedUsers.filter(u => u.userId !== user.userId));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // دالة إضافة المستخدمين المختارين للإحصائيات
  const addSelectedUsersToStats = () => {
    const updatedStats = [...topUsersForOthers, ...selectedUsers];
    setTopUsersForOthers(updatedStats);
    setSelectedUsers([]);
    setShowUserSelection(false);
  };

  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #00bcd4 0%, #009688 100%)',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{color: '#fff', fontSize: '1.2rem'}}>{t('loading')}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #00bcd4 0%, #009688 100%)',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{color: '#fff', fontSize: '1.2rem'}}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#ffffff',
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        background: '#ffffff',
        padding: isMobile ? '0.8rem 1rem' : '1rem 2rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '2px solid #0A8F82'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '1rem'}}>
          <button
            onClick={() => navigate('/doctor-dashboard')}
            style={{
              background: 'linear-gradient(135deg, #e53935 0%, #c62828 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: isMobile ? 8 : 12,
              padding: isMobile ? '0.6rem 1rem' : '0.8rem 1.5rem',
              fontWeight: 700,
              fontSize: isMobile ? 14 : 16,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(229, 57, 53, 0.3)'
            }}
          >
            ← {t('back')}
          </button>
          <h1 style={{
            color: '#0A8F82',
            fontWeight: 800,
            fontSize: isMobile ? 16 : 28,
            margin: 0
          }}>
            📊 {t('analytics')}
          </h1>
        </div>
        
        <button
          onClick={signOut}
          style={{
            background: 'linear-gradient(135deg, #ff5722 0%, #e64a19 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: isMobile ? 8 : 12,
            padding: isMobile ? '0.6rem 1rem' : '0.8rem 1.5rem',
            fontWeight: 700,
            fontSize: isMobile ? 14 : 16,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(255, 87, 34, 0.3)'
          }}
        >
          {t('logout')}
        </button>
      </div>

      {/* Content */}
      <div style={{
        padding: isMobile ? '1rem 0.8rem' : '2rem',
        maxWidth: 1200,
        margin: '0 auto'
      }}>
        <AnalyticsView 
          analytics={getAnalytics()} 
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          getTimeFilterText={getTimeFilterText}
          topUsersForOthers={topUsersForOthers}
          selectedUsers={selectedUsers}
          showUserSelection={showUserSelection}
          setShowUserSelection={setShowUserSelection}
          handleUserSelection={handleUserSelection}
          addSelectedUsersToStats={addSelectedUsersToStats}
          appointments={appointments}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}

// مكون التحليل الكامل
function AnalyticsView({ 
  analytics, 
  timeFilter, 
  setTimeFilter, 
  getTimeFilterText,
  topUsersForOthers,
  selectedUsers,
  showUserSelection,
  setShowUserSelection,
  handleUserSelection,
  addSelectedUsersToStats,
  appointments,
  isMobile
}) {
  const { t } = useTranslation();

  return (
    <div>
      {/* فلتر الوقت */}
      <div style={{
        background: '#fff',
        borderRadius: isMobile ? 12 : 16,
        boxShadow: '0 2px 12px rgba(10, 143, 130, 0.1)',
        padding: isMobile ? '1rem 0.8rem' : '1.5rem',
        marginBottom: '2rem',
        border: '2px solid #0A8F82'
      }}>
        <h3 style={{
          color: '#0A8F82',
          marginBottom: '1rem',
          textAlign: 'center',
          fontSize: isMobile ? '1.1rem' : '1.3rem'
        }}>
          ⏰ {t('time_filter')}
        </h3>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {['all', 'weekly', 'monthly', 'yearly'].map(filter => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              style={{
                background: timeFilter === filter ? '#0A8F82' : '#f8f9fa',
                color: timeFilter === filter ? '#fff' : '#0A8F82',
                border: timeFilter === filter ? 'none' : '2px solid #0A8F82',
                borderRadius: 12,
                padding: '0.8rem 1.5rem',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {getTimeFilterText(filter)}
            </button>
          ))}
        </div>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div style={{
        display:'grid', 
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: isMobile ? '0.8rem' : '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background:'#fff', 
          borderRadius: isMobile ? 12 : 16, 
          boxShadow:'0 2px 12px rgba(10, 143, 130, 0.1)', 
          padding: isMobile ? '1rem 0.8rem' : '1.5rem', 
          textAlign:'center',
          border: '2px solid #0A8F82'
        }}>
          <div style={{fontSize: isMobile ? '1.5rem' : '2rem', marginBottom:'0.5rem'}}>📊</div>
          <div style={{fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight:700, color:'#0A8F82', marginBottom:'0.5rem'}}>{analytics.totalAppointments}</div>
          <div style={{color:'#666', fontSize: isMobile ? '0.9rem' : '1rem'}}>{t('total_appointments')}</div>
        </div>
        <div style={{
          background:'#fff', 
          borderRadius: isMobile ? 12 : 16, 
          boxShadow:'0 2px 12px rgba(10, 143, 130, 0.1)', 
          padding: isMobile ? '1rem 0.8rem' : '1.5rem', 
          textAlign:'center',
          border: '2px solid #0A8F82'
        }}>
          <div style={{fontSize: isMobile ? '1.5rem' : '2rem', marginBottom:'0.5rem'}}>👥</div>
          <div style={{fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight:700, color:'#0A8F82', marginBottom:'0.5rem'}}>{analytics.totalPatients}</div>
          <div style={{color:'#666', fontSize: isMobile ? '0.9rem' : '1rem'}}>{t('total_patients')}</div>
        </div>
        <div style={{
          background:'#fff',
          borderRadius: isMobile ? 12 : 16,
          boxShadow:'0 2px 12px rgba(10, 143, 130, 0.1)',
          padding: isMobile ? '1rem 0.8rem' : '1.5rem',
          textAlign:'center',
          border: '2px solid #0A8F82'
        }}>
          <div style={{fontSize: isMobile ? '1.5rem' : '2rem', marginBottom:'0.5rem'}}>📅</div>
          <div style={{fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight:700, color:'#0A8F82', marginBottom:'0.5rem'}}>{analytics.todayAppointments}</div>
          <div style={{color:'#666', fontSize: isMobile ? '0.9rem' : '1rem'}}>{t('today_appointments')}</div>
        </div>
        <div style={{
          background:'#fff',
          borderRadius: isMobile ? 12 : 16,
          boxShadow:'0 2px 12px rgba(10, 143, 130, 0.1)',
          padding: isMobile ? '1rem 0.8rem' : '1.5rem',
          textAlign:'center',
          border: '2px solid #0A8F82'
        }}>
          <div style={{fontSize: isMobile ? '1.5rem' : '2rem', marginBottom:'0.5rem'}}>⏰</div>
          <div style={{fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight:700, color:'#0A8F82', marginBottom:'0.5rem'}}>{analytics.upcomingAppointments}</div>
          <div style={{color:'#666', fontSize: isMobile ? '0.9rem' : '1rem'}}>{t('upcoming_appointments')}</div>
        </div>
      </div>

      {/* إحصائيات الحجز لشخص آخر */}
      <div style={{
        background: '#fff',
        borderRadius: isMobile ? 12 : 16,
        boxShadow: '0 2px 12px rgba(10, 143, 130, 0.1)',
        padding: isMobile ? '1rem 0.8rem' : '1.5rem',
        marginBottom: '2rem',
        border: '2px solid #0A8F82'
      }}>
        <h3 style={{
          color: '#0A8F82',
          marginBottom: '1rem',
          textAlign: 'center',
          fontSize: isMobile ? '1.1rem' : '1.3rem'
        }}>
          👥 {t('booking_for_others_stats')}
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            background: '#e3f2fd',
            padding: '1rem',
            borderRadius: 12,
            textAlign: 'center',
            border: '2px solid #1976d2'
          }}>
            <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>📊</div>
            <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#1976d2', marginBottom: '0.5rem'}}>
              {analytics.bookingForOthersStats.total}
            </div>
            <div style={{color: '#666', fontSize: '0.9rem'}}>{t('total_bookings_for_others')}</div>
          </div>
          
          <div style={{
            background: '#e8f5e8',
            padding: '1rem',
            borderRadius: 12,
            textAlign: 'center',
            border: '2px solid #2e7d32'
          }}>
            <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>📈</div>
            <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#2e7d32', marginBottom: '0.5rem'}}>
              {analytics.bookingForOthersStats.percentage}%
            </div>
            <div style={{color: '#666', fontSize: '0.9rem'}}>{t('percentage_of_total')}</div>
          </div>
          
          <div style={{
            background: '#fff3e0',
            padding: '1rem',
            borderRadius: 12,
            textAlign: 'center',
            border: '2px solid #ef6c00'
          }}>
            <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>👤</div>
            <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#ef6c00', marginBottom: '0.5rem'}}>
              {analytics.bookingForOthersStats.uniqueBookers}
            </div>
            <div style={{color: '#666', fontSize: '0.9rem'}}>{t('unique_bookers')}</div>
          </div>
          
          <div style={{
            background: '#f3e5f5',
            padding: '1rem',
            borderRadius: 12,
            textAlign: 'center',
            border: '2px solid #7b1fa2'
          }}>
            <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🏥</div>
            <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#7b1fa2', marginBottom: '0.5rem'}}>
              {analytics.bookingForOthersStats.uniquePatients}
            </div>
            <div style={{color: '#666', fontSize: '0.9rem'}}>{t('unique_patients')}</div>
          </div>
        </div>
      </div>

      {/* أعلى المستخدمين الذين حجزوا لشخص آخر */}
      <div style={{
        background: '#fff',
        borderRadius: isMobile ? 12 : 16,
        boxShadow: '0 2px 12px rgba(10, 143, 130, 0.1)',
        padding: isMobile ? '1rem 0.8rem' : '1.5rem',
        marginBottom: '2rem',
        border: '2px solid #0A8F82'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h3 style={{
            color: '#0A8F82',
            margin: 0,
            fontSize: isMobile ? '1.1rem' : '1.3rem'
          }}>
            🏆 {t('top_users_booking_for_others')}
          </h3>
          
          <div style={{
            display: 'flex',
            gap: '0.5rem'
          }}>
            <button
              onClick={() => setShowUserSelection(!showUserSelection)}
              style={{
                background: '#0A8F82',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '0.5rem 1rem',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {showUserSelection ? t('hide_selection') : t('add_users')}
            </button>
            
            {selectedUsers.length > 0 && (
              <button
                onClick={addSelectedUsersToStats}
                style={{
                  background: '#4caf50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.5rem 1rem',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {t('add_selected')} ({selectedUsers.length})
              </button>
            )}
          </div>
        </div>

        {/* قائمة المستخدمين المختارين */}
        {showUserSelection && (
          <div style={{
            background: '#f8f9fa',
            borderRadius: 8,
            padding: '1rem',
            marginBottom: '1rem',
            border: '2px solid #0A8F82'
          }}>
            <h4 style={{
              color: '#0A8F82',
              margin: '0 0 1rem 0',
              fontSize: '1rem'
            }}>
              📋 {t('select_users_from_appointments')}
            </h4>
            
            <div style={{
              display: 'grid',
              gap: '0.5rem',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {appointments
                .filter(apt => apt.isBookingForOther && apt.userId)
                .map((apt, index) => {
                  const user = {
                    userId: apt.userId._id || apt.userId,
                    userName: apt.userName || apt.userId?.first_name || t('user_not_available'),
                    userPhone: apt.userId?.phone || t('phone_not_available'),
                    totalBookingsForOthers: 1,
                    uniquePatients: 1,
                    patientNames: [apt.patientName || apt.userName || t('patient_not_available')],
                    firstBookingDate: apt.date,
                    lastBookingDate: apt.date
                  };
                  
                  return (
                    <div
                      key={`${apt._id}-${index}`}
                      onClick={() => handleUserSelection(user)}
                      style={{
                        background: selectedUsers.find(u => u.userId === user.userId) ? '#e8f5e8' : '#fff',
                        border: selectedUsers.find(u => u.userId === user.userId) ? '2px solid #4caf50' : '1px solid #ddd',
                        borderRadius: 6,
                        padding: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{fontWeight: 600, color: '#0A8F82'}}>
                        👤 {user.userName}
                      </div>
                      <div style={{fontSize: '0.8rem', color: '#666'}}>
                        📞 {user.userPhone} | 📅 {new Date(apt.date).toLocaleDateString('ar-EG')}
                      </div>
                      <div style={{fontSize: '0.8rem', color: '#666'}}>
                        🏥 {t('patient')}: {apt.patientName || apt.userName || t('patient_not_available')}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* عرض المستخدمين */}
        <div style={{
          display: 'grid',
          gap: '1rem'
        }}>
          {topUsersForOthers.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#666',
              fontStyle: 'italic',
              padding: '2rem'
            }}>
              {t('no_users_found')}
            </div>
          ) : (
            topUsersForOthers.map((user, index) => (
              <div key={user.userId} style={{
                background: index < 3 ? '#fff3cd' : '#f8f9fa',
                padding: '1rem',
                borderRadius: 12,
                border: index < 3 ? '2px solid #ffc107' : '2px solid #0A8F82',
                position: 'relative'
              }}>
                {/* ترتيب المستخدم */}
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  background: index < 3 ? '#ffc107' : '#0A8F82',
                  color: '#fff',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1rem'
                }}>
                  {index + 1}
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  <div>
                    <h4 style={{
                      color: '#0A8F82',
                      margin: '0 0 0.5rem 0',
                      fontSize: '1.1rem',
                      fontWeight: 700
                    }}>
                      👤 {user.userName || t('user_not_available')}
                    </h4>
                    <p style={{margin: '0.3rem 0', color: '#666'}}>
                      📞 {user.userPhone || t('phone_not_available')}
                    </p>
                    <p style={{margin: '0.3rem 0', color: '#666'}}>
                      📅 {t('first_booking')}: {new Date(user.firstBookingDate).toLocaleDateString('ar-EG')}
                    </p>
                    <p style={{margin: '0.3rem 0', color: '#666'}}>
                      📅 {t('last_booking')}: {new Date(user.lastBookingDate).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  
                  <div>
                    <div style={{
                      background: '#0A8F82',
                      color: '#fff',
                      padding: '0.5rem 1rem',
                      borderRadius: 8,
                      textAlign: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{fontSize: '1.5rem', fontWeight: 700}}>
                        {user.totalBookingsForOthers}
                      </div>
                      <div style={{fontSize: '0.9rem'}}>{t('bookings_for_others')}</div>
                    </div>
                    
                    <div style={{
                      background: '#e8f5e8',
                      padding: '0.5rem 1rem',
                      borderRadius: 8,
                      textAlign: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{fontSize: '1.2rem', fontWeight: 700, color: '#2e7d32'}}>
                        {user.uniquePatients}
                      </div>
                      <div style={{fontSize: '0.8rem', color: '#2e7d32'}}>{t('different_patients')}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 style={{
                      color: '#0A8F82',
                      margin: '0 0 0.5rem 0',
                      fontSize: '1rem'
                    }}>
                      👥 {t('patients')}:
                    </h5>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      {user.patientNames.slice(0, 3).map((patient, idx) => (
                        <span key={idx} style={{
                          background: '#e3f2fd',
                          color: '#1976d2',
                          padding: '0.3rem 0.6rem',
                          borderRadius: 6,
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}>
                          {patient}
                        </span>
                      ))}
                      {user.patientNames.length > 3 && (
                        <span style={{
                          background: '#f5f5f5',
                          color: '#666',
                          padding: '0.3rem 0.6rem',
                          borderRadius: 6,
                          fontSize: '0.8rem'
                        }}>
                          +{user.patientNames.length - 3} {t('more')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* باقي الإحصائيات */}
      <div style={{
        background: '#fff',
        borderRadius: isMobile ? 12 : 16,
        boxShadow: '0 2px 12px rgba(10, 143, 130, 0.1)',
        padding: isMobile ? '1rem 0.8rem' : '1.5rem',
        marginBottom: '2rem',
        border: '2px solid #0A8F82'
      }}>
        <h3 style={{
          color: '#0A8F82',
          marginBottom: '1rem',
          textAlign: 'center',
          fontSize: isMobile ? '1.1rem' : '1.3rem'
        }}>
          📈 {t('detailed_analytics')}
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {/* إحصائيات الحضور */}
          <div>
            <h4 style={{
              color: '#0A8F82',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              ✅ {t('attendance_stats')}
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem'
            }}>
              <div style={{
                background: '#e8f5e8',
                padding: '1rem',
                borderRadius: 8,
                textAlign: 'center',
                border: '2px solid #2e7d32'
              }}>
                <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#2e7d32'}}>
                  {analytics.attendanceStats.present}
                </div>
                <div style={{color: '#666', fontSize: '0.9rem'}}>{t('present')}</div>
              </div>
              <div style={{
                background: '#ffebee',
                padding: '1rem',
                borderRadius: 8,
                textAlign: 'center',
                border: '2px solid #c62828'
              }}>
                <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#c62828'}}>
                  {analytics.attendanceStats.absent}
                </div>
                <div style={{color: '#666', fontSize: '0.9rem'}}>{t('absent')}</div>
              </div>
            </div>
          </div>

          {/* أكثر الأيام والأوقات ازدحاماً */}
          <div>
            <h4 style={{
              color: '#0A8F82',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              🕐 {t('busy_times')}
            </h4>
            <div style={{
              display: 'grid',
              gap: '1rem'
            }}>
              <div style={{
                background: '#fff3e0',
                padding: '1rem',
                borderRadius: 8,
                textAlign: 'center',
                border: '2px solid #ef6c00'
              }}>
                <div style={{fontSize: '1.2rem', fontWeight: 700, color: '#ef6c00'}}>
                  {analytics.mostBusyDay || t('not_available')}
                </div>
                <div style={{color: '#666', fontSize: '0.9rem'}}>{t('most_busy_day')}</div>
              </div>
              <div style={{
                background: '#e1f5fe',
                padding: '1rem',
                borderRadius: 8,
                textAlign: 'center',
                border: '2px solid #0277bd'
              }}>
                <div style={{fontSize: '1.2rem', fontWeight: 700, color: '#0277bd'}}>
                  {analytics.mostBusyHour ? `${analytics.mostBusyHour}:00` : t('not_available')}
                </div>
                <div style={{color: '#666', fontSize: '0.9rem'}}>{t('most_busy_hour')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorAnalyticsPage; 