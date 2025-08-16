import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ar } from 'date-fns/locale';
// استيراد swiper/react بالطريقة الحديثة
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { useTranslation } from 'react-i18next';

function DoctorDetails() {
  const { id } = useParams();
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState('');
  const [booking, setBooking] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]);
  const { t } = useTranslation();
  const specialties = t('specialties', { returnObjects: true }) || [];
  const provinces = t('provinces', { returnObjects: true }) || [];
  const weekdays = t('weekdays_array', { returnObjects: true }) || ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const months = t('months', { returnObjects: true }) || [
    'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
    'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'
  ];
  const [showImageModal, setShowImageModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [migratingImage, setMigratingImage] = useState(false);

  // مسح الكاش عند تحميل الصفحة
  useEffect(() => {
    // إجبار المتصفح على تحميل الملفات الجديدة
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
  }, []);

  // دالة مساعدة لمسار صورة الدكتور
  const getImageUrl = (doctor) => {
    // التحقق من كلا الحقلين: image و profileImage
    const img = doctor.image || doctor.profileImage;
    if (!img) {
      // إرجاع شعار المشروع كصورة افتراضية
      return '/logo.png';
    }
    
    // إذا كانت الصورة من Cloudinary (تبدأ بـ https://res.cloudinary.com)
    if (img.startsWith('https://res.cloudinary.com')) {
      return img;
    }
    
    // إذا كانت الصورة محلية (تبدأ بـ /uploads/)
    if (img.startsWith('/uploads/')) {
      // محاولة تحميل الصورة الحقيقية من الخادم
      return process.env.REACT_APP_API_URL + img;
    }
    
    // إذا كانت الصورة رابط كامل
    if (img.startsWith('http')) {
      return img;
    }
    
    // إرجاع شعار المشروع كصورة افتراضية
    return '/logo.png';
  };

  // التحقق من حالة تسجيل الدخول والتوجيه
  useEffect(() => {
    // انتظار حتى يتم تحميل AuthContext بالكامل
    if (authLoading) return;
    
    // التحقق من وجود بيانات المستخدم في localStorage أو وجود user/profile
    const savedUser = localStorage.getItem('user');
    const savedProfile = localStorage.getItem('profile');
    const hasUser = user || profile;
    const hasSavedData = savedUser || savedProfile;
    
    // إذا لم يكن هناك بيانات محفوظة ولا user، توجيه لصفحة تسجيل الدخول
    if (!hasSavedData && !hasUser) {
      const currentUrl = window.location.pathname + window.location.search;
      navigate(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }
  }, [user, profile, navigate, authLoading]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/doctors`)
      .then(res => res.json())
      .then(data => {
        const found = data.find(d => d._id === id);
        setDoctor(found);
        setLoading(false);
      })
      .catch(err => {
        setError(t('error_fetching_doctor_data'));
        setLoading(false);
      });
  }, [id]);

  // دالة تحويل الصورة المحلية إلى Cloudinary
  const migrateImageToCloudinary = async () => {
    if (!doctor) return;
    
    const imagePath = doctor.image || doctor.profileImage;
    if (!imagePath || !imagePath.startsWith('/uploads/')) {
      alert('لا توجد صورة محلية للتحويل');
      return;
    }

    if (!window.confirm('هل تريد تحويل هذه الصورة إلى Cloudinary؟')) {
      return;
    }

    setMigratingImage(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/migrate-single-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imagePath,
          userId: doctor._id,
          userType: 'doctor'
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('تم تحويل الصورة إلى Cloudinary بنجاح!');
        // إعادة تحميل بيانات الطبيب
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

  // استخراج الأيام المتاحة من workTimes
  const getAvailableDays = () => {
    if (!doctor?.workTimes || !Array.isArray(doctor.workTimes)) return [];
    return doctor.workTimes.map(wt => wt.day).filter(Boolean);
  };

  // تقسيم الفترة الزمنية إلى مواعيد منفصلة حسب مدة الموعد الافتراضية للطبيب
  const generateTimeSlots = (from, to) => {
    const slots = [];
    if (typeof from !== 'string' || typeof to !== 'string') {
      return [];
    }
    try {
      const start = new Date(`2000-01-01 ${from}`);
      const end = new Date(`2000-01-01 ${to}`);
      // استخدم مدة الموعد الافتراضية للطبيب أو 30 دقيقة كافتراضي
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
  };

  // جلب المواعيد المحجوزة لطبيب معين في تاريخ محدد
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

  // عند اختيار يوم بالتقويم، أظهر الأوقات المتاحة لذلك اليوم
  useEffect(() => {
    if (!selectedDate || !doctor?.workTimes) {
      setAvailableTimes([]);
      setBookedTimes([]);
      return;
    }
    
    // التحقق من أن اليوم ليس يوم إجازة
    if (!isDayAvailable(selectedDate)) {
      setAvailableTimes([]);
      setBookedTimes([]);
      return;
    }
    
    // ترتيب الأيام حسب جافاسكريبت: الأحد=0، الاثنين=1، ... السبت=6
    const weekDays = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    const dayName = weekDays[selectedDate.getDay()];
    const times = doctor.workTimes.filter(wt => wt.day === dayName);
    
    
    
    // تقسيم كل فترة زمنية إلى مواعيد منفصلة
    const allSlots = [];
    times.forEach(wt => {
      if (wt.from && wt.to) {
        const slots = generateTimeSlots(wt.from, wt.to);
        allSlots.push(...slots);
      }
    });
    
    
    setAvailableTimes(allSlots);
    setSelectedTime('');
    
    // جلب المواعيد المحجوزة لهذا اليوم - إصلاح مشكلة المنطقة الزمنية
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    fetchBookedAppointments(doctor._id, dateString);
  }, [selectedDate, doctor]);

  // تحديد الأيام المتاحة للتقويم
  const isDayAvailable = date => {
    // ترتيب الأيام حسب جافاسكريبت: الأحد=0، الاثنين=1، ... السبت=6
    const weekDays = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    const dayName = weekDays[date.getDay()];
    
    // التحقق من أن اليوم ضمن أيام العمل الأسبوعية
    if (!getAvailableDays().includes(dayName)) {
      return false;
    }
    
    // التحقق من أيام الإجازات
    if (doctor?.vacationDays && Array.isArray(doctor.vacationDays)) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 1-12
      const day = date.getDate();
      
      for (const vacation of doctor.vacationDays) {
        // التحقق من الإجازة اليومية (التاريخ كاملاً)
        if (vacation) {
          let vacationDate;
          
          // التعامل مع البيانات القديمة والجديدة
          if (typeof vacation === 'string') {
            // البيانات الجديدة - تاريخ كسلسلة نصية
            vacationDate = new Date(vacation);
          } else if (vacation && typeof vacation === 'object' && vacation.date) {
            // البيانات القديمة - كائن مع حقل date
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
  };

  const handleBook = async (e) => {
    e.preventDefault();
    
    // فحص البيانات قبل الإرسال
    if (!user?._id) {
      // توجيه المستخدم لصفحة التسجيل مع حفظ الرابط الحالي
      const currentUrl = window.location.pathname + window.location.search;
      console.log('🔄 DoctorDetails: توجيه المستخدم غير المسجل لصفحة التسجيل مع redirect:', currentUrl);
      navigate(`/signup?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }
    
    if (!selectedDate || !selectedTime) {
      setSuccess('يرجى اختيار التاريخ والوقت');
      return;
    }
    
    setBooking(true);
    setSuccess('');
    
    // إصلاح مشكلة المنطقة الزمنية في حجز الموعد
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
const bookingData = {
      userId: user._id,
      doctorId: doctor._id,
      userName: profile?.first_name || 'مستخدم',
      doctorName: doctor.name,
      date: dateString,
      time: selectedTime,
      reason: reason || '',
      duration: doctor?.appointmentDuration || 30 // إرسال مدة الموعد الافتراضية للطبيب
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
      } else {
        setSuccess(data.error || t('error_booking_appointment'));
      }
    } catch (err) {
              setSuccess(t('error_booking_appointment'));
    }
    setBooking(false);
  };

  if (authLoading) return <div style={{textAlign:'center', marginTop:40}}>جاري التحقق من حالة تسجيل الدخول...</div>;
  if (loading) return <div style={{textAlign:'center', marginTop:40}}>جاري التحميل...</div>;
  if (error || !doctor) return <div style={{textAlign:'center', marginTop:40, color:'#e53935'}}>{error || 'لم يتم العثور على الطبيب'}</div>;

  return (
    <div style={{
      background: `linear-gradient(135deg, rgba(0, 188, 212, 0.7) 0%, rgba(0, 150, 136, 0.7) 100%), url('/images/det.jpg?v=${Date.now()}') center center/cover no-repeat`,
      minHeight: '100vh',
      position: 'relative'
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
      
      {/* مودال تكبير الصورة */}
      {showImageModal && (
        <div onClick={()=>setShowImageModal(false)} style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10000}}>
          <div style={{position:'relative', background:'none'}} onClick={e=>e.stopPropagation()}>
                          <img 
                src={getImageUrl(doctor)} 
                alt={doctor.name} 
                onError={(e) => {
                  // إذا فشل تحميل الصورة الحقيقية، استخدم شعار المشروع
                  e.target.src = '/logo.png';
                }}
                style={{maxWidth:'90vw', maxHeight:'80vh', borderRadius:18, boxShadow:'0 4px 32px #0008'}} 
              />
            <button onClick={()=>setShowImageModal(false)} style={{position:'absolute', top:10, left:10, background:'#e53935', color:'#fff', border:'none', borderRadius:8, fontSize:22, fontWeight:900, padding:'0.2rem 0.8rem', cursor:'pointer'}}>×</button>
          </div>
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

      <div style={{
        maxWidth: window.innerWidth < 500 ? '92vw' : 480, 
        margin: window.innerWidth < 500 ? '0.8rem auto' : '1.5rem auto', 
        background:'#fff', 
        borderRadius: window.innerWidth < 500 ? 10 : 16, 
        boxShadow:'0 2px 12px #7c4dff22', 
        padding: window.innerWidth < 500 ? '1.2rem 0.8rem' : '2rem 1.5rem', 
        position:'relative', 
        zIndex:1
      }}>
        {/* زر نسخ رابط صفحة الدكتور */}
        <div style={{display:'flex', justifyContent:'flex-end', marginBottom:8}}>
          <button
            onClick={() => {
              const currentUrl = window.location.href;
              navigator.clipboard.writeText(currentUrl).then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
              }).catch(() => {
                // Fallback for older browsers
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
              background: copySuccess ? '#4caf50' : 'linear-gradient(135deg, #00bcd4 0%, #009688 100%)',
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
              boxShadow: '0 2px 8px rgba(0, 188, 212, 0.2)'
            }}
            onMouseEnter={(e) => {
              if (!copySuccess) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 188, 212, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!copySuccess) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(0, 188, 212, 0.2)';
              }
            }}
          >
            {copySuccess ? '✅ تم نسخ الرابط!' : '📋 نسخ الرابط'}
          </button>
        </div>
        {copySuccess && <div style={{color:'#00c853', textAlign:'center', fontWeight:700, marginBottom:8}}>تم نسخ الرابط!</div>}
        
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap: window.innerWidth < 500 ? 6 : 10}}>
          {/* صورة الطبيب */}
          <img 
            src={getImageUrl(doctor)} 
            alt={doctor.name} 
            onError={(e) => {
              // إذا فشل تحميل الصورة الحقيقية، استخدم شعار المشروع
              e.target.src = '/logo.png';
            }}
            style={{
              width: window.innerWidth < 500 ? 60 : 80, 
              height: window.innerWidth < 500 ? 60 : 80, 
              borderRadius:'50%', 
              objectFit:'cover', 
              border:'2px solid #7c4dff', 
              cursor:'pointer'
            }} 
            title="اضغط لتكبير الصورة" 
            onClick={()=>setShowImageModal(true)} 
          />
          
          {/* اسم الطبيب والتخصص */}
          <div style={{
            fontWeight:900, 
            fontSize: window.innerWidth < 500 ? 18 : 22, 
            color:'#222',
            textAlign: 'center'
          }}>
            {doctor.name}
          </div>
          <div style={{
            color:'#495057', 
            fontWeight:700, 
            fontSize: window.innerWidth < 500 ? 13 : 16,
            textAlign: 'center'
          }}>
            {specialties[doctor.specialty] || doctor.specialty}
          </div>
          <div style={{
            fontSize: window.innerWidth < 500 ? 12 : 14, 
            color:'#666',
            textAlign: 'center',
            marginTop: 8
          }}>
            <span role="img" aria-label="governorate" style={{fontSize: '1.2em', marginRight: '4px'}}>🏛️</span> 
            <span style={{fontWeight: 600, color: '#495057'}}>{provinces[doctor.province] || doctor.province}</span> 
            &nbsp;&nbsp;
            <span role="img" aria-label="area" style={{fontSize: '1.2em', marginRight: '4px'}}>📍</span> 
            <span style={{fontWeight: 600, color: '#495057'}}>{doctor.area}</span>
          </div>
          {doctor.clinicLocation && (
            <div style={{
              color:'#495057', 
              fontSize: window.innerWidth < 500 ? 13 : 15, 
              marginTop: 12,
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              <span style={{fontSize: '1.2em'}}>🏥</span>
              <span style={{fontWeight: 600}}>{t('clinic_location_label')}:</span>
              <span style={{fontWeight: 700, color: '#495057'}}>{doctor.clinicLocation}</span>
            </div>
          )}
          {doctor.mapLocation && (
            <div style={{marginTop: 12}}>
              <button
                onClick={() => window.open(doctor.mapLocation, '_blank')}
                style={{
                  background: 'linear-gradient(135deg, #00bcd4 0%, #009688 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 16,
                  padding: window.innerWidth < 500 ? '0.8rem 1.5rem' : '1rem 2rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: window.innerWidth < 500 ? 13 : 15,
                  boxShadow: '0 4px 12px rgba(0, 188, 212, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                      gap: 10,
                  margin: '0 auto',
                  transition: 'all 0.3s ease',
                  transform: 'translateY(0)'
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
                <span style={{fontSize: '1.3em'}}>🗺️</span> {t('open_map_location')}
              </button>
            </div>
          )}
          {doctor.phone && (
            <div style={{
              color:'#495057', 
              fontSize: window.innerWidth < 500 ? 13 : 15, 
              marginTop: 12,
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <span style={{fontSize: '1.2em'}}>📞</span>
              <span style={{fontWeight: 600}}>{t('phone_label')}:</span>
              <span style={{fontWeight: 700, color: '#495057'}}>{doctor.phone}</span>
            </div>
          )}
          {doctor.about && (
            <div style={{
              color:'#495057', 
              fontSize: window.innerWidth < 500 ? 13 : 15, 
              marginTop: 16, 
              textAlign:'center', 
              lineHeight:1.6
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <span style={{fontSize: '1.3em'}}>👨‍⚕️</span>
                <span style={{fontWeight: 700, color: '#495057'}}>{t('about_doctor_label')}:</span>
              </div>
              <div style={{
                color: '#495057',
                fontWeight: 500,
                lineHeight: 1.7
              }}>
                {doctor.about}
              </div>
            </div>
          )}
          
          {/* زر حجز لمستخدم آخر */}
          <button
            onClick={() => setShowNoteModal(true)}
            style={{
              background: 'linear-gradient(135deg, #00bcd4 0%, #009688 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 16,
              padding: window.innerWidth < 500 ? '0.8rem 1.5rem' : '1rem 2rem',
              fontWeight: 700,
              fontSize: window.innerWidth < 500 ? 13 : 15,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 188, 212, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: window.innerWidth < 500 ? 12 : 16,
              transition: 'all 0.3s ease',
              transform: 'translateY(0)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(0, 188, 212, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 188, 212, 0.3)';
            }}
          >
            <span style={{fontSize: '1.2em'}}>📝</span> {window.innerWidth < 500 ? t('book_for_other_user_short') : t('book_for_other_user')}
          </button>
        </div>
        
        {/* الأوقات المتاحة */}
        <div style={{marginTop: window.innerWidth < 500 ? 15 : 25}}>
          <div style={{
            fontWeight:700, 
            fontSize: window.innerWidth < 500 ? 14 : 16, 
            color:'#7c4dff', 
            marginBottom:8,
            textAlign: 'center'
          }}>
            {t('choose_booking_day')}
          </div>
          {/* شريط أيام الأسبوع بالكردية */}
          <div style={{
            display:'flex', 
            justifyContent:'space-between', 
            margin:'0 0 4px 0', 
            fontWeight:700, 
            color:'#7c4dff', 
            fontSize: window.innerWidth < 500 ? 10 : 13
          }}>
            {weekdays.map(day => (
              <div key={day} style={{width:'14.2%', textAlign:'center'}}>{day}</div>
            ))}
          </div>
          {/* اسم الشهر والسنة بالكردية */}
          {selectedDate && (
            <div style={{
              textAlign:'center', 
              color:'#009688', 
              fontWeight:800, 
              fontSize: window.innerWidth < 500 ? 15 : 17, 
              marginBottom:4
            }}>
              {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </div>
          )}
          {/* التقويم الشهري الافتراضي بدون تخصيص */}
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
          {selectedDate && availableTimes.length > 0 && (
            <div style={{marginTop: window.innerWidth < 500 ? 12 : 18}}>
              <div style={{
                fontWeight:700, 
                fontSize: window.innerWidth < 500 ? 14 : 16, 
                color:'#7c4dff', 
                marginBottom:8
              }}>
                اختر موعد الحجز:
              </div>
              <div style={{
                display:'flex', 
                flexWrap:'wrap', 
                gap: window.innerWidth < 500 ? 6 : 8
              }}>
                {availableTimes.map((time, idx) => {
                  const isBooked = bookedTimes.includes(time);
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isBooked}
                      onClick={()=>!isBooked && setSelectedTime(time)}
                      style={{
                        background: isBooked ? '#f5f5f5' : (selectedTime === time ? 'linear-gradient(135deg, #00bcd4 0%, #009688 100%)' : '#f0f0f0'),
                        color: isBooked ? '#999' : (selectedTime === time ? '#fff' : '#333'),
                        border:'none', 
                        borderRadius:12, 
                        padding: window.innerWidth < 500 ? '0.6rem 1rem' : '0.8rem 1.2rem', 
                        fontWeight:700, 
                        fontSize: window.innerWidth < 500 ? 12 : 14, 
                        cursor: isBooked ? 'not-allowed' : 'pointer', 
                        boxShadow: selectedTime === time ? '0 2px 8px rgba(0, 188, 212, 0.3)' : '0 1px 4px #00000022',
                        transition:'all 0.2s ease', 
                        minWidth: window.innerWidth < 500 ? 70 : 80, 
                        textAlign:'center',
                        opacity: isBooked ? 0.6 : 1
                      }}
                    >
                      {time} {isBooked && '(محجوز)'}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        {/* نموذج الحجز */}
        <form onSubmit={handleBook} style={{
          marginTop: window.innerWidth < 500 ? 10 : 15, 
          display:'flex', 
          flexDirection:'column', 
          gap: window.innerWidth < 500 ? 6 : 8
        }}>
          <input type="hidden" value={selectedDate ? selectedDate.toISOString().slice(0,10) : ''} />
          <input type="hidden" value={selectedTime} />
          <label style={{
            fontSize: window.innerWidth < 500 ? 12 : 14,
            fontWeight: 600,
            color: '#333',
            textAlign: 'center'
          }}>
            {t('reason_optional')}
          </label>
          <textarea 
            value={reason} 
            onChange={e=>setReason(e.target.value)} 
            rows={2} 
            style={{
              padding: window.innerWidth < 500 ? 5 : 7, 
              borderRadius:6, 
              border:'2px solid #00bcd4', 
              outline:'none', 
              fontSize: window.innerWidth < 500 ? 12 : 14, 
              minHeight: window.innerWidth < 500 ? 35 : 40, 
              background:'#f7fafd'
            }} 
          />
          <button 
            type="submit" 
            disabled={booking || !selectedDate || !selectedTime} 
            style={{
              background: booking || !selectedDate || !selectedTime ? '#ccc' : 'linear-gradient(135deg, #00bcd4 0%, #009688 100%)',
              color:'#fff', 
              border:'none', 
              borderRadius:16, 
              padding: window.innerWidth < 500 ? '0.8rem 1.5rem' : '1rem 2rem', 
              fontWeight:700, 
              fontSize: window.innerWidth < 500 ? 14 : 16, 
              cursor: booking || !selectedDate || !selectedTime ? 'not-allowed' : 'pointer', 
              marginTop:12,
              boxShadow: booking || !selectedDate || !selectedTime ? 'none' : '0 4px 12px rgba(0, 188, 212, 0.3)',
              transition: 'all 0.3s ease',
              transform: 'translateY(0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (!booking && selectedDate && selectedTime) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(0, 188, 212, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = booking || !selectedDate || !selectedTime ? 'none' : '0 4px 12px rgba(0, 188, 212, 0.3)';
            }}
          >
            <span style={{fontSize: '1.2em'}}>📅</span>
            {booking ? t('booking_in_progress') : t('book_appointment_button')}
          </button>
          {success && (
            <div style={{
              color:'#00c853', 
              fontWeight:700, 
              marginTop:8,
              fontSize: window.innerWidth < 500 ? 14 : 16
            }}>
              {success}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default DoctorDetails; 