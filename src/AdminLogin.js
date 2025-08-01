import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';

function AdminLogin() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    console.log('🔍 محاولة تسجيل دخول الأدمن:', { email, password });

    try {
      // ربط مع الخادم الحقيقي
      const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          loginType: 'admin'
        }),
      });

      console.log('📡 استجابة الخادم:', response.status);

      const data = await response.json();
      console.log('📊 بيانات الاستجابة:', data);

      if (response.ok) {
        // تسجيل دخول ناجح
        const adminUser = { 
          email, 
          user_type: 'admin', 
          name: 'مدير النظام',
          ...data.user 
        };
        
        console.log('✅ تسجيل دخول ناجح:', adminUser);
        
        localStorage.setItem('user', JSON.stringify(adminUser));
        setUser(adminUser);
        
        // إطلاق حدث لتحديث حالة المصادقة
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new Event('storage'));
        }
        
        console.log('🚀 الانتقال للوحة التحكم...');
        navigate('/admin');
      } else {
        // خطأ في تسجيل الدخول
        console.error('❌ خطأ في تسجيل الدخول:', data.error);
        setError(data.error || 'بيانات الدخول غير صحيحة');
      }
    } catch (error) {
      console.error('❌ خطأ في الاتصال بالخادم:', error);
              setError(t('error_server_connection'));
    }
  };

  return (
    <div style={{
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative'
    }}>
      {/* زر العودة */}
      <div style={{position:'absolute', top:'2rem', left:'2rem'}}>
        <button 
          onClick={() => navigate('/')} 
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.3)',
            padding: '0.75rem 1.5rem',
            borderRadius: 12,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 16,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.3)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.2)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ← العودة للصفحة الرئيسية
        </button>
      </div>

      {/* نموذج تسجيل الدخول */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        borderRadius: 20,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        padding: '3rem 2.5rem',
        minWidth: 380,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        {/* العنوان */}
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <div style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            🏥 لوحة الإدارة
          </div>
          <div style={{
            color: '#666',
            fontSize: '1.1rem',
            fontWeight: 500
          }}>
            تسجيل دخول مدير النظام
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* حقل البريد الإلكتروني */}
          <div style={{marginBottom: '1.5rem'}}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: 600,
              fontSize: '0.95rem'
            }}>
              البريد الإلكتروني
            </label>
            <input 
              type="email" 
              placeholder="أدخل بريدك الإلكتروني" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 1.2rem',
                borderRadius: 12,
                border: '2px solid #e0e0e0',
                fontSize: 16,
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* حقل كلمة المرور */}
          <div style={{marginBottom: '2rem'}}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: 600,
              fontSize: '0.95rem'
            }}>
              كلمة المرور
            </label>
            <input 
              type="password" 
              placeholder="أدخل كلمة المرور" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 1.2rem',
                borderRadius: 12,
                border: '2px solid #e0e0e0',
                fontSize: 16,
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* رسالة الخطأ */}
          {error && (
            <div style={{
              background: '#ffebee',
              color: '#c62828',
              padding: '1rem',
              borderRadius: 8,
              marginBottom: '1.5rem',
              border: '1px solid #ffcdd2',
              textAlign: 'center',
              fontWeight: 500
            }}>
              {error}
            </div>
          )}

          {/* زر تسجيل الدخول */}
          <button 
            type="submit" 
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '1.2rem',
              fontWeight: 700,
              fontSize: 18,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
            }}
          >
            🔐 تسجيل الدخول
          </button>
        </form>

        {/* معلومات إضافية */}
        {/* تم حذف قسم بيانات الدخول الافتراضية نهائيًا */}
      </div>
    </div>
  );
}

export default AdminLogin; 