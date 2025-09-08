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

  useEffect(() => {
    fetchAllAppointments();
  }, [profile?._id, fetchAllAppointments]);

  // دالة التصفية الزمنية
  const filterAppointmentsByTime = (appointments, filter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'weekly':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        return appointments.filter(apt => new Date(apt.date) >= weekAgo);
      
      case 'monthly':
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        return appointments.filter(apt => new Date(apt.date) >= monthAgo);
      
      case 'yearly':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(today.getFullYear() - 1);
        return appointments.filter(apt => new Date(apt.date) >= yearAgo);
      
      default:
        return appointments;
    }
  };

  // دالة تحويل الوقت إلى ساعة كاملة
  const getHourFromTime = (timeString) => {
    if (!timeString) return 'غير محدد';
    
    // استخراج الساعة من الوقت (مثال: "10:30" -> "10:00")
    const timeParts = timeString.split(':');
    if (timeParts.length >= 2) {
      const hour = parseInt(timeParts[0]);
      return `${hour.toString().padStart(2, '0')}:00`;
    }
    
    return timeString;
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
        absent: filteredAppointments.filter(apt => apt.attendance === 'absent').length
      },
      
      // تحليل حسب الأيام
      appointmentsByDay: {},
      appointmentsByMonth: {},
      appointmentsByHour: {}, // تغيير من appointmentsByTime إلى appointmentsByHour
      
      // إحصائيات إضافية
      mostBusyDay: null,
      mostBusyHour: null, // تغيير من mostBusyTime إلى mostBusyHour
      averageAppointmentsPerDay: 0,
      totalPatients: new Set()
    };

    // تحليل حسب الأيام
    filteredAppointments.forEach(apt => {
      const date = new Date(apt.date);
      const dayKey = date.toLocaleDateString('ar-EG', { weekday: 'long' });
      const monthKey = date.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
      const hourKey = getHourFromTime(apt.time); // استخدام الساعة الكاملة
      
      analytics.appointmentsByDay[dayKey] = (analytics.appointmentsByDay[dayKey] || 0) + 1;
      analytics.appointmentsByMonth[monthKey] = (analytics.appointmentsByMonth[monthKey] || 0) + 1;
      analytics.appointmentsByHour[hourKey] = (analytics.appointmentsByHour[hourKey] || 0) + 1;
      
      // إضافة المريض للمجموعة
      analytics.totalPatients.add(apt.userId?._id || apt.userName);
    });

    // العثور على أكثر يوم مشغول
    analytics.mostBusyDay = Object.entries(analytics.appointmentsByDay)
      .sort(([,a], [,b]) => b - a)[0];
    
    // العثور على أكثر ساعة مشغولة
    analytics.mostBusyHour = Object.entries(analytics.appointmentsByHour)
      .sort(([,a], [,b]) => b - a)[0];
    
    // متوسط المواعيد يومياً
    const uniqueDays = Object.keys(analytics.appointmentsByDay).length;
    analytics.averageAppointmentsPerDay = uniqueDays > 0 ? 
      (analytics.totalAppointments / uniqueDays).toFixed(1) : 0;
    
    analytics.totalPatients = analytics.totalPatients.size;
    
    return analytics;
  };

  // دالة الحصول على نص التصفية الزمنية
  const getTimeFilterText = () => {
    switch (timeFilter) {
      case 'weekly': return t('weekly_analysis');
      case 'monthly': return t('monthly_analysis');
      case 'yearly': return t('yearly_analysis');
      default: return t('all_time_analysis');
    }
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
        padding: isMobile ? '0.4rem 0.5rem' : '0.5rem 1rem',
        boxShadow: '0 1px 5px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid #0A8F82'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: isMobile ? '0.25rem' : '0.5rem'}}>
          <button
            onClick={() => navigate('/doctor-dashboard')}
            style={{
              background: 'linear-gradient(135deg, #e53935 0%, #c62828 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: isMobile ? 4 : 6,
              padding: isMobile ? '0.3rem 0.5rem' : '0.4rem 0.75rem',
              fontWeight: 700,
              fontSize: isMobile ? 7 : 8,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 1px 4px rgba(229, 57, 53, 0.3)'
            }}
          >
            ← {t('back')}
          </button>
          <h1 style={{
            color: '#0A8F82',
            fontWeight: 800,
            fontSize: isMobile ? 8 : 14,
            margin: 0
          }}>
            📊 {t('analytics_full_title')}
          </h1>
        </div>
        
        <button
          onClick={signOut}
          style={{
            background: 'linear-gradient(135deg, #ff5722 0%, #e64a19 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: isMobile ? 4 : 6,
            padding: isMobile ? '0.3rem 0.5rem' : '0.4rem 0.75rem',
            fontWeight: 700,
            fontSize: isMobile ? 7 : 8,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 1px 4px rgba(255, 87, 34, 0.3)'
          }}
        >
          {t('logout')}
        </button>
      </div>

      {/* Content */}
      <div style={{
        padding: isMobile ? '0.5rem 0.4rem' : '1rem',
        maxWidth: 600,
        margin: '0 auto'
      }}>
        <AnalyticsView 
          analytics={getAnalytics()} 
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          getTimeFilterText={getTimeFilterText}
        />
      </div>
    </div>
  );
}

