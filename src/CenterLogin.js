import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { useTranslation } from 'react-i18next';

function CenterLogin() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }
    try {
      // طلب تسجيل الدخول (يفترض وجود endpoint مناسب)
      const res = await fetch(`${process.env.REACT_APP_API_URL}/center/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        // حفظ بيانات الجلسة (مثلاً localStorage)
        localStorage.setItem('centerToken', data.token);
        localStorage.setItem('centerProfile', JSON.stringify(data.center));
        navigate('/center-home');
      } else {
        setError('بيانات الدخول غير صحيحة أو الحساب غير مفعل');
      }
    } catch (err) {
              setError(t('error_connection'));
    }
  };

  return (
    <div className="login-container" style={{background: 'linear-gradient(90deg, #00bcd4 0%, #7c4dff 100%)', flexDirection:'column', justifyContent:'center', minHeight:'100vh'}}>
      <form className="login-box" onSubmit={handleSubmit}>
        <h2>تسجيل دخول المركز/المستشفى</h2>
        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error && <div className="login-error">{error}</div>}
        <button type="submit">دخول</button>
      </form>
    </div>
  );
}

export default CenterLogin; 