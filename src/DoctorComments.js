import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';
import StarRating from './components/StarRating';
import './Login.css';

function DoctorComments() {
  const { user, profile } = useAuth();
  const { t, i18n } = useTranslation();
  const [ratings, setRatings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('comments');

  // دالة مساعدة للتصميم المتجاوب
  const isMobile = () => window.innerWidth <= 768;
  const isRTL = i18n.language === 'ar' || i18n.language === 'ku';

  useEffect(() => {
    if (user?._id) {
      Promise.all([fetchPrivateRatings(), fetchNotifications()])
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user?._id]);

  const fetchPrivateRatings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ratings/doctor/${user._id}/private`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setRatings(data.ratings || []);
      } else {
        setError(data.error || 'حدث خطأ أثناء جلب التعليقات');
      }
    } catch (err) {
      console.error('Error fetching private ratings:', err);
      setError('حدث خطأ في الاتصال بالخادم');
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/notifications/doctor/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.REACT_APP_API_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // تحديث قائمة الإشعارات
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #0A8F82',
          borderTop: '4px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <span style={{color: '#0A8F82', fontWeight: '600'}}>{t('loading')}...</span>
      </div>
    );
  }

  return (
    <div style={{
      background: '#ffffff',
      minHeight: '100vh',
      padding: '1rem'
    }}>
      {/* العنوان الرئيسي */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto 2rem',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #0A8F82 0%, #0A8F82 100%)',
          color: '#fff',
          padding: isMobile() ? '1rem' : '1.5rem 2rem',
          borderRadius: 16,
          fontWeight: 800, 
          fontSize: isMobile() ? 20 : 28, 
          boxShadow: '0 4px 16px rgba(10, 143, 130, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          💬 {t('rating.private_comments')}
        </div>
      </div>

      {/* التبويبات */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto 2rem',
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => setActiveTab('comments')}
          style={{
            background: activeTab === 'comments' ? '#0A8F82' : 'rgba(10, 143, 130, 0.1)',
            color: activeTab === 'comments' ? '#fff' : '#0A8F82',
            border: 'none',
            borderRadius: '12px',
            padding: '0.8rem 1.5rem',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'all 0.3s ease'
          }}
        >
          💬 {t('rating.comments')}
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          style={{
            background: activeTab === 'notifications' ? '#0A8F82' : 'rgba(10, 143, 130, 0.1)',
            color: activeTab === 'notifications' ? '#fff' : '#0A8F82',
            border: 'none',
            borderRadius: '12px',
            padding: '0.8rem 1.5rem',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'all 0.3s ease'
          }}
        >
          🔔 {t('notifications')}
          {notifications.filter(n => !n.isRead).length > 0 && (
            <span style={{
              background: '#ff4444',
              color: '#fff',
              borderRadius: '50%',
              padding: '2px 6px',
              fontSize: '12px',
              marginLeft: '0.5rem'
            }}>
              {notifications.filter(n => !n.isRead).length}
            </span>
          )}
        </button>
      </div>

      {/* محتوى التبويبات */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto'
      }}>
        {activeTab === 'comments' && (
          <div>
            {error ? (
              <div style={{
                background: '#fff',
                borderRadius: 12,
                padding: '2rem',
                textAlign: 'center',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                border: '1px solid #ffebee'
              }}>
                <div style={{fontSize: '3rem', marginBottom: '1rem'}}>⚠️</div>
                <h3 style={{color: '#e53935', marginBottom: '1rem'}}>{error}</h3>
                <button 
                  onClick={fetchPrivateRatings}
                  style={{
                    background: '#0A8F82',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.7rem 1.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {t('try_again')}
                </button>
              </div>
            ) : ratings.length === 0 ? (
              <div style={{
                background: '#fff',
                borderRadius: 12,
                padding: '2rem',
                textAlign: 'center',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{fontSize: '3rem', marginBottom: '1rem'}}>💬</div>
                <h3 style={{color: '#0A8F82', marginBottom: '1rem'}}>{t('rating.no_comments_yet')}</h3>
                <p style={{color: '#666'}}>{t('rating.no_comments_message')}</p>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {ratings.map((rating) => (
                  <div key={rating._id} style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: '1.5rem',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e0f7fa'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8rem'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: '#0A8F82',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: '700',
                          fontSize: '16px'
                        }}>
                          {rating.userId?.first_name?.charAt(0) || 'م'}
                        </div>
                        <div>
                          <div style={{
                            fontWeight: '600',
                            color: '#0A8F82',
                            fontSize: '16px'
                          }}>
                            {rating.userId?.first_name || 'مستخدم'}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#666'
                          }}>
                            {new Date(rating.createdAt).toLocaleDateString('ar-EG')}
                          </div>
                        </div>
                      </div>
                      <StarRating 
                        rating={rating.rating}
                        size="medium"
                        showText={false}
                      />
                    </div>
                    
                    {rating.comment && (
                      <div style={{
                        background: 'rgba(10, 143, 130, 0.05)',
                        borderRadius: '8px',
                        padding: '1rem',
                        border: '1px solid rgba(10, 143, 130, 0.1)',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        color: '#333'
                      }}>
                        "{rating.comment}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            {notifications.length === 0 ? (
              <div style={{
                background: '#fff',
                borderRadius: 12,
                padding: '2rem',
                textAlign: 'center',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🔔</div>
                <h3 style={{color: '#0A8F82', marginBottom: '1rem'}}>{t('no_notifications')}</h3>
                <p style={{color: '#666'}}>{t('no_notifications_message')}</p>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {notifications.map((notification) => (
                  <div 
                    key={notification._id} 
                    onClick={() => !notification.isRead && markNotificationAsRead(notification._id)}
                    style={{
                      background: notification.isRead ? '#fff' : 'rgba(10, 143, 130, 0.05)',
                      borderRadius: 12,
                      padding: '1.5rem',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                      border: `1px solid ${notification.isRead ? '#e0f7fa' : '#0A8F82'}`,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{
                        fontWeight: '600',
                        color: '#0A8F82',
                        fontSize: '16px'
                      }}>
                        {notification.type === 'rating_comment' ? '💬 تعليق جديد' : '🔔 إشعار'}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#666'
                      }}>
                        {new Date(notification.createdAt).toLocaleDateString('ar-EG')}
                      </div>
                    </div>
                    
                    <div style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#333'
                    }}>
                      {notification.message}
                    </div>
                    
                    {!notification.isRead && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#ff4444',
                        marginTop: '0.5rem'
                      }}></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default DoctorComments;