// مكون التحليل الكامل
function AnalyticsView({ analytics, timeFilter, setTimeFilter, getTimeFilterText }) {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const [showMoreTimes, setShowMoreTimes] = useState(false);

  // مراقبة حجم النافذة
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 500);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  return (
    <div style={{display:'flex', flexDirection:'column', gap: isMobile ? '0.5rem' : '1rem'}}>
      {/* تصفية زمنية */}
      <div style={{
        background:'#fff', 
        borderRadius: isMobile ? 6 : 8, 
        boxShadow:'0 1px 6px #7c4dff11', 
        padding: isMobile ? '0.5rem 0.4rem' : '0.75rem'
      }}>
        <h3 style={{
          color:'#0A8F82', 
          marginBottom: isMobile ? '0.4rem' : '0.5rem', 
          textAlign:'center',
          fontSize: isMobile ? '0.55rem' : '0.65rem'
        }}>{t('time_period_filter')}</h3>
        
        <div style={{
          display:'flex', 
          justifyContent:'center', 
          gap: isMobile ? '0.25rem' : '0.5rem',
          flexWrap:'wrap'
        }}>
          <button
            onClick={() => setTimeFilter('all')}
            style={{
              background: timeFilter === 'all' ? '#0A8F82' : '#f8f9fa',
              color: timeFilter === 'all' ? '#fff' : '#0A8F82',
              border: timeFilter === 'all' ? 'none' : '1px solid #0A8F82',
              borderRadius: isMobile ? 4 : 6,
              padding: isMobile ? '0.3rem 0.5rem' : '0.4rem 0.75rem',
              fontWeight: 700,
              fontSize: isMobile ? '0.45rem' : '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            📅 {t('all_time')}
          </button>
          
          <button
            onClick={() => setTimeFilter('weekly')}
            style={{
              background: timeFilter === 'weekly' ? '#0A8F82' : '#f8f9fa',
              color: timeFilter === 'weekly' ? '#fff' : '#0A8F82',
              border: timeFilter === 'weekly' ? 'none' : '1px solid #0A8F82',
              borderRadius: isMobile ? 4 : 6,
              padding: isMobile ? '0.3rem 0.5rem' : '0.4rem 0.75rem',
              fontWeight: 700,
              fontSize: isMobile ? '0.45rem' : '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            📊 {t('weekly')}
          </button>
          
          <button
            onClick={() => setTimeFilter('monthly')}
            style={{
              background: timeFilter === 'monthly' ? '#0A8F82' : '#f8f9fa',
              color: timeFilter === 'monthly' ? '#fff' : '#0A8F82',
              border: timeFilter === 'monthly' ? 'none' : '1px solid #0A8F82',
              borderRadius: isMobile ? 4 : 6,
              padding: isMobile ? '0.3rem 0.5rem' : '0.4rem 0.75rem',
              fontWeight: 700,
              fontSize: isMobile ? '0.45rem' : '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            📈 {t('monthly')}
          </button>
          
          <button
            onClick={() => setTimeFilter('yearly')}
            style={{
              background: timeFilter === 'yearly' ? '#0A8F82' : '#f8f9fa',
              color: timeFilter === 'yearly' ? '#fff' : '#0A8F82',
              border: timeFilter === 'yearly' ? 'none' : '1px solid #0A8F82',
              borderRadius: isMobile ? 4 : 6,
              padding: isMobile ? '0.3rem 0.5rem' : '0.4rem 0.75rem',
              fontWeight: 700,
              fontSize: isMobile ? '0.45rem' : '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🎯 {t('yearly')}
          </button>
        </div>
        
        <div style={{
          textAlign:'center',
          marginTop: isMobile ? '0.4rem' : '0.5rem',
          padding: isMobile ? '0.4rem' : '0.5rem',
          background:'#f8f9fa',
          borderRadius: isMobile ? 4 : 6,
          border: '1px solid #0A8F82'
        }}>
          <span style={{
            color:'#0A8F82',
            fontWeight:700,
            fontSize: isMobile ? '0.45rem' : '0.5rem'
          }}>
            📊 {getTimeFilterText()}
          </span>
        </div>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div style={{
        display:'grid', 
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(100px, 1fr))', 
        gap: isMobile ? '0.4rem' : '0.5rem'
      }}>
        <div style={{
          background:'#fff', 
          borderRadius: isMobile ? 6 : 8, 
          boxShadow:'0 1px 6px rgba(10, 143, 130, 0.1)', 
          padding: isMobile ? '0.5rem 0.4rem' : '0.75rem', 
          textAlign:'center',
          border: '1px solid #0A8F82'
        }}>
          <div style={{fontSize: isMobile ? '0.75rem' : '1rem', marginBottom:'0.25rem'}}>📊</div>
          <div style={{fontSize: isMobile ? '0.6rem' : '0.75rem', fontWeight:700, color:'#0A8F82', marginBottom:'0.25rem'}}>{analytics.totalAppointments}</div>
          <div style={{color:'#666', fontSize: isMobile ? '0.45rem' : '0.5rem'}}>{t('total_appointments')}</div>
        </div>
        <div style={{
          background:'#fff', 
          borderRadius: isMobile ? 6 : 8, 
          boxShadow:'0 1px 6px rgba(10, 143, 130, 0.1)', 
          padding: isMobile ? '0.5rem 0.4rem' : '0.75rem', 
          textAlign:'center',
          border: '1px solid #0A8F82'
        }}>
          <div style={{fontSize: isMobile ? '0.75rem' : '1rem', marginBottom:'0.25rem'}}>👥</div>
          <div style={{fontSize: isMobile ? '0.6rem' : '0.75rem', fontWeight:700, color:'#0A8F82', marginBottom:'0.25rem'}}>{analytics.totalPatients}</div>
          <div style={{color:'#666', fontSize: isMobile ? '0.45rem' : '0.5rem'}}>{t('total_patients')}</div>
        </div>
        <div style={{
          background:'#fff', 
          borderRadius: isMobile ? 6 : 8, 
          boxShadow:'0 1px 6px rgba(10, 143, 130, 0.1)', 
          padding: isMobile ? '0.5rem 0.4rem' : '0.75rem', 
          textAlign:'center',
          border: '1px solid #0A8F82'
        }}>
          <div style={{fontSize: isMobile ? '0.75rem' : '1rem', marginBottom:'0.25rem'}}>📈</div>
          <div style={{fontSize: isMobile ? '0.6rem' : '0.75rem', fontWeight:700, color:'#0A8F82', marginBottom:'0.25rem'}}>{analytics.averageAppointmentsPerDay}</div>
          <div style={{color:'#666', fontSize: isMobile ? '0.45rem' : '0.5rem'}}>{t('average_appointments_per_day')}</div>
        </div>
        <div style={{
          background:'#fff', 
          borderRadius: isMobile ? 6 : 8, 
          boxShadow:'0 1px 6px rgba(10, 143, 130, 0.1)', 
          padding: isMobile ? '0.5rem 0.4rem' : '0.75rem', 
          textAlign:'center',
          border: '1px solid #0A8F82'
        }}>
          <div style={{fontSize: isMobile ? '0.75rem' : '1rem', marginBottom:'0.25rem'}}>🔥</div>
          <div style={{fontSize: isMobile ? '0.6rem' : '0.75rem', fontWeight:700, color:'#0A8F82', marginBottom:'0.25rem'}}>{analytics.mostBusyDay?.[1] || 0}</div>
          <div style={{color:'#666', fontSize: isMobile ? '0.45rem' : '0.5rem'}}>{t('most_busy_day')}</div>
        </div>
        <div style={{
          background:'#fff', 
          borderRadius: isMobile ? 6 : 8, 
          boxShadow:'0 1px 6px rgba(10, 143, 130, 0.1)', 
          padding: isMobile ? '0.5rem 0.4rem' : '0.75rem', 
          textAlign:'center',
          border: '1px solid #0A8F82'
        }}>
          <div style={{fontSize: isMobile ? '0.75rem' : '1rem', marginBottom:'0.25rem'}}>✅</div>
          <div style={{fontSize: isMobile ? '0.6rem' : '0.75rem', fontWeight:700, color:'#0A8F82', marginBottom:'0.25rem'}}>{analytics.attendanceStats.present}</div>
          <div style={{color:'#666', fontSize: isMobile ? '0.45rem' : '0.5rem'}}>{t('present_count')}</div>
        </div>
        <div style={{
          background:'#fff', 
          borderRadius: isMobile ? 6 : 8, 
          boxShadow:'0 1px 6px rgba(10, 143, 130, 0.1)', 
          padding: isMobile ? '0.5rem 0.4rem' : '0.75rem', 
          textAlign:'center',
          border: '1px solid #0A8F82'
        }}>
          <div style={{fontSize: isMobile ? '0.75rem' : '1rem', marginBottom:'0.25rem'}}>❌</div>
          <div style={{fontSize: isMobile ? '0.6rem' : '0.75rem', fontWeight:700, color:'#0A8F82', marginBottom:'0.25rem'}}>{analytics.attendanceStats.absent}</div>
          <div style={{color:'#666', fontSize: isMobile ? '0.45rem' : '0.5rem'}}>{t('absent_count')}</div>
        </div>
      </div>

      {/* تحليل الحضور والغياب */}
      <div style={{
        background:'#fff', 
        borderRadius: isMobile ? 6 : 8, 
        boxShadow:'0 1px 6px rgba(10, 143, 130, 0.1)', 
        padding: isMobile ? '0.5rem 0.4rem' : '0.75rem',
        border: '1px solid #0A8F82'
      }}>
        <h3 style={{
          color:'#0A8F82', 
          marginBottom: isMobile ? '0.4rem' : '0.5rem', 
          textAlign:'center',
          fontSize: isMobile ? '0.55rem' : '0.65rem'
        }}>{t('attendance_analysis')}</h3>
        
        {/* إحصائيات الحضور */}
        <div style={{
          display:'grid', 
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)', 
          gap: isMobile ? '0.4rem' : '0.5rem',
          marginBottom: isMobile ? '0.5rem' : '0.75rem'
        }}>
          <div style={{
            background:'#e8f5e8',
            padding: isMobile ? '0.4rem 0.3rem' : '0.5rem',
            borderRadius: isMobile ? 4 : 6,
            textAlign:'center',
            border: '1px solid #0A8F82'
          }}>
            <div style={{
              fontSize: isMobile ? '0.75rem' : '1rem', 
              marginBottom:'0.25rem'
            }}>✅</div>
            <div style={{
              fontSize: isMobile ? '0.6rem' : '0.75rem', 
              fontWeight:700, 
              color:'#0A8F82',
              marginBottom:'0.15rem'
            }}>{analytics.attendanceStats.present}</div>
            <div style={{
              fontSize: isMobile ? '0.4rem' : '0.45rem', 
              color:'#0A8F82',
              fontWeight:600
            }}>{t('present')}</div>
          </div>
          
          <div style={{
            background:'#ffebee',
            padding: isMobile ? '0.4rem 0.3rem' : '0.5rem',
            borderRadius: isMobile ? 4 : 6,
            textAlign:'center',
            border: '1px solid #0A8F82'
          }}>
            <div style={{
              fontSize: isMobile ? '0.75rem' : '1rem', 
              marginBottom:'0.25rem'
            }}>❌</div>
            <div style={{
              fontSize: isMobile ? '0.6rem' : '0.75rem', 
              fontWeight:700, 
              color:'#0A8F82',
              marginBottom:'0.15rem'
            }}>{analytics.attendanceStats.absent}</div>
            <div style={{
              fontSize: isMobile ? '0.4rem' : '0.45rem', 
              color:'#0A8F82',
              fontWeight:600
            }}>{t('absent')}</div>
          </div>
        </div>

        {/* نسب الحضور */}
        <div style={{
          background:'#f8f9fa',
          padding: isMobile ? '0.5rem 0.4rem' : '0.75rem',
          borderRadius: isMobile ? 4 : 6,
          border: '1px solid #0A8F82'
        }}>
          <h4 style={{
            color:'#0A8F82',
            marginBottom: isMobile ? '0.4rem' : '0.5rem',
            textAlign:'center',
            fontSize: isMobile ? '0.5rem' : '0.55rem',
            fontWeight:600
          }}>{t('attendance_percentage')}</h4>
          
          <div style={{
            display:'flex',
            flexDirection:'column',
            gap: isMobile ? '0.3rem' : '0.4rem'
          }}>
            {/* نسبة الحضور */}
            <div style={{
              display:'flex',
              justifyContent:'space-between',
              alignItems:'center',
              padding: isMobile ? '0.25rem 0.4rem' : '0.4rem 0.5rem',
              background:'#e8f5e8',
              borderRadius: isMobile ? 3 : 4
            }}>
              <span style={{fontWeight:600, color:'#0A8F82', fontSize: isMobile ? '0.4rem' : '0.45rem'}}>{t('present')}</span>
              <div style={{
                background:'#0A8F82',
                color:'#fff',
                padding: isMobile ? '0.15rem 0.3rem' : '0.2rem 0.4rem',
                borderRadius: isMobile ? 2 : 3,
                fontWeight:700,
                fontSize: isMobile ? '0.4rem' : '0.45rem'
              }}>
                {analytics.totalAppointments > 0 ? 
                  ((analytics.attendanceStats.present / analytics.totalAppointments) * 100).toFixed(1) : 0}%
              </div>
            </div>
            
            {/* نسبة الغياب */}
            <div style={{
              display:'flex',
              justifyContent:'space-between',
              alignItems:'center',
              padding: isMobile ? '0.25rem 0.4rem' : '0.4rem 0.5rem',
              background:'#ffebee',
              borderRadius: isMobile ? 3 : 4
            }}>
              <span style={{fontWeight:600, color:'#0A8F82', fontSize: isMobile ? '0.4rem' : '0.45rem'}}>{t('absent')}</span>
              <div style={{
                background:'#0A8F82',
                color:'#fff',
                padding: isMobile ? '0.15rem 0.3rem' : '0.2rem 0.4rem',
                borderRadius: isMobile ? 2 : 3,
                fontWeight:700,
                fontSize: isMobile ? '0.4rem' : '0.45rem'
              }}>
                {analytics.totalAppointments > 0 ? 
                  ((analytics.attendanceStats.absent / analytics.totalAppointments) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* تحليل الأوقات حسب الساعات */}
      <div style={{
        background:'#fff', 
        borderRadius: isMobile ? 6 : 8, 
        boxShadow:'0 1px 6px rgba(10, 143, 130, 0.1)', 
        padding: isMobile ? '0.5rem 0.4rem' : '0.75rem',
        border: '1px solid #0A8F82'
      }}>
        <h3 style={{
          color:'#0A8F82', 
          marginBottom: isMobile ? '0.4rem' : '0.5rem', 
          textAlign:'center',
          fontSize: isMobile ? '0.55rem' : '0.65rem'
        }}>{t('appointments_by_hour') || 'المواعيد حسب الساعات'}</h3>
        
        {/* جدول منظم للساعات */}
        <div style={{
          display: 'table',
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '0.5rem'
        }}>
          <div style={{
            display: 'table-header-group',
            background: '#f8f9fa',
            fontWeight: 700,
            fontSize: isMobile ? '0.45rem' : '0.5rem'
          }}>
            <div style={{
              display: 'table-row'
            }}>
              <div style={{
                display: 'table-cell',
                padding: isMobile ? '0.3rem 0.2rem' : '0.4rem 0.5rem',
                borderBottom: '1px solid #0A8F82',
                textAlign: 'center',
                color: '#0A8F82'
              }}>
                {t('hour') || 'الساعة'}
              </div>
              <div style={{
                display: 'table-cell',
                padding: isMobile ? '0.3rem 0.2rem' : '0.4rem 0.5rem',
                borderBottom: '1px solid #0A8F82',
                textAlign: 'center',
                color: '#0A8F82'
              }}>
                {t('appointments_count') || 'عدد المواعيد'}
              </div>
              <div style={{
                display: 'table-cell',
                padding: isMobile ? '0.3rem 0.2rem' : '0.4rem 0.5rem',
                borderBottom: '1px solid #0A8F82',
                textAlign: 'center',
                color: '#0A8F82'
              }}>
                {t('status') || 'الحالة'}
              </div>
            </div>
          </div>
          
          <div style={{display: 'table-row-group'}}>
            {Object.entries(analytics.appointmentsByHour)
              .sort(([,a], [,b]) => b - a) // ترتيب تنازلي
              .slice(0, showMoreTimes ? 10 : 5) // عرض 5 أو 10 حسب الحالة
              .map(([hour, count], index) => (
                <div key={hour} style={{
                  display: 'table-row',
                  background: index % 2 === 0 ? '#fff' : '#f8f9fa',
                  borderBottom: '1px solid #dee2e6'
                }}>
                  <div style={{
                    display: 'table-cell',
                    padding: isMobile ? '0.3rem 0.2rem' : '0.4rem 0.5rem',
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: isMobile ? '0.45rem' : '0.5rem'
                  }}>
                    {hour}
                  </div>
                  <div style={{
                    display: 'table-cell',
                    padding: isMobile ? '0.3rem 0.2rem' : '0.4rem 0.5rem',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: isMobile ? '0.55rem' : '0.6rem',
                    color: '#0A8F82'
                  }}>
                    {count}
                  </div>
                  <div style={{
                    display: 'table-cell',
                    padding: isMobile ? '0.3rem 0.2rem' : '0.4rem 0.5rem',
                    textAlign: 'center'
                  }}>
                    {hour === analytics.mostBusyHour?.[0] ? (
                      <span style={{
                        background: '#0A8F82',
                        color: '#fff',
                        padding: isMobile ? '0.1rem 0.25rem' : '0.15rem 0.4rem',
                        borderRadius: isMobile ? 4 : 6,
                        fontSize: isMobile ? '0.35rem' : '0.4rem',
                        fontWeight: 600
                      }}>
                        🔥 {t('most_requested') || 'الأكثر طلباً'}
                      </span>
                    ) : (
                      <span style={{
                        color: '#6c757d',
                        fontSize: isMobile ? '0.35rem' : '0.4rem'
                      }}>
                        -
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
        
        {/* زر عرض المزيد للساعات */}
        {Object.entries(analytics.appointmentsByHour).length > 5 && (
          <div style={{
            textAlign: 'center',
            marginTop: '0.5rem'
          }}>
            <button
              onClick={() => setShowMoreTimes(!showMoreTimes)}
              style={{
                background: '#0A8F82',
                color: '#fff',
                border: 'none',
                borderRadius: isMobile ? 4 : 6,
                padding: isMobile ? '0.3rem 0.6rem' : '0.4rem 0.75rem',
                fontWeight: 600,
                fontSize: isMobile ? '0.225rem' : '0.25rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 1px 4px rgba(10, 143, 130, 0.3)'
              }}
            >
              {showMoreTimes ? t('show_less') || 'عرض أقل' : t('show_more') || 'عرض المزيد'} ({Object.entries(analytics.appointmentsByHour).length - 5} {t('more') || 'أكثر'})
            </button>
          </div>
        )}
      </div>

      {/* تحليل أيام الأسبوع */}
      <div style={{
        background:'#fff', 
        borderRadius: isMobile ? 6 : 8, 
        boxShadow:'0 1px 6px rgba(10, 143, 130, 0.1)', 
        padding: isMobile ? '0.5rem 0.4rem' : '0.75rem',
        border: '1px solid #0A8F82'
      }}>
        <h3 style={{
          color:'#0A8F82', 
          marginBottom: isMobile ? '0.4rem' : '0.5rem', 
          textAlign:'center',
          fontSize: isMobile ? '0.55rem' : '0.65rem'
        }}>{t('appointments_by_weekday') || 'المواعيد حسب أيام الأسبوع'}</h3>
        
        {/* ترتيب أيام الأسبوع */}
        <div style={{
          display:'grid', 
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(75px, 1fr))', 
          gap: isMobile ? '0.4rem' : '0.5rem'
        }}>
          {Object.entries(analytics.appointmentsByDay)
            .sort(([a], [b]) => {
              // ترتيب أيام الأسبوع من الأحد إلى السبت
              const weekdays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
              return weekdays.indexOf(a) - weekdays.indexOf(b);
            })
            .map(([day, count]) => (
              <div key={day} style={{
                background: day === analytics.mostBusyDay?.[0] ? '#fff3cd' : '#f5f5f5',
                padding: isMobile ? '0.4rem 0.3rem' : '0.5rem',
                borderRadius: isMobile ? 3 : 4,
                textAlign:'center',
                border: day === analytics.mostBusyDay?.[0] ? '1px solid #ffc107' : '1px solid #0A8F82'
              }}>
                <div style={{
                  fontSize: isMobile ? '0.5rem' : '0.55rem', 
                  fontWeight:700, 
                  marginBottom:'0.25rem',
                  color: day === analytics.mostBusyDay?.[0] ? '#856404' : '#0A8F82'
                }}>{(() => {
                  const dayMap = {
                    'الأحد': 'sunday',
                    'الاثنين': 'monday', 
                    'الثلاثاء': 'tuesday',
                    'الأربعاء': 'wednesday',
                    'الخميس': 'thursday',
                    'الجمعة': 'friday',
                    'السبت': 'saturday'
                  };
                  const englishKey = dayMap[day];
                  return englishKey ? t(`weekdays.${englishKey}`) : day;
                })()}</div>
                <div style={{
                  fontSize: isMobile ? '0.6rem' : '0.65rem', 
                  fontWeight:700, 
                  color: day === analytics.mostBusyDay?.[0] ? '#ffc107' : '#0A8F82'
                }}>{count}</div>
                {day === analytics.mostBusyDay?.[0] && (
                  <div style={{
                    fontSize: isMobile ? '0.35rem' : '0.4rem',
                    color: '#856404',
                    fontWeight: 600,
                    marginTop: '0.15rem'
                  }}>
                    🔥 {t('most_busy') || 'الأكثر انشغالاً'}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* تحليل الأشهر */}
      <div style={{
        background:'#fff', 
        borderRadius: isMobile ? 6 : 8, 
        boxShadow:'0 1px 6px rgba(10, 143, 130, 0.1)', 
        padding: isMobile ? '0.5rem 0.4rem' : '0.75rem',
        border: '1px solid #0A8F82'
      }}>
        <h3 style={{
          color:'#0A8F82', 
          marginBottom: isMobile ? '0.4rem' : '0.5rem', 
          textAlign:'center',
          fontSize: isMobile ? '0.55rem' : '0.65rem'
        }}>{t('appointments_by_month')}</h3>
        <div style={{
          display:'grid', 
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(100px, 1fr))', 
          gap: isMobile ? '0.4rem' : '0.5rem'
        }}>
          {Object.entries(analytics.appointmentsByMonth).map(([month, count]) => (
            <div key={month} style={{
              background:'#f5f5f5',
              padding: isMobile ? '0.4rem 0.3rem' : '0.5rem',
              borderRadius: isMobile ? 3 : 4,
              textAlign:'center',
              border: '1px solid #0A8F82'
            }}>
              <div style={{
                fontSize: isMobile ? '0.5rem' : '0.55rem', 
                fontWeight:700, 
                marginBottom:'0.25rem',
                color: '#0A8F82'
              }}>{(() => {
                const monthMap = {
                  'كانون الثاني': 'january',
                  'شباط': 'february',
                  'آذار': 'march',
                  'نيسان': 'april',
                  'أيار': 'may',
                  'حزيران': 'june',
                  'تموز': 'july',
                  'آب': 'august',
                  'أيلول': 'september',
                  'تشرين الأول': 'october',
                  'تشرين الثاني': 'november',
                  'كانون الأول': 'december'
                };
                const englishKey = monthMap[month];
                return englishKey ? t(`months.${englishKey}`) : month;
              })()}</div>
              <div style={{
                fontSize: isMobile ? '0.6rem' : '0.65rem', 
                fontWeight:700, 
                color:'#0A8F82'
              }}>{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DoctorAnalyticsPage; 