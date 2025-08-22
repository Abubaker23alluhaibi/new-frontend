import React, { useState, useEffect, useRef } from 'react';
// import { useTranslation } from 'react-i18next'; // غير مستخدم حالياً

const AdvertisementSlider = ({ target = 'both' }) => {
  const [advertisements, setAdvertisements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const intervalRef = useRef(null);
  // const { t } = useTranslation(); // غير مستخدم حالياً

  useEffect(() => {
    fetchAdvertisements();
    
    // إعداد التمرير التلقائي
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => 
        prevIndex === advertisements.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // تغيير كل 5 ثواني

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [target, advertisements.length]);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      setError('');
      
      const apiUrl = `${process.env.REACT_APP_API_URL}/advertisements/${target}`;
      console.log('🔍 جلب الإعلانات من:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ تم جلب الإعلانات:', data);
        setAdvertisements(data);
        
        // تحديث إحصائيات المشاهدة
        data.forEach(ad => {
          updateStats(ad._id, 'view');
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ خطأ في جلب الإعلانات:', response.status, errorData);
        setError(`فشل في جلب الإعلانات: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ خطأ في الاتصال:', err);
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const updateStats = async (adId, action) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/advertisements/${adId}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
    } catch (err) {
      console.error('خطأ في تحديث الإحصائيات:', err);
    }
  };

  const handleAdClick = (advertisement) => {
    updateStats(advertisement._id, 'click');
    // يمكن إضافة منطق إضافي هنا مثل فتح رابط أو نافذة منبثقة
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    // إعادة تعيين المؤقت
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => 
          prevIndex === advertisements.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? advertisements.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === advertisements.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (loading) {
    return (
      <div style={{
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        borderRadius: '12px',
        margin: '1rem 0'
      }}>
        <div>جاري تحميل الإعلانات...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffebee',
        color: '#c62828',
        borderRadius: '12px',
        margin: '1rem 0'
      }}>
        <div>{error}</div>
      </div>
    );
  }

  if (advertisements.length === 0) {
    console.log('ℹ️ لا توجد إعلانات للعرض');
    return null; // لا تعرض شيئاً إذا لم تكن هناك إعلانات
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '200px',
      margin: '1rem 0',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      {/* الإعلان الحالي */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: 'pointer',
          transition: 'opacity 0.5s ease-in-out'
        }}
        onClick={() => handleAdClick(advertisements[currentIndex])}
      >
        <img
          src={advertisements[currentIndex]?.image}
          alt={advertisements[currentIndex]?.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        
        {/* معلومات الإعلان */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
          color: 'white',
          padding: '1rem',
          textAlign: 'right'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
            {advertisements[currentIndex]?.title}
          </h3>
          <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
            {advertisements[currentIndex]?.description}
          </p>
        </div>
      </div>

      {/* أزرار التنقل */}
      {advertisements.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}
          >
            ‹
          </button>
          
          <button
            onClick={goToNext}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}
          >
            ›
          </button>
        </>
      )}

      {/* مؤشرات الشرائح */}
      {advertisements.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px'
        }}>
          {advertisements.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: 'none',
                background: index === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'background 0.3s ease'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvertisementSlider;
