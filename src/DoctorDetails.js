import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ar } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { formatNotificationDate } from './utils/dateUtils';
import StarRating from './components/StarRating';
import './DoctorDetails.css';
import { getTranslatedSpecialty } from './utils/specialtyTranslation';

function DoctorDetails() {
  const { id } = useParams();
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(() => {
    // محاولة استرجاع بيانات الطبيب من localStorage عند إعادة التحميل
    const savedDoctor = localStorage.getItem('currentDoctor');
    const savedDoctorId = localStorage.getItem('currentDoctorId');
    if (savedDoctor && savedDoctorId === id) {
      try {
        return JSON.parse(savedDoctor);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(() => {
    // إذا كانت هناك بيانات محفوظة، لا نعرض شاشة التحميل
    const savedDoctor = localStorage.getItem('currentDoctor');
    const savedDoctorId = localStorage.getItem('currentDoctorId');
    return !(savedDoctor && savedDoctorId === id);
  });
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [success, setSuccess] = useState('');
  const [booking, setBooking] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]);
  const { t, i18n } = useTranslation();
  // استخدام specialty_categories الجديدة للترجمة المتعددة اللغات
  const specialtyCategories = t('specialty_categories', { returnObjects: true }) || [];
  
  // الاحتفاظ بـ specialties القديمة كـ fallback
  const specialties = (t('specialties', { returnObjects: true }) && Array.isArray(t('specialties', { returnObjects: true }))) ? t('specialties', { returnObjects: true }) : [];
  
  // دالة لترجمة التخصص
  const translateSpecialty = (specialty) => {
    return getTranslatedSpecialty(
      specialty, 
      specialtyCategories, 
      specialties, 
      i18n.language
    );
  };
  const provinces = (t('provinces', { returnObjects: true }) && Array.isArray(t('provinces', { returnObjects: true }))) ? t('provinces', { returnObjects: true }) : [];
  const weekdays = (t('weekdays', { returnObjects: true }) && Array.isArray(t('weekdays', { returnObjects: true }))) ? t('weekdays', { returnObjects: true }) : 
                   (t('weekdays_array', { returnObjects: true }) && Array.isArray(t('weekdays_array', { returnObjects: true }))) ? t('weekdays_array', { returnObjects: true }) : 
                   ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const months = (t('months', { returnObjects: true }) && Array.isArray(t('months', { returnObjects: true }))) ? t('months', { returnObjects: true }) : [
    'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
    'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'
  ];
  const [showImageModal, setShowImageModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [isBookingForOther, setIsBookingForOther] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [migratingImage, setMigratingImage] = useState(false);
  const [showAppRedirect, setShowAppRedirect] = useState(false);
  const [currentPage, setCurrentPage] = useState('info');
  
  // حالات التقييمات
  const [ratings, setRatings] = useState([]);
  const [userRating, setUserRating] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);

  const checkAppInstalled = useCallback(() => {
    const deepLink = `tabibiq://doctor/${id}`;
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    iframe.src = deepLink;
    
    setTimeout(() => {
      document.body.removeChild(iframe);
      setShowAppRedirect(true);
      
      setTimeout(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent)) {
          window.location.href = 'https://apps.apple.com/app/tabibiq/id123456789';
        } else if (/android/.test(userAgent)) {
          window.location.href = 'https://play.google.com/store/apps/details?id=com.tabibiq.app';
        }
      }, 3000);
    }, 1000);
  }, [id]);

  const openApp = () => {
    const shouldOpen = window.confirm('هل تريد فتح التطبيق؟');
    if (shouldOpen) {
      const deepLink = `tabibiq://doctor/${id}`;
      window.location.href = deepLink;
    }
  };

  const openAppStore = () => {
    const shouldOpen = window.confirm('هل تريد الانتقال إلى متجر التطبيقات لتحميل التطبيق؟');
    if (shouldOpen) {
      const userAgent = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        window.location.href = 'https://apps.apple.com/app/tabibiq/id123456789';
      } else if (/android/.test(userAgent)) {
        window.location.href = 'https://play.google.com/store/apps/details?id=com.tabibiq.app';
      }
    }
  };

  useEffect(() => {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    checkAppInstalled();
  }, [id, checkAppInstalled]);

  const getImageUrl = (doctor) => {
    const img = doctor.image || doctor.profileImage;
    if (!img) return '/logo.png';
    if (img.startsWith('https://res.cloudinary.com')) return img;
    if (img.startsWith('/uploads/')) return process.env.REACT_APP_API_URL + img;
    if (img.startsWith('http')) return img;
    return '/logo.png';
  };

  useEffect(() => {
    // لا نتحقق من المصادقة إلا بعد انتهاء التحميل
    if (authLoading) return;
    
    // انتظار قليل للتأكد من تحميل البيانات من localStorage
    const checkAuth = () => {
      const savedUser = localStorage.getItem('user');
      const savedProfile = localStorage.getItem('profile');
      const hasUser = user || profile;
      const hasSavedData = savedUser || savedProfile;
      
      // إذا لم تكن هناك بيانات محفوظة ولا مستخدم حالي، أعد التوجيه
      if (!hasSavedData && !hasUser) {
        const currentUrl = window.location.pathname + window.location.search;
        navigate(`/login?redirect=${encodeURIComponent(currentUrl)}`);
        return;
      }
    };
    
    // تأخير قصير للتأكد من تحميل البيانات
    const timeoutId = setTimeout(checkAuth, 100);
    
    return () => clearTimeout(timeoutId);
  }, [user, profile, navigate, authLoading]);

  useEffect(() => {
    // حفظ معرف الطبيب في localStorage للاستخدام عند إعادة التحميل
    if (id) {
      localStorage.setItem('currentDoctorId', id);
    }
    
    fetch(`${process.env.REACT_APP_API_URL}/doctors`)
      .then(res => res.json())
      .then(data => {
        const found = data.find(d => d._id === id);
        if (found) {
          setDoctor(found);
          // حفظ بيانات الطبيب في localStorage
          localStorage.setItem('currentDoctor', JSON.stringify(found));
        } else {
          setError('الطبيب غير موجود');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching doctor:', err);
        setError(t('error_fetching_doctor_data'));
        setLoading(false);
      });
  }, [id, t]);

  const fetchRatings = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ratings/doctor/${id}`);
      const data = await response.json();
      if (response.ok) {
        setRatings(data.ratings || []);
      }
    } catch (err) {
      console.error('Error fetching ratings:', err);
    }
  }, [id]);

  const fetchUserRating = useCallback(async () => {
    if (!user?._id) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ratings/doctor/${id}?userId=${user._id}`);
      const data = await response.json();
      if (response.ok && data.ratings.length > 0) {
        setUserRating(data.ratings[0]);
      }
    } catch (err) {
      console.error('Error fetching user rating:', err);
    }
  }, [id, user?._id]);

  // جلب التقييمات
  useEffect(() => {
    if (id) {
      fetchRatings();
      if (user?._id) {
        fetchUserRating();
      }
    }
  }, [id, user?._id, fetchRatings, fetchUserRating]);

  // تنظيف البيانات المحفوظة عند مغادرة الصفحة
  useEffect(() => {
    return () => {
      // تنظيف البيانات المحفوظة عند مغادرة المكون
      localStorage.removeItem('currentDoctor');
      localStorage.removeItem('currentDoctorId');
    };
  }, []);

  const handleRatingSubmit = async (rating) => {
    if (!user?._id) {
      alert('يجب تسجيل الدخول لتقييم الطبيب');
      return;
    }

    setRatingLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?._id || profile?._id,
          doctorId: id,
          rating: rating,
          comment: ratingComment
        })
      });

      const data = await response.json();
      if (response.ok) {
        setUserRating(data.rating);
        setShowRatingModal(false);
        setRatingComment('');
        // تحديث بيانات الطبيب
        fetch(`${process.env.REACT_APP_API_URL}/doctors`)
          .then(res => res.json())
          .then(doctorsData => {
            const updatedDoctor = doctorsData.find(d => d._id === id);
            if (updatedDoctor) {
              setDoctor(updatedDoctor);
            }
          });
        // إعادة جلب التقييمات
        fetchRatings();
      } else {
        alert(data.error || 'حدث خطأ أثناء إرسال التقييم');
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setRatingLoading(false);
    }
  };

  const migrateImageToCloudinary = async () => {
    if (!doctor) return;
    const imagePath = doctor.image || doctor.profileImage;
    if (!imagePath || !imagePath.startsWith('/uploads/')) {
      alert('لا توجد صورة محلية للتحويل');
      return;
    }
    if (!window.confirm('هل تريد تحويل هذه الصورة إلى Cloudinary؟')) return;
    setMigratingImage(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/migrate-single-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagePath,
          userId: doctor._id,
          userType: 'doctor'
        })
      });
      const data = await response.json();
      if (response.ok) {
        alert('تم تحويل الصورة إلى Cloudinary بنجاح!');
        window.location.reload();
      } else {
        alert('حدث خطأ أثناء تحويل الصورة: ' + (data.error || 'خطأ غير معروف'));
      }
    } catch (error) {
      console.error('خطأ في تحويل الصورة:', error);
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setMigratingImage(false);
    }
  };

  const getAvailableDays = useCallback(() => {
    if (!doctor?.workTimes || !Array.isArray(doctor.workTimes)) return [];
    return doctor.workTimes.map(wt => wt.day).filter(Boolean);
  }, [doctor?.workTimes]);

  const generateTimeSlots = useCallback((from, to) => {
    const slots = [];
    if (typeof from !== 'string' || typeof to !== 'string') return [];
    try {
      const start = new Date(`2000-01-01 ${from}`);
      const end = new Date(`2000-01-01 ${to}`);
      const duration = doctor?.appointmentDuration ? Number(doctor.appointmentDuration) : 30;
      while (start < end) {
        const timeString = start.toTimeString().slice(0, 5);
        slots.push(timeString);
        start.setMinutes(start.getMinutes() + duration);
      }
    } catch (error) {
      return [];
    }
    return slots;
  }, [doctor?.appointmentDuration]);

  const fetchBookedAppointments = async (doctorId, date) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/appointments/${doctorId}/${date}`);
      if (res.ok) {
        const appointments = await res.json();
        if (appointments && Array.isArray(appointments)) {
          const bookedTimeSlots = appointments.map(apt => apt.time);
          setBookedTimes(bookedTimeSlots);
        } else {
          setBookedTimes([]);
        }
      }
    } catch (error) {
      // Error fetching booked appointments
    }
  };

  const isDayAvailable = useCallback(date => {
    const weekDays = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    const dayName = weekDays[date.getDay()];
    
    if (!getAvailableDays().includes(dayName)) return false;
    
    if (doctor?.vacationDays && Array.isArray(doctor.vacationDays)) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      for (const vacation of doctor.vacationDays) {
        if (vacation) {
          let vacationDate;
          if (typeof vacation === 'string') {
            vacationDate = new Date(vacation);
          } else if (vacation && typeof vacation === 'object' && vacation.date) {
            vacationDate = new Date(vacation.date);
          }
          
          if (vacationDate && !isNaN(vacationDate.getTime())) {
            if (vacationDate.getFullYear() === year && 
                vacationDate.getMonth() + 1 === month && 
                vacationDate.getDate() === day) {
              return false;
            }
          }
        }
      }
    }
    return true;
  }, [doctor?.vacationDays, getAvailableDays]);

  useEffect(() => {
    if (!selectedDate || !doctor?.workTimes) {
      setAvailableTimes([]);
      setBookedTimes([]);
      return;
    }
    
    if (!isDayAvailable(selectedDate)) {
      setAvailableTimes([]);
      setBookedTimes([]);
      return;
    }
    
    const weekDays = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    const dayName = weekDays[selectedDate.getDay()];
    const times = doctor.workTimes.filter(wt => wt.day === dayName);
    
    const allSlots = [];
    times.forEach(wt => {
      if (wt.from && wt.to) {
        const slots = generateTimeSlots(wt.from, wt.to);
        allSlots.push(...slots);
      }
    });
    
    setAvailableTimes(allSlots);
    setSelectedTime('');
    
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    fetchBookedAppointments(doctor._id, dateString);
  }, [selectedDate, doctor, generateTimeSlots, isDayAvailable]);

  const handleBook = async (e) => {
    e.preventDefault();
    
    if (!user?._id) {
      const currentUrl = window.location.pathname + window.location.search;
      navigate(`/signup?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }
    
    if (!selectedDate || !selectedTime) {
      setSuccess('يرجى اختيار التاريخ والوقت');
      return;
    }
    
    if (!patientAge) {
      setSuccess(t('common.age_required'));
      return;
    }
    
    if (isBookingForOther && (!patientName || !patientPhone)) {
      setSuccess('يرجى إدخال اسم المريض ورقم الهاتف');
      return;
    }
    
    const ageNum = parseInt(patientAge);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setSuccess(t('common.age_invalid'));
      return;
    }
    
    setBooking(true);
    setSuccess('');
    
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    const bookingData = {
      userId: user?._id || profile?._id,
      doctorId: doctor?._id,
      userName: profile?.first_name || user?.first_name || 'مستخدم',
      doctorName: doctor?.name || 'طبيب',
      date: dateString,
      time: selectedTime,
      reason: reason || '',
      patientAge: parseInt(patientAge),
      duration: doctor?.appointmentDuration || 30,
      isBookingForOther: isBookingForOther,
      patientName: isBookingForOther ? patientName : '',
      patientPhone: isBookingForOther ? patientPhone : '',
      bookerName: profile?.first_name || user?.first_name || 'مستخدم'
    };
    
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccess('تم حجز الموعد بنجاح!');
        setSelectedDate(null);
        setSelectedTime('');
        setReason('');
        setPatientAge('');
        setIsBookingForOther(false);
        setPatientName('');
        setPatientPhone('');
      } else {
        setSuccess(data.error || t('error_booking_appointment'));
      }
    } catch (err) {
      setSuccess(t('error_booking_appointment'));
    }
    setBooking(false);
  };

  // عرض رسالة تحميل فقط إذا لم تكن هناك بيانات محفوظة
  const hasStoredData = localStorage.getItem('user') || localStorage.getItem('profile');
  
  if (authLoading && !hasStoredData) {
    return (
      <div style={{
        textAlign: 'center', 
        marginTop: 40, 
        padding: '20px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        margin: '20px'
      }}>
        جاري التحقق من حالة تسجيل الدخول...
      </div>
    );
  }
  
  if (loading) {
    return (
      <div style={{
        textAlign: 'center', 
        marginTop: 40, 
        padding: '20px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        margin: '20px'
      }}>
        جاري تحميل بيانات الطبيب...
      </div>
    );
  }
  
  if (error || !doctor) {
    return (
      <div style={{
        textAlign: 'center', 
        marginTop: 40, 
        color: '#e53935',
        padding: '20px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        margin: '20px'
      }}>
        {error || 'لم يتم العثور على الطبيب'}
        <br />
        <button 
          onClick={() => window.location.reload()} 
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            background: '#0A8F82',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }
  
  if (doctor && doctor.disabled) {
    return (
      <div style={{
        background: `linear-gradient(135deg, rgba(229, 57, 53, 0.7) 0%, rgba(183, 28, 28, 0.7) 100%), url('/images/det.jpg?v=${Date.now()}') center center/cover no-repeat`,
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: 480, 
          margin: '1.5rem auto', 
          background:'#fff', 
          borderRadius: 16, 
          boxShadow:'0 4px 20px rgba(229, 57, 53, 0.3)', 
          padding: '3rem 2rem', 
          textAlign: 'center',
          border: '2px solid #e53935'
        }}>
          <div style={{fontSize: 60, marginBottom: '1rem'}}>🚫</div>
          <div style={{fontSize: 24, fontWeight: 700, color: '#e53935', marginBottom: '1rem'}}>
            الطبيب غير متاح
          </div>
          <div style={{fontSize: 16, color: '#666', lineHeight: 1.6, marginBottom: '2rem'}}>
            عذراً، هذا الطبيب غير متاح حالياً لحجز المواعيد. يرجى اختيار طبيب آخر من قائمة الأطباء المتاحين.
          </div>
          <button
            onClick={() => navigate('/user-home')}
            style={{
              background: 'linear-gradient(135deg, #00bcd4 0%, #009688 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '1rem 2rem',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 188, 212, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(0, 188, 212, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 188, 212, 0.3)';
            }}
          >
            العودة إلى قائمة الأطباء
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-details-container">
      {/* صفحة معلومات الطبيب */}
      {currentPage === 'info' && (
        <>
          {/* رأس الصفحة مع معلومات الطبيب */}
          <div className="doctor-header">
            <div className="doctor-header-content">
              <img 
                src={getImageUrl(doctor)} 
                alt={doctor.name} 
                onError={(e) => {
                  e.target.src = '/logo.png';
                }}
                className="doctor-avatar"
                title="اضغط لتكبير الصورة" 
                onClick={()=>setShowImageModal(true)} 
              />
              
              <div className="doctor-name">{doctor.name}</div>
              <div className="doctor-specialty">
                {translateSpecialty(doctor.specialty)}
              </div>
              <div className="doctor-location">
                <span role="img" aria-label="governorate">🏛️</span> 
                <span>{provinces[doctor.province] || doctor.province}</span> 
                <span role="img" aria-label="area">📍</span> 
                <span>{doctor.area}</span>
              </div>
              
              {/* عرض التقييم */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
                padding: '0.5rem',
                background: 'rgba(10, 143, 130, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(10, 143, 130, 0.1)'
              }}>
                <StarRating 
                  rating={doctor.averageRating || 0}
                  size="medium"
                  showText={true}
                />
                {doctor.totalRatings > 0 && (
                  <span style={{
                    fontSize: '12px',
                    color: '#666',
                    fontWeight: '500'
                  }}>
                    ({doctor.totalRatings} {t('rating.total_ratings')})
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* قسم معلومات الطبيب */}
          <div className="doctor-info-section">
            <div className="info-grid">
              {doctor.clinicLocation && (
                <div className="info-item">
                  <span className="info-icon">🏥</span>
                  <div className="info-text">
                    <strong>موقع العيادة:</strong> {doctor.clinicLocation}
                  </div>
                </div>
              )}
              {doctor.mapLocation && (
                <div className="info-item">
                  <span className="info-icon">🗺️</span>
                  <div className="info-text">
                    <strong>الموقع على الخريطة:</strong> متاح
                  </div>
                </div>
              )}
            </div>
            
            {doctor.about && (
              <div className="doctor-about">
                <div className="about-title">
                  <span>👨‍⚕️</span>
                  <span>نبذة عن الطبيب</span>
                </div>
                <div className="about-content">{doctor.about}</div>
              </div>
            )}
          </div>
          
          {/* أزرار الإجراءات */}
          <div className="action-buttons">
            <button
              onClick={() => setCurrentPage('booking')}
              className="btn-primary"
            >
              <span>📅</span>
              حجز موعد
            </button>
            <button
              onClick={() => setCurrentPage('ratings')}
              className="btn-secondary"
            >
              <span>⭐</span>
              {t('rating.reviews')}
            </button>
            <button
              onClick={() => navigate(`/book-for-other/${id}`)}
              className="btn-secondary"
            >
              <span>👥</span>
              حجز لشخص آخر
            </button>
            {doctor.mapLocation && (
              <button
                onClick={() => window.open(doctor.mapLocation, '_blank')}
                className="btn-secondary"
              >
                <span>🗺️</span>
                فتح الخريطة
              </button>
            )}
          </div>
        </>
      )}

      {/* صفحة التقييمات */}
      {currentPage === 'ratings' && (
        <>
          {/* رأس صفحة التقييمات */}
          <div className="doctor-header">
            <div className="doctor-header-content">
              <img 
                src={getImageUrl(doctor)} 
                alt={doctor.name} 
                className="doctor-avatar"
              />
              <div className="doctor-info">
                <div className="doctor-name">{doctor.name}</div>
                <div className="doctor-specialty">
                  {translateSpecialty(doctor.specialty)}
                </div>
              </div>
            </div>
          </div>

          {/* قسم التقييمات */}
          <div className="doctor-info-section">
            {/* إحصائيات التقييم */}
            <div style={{
              background: '#fff',
              borderRadius: 12,
              padding: '1.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e0f7fa'
            }}>
              <h3 style={{color: '#0A8F82', marginBottom: '1rem', textAlign: 'center'}}>
                ⭐ {t('rating.average_rating')}
              </h3>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <StarRating 
                  rating={doctor.averageRating || 0}
                  size="large"
                  showText={true}
                />
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{fontSize: '1.5rem', fontWeight: '800', color: '#0A8F82'}}>
                    {doctor.totalRatings || 0}
                  </div>
                  <div style={{fontSize: '14px', color: '#666'}}>
                    {t('rating.total_ratings')}
                  </div>
                </div>
                <div>
                  <div style={{fontSize: '1.5rem', fontWeight: '800', color: '#0A8F82'}}>
                    {doctor.averageRating?.toFixed(1) || '0.0'}
                  </div>
                  <div style={{fontSize: '14px', color: '#666'}}>
                    {t('rating.average_rating')}
                  </div>
                </div>
              </div>
            </div>

            {/* زر التقييم */}
            {user?._id && (
              <div style={{
                background: '#fff',
                borderRadius: 12,
                padding: '1.5rem',
                marginBottom: '1.5rem',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e0f7fa',
                textAlign: 'center'
              }}>
                <h3 style={{color: '#0A8F82', marginBottom: '1rem'}}>
                  {userRating ? t('rating.your_rating') : t('rating.rate_this_doctor')}
                </h3>
                
                {userRating ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <StarRating 
                      rating={userRating.rating}
                      size="large"
                      showText={true}
                    />
                    {userRating.comment && (
                      <div style={{
                        background: 'rgba(10, 143, 130, 0.05)',
                        padding: '0.8rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(10, 143, 130, 0.1)',
                        marginTop: '0.5rem',
                        fontSize: '14px',
                        color: '#333',
                        maxWidth: '400px'
                      }}>
                        "{userRating.comment}"
                      </div>
                    )}
                    <button
                      onClick={() => setShowRatingModal(true)}
                      style={{
                        background: '#0A8F82',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.5rem 1rem',
                        fontSize: '14px',
                        cursor: 'pointer',
                        marginTop: '0.5rem'
                      }}
                    >
                      {t('rating.update_rating')}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowRatingModal(true)}
                    style={{
                      background: '#0A8F82',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '1rem 2rem',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(10, 143, 130, 0.3)'
                    }}
                  >
                    ⭐ {t('rating.rate_this_doctor')}
                  </button>
                )}
              </div>
            )}

            {/* قائمة التقييمات */}
            <div style={{
              background: '#fff',
              borderRadius: 12,
              padding: '1.5rem',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e0f7fa'
            }}>
              <h3 style={{color: '#0A8F82', marginBottom: '1rem'}}>
                📝 {t('rating.reviews')}
              </h3>
              
              {/* رسالة توضيحية */}
              <div style={{
                background: 'rgba(10, 143, 130, 0.1)',
                border: '1px solid rgba(10, 143, 130, 0.2)',
                borderRadius: '8px',
                padding: '0.8rem',
                marginBottom: '1rem',
                fontSize: '14px',
                color: '#0A8F82',
                textAlign: 'center'
              }}>
                💬 {t('rating.comments_private')}
              </div>
              
              {ratings.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#666'
                }}>
                  <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>⭐</div>
                  {t('rating.no_ratings_yet')}
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  {ratings.map((rating, index) => (
                    <div key={rating._id} style={{
                      background: 'rgba(10, 143, 130, 0.05)',
                      borderRadius: '8px',
                      padding: '1rem',
                      border: '1px solid rgba(10, 143, 130, 0.1)'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span style={{
                            fontWeight: '600',
                            color: '#0A8F82'
                          }}>
                            {rating.userId?.first_name || 'مستخدم'}
                          </span>
                          <StarRating 
                            rating={rating.rating}
                            size="small"
                            showText={false}
                          />
                        </div>
                        <span style={{
                          fontSize: '12px',
                          color: '#666'
                        }}>
                          {formatNotificationDate(rating.createdAt, i18n.language)}
                        </span>
                      </div>
                      {/* التعليقات مخفية من العرض العام - تظهر للطبيب فقط */}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
      
      {/* صفحة حجز المواعيد */}
      {currentPage === 'booking' && (
        <>
          {/* رأس صفحة الحجز */}
          <div className="doctor-header">
            <div className="doctor-header-content">
              <img 
                src={getImageUrl(doctor)} 
                alt={doctor.name} 
                onError={(e) => {
                  e.target.src = '/logo.png';
                }}
                className="doctor-avatar"
                style={{width: '60px', height: '60px'}}
              />
              <div className="doctor-name" style={{fontSize: '1.3rem'}}>{doctor.name}</div>
              <div className="doctor-specialty" style={{fontSize: '0.9rem'}}>
                {translateSpecialty(doctor.specialty)}
              </div>
              <button
                onClick={() => setCurrentPage('info')}
                className="btn-secondary"
                style={{marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '0.8rem'}}
              >
                <span>←</span>
                العودة للمعلومات
              </button>
            </div>
          </div>
          
          {/* قسم حجز المواعيد */}
          <div className="booking-section">
            <div className="booking-title">اختر موعد الحجز</div>
            
            {/* التقويم */}
            <div className="calendar-container">
              <div className="weekdays-bar">
                {weekdays.map(day => (
                  <div key={day} className="weekday">{day}</div>
                ))}
              </div>
              
              {selectedDate && (
                <div className="month-year">
                  {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </div>
              )}
              
              <div style={{
                transform: window.innerWidth < 500 ? 'scale(0.9)' : 'scale(1)',
                transformOrigin: 'top center'
              }}>
                <DatePicker
                  selected={selectedDate}
                  onChange={date => setSelectedDate(date)}
                  filterDate={isDayAvailable}
                  placeholderText="اختر يوم متاح..."
                  dateFormat="yyyy-MM-dd"
                  minDate={new Date()}
                  inline
                  locale={ar}
                />
              </div>
            </div>
            
            {/* الأوقات المتاحة */}
            {selectedDate && availableTimes.length > 0 && (
              <div className="time-slots">
                <div className="time-slots-title">اختر موعد الحجز:</div>
                <div className="time-grid">
                  {availableTimes.map((time, idx) => {
                    const isBooked = bookedTimes.includes(time);
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isBooked}
                        onClick={()=>!isBooked && setSelectedTime(time)}
                        className={`time-slot ${selectedTime === time ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
                      >
                        {time} {isBooked && '(محجوز)'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* نموذج الحجز */}
            <form onSubmit={handleBook} className="booking-form">
              <input type="hidden" value={selectedDate ? selectedDate.toISOString().slice(0,10) : ''} />
              <input type="hidden" value={selectedTime} />
              
              {/* مؤشر الحجز لشخص آخر */}
              {isBookingForOther && (
                <div className="booking-type-indicator">
                  <div className="booking-type-title">
                    👥 {t('booking.booking_for_other_person')}
                  </div>
                  <div className="booking-type-details">
                    <strong>{t('booking.patient_name')}:</strong> {patientName} | 
                    <strong> {t('booking.patient_phone')}:</strong> {patientPhone}
                  </div>
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">{t('reason_optional')}</label>
                <textarea 
                  value={reason} 
                  onChange={e=>setReason(e.target.value)} 
                  rows={2} 
                  className="form-input form-textarea"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">{t('common.patient_age')} *</label>
                <input 
                  type="number" 
                  value={patientAge} 
                  onChange={e=>setPatientAge(e.target.value)} 
                  placeholder={t('common.age')}
                  min="1" 
                  max="120"
                  required
                  className="form-input"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={booking || !selectedDate || !selectedTime || !patientAge} 
                className="btn-book"
              >
                <span>📅</span>
                {booking ? t('booking_in_progress') : (isBookingForOther ? t('booking.book_for_other_button') : t('book_appointment_button'))}
              </button>
              
              {success && (
                <div className="success-message">{success}</div>
              )}
              
              {/* زر إلغاء الحجز لشخص آخر */}
              {isBookingForOther && (
                <button
                  type="button"
                  onClick={() => {
                    setIsBookingForOther(false);
                    setPatientName('');
                    setPatientPhone('');
                  }}
                  className="btn-cancel-booking"
                >
                  {t('booking.cancel_booking_for_other')}
                </button>
              )}
            </form>
          </div>
        </>
      )}
      
      {/* مودال تكبير الصورة */}
      {showImageModal && (
        <div onClick={()=>setShowImageModal(false)} style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10000}}>
          <div style={{position:'relative', background:'none'}} onClick={e=>e.stopPropagation()}>
            <img 
              src={getImageUrl(doctor)} 
              alt={doctor.name} 
              onError={(e) => {
                e.target.src = '/logo.png';
              }}
              style={{maxWidth:'90vw', maxHeight:'80vh', borderRadius:18, boxShadow:'0 4px 32px #0008'}} 
            />
            <button onClick={()=>setShowImageModal(false)} style={{position:'absolute', top:10, left:10, background:'#e53935', color:'#fff', border:'none', borderRadius:8, fontSize:22, fontWeight:900, padding:'0.2rem 0.8rem', cursor:'pointer'}}>×</button>
          </div>
        </div>
      )}

      {/* رسالة التوجيه للتطبيق */}
      {showAppRedirect && (
        <div style={{
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          border: '2px solid #2196f3',
          borderRadius: 12,
          padding: '1rem',
          margin: '1rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px #2196f322'
        }}>
          <div style={{fontSize: 16, fontWeight: 600, color: '#1976d2', marginBottom: '0.8rem'}}>
            📱 {t('app_redirect_title') || 'افتح التطبيق للحصول على تجربة أفضل!'}
          </div>
          <div style={{fontSize: 14, color: '#1976d2', marginBottom: '1rem'}}>
            {t('app_redirect_description') || 'يمكنك الوصول لجميع الميزات وحجز المواعيد بسهولة'}
          </div>
          <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap'}}>
            <button 
              onClick={openApp}
              style={{
                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '0.6rem 1.2rem',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px #2196f322'
              }}
            >
              📱 {t('open_app') || 'افتح التطبيق'}
            </button>
            <button 
              onClick={openAppStore}
              style={{
                background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '0.6rem 1.2rem',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px #4caf5022'
              }}
            >
              🛒 {t('download_app') || 'حمل التطبيق'}
            </button>
          </div>
        </div>
      )}

      {/* زر نسخ رابط صفحة الدكتور */}
      <div style={{display:'flex', justifyContent:'flex-end', margin:'1rem'}}>
        <button
          onClick={() => {
            const currentUrl = window.location.href;
            navigator.clipboard.writeText(currentUrl).then(() => {
              setCopySuccess(true);
              setTimeout(() => setCopySuccess(false), 2000);
            }).catch(() => {
              const textArea = document.createElement('textarea');
              textArea.value = currentUrl;
              document.body.appendChild(textArea);
              textArea.select();
              document.execCommand('copy');
              document.body.removeChild(textArea);
              setCopySuccess(true);
              setTimeout(() => setCopySuccess(false), 2000);
            });
          }}
          style={{
            background: copySuccess ? '#0A8F82' : 'linear-gradient(135deg, #0A8F82 0%, #077a6f 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(10, 143, 130, 0.2)'
          }}
          onMouseEnter={(e) => {
            if (!copySuccess) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(10, 143, 130, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(10, 143, 130, 0.2)';
          }}
        >
          {copySuccess ? '✅ تم نسخ الرابط!' : '📋 نسخ الرابط'}
        </button>
      </div>
      {copySuccess && <div style={{color:'#0A8F82', textAlign:'center', fontWeight:700, margin:'0 1rem 1rem'}}>تم نسخ الرابط!</div>}
      
      {/* زر تحويل الصورة إلى Cloudinary (للمطورين فقط) */}
      {(doctor.image?.startsWith('/uploads/') || doctor.profileImage?.startsWith('/uploads/')) && (
        <div style={{textAlign: 'center', margin: '1rem'}}>
          <button
            onClick={migrateImageToCloudinary}
            disabled={migratingImage}
            style={{
              background: migratingImage ? '#ccc' : 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: migratingImage ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease',
              margin: '0 auto'
            }}
          >
            {migratingImage ? (
              <>
                <span style={{fontSize: '1.2em'}}>⏳</span>
                جاري التحويل...
              </>
            ) : (
              <>
                <span style={{fontSize: '1.2em'}}>☁️</span>
                تحويل للـ Cloudinary
              </>
            )}
          </button>
        </div>
      )}

      {/* مودال الملاحظة المهمة */}
      {showNoteModal && (
        <div onClick={()=>setShowNoteModal(false)} style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10000}}>
          <div style={{position:'relative', background:'#fff', borderRadius:16, padding:'2rem', maxWidth:'90vw', maxHeight:'80vh', overflow:'auto'}} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>setShowNoteModal(false)} style={{position:'absolute', top:10, right:10, background:'#e53935', color:'#fff', border:'none', borderRadius:8, fontSize:22, fontWeight:900, padding:'0.2rem 0.8rem', cursor:'pointer'}}>×</button>
            <div style={{
              background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
              border: '2px solid #ffc107',
              borderRadius: 12,
              padding: '1.5rem',
              textAlign: 'center',
              boxShadow: '0 2px 8px #ffc10722'
            }}>
              <div style={{fontSize: 20, fontWeight: 700, color: '#856404', marginBottom: 12}}>
                ⚠️ {t('important_note')}
              </div>
              <div style={{fontSize: 16, color: '#856404', lineHeight: 1.6, marginBottom: 12}}>
                {t('appointment_note')}
              </div>
              <div style={{fontSize: 14, color: '#856404', fontStyle: 'italic'}}>
                💡 {t('profile_update_note')}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* نافذة التقييم */}
      {showRatingModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{
              color: '#0A8F82',
              marginBottom: '1.5rem',
              textAlign: 'center',
              fontSize: '1.5rem'
            }}>
              ⭐ {t('rating.rate_this_doctor')}
            </h3>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              <StarRating 
                rating={0}
                onRatingChange={handleRatingSubmit}
                interactive={!ratingLoading}
                size="large"
                showText={true}
              />
            </div>
            
            {ratingLoading && (
              <div style={{
                textAlign: 'center',
                marginBottom: '1rem',
                color: '#0A8F82',
                fontWeight: '600'
              }}>
                {t('rating.submitting')}...
              </div>
            )}
            
            <div style={{marginBottom: '1.5rem'}}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#0A8F82'
              }}>
                {t('rating.write_review')} (اختياري)
              </label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder={t('rating.review_placeholder')}
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '0.8rem',
                  border: '2px solid #e0f7fa',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                maxLength={500}
              />
              <div style={{
                fontSize: '12px',
                color: '#666',
                textAlign: 'right',
                marginTop: '0.3rem'
              }}>
                {ratingComment.length}/500
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setRatingComment('');
                }}
                style={{
                  background: '#f44336',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.8rem 1.5rem',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorDetails;
