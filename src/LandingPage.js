import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState('ar');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [backgroundImageLoaded, setBackgroundImageLoaded] = useState(false);
  const moreMenuRef = useRef(null);

  // دالة مساعدة لضمان تطبيق اللغة
  const ensureLanguageApplied = (lang) => {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 5;
      
      const tryApplyLanguage = () => {
        attempts++;
        i18n.changeLanguage(lang);
        
        setTimeout(() => {
          if (i18n.language === lang || attempts >= maxAttempts) {
            resolve();
          } else {
            tryApplyLanguage();
          }
        }, 100);
      };
      
      tryApplyLanguage();
    });
  };

  // دالة لإعادة تحميل الترجمة بشكل قوي
  const forceReloadTranslation = () => {
    try {
      const currentLang = i18n.language || 'ar';
      const savedLang = localStorage.getItem('selectedLanguage') || 'ar';
      
      // تغيير مؤقت ثم العودة للغة المحفوظة
      i18n.changeLanguage('en');
      setTimeout(() => {
        i18n.changeLanguage(savedLang);
        
        // إعادة تطبيق إضافية
        setTimeout(() => {
          i18n.changeLanguage(savedLang);
        }, 100);
      }, 50);
    } catch (error) {
      console.error('خطأ في إعادة تحميل الترجمة:', error);
    }
  };

  // دالة لإعادة تحميل الصفحة إذا كانت البيانات قديمة
  const checkAndReloadIfNeeded = () => {
    try {
      const lastUpdate = localStorage.getItem('translationTimestamp');
      const currentTime = Date.now();
      
      // إذا مر أكثر من 3 دقائق منذ آخر تحديث، أعد تحميل الترجمة
      if (lastUpdate && (currentTime - parseInt(lastUpdate)) > 180000) {
        forceReloadTranslation();
        localStorage.setItem('translationTimestamp', currentTime.toString());
      }
      
      // التحقق من تطابق اللغة المحفوظة مع اللغة الحالية
      const savedLang = localStorage.getItem('selectedLanguage');
      const currentLang = i18n.language;
      
      if (savedLang && currentLang && savedLang !== currentLang) {
        console.log('تصحيح عدم تطابق اللغة:', savedLang, currentLang);
        i18n.changeLanguage(savedLang);
        setCurrentLanguage(savedLang);
      }
    } catch (error) {
      console.error('خطأ في فحص الترجمة:', error);
    }
  };

  useEffect(() => {
    // إضافة timestamp لمنع التخزين المؤقت
    const timestamp = Date.now();
    
    // استرجاع اللغة المحفوظة مع معالجة الأخطاء
    let savedLanguage = 'ar'; // اللغة الافتراضية
    try {
      const storedLanguage = localStorage.getItem('selectedLanguage');
      if (storedLanguage && ['ar', 'en', 'ku'].includes(storedLanguage)) {
        savedLanguage = storedLanguage;
        console.log('تم استرجاع اللغة المحفوظة:', savedLanguage);
      } else {
        console.log('لم يتم العثور على لغة محفوظة، استخدام الافتراضية:', savedLanguage);
      }
    } catch (error) {
      console.error('خطأ في قراءة اللغة المحفوظة:', error);
    }
    
    // تحديث الحالة المحلية
    setCurrentLanguage(savedLanguage);
    console.log('تم تحديث الحالة المحلية للغة:', savedLanguage);
    
    // تطبيق اللغة في i18n مع معالجة الأخطاء
    const applyLanguage = async () => {
      try {
        // تطبيق اللغة مباشرة
        i18n.changeLanguage(savedLanguage);
        console.log('تم تطبيق اللغة في i18n:', savedLanguage);
        
        // التحقق من تطبيق اللغة
        setTimeout(() => {
          console.log('اللغة الحالية في i18n:', i18n.language);
          if (i18n.language !== savedLanguage) {
            console.log('إعادة تطبيق اللغة بعد فشل أولي');
            i18n.changeLanguage(savedLanguage);
            
            // إعادة تحميل الصفحة إذا لم تتطبق اللغة
            setTimeout(() => {
              if (i18n.language !== savedLanguage) {
                console.log('فشل في تطبيق اللغة، إعادة تحميل الصفحة');
                window.location.reload();
              }
            }, 500);
          }
        }, 100);
      } catch (error) {
        console.error('خطأ في تطبيق اللغة:', error);
      }
    };
    
    applyLanguage();
    
    // إضافة meta tags لمنع التخزين المؤقت
    const metaTags = [
      { name: 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
      { name: 'Pragma', content: 'no-cache' },
      { name: 'Expires', content: '0' }
    ];
    
    metaTags.forEach(tag => {
      let meta = document.querySelector(`meta[name="${tag.name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = tag.name;
        document.head.appendChild(meta);
      }
      meta.content = tag.content;
    });
    
    // إضافة timestamp للصفحة لمنع التخزين المؤقت
    if (!document.querySelector('meta[name="timestamp"]')) {
      const timestampMeta = document.createElement('meta');
      timestampMeta.name = 'timestamp';
      timestampMeta.content = timestamp.toString();
      document.head.appendChild(timestampMeta);
    }
    
    // إضافة timestamp للـ localStorage
    localStorage.setItem('translationTimestamp', timestamp.toString());
  }, [i18n]);

  useEffect(() => {
    // تحميل الصورة الخلفية مسبقاً
    const backgroundImage = new Image();
    backgroundImage.onload = () => {
      setBackgroundImageLoaded(true);
    };
    backgroundImage.onerror = () => {
      console.warn('فشل تحميل الصورة الخلفية، سيتم استخدام الخلفية الافتراضية');
      setBackgroundImageLoaded(true);
    };
    backgroundImage.src = '/images/doctor-capsule.jpg';
  }, []);

  useEffect(() => {
    // فحص وتحديث الترجمة عند تحميل الصفحة
    checkAndReloadIfNeeded();
    
    // إضافة event listener لتحديث الترجمة عند التركيز على الصفحة
    const handleFocus = () => {
      checkAndReloadIfNeeded();
    };
    
    // إضافة event listener لتحديث الترجمة عند تغيير الرؤية
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAndReloadIfNeeded();
      }
    };
    
    // إضافة event listener لتحديث الترجمة عند العودة للصفحة
    const handlePageShow = () => {
      checkAndReloadIfNeeded();
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  useEffect(() => {
    // إغلاق القائمة عند النقر خارجها
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };

    // تأثير التمرير للـ header
    const handleScroll = () => {
      const header = document.querySelector('.header');
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    };

    // إضافة event listeners متعددة لضمان العمل على جميع الأجهزة
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const changeLanguage = async (lang) => {
    console.log('محاولة تغيير اللغة إلى:', lang);
    
    // تحديث الحالة المحلية أولاً
    setCurrentLanguage(lang);
    
    // حفظ اللغة في localStorage
    try {
      localStorage.setItem('selectedLanguage', lang);
      localStorage.setItem('translationTimestamp', Date.now().toString());
      console.log('تم حفظ اللغة في localStorage:', lang);
    } catch (error) {
      console.error('خطأ في حفظ اللغة في localStorage:', error);
    }
    

    
    // تغيير اللغة في i18n مباشرة
    try {
      // تغيير اللغة بشكل مباشر
      i18n.changeLanguage(lang);
      console.log('تم تطبيق اللغة في i18n:', lang);
      
      // إعادة تطبيق اللغة بعد تأخير قصير
      setTimeout(() => {
        i18n.changeLanguage(lang);
        console.log('اللغة الحالية بعد التطبيق:', i18n.language);
        
        // التحقق من نجاح التطبيق
        if (i18n.language === lang) {
          console.log('تم تطبيق اللغة بنجاح:', lang);
          // إضافة timestamp جديد
          localStorage.setItem('translationTimestamp', Date.now().toString());
          
          // إعادة تحميل الصفحة لضمان تطبيق التغييرات
          console.log('إعادة تحميل الصفحة لتطبيق التغييرات');
          setTimeout(() => {
            window.location.reload();
          }, 300);
        } else {
          console.log('فشل في تطبيق اللغة، إعادة تحميل إجبارية');
          // إعادة تحميل الصفحة كحل بديل
          setTimeout(() => {
            window.location.reload();
          }, 300);
        }
      }, 200);
      
    } catch (error) {
      console.error('خطأ في تغيير اللغة:', error);
      // إعادة تحميل الصفحة كحل بديل
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = document.querySelector('.header').offsetHeight;
      const elementPosition = element.offsetTop - headerHeight - 20;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
    setShowMoreMenu(false);
  };

  const goToLogin = () => {
    navigate('/login');
  };

  const goToAbout = () => {
    scrollToSection('about');
  };

  const goToHome = () => {
    scrollToSection('home');
  };



  return (
    <div className="landing-page" itemScope itemType="https://schema.org/MedicalOrganization">
      {/* Header */}
      <header className="header" id="header" role="banner">
        <div className="header-container">
          <div className="logo">
            <div 
              className="logo-container"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{ cursor: 'pointer' }}
            >
              <img 
                src="/logo192.png" 
                alt="منصة طبيب العراق - Tabib IQ Logo" 
                className="logo-image"
                itemProp="logo"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="logo-fallback" style={{ display: 'none' }}>
                <span className="logo-icon">🏥</span>
              </div>
              <div className="logo-text">
                <h1 itemProp="name">{t('landing_page.header.logo_text')}</h1>
                <span itemProp="description">{t('landing_page.header.subtitle')}</span>
              </div>
            </div>
          </div>
          
          {/* Navigation Menu - Hidden on mobile */}
          <nav className="nav-menu desktop-nav" role="navigation" aria-label="القائمة الرئيسية">
            <ul>
              <li><button onClick={() => scrollToSection('home')}>{t('landing_page.header.nav.home')}</button></li>
              <li><button onClick={() => scrollToSection('about')}>{t('landing_page.header.nav.about')}</button></li>
              <li><button onClick={() => scrollToSection('doctor-services')}>{t('landing_page.header.nav.doctor_services')}</button></li>
              <li><button onClick={() => scrollToSection('how-to-use')}>{t('landing_page.header.nav.how_to_use')}</button></li>
              <li><button onClick={() => scrollToSection('booking')}>{t('landing_page.header.nav.booking')}</button></li>
            </ul>
          </nav>

          <div className="header-actions">
            {/* More Menu Button - Mobile Only */}
            <div className="more-menu mobile-only" ref={moreMenuRef}>
              <button 
                className="more-btn" 
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                aria-label="قائمة إضافية"
              >
                <span className="more-icon">☰</span>
                <span className="more-text">مزيد</span>
              </button>
              
              {/* More Menu Dropdown */}
              {showMoreMenu && (
                <div className="more-dropdown">
                  <button onClick={() => scrollToSection('home')}>{t('landing_page.header.nav.home')}</button>
                  <button onClick={() => scrollToSection('about')}>{t('landing_page.header.nav.about')}</button>
                  <button onClick={() => scrollToSection('doctor-services')}>{t('landing_page.header.nav.doctor_services')}</button>
                  <button onClick={() => scrollToSection('how-to-use')}>{t('landing_page.header.nav.how_to_use')}</button>
                  <button onClick={() => scrollToSection('booking')}>{t('landing_page.header.nav.booking')}</button>
                  <div className="dropdown-divider"></div>
                  <button className="login-btn-mobile" onClick={goToLogin}>
                    {t('landing_page.header.login_button')}
                  </button>
                  <button className="back-home-btn-mobile" onClick={goToHome}>
                    {t('landing_page.header.back_to_home')}
                  </button>
                  <div className="dropdown-divider"></div>
                  <div className="language-selector-mobile">
                    <select 
                      value={currentLanguage} 
                      onChange={(e) => changeLanguage(e.target.value)} 
                      className="language-select-mobile-new"
                    >
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                      <option value="ku">کوردی</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Language Selector - Desktop Only */}
            <div className="language-selector desktop-only">
              <select 
                value={currentLanguage} 
                onChange={(e) => changeLanguage(e.target.value)} 
                className="language-select-new"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
                <option value="ku">کوردی</option>
              </select>
            </div>
            
            <button className="login-btn" onClick={goToLogin}>
              {t('landing_page.header.login_button')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        id="home" 
        className="hero-section" 
        role="main"
        style={{
          background: backgroundImageLoaded 
            ? `url('/images/doctor-capsule.jpg') center center/cover no-repeat`
            : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
          transition: 'background 0.3s ease-in-out'
        }}
      >
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              <span>{t('landing_page.hero.title')}</span> 
              <span className="highlight">{t('landing_page.hero.highlight')}</span>
            </h1>
            <p className="hero-subtitle">
              {t('landing_page.hero.subtitle')}
            </p>
            <div className="doctor-message">
              <p className="doctor-message-text">
                {t('landing_page.hero.doctor_message')}
              </p>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">{t('landing_page.hero.stats.doctors')}</span>
              </div>
              <div className="stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">{t('landing_page.hero.stats.patients')}</span>
              </div>
              <div className="stat">
                <span className="stat-number">50K+</span>
                <span className="stat-label">{t('landing_page.hero.stats.appointments')}</span>
              </div>
            </div>
            <div className="hero-buttons">
              <button className="cta-btn primary" onClick={goToLogin}>
                {t('landing_page.header.login_button')}
              </button>
              <button className="cta-btn secondary" onClick={() => scrollToSection('about')}>
                {t('landing_page.hero.buttons.learn_more')}
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="section-header">
            <h2>{t('landing_page.about.title')}</h2>
            <p>{t('landing_page.about.subtitle')}</p>
          </div>
          
          <div className="about-content">
            <div className="about-text">
              <h3>{t('landing_page.about.main_title')}</h3>
              <p>{t('landing_page.about.description')}</p>
              
              <div className="features-grid">
                <div className="feature">
                  <div className="feature-icon">🔒</div>
                  <h4>{t('landing_page.about.features.security.title')}</h4>
                  <p>{t('landing_page.about.features.security.description')}</p>
                </div>
                <div className="feature">
                  <div className="feature-icon">⚡</div>
                  <h4>{t('landing_page.about.features.speed.title')}</h4>
                  <p>{t('landing_page.about.features.speed.description')}</p>
                </div>
                <div className="feature">
                  <div className="feature-icon">👨‍⚕️</div>
                  <h4>{t('landing_page.about.features.verified.title')}</h4>
                  <p>{t('landing_page.about.features.verified.description')}</p>
                </div>
                <div className="feature">
                  <div className="feature-icon">📱</div>
                  <h4>{t('landing_page.about.features.easy_use.title')}</h4>
                  <p>{t('landing_page.about.features.easy_use.description')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section id="how-to-use" className="how-to-use-section">
        <div className="container">
          <div className="section-header">
            <h2>{t('landing_page.how_to_use.title')}</h2>
            <p>{t('landing_page.how_to_use.subtitle')}</p>
          </div>
          
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-icon">🔍</div>
              <h3>{t('landing_page.how_to_use.steps.step1.title')}</h3>
              <p>{t('landing_page.how_to_use.steps.step1.description')}</p>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-icon">📅</div>
              <h3>{t('landing_page.how_to_use.steps.step2.title')}</h3>
              <p>{t('landing_page.how_to_use.steps.step2.description')}</p>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-icon">✅</div>
              <h3>{t('landing_page.how_to_use.steps.step3.title')}</h3>
              <p>{t('landing_page.how_to_use.steps.step3.description')}</p>
            </div>
            
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-icon">🎉</div>
              <h3>{t('landing_page.how_to_use.steps.step4.title')}</h3>
              <p>{t('landing_page.how_to_use.steps.step4.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor Services Section */}
      <section id="doctor-services" className="doctor-services-section">
        <div className="container">
          <div className="section-header">
            <h2>{t('landing_page.doctor_services.title')}</h2>
            <p>{t('landing_page.doctor_services.subtitle')}</p>
          </div>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">📊</div>
              <h3>{t('landing_page.doctor_services.services.dashboard.title')}</h3>
              <p>{t('landing_page.doctor_services.services.dashboard.description')}</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">📅</div>
              <h3>{t('landing_page.doctor_services.services.calendar.title')}</h3>
              <p>{t('landing_page.doctor_services.services.calendar.description')}</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">📈</div>
              <h3>{t('landing_page.doctor_services.services.analytics.title')}</h3>
              <p>{t('landing_page.doctor_services.services.analytics.description')}</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">👤</div>
              <h3>{t('landing_page.doctor_services.services.profile.title')}</h3>
              <p>{t('landing_page.doctor_services.services.profile.description')}</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">⭐</div>
              <h3>{t('landing_page.doctor_services.services.special_appointments.title')}</h3>
              <p>{t('landing_page.doctor_services.services.special_appointments.description')}</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🔔</div>
              <h3>{t('landing_page.doctor_services.services.notifications.title')}</h3>
              <p>{t('landing_page.doctor_services.services.notifications.description')}</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">📸</div>
              <h3>{t('landing_page.doctor_services.services.images.title')}</h3>
              <p>{t('landing_page.doctor_services.services.images.description')}</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🗺️</div>
              <h3>{t('landing_page.doctor_services.services.location.title')}</h3>
              <p>{t('landing_page.doctor_services.services.location.description')}</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🏥</div>
              <h3>{t('landing_page.doctor_services.services.health_centers.title')}</h3>
              <p>{t('landing_page.doctor_services.services.health_centers.description')}</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">👥</div>
              <h3>{t('landing_page.doctor_services.services.patient_management.title')}</h3>
              <p>{t('landing_page.doctor_services.services.patient_management.description')}</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">💰</div>
              <h3>{t('landing_page.doctor_services.services.revenue_tracking.title')}</h3>
              <p>{t('landing_page.doctor_services.services.revenue_tracking.description')}</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">💻</div>
              <h3>{t('landing_page.doctor_services.services.online_consultations.title')}</h3>
              <p>{t('landing_page.doctor_services.services.online_consultations.description')}</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">📈</div>
              <h3>{t('landing_page.doctor_services.services.marketing_tools.title')}</h3>
              <p>{t('landing_page.doctor_services.services.marketing_tools.description')}</p>
            </div>
          </div>
          
          <div className="services-cta">
            <button className="cta-btn primary" onClick={() => navigate('/signup-doctor')}>
              {t('landing_page.doctor_services.register_button')}
            </button>
            <button className="cta-btn secondary" onClick={goToLogin}>
              {t('landing_page.doctor_services.login_button')}
            </button>
          </div>
          
          {/* Benefits Section */}
          <div className="benefits-section">
            <div className="section-header">
              <h2>{t('landing_page.doctor_services.benefits.title')}</h2>
              <p>{t('landing_page.doctor_services.benefits.subtitle')}</p>
            </div>
            
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon">🎁</div>
                <h3>{t('landing_page.doctor_services.benefits.items.free_registration.title')}</h3>
                <p>{t('landing_page.doctor_services.benefits.items.free_registration.description')}</p>
              </div>
              
              <div className="benefit-card">
                <div className="benefit-icon">👁️</div>
                <h3>{t('landing_page.doctor_services.benefits.items.increased_visibility.title')}</h3>
                <p>{t('landing_page.doctor_services.benefits.items.increased_visibility.description')}</p>
              </div>
              
              <div className="benefit-card">
                <div className="benefit-icon">📋</div>
                <h3>{t('landing_page.doctor_services.benefits.items.patient_management.title')}</h3>
                <p>{t('landing_page.doctor_services.benefits.items.patient_management.description')}</p>
              </div>
              
              <div className="benefit-card">
                <div className="benefit-icon">📊</div>
                <h3>{t('landing_page.doctor_services.benefits.items.analytics.title')}</h3>
                <p>{t('landing_page.doctor_services.benefits.items.analytics.description')}</p>
              </div>
              
              <div className="benefit-card">
                <div className="benefit-icon">🛠️</div>
                <h3>{t('landing_page.doctor_services.benefits.items.support.title')}</h3>
                <p>{t('landing_page.doctor_services.benefits.items.support.description')}</p>
              </div>
              
              <div className="benefit-card">
                <div className="benefit-icon">🚀</div>
                <h3>{t('landing_page.doctor_services.benefits.items.growth.title')}</h3>
                <p>{t('landing_page.doctor_services.benefits.items.growth.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="booking-section">
        <div className="container">
          <div className="section-header">
            <h2>{t('landing_page.booking.title')}</h2>
            <p>{t('landing_page.booking.subtitle')}</p>
          </div>
          
          <div className="booking-content">
            <div className="booking-instructions">
              <div className="instruction">
                <div className="instruction-icon">📋</div>
                <div className="instruction-text">
                  <h4>{t('landing_page.booking.instructions.data_accuracy.title')}</h4>
                  <p>{t('landing_page.booking.instructions.data_accuracy.description')}</p>
                </div>
              </div>
              
              <div className="instruction">
                <div className="instruction-icon">⏰</div>
                <div className="instruction-text">
                  <h4>{t('landing_page.booking.instructions.temporary.title')}</h4>
                  <p>{t('landing_page.booking.instructions.temporary.description')}</p>
                </div>
              </div>
              
              <div className="instruction">
                <div className="instruction-icon">📞</div>
                <div className="instruction-text">
                  <h4>{t('landing_page.booking.instructions.communication.title')}</h4>
                  <p>{t('landing_page.booking.instructions.communication.description')}</p>
                </div>
              </div>
              
              <div className="instruction">
                <div className="instruction-icon">🔄</div>
                <div className="instruction-text">
                  <h4>{t('landing_page.booking.instructions.cancellation.title')}</h4>
                  <p>{t('landing_page.booking.instructions.cancellation.description')}</p>
                </div>
              </div>
            </div>
            
            <div className="booking-demo">
              <h3>{t('landing_page.booking.demo.title')}</h3>
              <div className="demo-steps">
                <div className="demo-step">
                  <div className="demo-image-container">
                    <div className="demo-image doctor-image">
                      <span className="demo-icon">👨‍⚕️</span>
                      <div className="demo-text">صورة الطبيب</div>
                    </div>
                  </div>
                  <p>1. {t('landing_page.booking.demo.steps.step1')}</p>
                </div>
                <div className="demo-step">
                  <div className="demo-image-container">
                    <div className="demo-image calendar-image">
                      <span className="demo-icon">📅</span>
                      <div className="demo-text">تقويم المواعيد</div>
                    </div>
                  </div>
                  <p>2. {t('landing_page.booking.demo.steps.step2')}</p>
                </div>
                <div className="demo-step">
                  <div className="demo-image-container">
                    <div className="demo-image confirm-image">
                      <span className="demo-icon">✅</span>
                      <div className="demo-text">تأكيد الحجز</div>
                    </div>
                  </div>
                  <p>3. {t('landing_page.booking.demo.steps.step3')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" role="contentinfo">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3 itemProp="name">TabibiQ</h3>
              <p itemProp="description">{t('landing_page.footer.description')}</p>
            </div>
            <div className="footer-section">
              <h4>{t('landing_page.footer.quick_links')}</h4>
              <ul>
                <li><button onClick={() => scrollToSection('home')}>{t('landing_page.header.nav.home')}</button></li>
                <li><button onClick={() => scrollToSection('about')}>{t('landing_page.header.nav.about')}</button></li>
                <li><button onClick={() => scrollToSection('doctor-services')}>{t('landing_page.header.nav.doctor_services')}</button></li>
                <li><button onClick={() => scrollToSection('how-to-use')}>{t('landing_page.header.nav.how_to_use')}</button></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>{t('landing_page.footer.contact')}</h4>
              <p>{t('landing_page.footer.email')}</p>
              <p>
                <a href="https://wa.me/9647769012619" target="_blank" rel="noopener noreferrer" className="whatsapp-link">
                  <span>{t('landing_page.footer.phone')}</span>
                </a>
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>{t('landing_page.footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 