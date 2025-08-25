import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const PrivacyPolicy = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState('ar');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'ar';
    setCurrentLanguage(savedLanguage);
    i18n.changeLanguage(savedLanguage);
  }, [i18n]);

  const changeLanguage = async (lang) => {
    setCurrentLanguage(lang);
    localStorage.setItem('selectedLanguage', lang);
    await i18n.changeLanguage(lang);
  };

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="privacy-policy-page">
      {/* Header */}
      <header className="header privacy-header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <h1 className="logo">TabibiQ</h1>
              <p className="logo-subtitle">صفحة سياسة الخصوصية</p>
            </div>
            
            <div className="language-switcher">
              <button
                className={`lang-btn ${currentLanguage === 'ar' ? 'active' : ''}`}
                onClick={() => changeLanguage('ar')}
                disabled={currentLanguage === 'ar'}
              >
                العربية
              </button>
              <button
                className={`lang-btn ${currentLanguage === 'en' ? 'active' : ''}`}
                onClick={() => changeLanguage('en')}
                disabled={currentLanguage === 'en'}
              >
                English
              </button>
            </div>

            <button className="back-btn" onClick={goBack}>
              {currentLanguage === 'ar' ? 'العودة للصفحة الرئيسية' : 'Back to Home'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="privacy-main">
        <div className="container">
          <div className="privacy-content">
            <h1 className="privacy-title">
              {currentLanguage === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </h1>
            
            <div className="privacy-section">
              <h2>{currentLanguage === 'ar' ? 'مقدمة' : 'Introduction'}</h2>
              <p>
                {currentLanguage === 'ar' 
                  ? 'نحن في TabibiQ نلتزم بحماية خصوصيتك وبياناتك الشخصية. هذه السياسة توضح كيفية جمع واستخدام وحماية معلوماتك عند استخدام منصتنا.'
                  : 'At TabibiQ, we are committed to protecting your privacy and personal data. This policy explains how we collect, use, and protect your information when using our platform.'
                }
              </p>
            </div>

            <div className="privacy-section">
              <h2>{currentLanguage === 'ar' ? 'المعلومات التي نجمعها' : 'Information We Collect'}</h2>
              <ul>
                <li>
                  {currentLanguage === 'ar' 
                    ? 'المعلومات الشخصية: الاسم، البريد الإلكتروني، رقم الهاتف'
                    : 'Personal Information: Name, email, phone number'
                  }
                </li>
                <li>
                  {currentLanguage === 'ar' 
                    ? 'معلومات الحجز: المواعيد، الأوقات، الأطباء'
                    : 'Booking Information: Appointments, times, doctors'
                  }
                </li>
                <li>
                  {currentLanguage === 'ar' 
                    ? 'معلومات الاستخدام: كيفية استخدام المنصة'
                    : 'Usage Information: How you use the platform'
                  }
                </li>
              </ul>
            </div>

            <div className="privacy-section">
              <h2>{currentLanguage === 'ar' ? 'كيفية استخدام المعلومات' : 'How We Use Information'}</h2>
              <ul>
                <li>
                  {currentLanguage === 'ar' 
                    ? 'توفير خدمات الحجز والتواصل'
                    : 'Providing booking services and communication'
                  }
                </li>
                <li>
                  {currentLanguage === 'ar' 
                    ? 'تحسين تجربة المستخدم'
                    : 'Improving user experience'
                  }
                </li>
                <li>
                  {currentLanguage === 'ar' 
                    ? 'إرسال إشعارات مهمة'
                    : 'Sending important notifications'
                  }
                </li>
              </ul>
            </div>

            <div className="privacy-section">
              <h2>{currentLanguage === 'ar' ? 'حماية البيانات' : 'Data Protection'}</h2>
              <p>
                {currentLanguage === 'ar' 
                  ? 'نستخدم تقنيات تشفير متقدمة لحماية بياناتك. لا نشارك معلوماتك مع أطراف ثالثة دون موافقتك.'
                  : 'We use advanced encryption technologies to protect your data. We do not share your information with third parties without your consent.'
                }
              </p>
            </div>

            <div className="privacy-section">
              <h2>{currentLanguage === 'ar' ? 'حقوقك' : 'Your Rights'}</h2>
              <ul>
                <li>
                  {currentLanguage === 'ar' 
                    ? 'الوصول إلى بياناتك الشخصية'
                    : 'Access to your personal data'
                  }
                </li>
                <li>
                  {currentLanguage === 'ar' 
                    ? 'تصحيح المعلومات غير الدقيقة'
                    : 'Correct inaccurate information'
                  }
                </li>
                <li>
                  {currentLanguage === 'ar' 
                    ? 'حذف بياناتك عند الطلب'
                    : 'Delete your data upon request'
                  }
                </li>
              </ul>
            </div>

            <div className="privacy-section">
              <h2>{currentLanguage === 'ar' ? 'التواصل معنا' : 'Contact Us'}</h2>
              <p>
                {currentLanguage === 'ar' 
                  ? 'إذا كان لديك أي أسئلة حول سياسة الخصوصية، يمكنك التواصل معنا عبر:'
                  : 'If you have any questions about this privacy policy, you can contact us via:'
                }
              </p>
              <div className="contact-info">
                <p>📧 Email: info@tabibiq.com</p>
                <p>📱 WhatsApp: +964 776 901 2619</p>
              </div>
            </div>

            <div className="privacy-section">
              <h2>{currentLanguage === 'ar' ? 'تحديث السياسة' : 'Policy Updates'}</h2>
              <p>
                {currentLanguage === 'ar' 
                  ? 'قد نقوم بتحديث هذه السياسة من وقت لآخر. سنقوم بإعلامك بأي تغييرات مهمة.'
                  : 'We may update this policy from time to time. We will notify you of any significant changes.'
                }
              </p>
            </div>

            <div className="privacy-footer">
              <p className="last-updated">
                {currentLanguage === 'ar' 
                  ? 'آخر تحديث: ديسمبر 2024'
                  : 'Last Updated: December 2024'
                }
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer privacy-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>TabibiQ</h3>
              <p>
                {currentLanguage === 'ar' 
                  ? 'منصة طبية رقمية متكاملة'
                  : 'Integrated Digital Medical Platform'
                }
              </p>
            </div>
            <div className="footer-section">
              <h4>
                {currentLanguage === 'ar' ? 'روابط سريعة' : 'Quick Links'}
              </h4>
              <ul>
                <li><button onClick={goBack}>
                  {currentLanguage === 'ar' ? 'الصفحة الرئيسية' : 'Home'}
                </button></li>
                <li><button onClick={() => window.scrollTo(0, 0)}>
                  {currentLanguage === 'ar' ? 'أعلى الصفحة' : 'Top of Page'}
                </button></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>
                {currentLanguage === 'ar' ? 'معلومات الاتصال' : 'Contact Info'}
              </h4>
              <p>info@tabibiq.com</p>
              <p>
                <a href="https://wa.me/9647769012619" target="_blank" rel="noopener noreferrer" className="whatsapp-link">
                  +964 776 901 2619
                </a>
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>
              {currentLanguage === 'ar' 
                ? '© 2024 TabibiQ. جميع الحقوق محفوظة.'
                : '© 2024 TabibiQ. All rights reserved.'
              }
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
