import React, { useState, useEffect, useRef } from 'react';
// import { useTranslation } from 'react-i18next'; // غير مستخدم حالياً

const AdvertisementSlider = ({ target = 'both' }) => {
  console.log('🎬 AdvertisementSlider: تم تحميل المكون مع الهدف:', target);
  const [advertisements, setAdvertisements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const intervalRef = useRef(null);
  // const { t } = useTranslation(); // غير مستخدم حالياً

  useEffect(() => {
    console.log('🔄 AdvertisementSlider useEffect: تم تشغيل useEffect مع:', { target, advertisementsLength: advertisements.length });
    console.log('🔄 AdvertisementSlider: سيتم جلب الإعلانات للهدف:', target);
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
      
      // تحديد API endpoint بناءً على الهدف
      let apiUrl;
      if (target === 'both') {
        // للدكتور: جرب إعلانات الأطباء أولاً، ثم إعلانات عامة
        apiUrl = `${process.env.REACT_APP_API_URL}/advertisements/doctors`;
        console.log('🎯 AdvertisementSlider: جلب إعلانات الأطباء للدكتور من:', apiUrl);
      } else {
        apiUrl = `${process.env.REACT_APP_API_URL}/advertisements/${target}`;
        console.log('🎯 AdvertisementSlider: جلب الإعلانات للهدف:', target, 'من:', apiUrl);
      }
      
      console.log('🔗 AdvertisementSlider: API URL المستخدم:', process.env.REACT_APP_API_URL);
      console.log('🎯 AdvertisementSlider: الهدف المحدد:', target);
      
      const response = await fetch(apiUrl);
      console.log('📡 AdvertisementSlider: استجابة الخادم:', response.status, response.statusText);
      console.log('📡 AdvertisementSlider: headers الاستجابة:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ AdvertisementSlider: تم جلب الإعلانات:', data);
        console.log('📊 AdvertisementSlider: عدد الإعلانات المستلمة:', Array.isArray(data) ? data.length : 'غير مصفوفة');
        console.log('📊 AdvertisementSlider: نوع البيانات المستلمة:', typeof data);
        console.log('📊 AdvertisementSlider: هل البيانات مصفوفة؟', Array.isArray(data));
        if (Array.isArray(data)) {
          console.log('📊 AdvertisementSlider: محتوى الإعلانات:', data.map(ad => ({ id: ad._id, title: ad.title, image: ad.image })));
        }
        
        if (Array.isArray(data) && data.length > 0) {
          setAdvertisements(data);
          
          // تحديث إحصائيات المشاهدة
          data.forEach(ad => {
            updateStats(ad._id, 'view');
          });
        } else if (target === 'both') {
          // إذا لم توجد إعلانات للأطباء، جرب إعلانات عامة
          console.log('🔄 AdvertisementSlider: محاولة جلب إعلانات عامة كبديل');
          const fallbackResponse = await fetch(`${process.env.REACT_APP_API_URL}/advertisements/users`);
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            console.log('✅ AdvertisementSlider: تم جلب إعلانات عامة كبديل:', fallbackData);
            if (Array.isArray(fallbackData) && fallbackData.length > 0) {
              setAdvertisements(fallbackData);
              fallbackData.forEach(ad => {
                updateStats(ad._id, 'view');
              });
            } else {
              console.log('ℹ️ AdvertisementSlider: لا توجد إعلانات عامة أيضاً');
              setAdvertisements([]);
            }
          } else {
            console.log('❌ AdvertisementSlider: فشل في جلب إعلانات عامة كبديل');
            setAdvertisements([]);
          }
        } else {
          setAdvertisements([]);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ AdvertisementSlider: خطأ في جلب الإعلانات:', response.status, errorData);
        console.error('❌ AdvertisementSlider: تفاصيل الخطأ:', errorData);
        
        if (target === 'both') {
          // إذا فشل جلب إعلانات الأطباء، جرب إعلانات عامة
          console.log('🔄 AdvertisementSlider: محاولة جلب إعلانات عامة بعد فشل إعلانات الأطباء');
          try {
            const fallbackResponse = await fetch(`${process.env.REACT_APP_API_URL}/advertisements/users`);
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              console.log('✅ AdvertisementSlider: تم جلب إعلانات عامة كبديل:', fallbackData);
              if (Array.isArray(fallbackData) && fallbackData.length > 0) {
                setAdvertisements(fallbackData);
                fallbackData.forEach(ad => {
                  updateStats(ad._id, 'view');
                });
                return; // نجح البديل، لا نحتاج لعرض خطأ
              }
            }
          } catch (fallbackErr) {
            console.error('❌ AdvertisementSlider: فشل في جلب إعلانات عامة كبديل:', fallbackErr);
          }
        }
        
        setError(`فشل في جلب الإعلانات: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ AdvertisementSlider: خطأ في الاتصال:', err);
      
      if (target === 'both') {
        // إذا فشل الاتصال، جرب إعلانات عامة
        console.log('🔄 AdvertisementSlider: محاولة جلب إعلانات عامة بعد فشل الاتصال');
        try {
          const fallbackResponse = await fetch(`${process.env.REACT_APP_API_URL}/advertisements/users`);
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            console.log('✅ AdvertisementSlider: تم جلب إعلانات عامة كبديل:', fallbackData);
            if (Array.isArray(fallbackData) && fallbackData.length > 0) {
              setAdvertisements(fallbackData);
              fallbackData.forEach(ad => {
                updateStats(ad._id, 'view');
              });
              return; // نجح البديل، لا نحتاج لعرض خطأ
            }
          }
        } catch (fallbackErr) {
          console.error('❌ AdvertisementSlider: فشل في جلب إعلانات عامة كبديل:', fallbackErr);
        }
      }
      
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const updateStats = async (adId, action) => {
    try {
      console.log('📊 AdvertisementSlider: تحديث الإحصائيات:', { adId, action });
      await fetch(`${process.env.REACT_APP_API_URL}/advertisements/${adId}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      console.log('✅ AdvertisementSlider: تم تحديث الإحصائيات بنجاح');
    } catch (err) {
      console.error('❌ AdvertisementSlider: خطأ في تحديث الإحصائيات:', err);
    }
  };

  const handleAdClick = (advertisement) => {
    console.log('🖱️ AdvertisementSlider: تم النقر على الإعلان:', advertisement);
    updateStats(advertisement._id, 'click');
    // يمكن إضافة منطق إضافي هنا مثل فتح رابط أو نافذة منبثقة
  };

  const goToSlide = (index) => {
    console.log('🎯 AdvertisementSlider: الانتقال إلى الشريحة:', index);
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
    console.log('⏳ AdvertisementSlider: في حالة التحميل');
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
    console.log('❌ AdvertisementSlider: في حالة الخطأ:', error);
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
    console.log('ℹ️ AdvertisementSlider: لا توجد إعلانات للعرض');
    console.log('ℹ️ الهدف المحدد:', target);
    console.log('ℹ️ API URL المستخدم:', process.env.REACT_APP_API_URL);
    
    // إذا لم توجد إعلانات، لا تظهر أي شيء (مثل المستخدم)
    return null;
  }

  console.log('🎯 AdvertisementSlider: عرض الإعلانات، العدد:', advertisements.length, 'المؤشر الحالي:', currentIndex);
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '300px', // زيادة الارتفاع من 200px إلى 300px
      margin: '1rem 0',
      borderRadius: '16px', // زيادة border radius
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)', // ظل أفضل
      border: '3px solid #e0e0e0', // حدود واضحة
      maxWidth: '800px', // عرض أقصى للصور
      marginLeft: 'auto',
      marginRight: 'auto'
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
            objectFit: 'contain', // تغيير من 'cover' إلى 'contain' لضمان ظهور الصورة كاملة
            objectPosition: 'center', // توسيط الصورة
            backgroundColor: '#f8f9fa' // خلفية فاتحة للصورة
          }}
          onError={(e) => {
            console.error('❌ فشل تحميل صورة الإعلان:', advertisements[currentIndex]?.image);
            e.target.style.display = 'none';
          }}
          onLoad={() => {
            console.log('✅ تم تحميل صورة الإعلان بنجاح:', advertisements[currentIndex]?.image);
          }}
        />
        
        {/* معلومات الإعلان */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', // خلفية أغمق
          color: 'white',
          padding: '1.5rem', // زيادة padding
          textAlign: 'right'
        }}>
          <h3 style={{ 
            margin: '0 0 0.8rem 0', 
            fontSize: '1.3rem', // زيادة حجم العنوان
            fontWeight: '700',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)' // ظل للنص
          }}>
            {advertisements[currentIndex]?.title || 'عنوان الإعلان'}
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: '1rem', // زيادة حجم الوصف
            opacity: 0.95,
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)', // ظل للنص
            lineHeight: '1.4'
          }}>
            {advertisements[currentIndex]?.description || 'وصف الإعلان'}
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
              left: '15px', // زيادة المسافة من الحواف
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.6)', // خلفية أغمق
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '50px', // زيادة حجم الأزرار
              height: '50px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem', // زيادة حجم السهم
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(0,0,0,0.8)';
              e.target.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(0,0,0,0.6)';
              e.target.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            ‹
          </button>
          
          <button
            onClick={goToNext}
            style={{
              position: 'absolute',
              right: '15px', // زيادة المسافة من الحواف
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.6)', // خلفية أغمق
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '50px', // زيادة حجم الأزرار
              height: '50px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem', // زيادة حجم السهم
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(0,0,0,0.8)';
              e.target.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(0,0,0,0.6)';
              e.target.style.transform = 'translateY(-50%) scale(1)';
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
          bottom: '20px', // زيادة المسافة من الأسفل
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '12px' // زيادة المسافة بين المؤشرات
        }}>
          {advertisements.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: '16px', // زيادة حجم المؤشرات
                height: '16px',
                borderRadius: '50%',
                border: 'none',
                background: index === currentIndex ? 'white' : 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
              onMouseEnter={(e) => {
                if (index !== currentIndex) {
                  e.target.style.background = 'rgba(255,255,255,0.8)';
                  e.target.style.transform = 'scale(1.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (index !== currentIndex) {
                  e.target.style.background = 'rgba(255,255,255,0.6)';
                  e.target.style.transform = 'scale(1)';
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvertisementSlider;
