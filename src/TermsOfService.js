import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const TermsOfService = () => {
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
    <div className="terms-page">
      {/* Header */}
      <header className="header terms-header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <h1 className="logo">TabibiQ</h1>
              <p className="logo-subtitle">{t('terms_page_title')}</p>
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
      <main className="terms-main">
        <div className="container">
          <div className="terms-content">
            <h1 className="terms-title">
              {t('terms_of_service')}
            </h1>
            
            <div className="terms-section">
              <h2>{t('terms_introduction')}</h2>
              <p>
                {currentLanguage === 'ar' 
                  ? 'مرحباً بك في منصة TabibiQ. باستخدام هذه المنصة، فإنك توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءة هذه الشروط بعناية قبل استخدام الخدمات.'
                  : 'Welcome to TabibiQ platform. By using this platform, you agree to comply with these terms and conditions. Please read these terms carefully before using the services.'
                }
              </p>
            </div>

            <div className="terms-section">
              <h2>{t('terms_acceptance')}</h2>
              <p>
                {currentLanguage === 'ar' 
                  ? 'باستخدام منصة TabibiQ، فإنك تؤكد أنك قد قرأت وفهمت ووافقت على هذه الشروط. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام الخدمات.'
                  : 'By using the TabibiQ platform, you confirm that you have read, understood, and agreed to these terms. If you do not agree to any part of these terms, please do not use the services.'
                }
              </p>
            </div>

            <div className="terms-section">
              <h2>{t('terms_services_description')}</h2>
              <p>
                {currentLanguage === 'ar' 
                  ? 'TabibiQ هي منصة طبية تقدم خدمات حجز المواعيد مع الأطباء، وإدارة المواعيد، وتذكيرات الأدوية، وغيرها من الخدمات الطبية المساعدة.'
                  : 'TabibiQ is a medical platform that provides appointment booking services with doctors, appointment management, medicine reminders, and other medical assistance services.'
                }
              </p>
            </div>

            <div className="terms-section">
              <h2>{t('terms_registered_users')}</h2>
              <ul>
                <li>
                  {currentLanguage === 'ar' 
                    ? 'يجب أن تكون عمرك 18 عاماً أو أكثر لإنشاء حساب'
                    : 'You must be 18 years or older to create an account'
                  }
                </li>
                <li>
                  {currentLanguage === 'ar' 
                    ? 'يجب تقديم معلومات دقيقة وصحيحة عند التسجيل'
                    : 'You must provide accurate and correct information when registering'
                  }
                </li>
                <li>
                  {currentLanguage === 'ar' 
                    ? 'أنت مسؤول عن الحفاظ على سرية معلومات حسابك'
                    : 'You are responsible for maintaining the confidentiality of your account information'
                  }
                </li>
              </ul>
            </div>

            <div className="terms-section">
              <h2>{t('terms_doctors')}</h2>
              <ul>
                <li>
                  {currentLanguage === 'ar' 
                    ? 'يجب أن يكون لديك ترخيص صحيح لممارسة الطب'
                    : 'You must have a valid license to practice medicine'
                  }
                </li>
                <li>
                  {currentLanguage === 'ar' 
                    ? 'يجب تقديم وثائق صحيحة ومحدثة'
                    : 'You must provide correct and updated documents'
                  }
                </li>
                <li>
                  {currentLanguage === 'ar' 
                    ? 'أنت مسؤول عن جودة الرعاية الطبية المقدمة'
                    : 'You are responsible for the quality of medical care provided'
                  }
                </li>
              </ul>
            </div>

            <div className="terms-section">
              <h2>{t('terms_bookings')}</h2>
              <ul>
                <li>
                  {currentLanguage === 'ar' 
                    ? 'يجب احترام المواعيد المحددة'
                    : 'Scheduled appointments must be respected'
                  }
                </li>
                <li>
                  {currentLanguage === 'ar' 
                    ? 'يجب إلغاء المواعيد قبل 24 ساعة على الأقل'
                    : 'Appointments must be cancelled at least 24 hours in advance'
                  }
                </li>
                <li>
                  {currentLanguage === 'ar' 
                    ? 'المنصة غير مسؤولة عن عدم حضور الطبيب أو المريض'
                    : 'The platform is not responsible for doctor or patient no-shows'
                  }
                </li>
              </ul>
            </div>

            <div className="terms-section">
              <h2>{t('terms_privacy')}</h2>
              <p>
                {currentLanguage === 'ar' 
                  ? 'نحن نلتزم بحماية خصوصيتك وأمان بياناتك. راجع سياسة الخصوصية الخاصة بنا لمزيد من التفاصيل حول كيفية جمع واستخدام وحماية معلوماتك.'
                  : 'We are committed to protecting your privacy and the security of your data. Please review our privacy policy for more details on how we collect, use, and protect your information.'
                }
              </p>
            </div>

            <div className="terms-section">
              <h2>{t('terms_acceptable_use')}</h2>
              <p>
                {currentLanguage === 'ar' 
                  ? 'يجب استخدام المنصة لأغراض طبية مشروعة فقط. يحظر استخدام المنصة لأي أغراض غير قانونية أو ضارة.'
                  : 'The platform should only be used for legitimate medical purposes. Using the platform for any illegal or harmful purposes is prohibited.'
                }
              </p>
            </div>

            <div className="terms-section">
              <h2>{t('terms_legal_liability')}</h2>
              <p>
                {currentLanguage === 'ar' 
                  ? 'TabibiQ هي منصة وسيطة فقط. نحن غير مسؤولين عن جودة الرعاية الطبية المقدمة أو النتائج الطبية. يتحمل الأطباء والممارسون الصحيون المسؤولية الكاملة عن رعايتهم الطبية.'
                  : 'TabibiQ is only an intermediary platform. We are not responsible for the quality of medical care provided or medical outcomes. Doctors and healthcare practitioners bear full responsibility for their medical care.'
                }
              </p>
            </div>

            <div className="terms-section">
              <h2>{t('terms_modifications')}</h2>
              <p>
                {currentLanguage === 'ar' 
                  ? 'نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إشعارك بأي تغييرات جوهرية عبر المنصة أو البريد الإلكتروني.'
                  : 'We reserve the right to modify these terms at any time. You will be notified of any material changes through the platform or email.'
                }
              </p>
            </div>

            <div className="terms-section">
              <h2>{t('terms_termination')}</h2>
              <p>
                {currentLanguage === 'ar' 
                  ? 'يمكننا إنهاء أو تعليق حسابك في أي وقت إذا انتهكت هذه الشروط أو لأي سبب آخر نعتبره مناسباً.'
                  : 'We may terminate or suspend your account at any time if you violate these terms or for any other reason we deem appropriate.'
                }
              </p>
            </div>

            <div className="terms-section">
              <h2>{t('terms_governing_law')}</h2>
              <p>
                {currentLanguage === 'ar' 
                  ? 'تخضع هذه الشروط لقوانين العراق. أي نزاعات تنشأ عن هذه الشروط ستخضع للاختصاص القضائي للمحاكم العراقية.'
                  : 'These terms are governed by the laws of Iraq. Any disputes arising from these terms will be subject to the jurisdiction of Iraqi courts.'
                }
              </p>
            </div>

            <div className="terms-section">
              <h2>{t('terms_contact')}</h2>
              <p>
                {currentLanguage === 'ar' 
                  ? 'إذا كان لديك أي أسئلة حول هذه الشروط، يرجى الاتصال بنا عبر البريد الإلكتروني أو من خلال المنصة.'
                  : 'If you have any questions about these terms, please contact us via email or through the platform.'
                }
              </p>
            </div>

            <div className="terms-footer">
              <p>
                {t('terms_last_updated')}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;
