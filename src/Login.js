import React, { useState, useEffect, useCallback } from 'react';
import './Login.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import { normalizePhone } from './utils/phoneUtils';

function Login() {
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [welcome, setWelcome] = useState(false);
  const [showSignupChoice, setShowSignupChoice] = useState(false);
  const [loginType, setLoginType] = useState('user');
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirect = params.get('redirect');
  const { signIn } = useAuth();
  const { t } = useTranslation();
  const [lang, setLang] = useState(i18n.language || 'ku');
  const [showContactModal, setShowContactModal] = useState(false);

  // مسح الكاش عند تحميل الصفحة
  useEffect(() => {
    // إجبار المتصفح على تحميل الملفات الجديدة
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
  }, []);

  const handleLangChange = useCallback((e) => {
    const newLang = e.target.value;
    setLang(newLang);
    i18n.changeLanguage(newLang);
  }, []);

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  const handlePasswordChange = useCallback((e) => {
    setPassword(e.target.value);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!input || !password) {
      setError(t('login.error_required'));
      return;
    }
    
    try {
      const normalizedInput = !input.includes('@') ? normalizePhone(input) : input;
      const { data, error } = await signIn(normalizedInput, password, loginType);

      if (error) throw new Error(error);
      
      setWelcome(true);
      
      const params = new URLSearchParams(location.search);
      const redirect = params.get('redirect');
      
      if (redirect) {
        navigate(redirect, { replace: true });
      } else if (loginType === 'doctor') {
        // توجيه الدكتور لصفحة اختيار نوع المستخدم
        navigate('/user-type-selector');
      } else {
        navigate('/home');
      }
    } catch (err) {
      if (err.message && err.message.includes(t('registered_as_doctor'))) {
        setError(t('doctor_account_login_error'));
      } else {
        setError(err.message);
      }
    }
  };

  const isMobile = window.innerWidth < 768;

  return (
    <div className="login-container" style={{
      background: `linear-gradient(135deg, rgba(0, 188, 212, 0.4) 0%, rgba(0, 150, 136, 0.4) 100%), url('/images/login-hero.jpg?v=${Date.now()}') center center/cover no-repeat`,
      minHeight: isMobile ? '120vh' : '130vh',
      position: 'relative',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      paddingTop: isMobile ? '2rem' : '4rem',
      paddingBottom: isMobile ? '2rem' : '2rem',
    }}>
      {/* زر العودة للصفحة الرئيسية */}
      <button 
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: isMobile ? '0.5rem' : '1rem',
          right: isMobile ? '0.5rem' : '1rem',
          background: 'rgba(255, 255, 255, 0.2)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          color: 'white',
          padding: isMobile ? '0.3rem 0.7rem' : '0.5rem 1rem',
          borderRadius: '20px',
          cursor: 'pointer',
          fontSize: isMobile ? '0.8rem' : '0.9rem',
          fontWeight: '500',
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.3)';
          e.target.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.2)';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        🏠 {t('back_to_home')}
      </button>

      {/* رسالة إذا كان هناك redirect */}
      {redirect && (
        <div style={{
          background:'#fff3e0',
          color:'#e65100',
          borderRadius:12,
          padding: isMobile ? '0.8rem 1rem' : '1rem 1.2rem',
          fontWeight:700,
          fontSize: isMobile ? 14 : 17,
          margin: isMobile ? '0.8rem auto 1rem auto' : '1.2rem auto 1.5rem auto',
          maxWidth: isMobile ? 320 : 400,
          textAlign:'center',
          boxShadow:'0 2px 12px #ff980022',
        }}>
          {t('login_required')}
        </div>
      )}
      
      {/* زر تغيير اللغة */}
      <div style={{position: 'relative', width: '100%'}}>
        <select 
          value={lang} 
          onChange={handleLangChange} 
          className="corner-language-select"
          key={lang}
          style={{
            position: 'absolute',
            top: isMobile ? '0.5rem' : '1rem',
            left: isMobile ? '0.5rem' : '1rem',
            zIndex: 1000,
            background: 'rgba(0, 188, 212, 0.1)',
            color: '#009688',
            border: 'none',
            borderRadius: '8px',
            padding: isMobile ? '0.25rem 0.6rem' : '0.3rem 0.8rem',
            fontWeight: 700,
            fontSize: isMobile ? '0.8rem' : '15px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 188, 212, 0.2)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s',
            border: '1px solid rgba(0, 150, 136, 0.2)',
          }}
        >
          <option value="ar">عربي</option>
          <option value="ku">کوردی</option>
          <option value="en">English</option>
        </select>
      </div>
      
      {/* خلفية إضافية للعمق */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(0, 188, 212, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0, 150, 136, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      
      <div style={{position:'relative', zIndex:1, width:'100%', marginTop: isMobile ? '2rem' : '1rem'}}>
        {/* Logo Section - أصغر للموبايل */}
        <div style={{textAlign:'center', marginBottom: isMobile ? '2.5rem' : '2.2rem', padding:'0 1.2rem'}}>
          <div 
            onClick={() => navigate('/')}
            style={{
              cursor: 'pointer',
              display: 'inline-block',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <img 
              src="/logo192.png" 
              alt="Logo" 
              style={{
                width: isMobile ? 50 : 90, 
                height: isMobile ? 50 : 90, 
                borderRadius: '50%', 
                background: '#fff', 
                border: isMobile ? '3px solid #fff' : '5px solid #fff', 
                boxShadow: '0 4px 18px #00968855, 0 1.5px 8px #00bcd433', 
                marginBottom: isMobile ? 6 : 12, 
                marginTop: isMobile ? 6 : 0, 
                objectFit: 'cover'
              }} 
            />
            <div style={{
              fontWeight:900, 
              fontSize: isMobile ? '1.5rem' : '2rem', 
              color:'#fff', 
              letterSpacing:0.5, 
              marginBottom: isMobile ? 4 : 7, 
              textShadow:'0 2px 8px #00968855'
            }}>
              {t('platform_name')}
            </div>
            <div style={{
              color:'#fff', 
              fontSize: isMobile ? '0.9rem' : '1.15rem', 
              fontWeight:600, 
              textShadow:'0 1px 6px #7c4dff55'
            }}>
              {t('platform_desc')}
            </div>
          </div>
        </div>

        {/* Login Form - أصغر للموبايل */}
        <form className="login-box" onSubmit={handleSubmit} style={{
          background: '#fff',
          padding: isMobile ? '2rem 1.5rem' : '2.7rem 2.2rem',
          borderRadius: '20px',
          boxShadow: '0 8px 40px 0 rgba(0, 188, 212, 0.18), 0 1.5px 8px 0 rgba(0,0,0,0.10)',
          minWidth: isMobile ? 300 : 340,
          maxWidth: isMobile ? '85vw' : '95vw',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '1.2rem' : '1.5rem',
          alignItems: 'center',
          border: '1.5px solid #e0e0e0',
          animation: 'fadeIn 0.8s cubic-bezier(.39,.575,.56,1.000)',
          textAlign: 'center',
          margin: isMobile ? '0 auto' : '0 auto',
        }}>
          <h2 style={{
            margin: '0 0 0.5rem 0',
            color: '#009688',
            textAlign: 'center',
            fontSize: isMobile ? '1.6rem' : '2.1rem',
            letterSpacing: '1px',
            fontWeight: '700'
          }}>
            {t('login_title')}
          </h2>

          {/* اختيار نوع الحساب - أصغر للموبايل */}
          <div style={{
            display:'flex', 
            gap: isMobile ? 8 : 12, 
            marginBottom: isMobile ? 12 : 18, 
            justifyContent:'center', 
            flexWrap:'wrap'
          }}>
            <div
              onClick={()=>setLoginType('user')}
              style={{
                cursor:'pointer',
                background: loginType==='user' ? 'linear-gradient(90deg,#7c4dff 0%,#00bcd4 100%)' : '#f3f6fa',
                color: loginType==='user' ? '#fff' : '#7c4dff',
                border: loginType==='user' ? '2.5px solid #00bcd4' : '2px solid #e0e0e0',
                borderRadius: 14,
                padding: isMobile ? '0.7rem 1.2rem' : '1rem 1.8rem',
                fontWeight: 800,
                fontSize: isMobile ? 14 : 16,
                boxShadow: loginType==='user' ? '0 2px 12px #00bcd422' : 'none',
                display:'flex', 
                alignItems:'center', 
                gap: isMobile ? 6 : 10,
                transition:'all 0.2s'
              }}
            >
              {t('user')}
              {loginType==='user' && <span style={{marginRight:8, fontSize: isMobile ? 16 : 18}}>✓</span>}
            </div>
            <div
              onClick={()=>setLoginType('doctor')}
              style={{
                cursor:'pointer',
                background: loginType==='doctor' ? 'linear-gradient(90deg,#00bcd4 0%,#7c4dff 100%)' : '#f3f6fa',
                color: loginType==='doctor' ? '#fff' : '#00bcd4',
                border: loginType==='doctor' ? '2.5px solid #7c4dff' : '2px solid #e0e0e0',
                borderRadius: 14,
                padding: isMobile ? '0.7rem 1.2rem' : '1rem 1.8rem',
                fontWeight: 800,
                fontSize: isMobile ? 14 : 16,
                boxShadow: loginType==='doctor' ? '0 2px 12px #7c4dff22' : 'none',
                display:'flex', 
                alignItems:'center', 
                gap: isMobile ? 6 : 10,
                transition:'all 0.2s'
              }}
            >
              {t('doctor')}
              {loginType==='doctor' && <span style={{marginRight:8, fontSize: isMobile ? 16 : 18}}>✓</span>}
            </div>
          </div>

          {/* Input Fields - أصغر للموبايل */}
          <input
            type="text"
            placeholder={t('phone_or_email_placeholder')}
            value={input}
            onChange={handleInputChange}
            autoComplete="username"
            inputMode="text"
            autoFocus={false}
            onFocus={(e) => {
              e.target.style.borderColor = '#00bcd4';
              e.target.style.boxShadow = '0 0 0 2px #00bcd433';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#b2dfdb';
              e.target.style.boxShadow = '0 1.5px 6px 0 rgba(0, 188, 212, 0.04)';
            }}
            style={{
              padding: isMobile ? '0.7rem 0.9rem' : '1rem 1.1rem',
              border: '1.5px solid #b2dfdb',
              borderRadius: '12px',
              fontSize: isMobile ? '0.9rem' : '1.08rem',
              outline: 'none',
              background: '#f8fafd',
              transition: 'border 0.2s, box-shadow 0.2s',
              boxShadow: '0 1.5px 6px 0 rgba(0, 188, 212, 0.04)',
              color: '#222',
              width: '100%',
              WebkitAppearance: 'none',
              WebkitBorderRadius: '12px'
            }}
          />
          
          <input
            type="password"
            placeholder={t('password')}
            value={password}
            onChange={handlePasswordChange}
            autoComplete="current-password"
            inputMode="text"
            autoFocus={false}
            onFocus={(e) => {
              e.target.style.borderColor = '#00bcd4';
              e.target.style.boxShadow = '0 0 0 2px #00bcd433';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#b2dfdb';
              e.target.style.boxShadow = '0 1.5px 6px 0 rgba(0, 188, 212, 0.04)';
            }}
            style={{
              padding: isMobile ? '0.7rem 0.9rem' : '1rem 1.1rem',
              border: '1.5px solid #b2dfdb',
              borderRadius: '12px',
              fontSize: isMobile ? '0.9rem' : '1.08rem',
              outline: 'none',
              background: '#f8fafd',
              transition: 'border 0.2s, box-shadow 0.2s',
              boxShadow: '0 1.5px 6px 0 rgba(0, 188, 212, 0.04)',
              color: '#222',
              width: '100%',
              WebkitAppearance: 'none',
              WebkitBorderRadius: '12px'
            }}
          />
          
          {error && (
            <div style={{
              color: '#e53935',
              background: '#fff3f3',
              borderRadius: '8px',
              padding: isMobile ? '0.5rem 0.8rem' : '0.7rem 1rem',
              fontSize: isMobile ? '0.9rem' : '1.05rem',
              textAlign: 'center',
              border: '1px solid #ffd6d6',
              boxShadow: '0 1px 4px 0 #ffd6d633',
              width: '100%'
            }}>
              {error}
            </div>
          )}
          
          <button type="submit" style={{
            fontSize: isMobile ? 14 : 18,
            padding: isMobile ? '0.8rem 1.5rem' : '1rem 2.2rem',
            borderRadius: 12,
            fontWeight: 800,
            background: 'linear-gradient(90deg,#00bcd4 0%,#009688 100%)',
            color: '#fff',
            border: 'none',
            marginTop: 8,
            boxShadow: '0 2px 8px #00bcd422',
            width: '100%',
            maxWidth: isMobile ? 280 : 340,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            transition: 'all 0.2s',
            cursor: 'pointer',
            gap: '0.6rem'
          }}>
            <svg width={isMobile ? 18 : 22} height={isMobile ? 18 : 22} fill="none" viewBox="0 0 24 24" style={{marginLeft: 6}} xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4v16m8-8H4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {t('login_button')}
          </button>
        </form>

        {/* زر إنشاء حساب جديد - في مكان واضح */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: isMobile ? '1rem' : '1.5rem',
          padding: '0 1rem'
        }}>
          <button
            type="button"
            onClick={() => setShowSignupChoice(true)}
            style={{
              width: '100%',
              maxWidth: isMobile ? 280 : 340,
              background: 'linear-gradient(90deg,#fff 0%,#e0f7fa 100%)',
              color: '#00796b',
              border: '2px solid #00bcd4',
              borderRadius: 14,
              padding: isMobile ? '0.8rem 1.2rem' : '1rem 1.5rem',
              fontWeight: 900,
              fontSize: isMobile ? 14 : 16,
              cursor: 'pointer',
              boxShadow: '0 2px 12px #00bcd422',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              letterSpacing: 0.2,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 16px #00bcd433';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 12px #00bcd422';
            }}
          >
            ✨ {t('create_account')}
          </button>
        </div>

        {/* زر تواصل معنا - أصغر للموبايل */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: isMobile ? '0.8rem' : '1rem',
          padding: '0 1rem'
        }}>
          <button
            type="button"
            onClick={() => setShowContactModal(true)}
            style={{
              width: '100%',
              maxWidth: isMobile ? 280 : 340,
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 14,
              padding: isMobile ? '0.6rem 1rem' : '0.7rem 1.5rem',
              fontWeight: 700,
              fontSize: isMobile ? 13 : 16,
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              letterSpacing: 0.2,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            📞 تواصل معنا
          </button>
        </div>

        {/* Modal اختيار نوع الحساب */}
        {showSignupChoice && (
          <div style={{
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh',
            background: 'rgba(0,0,0,0.18)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 1000
          }}>
            <div style={{
              background: '#fff', 
              borderRadius: 16, 
              boxShadow: '0 4px 24px #00968833', 
              padding: isMobile ? '1.5rem 1.2rem' : '2.2rem 1.5rem', 
              minWidth: isMobile ? 240 : 260, 
              textAlign: 'center'
            }}>
              <h3 style={{
                marginBottom: isMobile ? 14 : 18, 
                color:'#7c4dff', 
                fontWeight:800,
                fontSize: isMobile ? '1.2rem' : '1.4rem'
              }}>
                {t('choose_account_type')}
              </h3>
              <div style={{
                display:'flex', 
                gap: isMobile ? 12 : 18, 
                justifyContent:'center', 
                marginBottom: isMobile ? 14 : 18,
                flexDirection: isMobile ? 'column' : 'row'
              }}>
                <button
                  style={{
                    background:'#7c4dff', 
                    color:'#fff', 
                    border:'none', 
                    borderRadius:12, 
                    padding: isMobile ? '0.8rem 1.5rem' : '0.9rem 2.2rem', 
                    fontWeight:700, 
                    fontSize: isMobile ? 15 : 17, 
                    cursor:'pointer',
                    width: isMobile ? '100%' : 'auto'
                  }}
                  onClick={()=>{ setShowSignupChoice(false); navigate(`/signup${redirect ? `?redirect=${redirect}` : ''}`); }}
                >
                  {t('user')}
                </button>
                <button
                  style={{
                    background:'#00bcd4', 
                    color:'#fff', 
                    border:'none', 
                    borderRadius:12, 
                    padding: isMobile ? '0.8rem 1.5rem' : '0.9rem 2.2rem', 
                    fontWeight:700, 
                    fontSize: isMobile ? 15 : 17, 
                    cursor:'pointer',
                    width: isMobile ? '100%' : 'auto'
                  }}
                  onClick={()=>{ setShowSignupChoice(false); navigate('/signup-doctor'); }}
                >
                  {t('doctor')}
                </button>
              </div>
              <button 
                style={{
                  background:'none', 
                  border:'none', 
                  color:'#888', 
                  cursor:'pointer', 
                  fontSize: isMobile ? 13 : 15
                }} 
                onClick={()=>setShowSignupChoice(false)}
              >
                {t('close')}
              </button>
            </div>
          </div>
        )}

        {/* شاشة منبثقة لمعلومات التواصل */}
        {showContactModal && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.18)',
            zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 18,
              boxShadow: '0 4px 24px #00968833',
              padding: isMobile ? '1.2rem 1.1rem' : '2.2rem 2.5rem',
              minWidth: isMobile ? 200 : 220,
              maxWidth: '90vw',
              textAlign: 'center',
              color: '#00796b',
              fontWeight: 800,
              fontSize: isMobile ? 14 : 18
            }}>
              <div style={{
                marginBottom: 12, 
                fontSize: isMobile ? 16 : 20, 
                fontWeight: 900
              }}>
                معلومات التواصل
              </div>
              <div style={{marginBottom: 10}}>
                <span style={{fontWeight:700}}>الإيميل:</span> 
                <span style={{direction:'ltr'}}>Tabibiqapp@gmail.com</span>
              </div>
              <div style={{marginBottom: 18}}>
                <span style={{fontWeight:700}}>واتساب:</span> 
                <a
                  href="https://wa.me/9647769012619"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    direction:'ltr',
                    color:'#25d366',
                    textDecoration:'underline',
                    fontWeight:900,
                    cursor:'pointer'
                  }}
                  onMouseOver={e => e.target.style.textDecoration = 'underline'}
                  onMouseOut={e => e.target.style.textDecoration = 'underline'}
                >
                  +9647769012619
                </a>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                style={{
                  background:'#00bcd4', 
                  color:'#fff', 
                  border:'none', 
                  borderRadius:10,
                  padding: isMobile ? '0.5rem 1.2rem' : '0.7rem 2.2rem',
                  fontWeight:800, 
                  fontSize: isMobile ? 13 : 16, 
                  cursor:'pointer',
                  marginTop: 6
                }}
              >
                إغلاق
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(Login);