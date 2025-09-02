import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';
import DoctorCard from './DoctorCard';
import StarRating from './components/StarRating';
import './Login.css';

function TopRatedDoctors() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { t, i18n } = useTranslation();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // دالة مساعدة للتصميم المتجاوب
  const isMobile = () => window.innerWidth <= 768;
  const isRTL = i18n.language === 'ar' || i18n.language === 'ku';

  useEffect(() => {
    fetchTopRatedDoctors();
  }, []);

  const fetchTopRatedDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctors/top-rated`);
      const data = await response.json();
      
      if (response.ok) {
        setDoctors(data);
      } else {
        setError(data.error || 'حدث خطأ أثناء جلب الأطباء');
      }
    } catch (err) {
      console.error('Error fetching top rated doctors:', err);
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div style={{
      background: '#ffffff', // خلفية بيضاء كما طُلب
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* الشريط العلوي العصري */}
      <div style={{
        background: '#0A8F82', // نفس لون الـ header
        boxShadow: '0 4px 20px rgba(10, 143, 130, 0.3)',
        borderBottomLeftRadius: 18, 
        borderBottomRightRadius: 18,
        padding: isMobile() ? '0.7rem 1rem' : '0.7rem 1.2rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        position: 'relative', 
        minHeight: 64,
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* شعار مع أيقونة */}
        <div 
          onClick={() => navigate('/')}
          style={{
            display:'flex', 
            alignItems:'center', 
            gap:8, 
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
          <img src="/logo192.png" alt="Logo" style={{width: isMobile() ? 38 : 44, height: isMobile() ? 38 : 44, borderRadius: '50%', background: '#fff', border: '4px solid #fff', boxShadow: '0 4px 16px #00bcd455', objectFit: 'cover', marginRight: 4}} />
          <span style={{color:'#ffffff', fontWeight:900, fontSize: isMobile() ? 20 : 24, letterSpacing:1, marginRight:4}}>{t('app_name')}</span>
        </div>
        
        {/* عناصر الزاوية: الهامبرغر */}
        <div style={{display:'flex', alignItems:'center', gap:8, flexDirection: isRTL ? 'row-reverse' : 'row'}}>
          <button onClick={()=>setDrawerOpen(true)} style={{background:'none', border:'none', cursor:'pointer', padding:8, display:'flex', alignItems:'center'}}>
            <span style={{fontSize:28, color:'#ffffff', fontWeight:900}}>&#9776;</span>
          </button>
        </div>
      </div>

      {/* القائمة الجانبية (Drawer) */}
      {drawerOpen && (
        <div onClick={()=>setDrawerOpen(false)} style={{position:'fixed', top:0, left:isRTL ? 'unset' : 0, right:isRTL ? 0 : 'unset', width:'100vw', height:'100vh', background:'rgba(0,0,0,0.25)', zIndex:2000, display:'flex', justifyContent:isRTL ? 'flex-end' : 'flex-start'}}>
          <div onClick={e=>e.stopPropagation()} style={{width:260, height:'100%', background:'#fff', boxShadow:'0 2px 16px #00bcd422', padding:'2rem 1.2rem', display:'flex', flexDirection:'column', gap:18, direction:isRTL ? 'rtl' : 'ltr'}}>
            <button onClick={()=>setDrawerOpen(false)} style={{background:'none', border:'none', color:'#e53935', fontSize:26, fontWeight:900, alignSelf:isRTL ? 'flex-start' : 'flex-end', cursor:'pointer', marginBottom:8}}>&times;</button>
            <button onClick={() => navigate('/')} style={{background:'linear-gradient(90deg,#0A8F82 0%,#0A8F82 100%)', color:'#fff', border:'none', borderRadius:12, padding:'0.7rem 1.1rem', fontWeight:800, fontSize:15, cursor:'pointer', boxShadow:'0 2px 8px #0A8F8222', display:'flex', alignItems:'center', gap:6}}><span style={{fontSize:18}}>🏠</span>{t('back_to_home')}</button>
            <button onClick={() => navigate('/my-appointments')} style={{background:'linear-gradient(90deg,#0A8F82 0%,#0A8F82 100%)', color:'#fff', border:'none', borderRadius:12, padding:'0.7rem 1.1rem', fontWeight:800, fontSize:15, cursor:'pointer', boxShadow:'0 2px 8px #0A8F8222', display:'flex', alignItems:'center', gap:6}}><span style={{fontSize:18}}>📅</span>{t('my_appointments')}</button>
            <button onClick={()=>{navigate('/profile'); setDrawerOpen(false);}} style={{background:'rgba(10, 143, 130, 0.1)', border:'none', borderRadius:12, padding:'0.7rem 1.1rem', fontWeight:600, fontSize:15, cursor:'pointer', color:'#0A8F82', boxShadow:'0 2px 8px rgba(10, 143, 130, 0.2)', display:'flex', alignItems:'center', gap:6}}><svg width={20} height={20} fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="#0A8F82" strokeWidth="2"/><path d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4" stroke="#0A8F82" strokeWidth="2"/></svg>{t('my_profile')}</button>
            <button onClick={handleLogout} style={{background:'linear-gradient(135deg, #0A8F82 0%, #0A8F82 100%)', color:'#fff', border:'none', borderRadius:8, padding:'0.7rem 1.1rem', fontWeight:600, fontSize:15, cursor:'pointer', boxShadow:'0 2px 8px rgba(10, 143, 130, 0.3)'}}>{t('logout')}</button>
            <div style={{marginTop:12}}>
              <label style={{fontWeight:700, color:'#0A8F82', marginBottom:4, display:'block'}}>{t('change_language')}</label>
              <select value={i18n.language || 'ar'} onChange={(e) => {
                const newLang = e.target.value;
                i18n.changeLanguage(newLang);
                localStorage.setItem('selectedLanguage', newLang);
              }} style={{background:'rgba(10, 143, 130, 0.1)', color:'#0A8F82', border:'none', borderRadius:8, padding:'0.3rem 0.8rem', fontWeight:700, fontSize:15, cursor:'pointer', boxShadow:'0 2px 8px rgba(10, 143, 130, 0.2)'}}>
                <option value="ar">العربية</option>
                <option value="en">English</option>
                <option value="ku">کوردی</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* العنوان الرئيسي */}
      <div style={{
        maxWidth: 1200,
        margin: '2rem auto 0',
        padding: '0 1rem',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #0A8F82 0%, #0A8F82 100%)',
          color: '#fff',
          padding: isMobile() ? '1rem' : '1.5rem 2rem',
          borderRadius: 16,
          fontWeight: 800, 
          fontSize: isMobile() ? 20 : 28, 
          marginBottom: isMobile() ? 16 : 24,
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(10, 143, 130, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          ⭐ {t('rating.top_rated_doctors')}
        </div>
      </div>

      {/* محتوى الصفحة */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 1rem 2rem'
      }}>
        {loading ? (
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
        ) : error ? (
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
              onClick={fetchTopRatedDoctors}
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
        ) : doctors.length === 0 ? (
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{fontSize: '3rem', marginBottom: '1rem'}}>⭐</div>
            <h3 style={{color: '#0A8F82', marginBottom: '1rem'}}>{t('rating.no_ratings_yet')}</h3>
            <p style={{color: '#666', marginBottom: '1.5rem'}}>لا توجد تقييمات كافية لعرض الأطباء الأعلى تقييماً</p>
            <button 
              onClick={() => navigate('/')}
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
              {t('back_to_home')}
            </button>
          </div>
        ) : (
          <>
            {/* إحصائيات سريعة */}
            <div style={{
              background: '#fff',
              borderRadius: 12,
              padding: isMobile() ? '1rem' : '1.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e0f7fa'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{textAlign: 'center'}}>
                  <div style={{fontSize: isMobile() ? '1.5rem' : '2rem', fontWeight: '800', color: '#0A8F82'}}>
                    {doctors.length}
                  </div>
                  <div style={{fontSize: isMobile() ? '12px' : '14px', color: '#666', fontWeight: '600'}}>
                    {t('doctors')}
                  </div>
                </div>
                <div style={{textAlign: 'center'}}>
                  <div style={{fontSize: isMobile() ? '1.5rem' : '2rem', fontWeight: '800', color: '#0A8F82'}}>
                    {doctors.length > 0 ? doctors[0].averageRating?.toFixed(1) || '0.0' : '0.0'}
                  </div>
                  <div style={{fontSize: isMobile() ? '12px' : '14px', color: '#666', fontWeight: '600'}}>
                    {t('rating.average_rating')}
                  </div>
                </div>
                <div style={{textAlign: 'center'}}>
                  <div style={{fontSize: isMobile() ? '1.5rem' : '2rem', fontWeight: '800', color: '#0A8F82'}}>
                    {doctors.reduce((sum, doc) => sum + (doc.totalRatings || 0), 0)}
                  </div>
                  <div style={{fontSize: isMobile() ? '12px' : '14px', color: '#666', fontWeight: '600'}}>
                    {t('rating.total_ratings')}
                  </div>
                </div>
              </div>
            </div>

            {/* قائمة الأطباء */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: isMobile() ? '0.5rem' : '1rem',
              justifyContent: 'center'
            }}>
              {doctors.map((doctor, index) => (
                <div key={doctor._id} style={{
                  position: 'relative',
                  background: '#fff',
                  borderRadius: 12,
                  padding: isMobile() ? '0.8rem' : '1.2rem',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e0f7fa',
                  minWidth: isMobile() ? 140 : 240,
                  maxWidth: isMobile() ? 160 : 280,
                  flex: '1 1 140px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isMobile()) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile()) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                  }
                }}
                onClick={() => navigate(`/doctor/${doctor._id}`)}>
                  
                  {/* ترتيب الطبيب */}
                  <div style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    background: 'linear-gradient(135deg, #0A8F82, #0A8F82)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: isMobile() ? 24 : 32,
                    height: isMobile() ? 24 : 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile() ? 10 : 14,
                    fontWeight: 700,
                    boxShadow: '0 3px 8px rgba(10, 143, 130, 0.4)',
                    border: '2px solid #fff'
                  }}>
                    {index + 1}
                  </div>

                  {/* محتوى البطاقة */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile() ? '0.4rem' : '0.8rem',
                    marginBottom: isMobile() ? '0.4rem' : '0.8rem'
                  }}>
                    <img 
                      src={doctor.imageUrl || '/logo.png'} 
                      alt={doctor.name} 
                      style={{
                        width: isMobile() ? 32 : 60, 
                        height: isMobile() ? 32 : 60, 
                        borderRadius: '50%', 
                        objectFit: 'cover', 
                        border: '2px solid #0A8F82', 
                        boxShadow: '0 2px 8px rgba(10, 143, 130, 0.2)'
                      }} 
                    />
                    
                    <div style={{flex: 1}}>
                      <div style={{
                        fontWeight: 700, 
                        fontSize: isMobile() ? 12 : 18, 
                        color: '#2c3e50', 
                        marginBottom: isMobile() ? 2 : 3
                      }}>
                        {doctor.name}
                      </div>
                      <div style={{
                        color: '#0A8F82', 
                        fontWeight: 600, 
                        fontSize: isMobile() ? 10 : 14, 
                        marginBottom: isMobile() ? 2 : 3
                      }}>
                        {doctor.specialty}
                      </div>
                    </div>
                  </div>
                  
                  {/* التقييم */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: isMobile() ? '0.3rem' : '0.6rem',
                    background: 'rgba(10, 143, 130, 0.05)',
                    borderRadius: 6,
                    border: '1px solid rgba(10, 143, 130, 0.1)'
                  }}>
                    <StarRating 
                      rating={doctor.averageRating || 0}
                      size="small"
                      showText={false}
                    />
                    <span style={{
                      fontSize: isMobile() ? 10 : 12,
                      color: '#666',
                      fontWeight: '500'
                    }}>
                      ({doctor.totalRatings || 0})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
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

export default TopRatedDoctors;
