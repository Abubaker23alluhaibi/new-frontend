import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState('ar');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  useEffect(() => {
    // استرجاع اللغة المحفوظة
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'ar';
    setCurrentLanguage(savedLanguage);
    i18n.changeLanguage(savedLanguage);
  }, [i18n]);

  const changeLanguage = (lang) => {
    setCurrentLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('selectedLanguage', lang);
    setShowLanguageDropdown(false);
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
  };

  const goToLogin = () => {
    navigate('/');
  };

  const getLanguageDisplay = () => {
    switch (currentLanguage) {
      case 'ar': return 'العربية';
      case 'en': return 'English';
      case 'ku': return 'کوردی';
      default: return 'العربية';
    }
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header" id="header">
        <div className="header-container">
          <div className="logo">
            <div className="logo-container">
              <img src="/images/logo192.png" alt="TabibiQ Logo" className="logo-image" />
              <div className="logo-text">
                <h1>{t('landing_page.header.logo_text')}</h1>
                <span>{t('landing_page.header.subtitle')}</span>
              </div>
            </div>
          </div>
          
          <nav className="nav-menu">
            <ul>
              <li><button onClick={() => scrollToSection('home')}>{t('landing_page.header.nav.home')}</button></li>
              <li><button onClick={() => scrollToSection('about')}>{t('landing_page.header.nav.about')}</button></li>
              <li><button onClick={() => scrollToSection('how-to-use')}>{t('landing_page.header.nav.how_to_use')}</button></li>
              <li><button onClick={() => scrollToSection('booking')}>{t('landing_page.header.nav.booking')}</button></li>
            </ul>
          </nav>

          <div className="header-actions">
            <div className="language-selector">
              <button className="language-btn" onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}>
                🌐 <span>{getLanguageDisplay()}</span>
              </button>
              <div className={`language-dropdown ${showLanguageDropdown ? 'show' : ''}`}>
                <button onClick={() => changeLanguage('ar')}>العربية</button>
                <button onClick={() => changeLanguage('en')}>English</button>
                <button onClick={() => changeLanguage('ku')}>کوردی</button>
              </div>
            </div>
            
            <button className="login-btn" onClick={goToLogin}>
              {t('landing_page.header.login_button')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              <span>{t('landing_page.hero.title')}</span> 
              <span className="highlight">{t('landing_page.hero.highlight')}</span>
            </h1>
            <p className="hero-subtitle">
              {t('landing_page.hero.subtitle')}
            </p>
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
              <button className="cta-btn primary" onClick={() => scrollToSection('how-to-use')}>
                {t('landing_page.hero.buttons.start_now')}
              </button>
              <button className="cta-btn secondary" onClick={() => scrollToSection('about')}>
                {t('landing_page.hero.buttons.learn_more')}
              </button>
            </div>
          </div>
          <div className="hero-image">
            <img src="/images/logo192.png" alt="TabibiQ Logo" className="hero-logo" />
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
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>TabibiQ</h3>
              <p>{t('landing_page.footer.description')}</p>
            </div>
            <div className="footer-section">
              <h4>{t('landing_page.footer.quick_links')}</h4>
              <ul>
                <li><button onClick={() => scrollToSection('home')}>{t('landing_page.header.nav.home')}</button></li>
                <li><button onClick={() => scrollToSection('about')}>{t('landing_page.header.nav.about')}</button></li>
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