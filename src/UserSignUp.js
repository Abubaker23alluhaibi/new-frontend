import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';
import { normalizePhone } from './utils/phoneUtils';
import { useAuth } from './AuthContext';

function UserSignUp() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirect = params.get('redirect');
  const { signIn } = useAuth();

  useEffect(() => {
    if (success) {
      // عرض رسالة النجاح لمدة ثانيتين قبل التوجيه
      setTimeout(() => {
        // التحقق من وجود رابط redirect
        if (redirect) {
          console.log('🔄 UserSignUp: إعادة توجيه للرابط المحفوظ:', redirect);
          navigate(redirect, { replace: true });
        } else {
          console.log('🏠 UserSignUp: إعادة توجيه للصفحة الرئيسية للمستخدم');
          navigate('/home', { replace: true });
        }
      }, 2000);
    }
  }, [success, navigate, redirect]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!form.name || !form.email || !form.phone || !form.password || !form.confirm) {
      setError('يرجى ملء جميع الحقول');
      setLoading(false);
      return;
    }
    if (form.password !== form.confirm) {
      setError('كلمتا المرور غير متطابقتين');
      setLoading(false);
      return;
    }
    try {
      // توحيد رقم الهاتف قبل الإرسال
      const normalizedPhone = normalizePhone(form.phone);
      
      const res = await fetch(process.env.REACT_APP_API_URL + '/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          first_name: form.name,
          phone: normalizedPhone
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        console.log('✅ UserSignUp: تم التسجيل بنجاح، بدء تسجيل الدخول التلقائي...');
        
        // تسجيل الدخول التلقائي بعد التسجيل الناجح
        try {
          await signIn(form.email, form.password, 'user');
          console.log('✅ UserSignUp: تم تسجيل الدخول التلقائي بنجاح');
          setSuccessMessage(redirect ? 'تم التسجيل بنجاح! سيتم توجيهك لصفحة الطبيب...' : 'تم التسجيل بنجاح! سيتم توجيهك للصفحة الرئيسية...');
          setSuccess(true);
        } catch (loginErr) {
          console.error('❌ UserSignUp: خطأ في تسجيل الدخول التلقائي:', loginErr);
          // حتى لو فشل تسجيل الدخول التلقائي، نعرض رسالة نجاح
          setSuccessMessage(redirect ? 'تم التسجيل بنجاح! سيتم توجيهك لصفحة الطبيب...' : 'تم التسجيل بنجاح! سيتم توجيهك للصفحة الرئيسية...');
          setSuccess(true);
        }
      } else {
        // معالجة أخطاء التسجيل
        if (data.error) {
          setError(data.error);
        } else if (data.message) {
          setError(data.message);
        } else {
          setError('حدث خطأ أثناء التسجيل');
        }
      }
          } catch (err) {
        console.error('❌ UserSignUp: خطأ في التسجيل:', err);
        setError(err.message || 'حدث خطأ أثناء التسجيل');
      } finally {
        setLoading(false);
      }
  };

  return (
    <div style={{
      background: `linear-gradient(135deg, rgba(0, 188, 212, 0.9) 0%, rgba(0, 150, 136, 0.9) 100%), url('/images/doctor-capsule.jpg') center center/cover no-repeat`,
      minHeight: '100vh',
      position: 'relative',
    }}>
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
      <div style={{position:'relative', zIndex:1}}>
        {/* زر العودة للصفحة الرئيسية */}
        <button 
          onClick={() => navigate('/')}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            backdropFilter: 'blur(10px)',
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
          ← العودة للرئيسية
        </button>
        
        <form className="login-box" onSubmit={handleSubmit}>
          <h2>تسجيل مستخدم جديد</h2>
          {redirect && (
            <div style={{
              background: '#e3f2fd',
              border: '1px solid #2196f3',
              borderRadius: 8,
              padding: '0.8rem',
              marginBottom: '1rem',
              fontSize: '0.9rem',
              color: '#1976d2',
              textAlign: 'center'
            }}>
              <div style={{fontWeight: 700, marginBottom: 4}}>💡 ملاحظة:</div>
              <div>بعد التسجيل سيتم توجيهك تلقائياً لصفحة الطبيب</div>
            </div>
          )}
          <input
            type="text"
            name="name"
            placeholder="الاسم الكامل"
            value={form.name}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="البريد الإلكتروني"
            value={form.email}
            onChange={handleChange}
          />
          <div style={{display:'flex', alignItems:'center', width:'100%', maxWidth:'100%'}}>
            <span style={{background:'#e0f7fa', color:'#009688', borderRadius:'10px 0 0 10px', padding:'0.9rem 0.9rem', fontWeight:700, fontSize:'1.08rem', border:'1.5px solid #b2dfdb', borderRight:'none'}}>+964</span>
            <input
              type="text"
              name="phone"
              placeholder="رقم الهاتف (بدون الصفر)"
              value={form.phone}
              onChange={handleChange}
              style={{borderRadius:'0 12px 12px 0', borderLeft:'none', flex:1, minWidth:0}}
            />
          </div>
          {/* ملاحظة مهمة حول رقم الواتساب */}
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: 8,
            padding: '0.8rem',
            marginBottom: '1rem',
            fontSize: '0.9rem',
            color: '#856404',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span style={{fontSize: '1.2rem'}}>📱</span>
            <div>
              <div style={{fontWeight: 700, marginBottom: 2}}>ملاحظة مهمة:</div>
              <div>يجب أن يكون الرقم يحتوي على واتساب للتواصل مع الطبيب</div>
              <div style={{fontSize: '0.8rem', marginTop: 4, opacity: 0.8}}>
                <strong>تێبینی گرنگ:</strong> ژمارەکە دەبێت واتساپی تێدابێت بۆ پەیوەندی لەگەڵ دکتۆر
              </div>
            </div>
          </div>
          <input
            type="password"
            name="password"
            placeholder="كلمة المرور"
            value={form.password}
            onChange={handleChange}
          />
          <input
            type="password"
            name="confirm"
            placeholder="تأكيد كلمة المرور"
            value={form.confirm}
            onChange={handleChange}
          />
          {error && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{successMessage}</div>}
          <button type="submit" disabled={success || loading}>
            {loading ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginLeft: 6, animation: 'spin 1s linear infinite'}}>
                  <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                جاري التسجيل...
              </>
            ) : (
              <>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" style={{marginLeft: 6}} xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4v16m8-8H4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                تسجيل
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserSignUp; 