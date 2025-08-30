import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Login.css';

function UserBookingForOthersStats() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [topUsers, setTopUsers] = useState([]);
  const [doctorStats, setDoctorStats] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('users');
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

  // جلب إحصائيات المستخدمين
  const fetchTopUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/top-users-booking-for-others`);
      const data = await response.json();
      
      if (data.success) {
        setTopUsers(data.data.topUsers);
        setSummary(data.data.summary);
      } else {
        setError(data.error || 'حدث خطأ في جلب البيانات');
      }
    } catch (err) {
      console.error('خطأ في جلب إحصائيات المستخدمين:', err);
      setError('حدث خطأ في الاتصال بالخادم');
    }
  };

  // جلب إحصائيات الأطباء
  const fetchDoctorStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctors-booking-for-others-stats`);
      const data = await response.json();
      
      if (data.success) {
        setDoctorStats(data.data);
      } else {
        setError(data.error || 'حدث خطأ في جلب البيانات');
      }
    } catch (err) {
      console.error('خطأ في جلب إحصائيات الأطباء:', err);
      setError('حدث خطأ في الاتصال بالخادم');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchTopUsers(), fetchDoctorStats()]);
      setLoading(false);
    };
    
    fetchData();
  }, []);

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // تنسيق متوسط الحجوزات شهرياً
  const formatAverageBookings = (avg) => {
    if (!avg || isNaN(avg) || !isFinite(avg)) return 'غير محدد';
    return avg.toFixed(1);
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
            onClick={() => navigate('/admin-dashboard')}
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
            📊 {t('stats.booking_for_others')}
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
        {/* الإحصائيات العامة */}
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
            📈 {t('stats.overview')}
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
              <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>📅</div>
              <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#1976d2', marginBottom: '0.5rem'}}>
                {summary.totalBookingsForOthers || 0}
              </div>
                              <div style={{color: '#666', fontSize: '0.9rem'}}>{t('stats.total_bookings')}</div>
            </div>
            
            <div style={{
              background: '#e8f5e8',
              padding: '1rem',
              borderRadius: 12,
              textAlign: 'center',
              border: '2px solid #2e7d32'
            }}>
              <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>👥</div>
              <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#2e7d32', marginBottom: '0.5rem'}}>
                {summary.uniqueUsersBookingForOthers || 0}
              </div>
                              <div style={{color: '#666', fontSize: '0.9rem'}}>{t('stats.unique_users')}</div>
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
                {summary.totalUsers || 0}
              </div>
                              <div style={{color: '#666', fontSize: '0.9rem'}}>{t('stats.total_users')}</div>
            </div>
            
            <div style={{
              background: '#f3e5f5',
              padding: '1rem',
              borderRadius: 12,
              textAlign: 'center',
              border: '2px solid #7b1fa2'
            }}>
              <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>📊</div>
              <div style={{fontSize: '1.5rem', fontWeight: 700, color: '#7b1fa2', marginBottom: '0.5rem'}}>
                {summary.percentageOfUsers || 0}%
              </div>
                              <div style={{color: '#666', fontSize: '0.9rem'}}>{t('stats.percentage_users')}</div>
            </div>
          </div>
        </div>

        {/* تبويبات التنقل */}
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
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setActiveTab('users')}
              style={{
                background: activeTab === 'users' ? '#0A8F82' : '#f8f9fa',
                color: activeTab === 'users' ? '#fff' : '#0A8F82',
                border: activeTab === 'users' ? 'none' : '2px solid #0A8F82',
                borderRadius: 12,
                padding: '0.8rem 1.5rem',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
                             👥 {t('stats.top_users')}
            </button>
            
            <button
              onClick={() => setActiveTab('doctors')}
              style={{
                background: activeTab === 'doctors' ? '#0A8F82' : '#f8f9fa',
                color: activeTab === 'doctors' ? '#fff' : '#0A8F82',
                border: activeTab === 'doctors' ? 'none' : '2px solid #0A8F82',
                borderRadius: 12,
                padding: '0.8rem 1.5rem',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              👨‍⚕️ {t('stats.doctor_stats')}
            </button>
          </div>
        </div>

        {/* محتوى التبويبات */}
        {activeTab === 'users' && (
          <div style={{
            background: '#fff',
            borderRadius: isMobile ? 12 : 16,
            boxShadow: '0 2px 12px rgba(10, 143, 130, 0.1)',
            padding: isMobile ? '1rem 0.8rem' : '1.5rem',
            border: '2px solid #0A8F82'
          }}>
            <h3 style={{
              color: '#0A8F82',
              marginBottom: '1rem',
              textAlign: 'center',
              fontSize: isMobile ? '1.1rem' : '1.3rem'
            }}>
              🏆 {t('stats.most_bookings')}
            </h3>
            
            <div style={{
              display: 'grid',
              gap: '1rem'
            }}>
              {topUsers.map((user, index) => (
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
                        👤 {user.userName || t('stats.user_not_available')}
                      </h4>
                      <p style={{margin: '0.3rem 0', color: '#666'}}>
                                                 📞 {user.userPhone || t('stats.phone_not_available')}
                      </p>
                      <p style={{margin: '0.3rem 0', color: '#666'}}>
                                                 📅 {t('stats.first_booking')}: {formatDate(user.firstBookingDate)}
                      </p>
                      <p style={{margin: '0.3rem 0', color: '#666'}}>
                                                 📅 {t('stats.last_booking')}: {formatDate(user.lastBookingDate)}
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
                         <div style={{fontSize: '0.9rem'}}>{t('stats.bookings_for_others')}</div>
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
                                                 <div style={{fontSize: '0.8rem', color: '#2e7d32'}}>{t('stats.different_patients')}</div>
                      </div>
                      
                      <div style={{
                        background: '#fff3e0',
                        padding: '0.5rem 1rem',
                        borderRadius: 8,
                        textAlign: 'center'
                      }}>
                        <div style={{fontSize: '1.2rem', fontWeight: 700, color: '#ef6c00'}}>
                          {formatAverageBookings(user.averageBookingsPerMonth)}
                        </div>
                                                 <div style={{fontSize: '0.8rem', color: '#ef6c00'}}>{t('stats.bookings_per_month')}</div>
                      </div>
                    </div>
                    
                    <div>
                                             <h5 style={{
                         color: '#0A8F82',
                         margin: '0 0 0.5rem 0',
                         fontSize: '1rem'
                       }}>
                         👥 {t('stats.patients')}:
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
                            +{user.patientNames.length - 3} أكثر
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div style={{
            background: '#fff',
            borderRadius: isMobile ? 12 : 16,
            boxShadow: '0 2px 12px rgba(10, 143, 130, 0.1)',
            padding: isMobile ? '1rem 0.8rem' : '1.5rem',
            border: '2px solid #0A8F82'
          }}>
            <h3 style={{
              color: '#0A8F82',
              marginBottom: '1rem',
              textAlign: 'center',
              fontSize: isMobile ? '1.1rem' : '1.3rem'
            }}>
              👨‍⚕️ {t('stats.doctor_booking_stats')}
            </h3>
            
            <div style={{
              display: 'grid',
              gap: '1rem'
            }}>
              {doctorStats.map((doctor, index) => (
                <div key={doctor.doctorId} style={{
                  background: index < 3 ? '#fff3cd' : '#f8f9fa',
                  padding: '1rem',
                  borderRadius: 12,
                  border: index < 3 ? '2px solid #ffc107' : '2px solid #0A8F82',
                  position: 'relative'
                }}>
                  {/* ترتيب الطبيب */}
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
                        👨‍⚕️ {doctor.doctorName || 'طبيب غير محدد'}
                      </h4>
                      <p style={{margin: '0.3rem 0', color: '#666'}}>
                        🏥 {doctor.specialty || 'تخصص غير محدد'}
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
                          {doctor.totalBookingsForOthers}
                        </div>
                        <div style={{fontSize: '0.9rem'}}>حجز لشخص آخر</div>
                      </div>
                      
                      <div style={{
                        background: '#e8f5e8',
                        padding: '0.5rem 1rem',
                        borderRadius: 8,
                        textAlign: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{fontSize: '1.2rem', fontWeight: 700, color: '#2e7d32'}}>
                          {doctor.uniqueBookersCount}
                        </div>
                        <div style={{fontSize: '0.8rem', color: '#2e7d32'}}>مستخدم مختلف</div>
                      </div>
                      
                      <div style={{
                        background: '#fff3e0',
                        padding: '0.5rem 1rem',
                        borderRadius: 8,
                        textAlign: 'center'
                      }}>
                        <div style={{fontSize: '1.2rem', fontWeight: 700, color: '#ef6c00'}}>
                          {doctor.uniquePatientsCount}
                        </div>
                        <div style={{fontSize: '0.8rem', color: '#ef6c00'}}>مريض مختلف</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserBookingForOthersStats;
