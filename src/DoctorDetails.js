import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  const { user, profile } = useAuth();
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
  const weekdays = t('weekdays', { returnObjects: true }) || ['شەممە', 'یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'هەینی'];
  const months = t('months', { returnObjects: true }) || [
    'کانونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران',
    'تەمموز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانونی یەکەم'
  ];
  const [showImageModal, setShowImageModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  // دالة مساعدة لمسار صورة الدكتور
  const getImageUrl = (doctor) => {
    // التحقق من كلا الحقلين: image و profileImage
    const img = doctor.image || doctor.profileImage;
    if (!img) {
      // إرجاع شعار المشروع كصورة افتراضية
      return '/logo.png';
    }
    if (img.startsWith('/uploads/')) {
      // محاولة تحميل الصورة الحقيقية من الخادم
      return process.env.REACT_APP_API_URL + img;
    }
    if (img.startsWith('http')) return img;
    // إرجاع شعار المشروع كصورة افتراضية
    return '/logo.png';
  };

  // إضافة console.log لرؤية بيانات المستخدم
useEffect(() => {
  // console.log for debugging
}, [user, profile]);

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

  // استخراج الأيام المتاحة من workTimes
  const getAvailableDays = () => {
    if (!doctor?.workTimes) return [];
    return doctor.workTimes.map(wt => wt.day).filter(Boolean);
  };

  // تقسيم الفترة الزمنية إلى مواعيد منفصلة كل 30 دقيقة
  const generateTimeSlots = (from, to) => {
    const slots = [];
    
    // التأكد من أن from و to هما strings
    if (typeof from !== 'string' || typeof to !== 'string') {
      
      return [];
    }
    
    try {
      const start = new Date(`2000-01-01 ${from}`);
      const end = new Date(`2000-01-01 ${to}`);
      
      while (start < end) {
        const timeString = start.toTimeString().slice(0, 5);
        slots.push(timeString);
        start.setMinutes(start.getMinutes() + 30); // كل 30 دقيقة
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
        const bookedTimeSlots = appointments.map(apt => apt.time);
        setBookedTimes(bookedTimeSlots);
  
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
    return getAvailableDays().includes(dayName);
  };

  const handleBook = async (e) => {
    e.preventDefault();
    
    // فحص البيانات قبل الإرسال
    if (!user?._id) {
      setSuccess('يجب تسجيل الدخول أولاً');
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
      reason: reason || ''
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

  if (loading) return <div style={{textAlign:'center', marginTop:40}}>جاري التحميل...</div>;
  if (error || !doctor) return <div style={{textAlign:'center', marginTop:40, color:'#e53935'}}>{error || 'لم يتم العثور على الطبيب'}</div>;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #00bcd4 0%, #009688 100%)',
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
        maxWidth: window.innerWidth < 500 ? '95vw' : 500, 
        margin: window.innerWidth < 500 ? '1rem auto' : '2rem auto', 
        background:'#fff', 
        borderRadius: window.innerWidth < 500 ? 12 : 18, 
        boxShadow:'0 2px 16px #7c4dff22', 
        padding: window.innerWidth < 500 ? '1.5rem 1rem' : '2.5rem 2rem', 
        position:'relative', 
        zIndex:1
      }}>
        {/* زر نسخ رابط صفحة الدكتور */}
        <div style={{display:'flex', justifyContent:'flex-end', marginBottom:8}}>
          <button
            onClick={() => {
              if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(window.location.href)
                  .then(() => {
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000);
                  })
                  .catch(() => {
                    alert('تعذر النسخ تلقائياً. يرجى تحديد الرابط ونسخه يدوياً.');
                  });
              } else {
                // fallback: تحديد النص يدوياً
                const textArea = document.createElement("textarea");
                textArea.value = window.location.href;
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                  document.execCommand('copy');
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 2000);
                } catch (err) {
                  alert('تعذر النسخ تلقائياً. يرجى تحديد الرابط ونسخه يدوياً.');
                }
                document.body.removeChild(textArea);
              }
            }}
            style={{
              background:'#e0f7fa', 
              color:'#009688', 
              border:'1.5px solid #b2dfdb', 
              borderRadius:8, 
              padding: window.innerWidth < 500 ? '0.4rem 0.8rem' : '0.5rem 1.1rem', 
              fontWeight:700, 
              fontSize: window.innerWidth < 500 ? 13 : 15, 
              cursor:'pointer', 
              boxShadow:'0 2px 8px #00bcd422', 
              display:'flex', 
              alignItems:'center', 
              gap:6
            }}
            title="نسخ رابط صفحة الدكتور"
          >
            <span style={{fontSize: window.innerWidth < 500 ? 16 : 18}}>🔗</span> 
            {window.innerWidth < 500 ? 'نسخ' : 'نسخ رابط الصفحة'}
          </button>
        </div>
        {copySuccess && <div style={{color:'#00c853', textAlign:'center', fontWeight:700, marginBottom:8}}>تم نسخ الرابط!</div>}
        
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap: window.innerWidth < 500 ? 8 : 12}}>
          {/* مستطيل ملون لاسم الطبيب والتخصص فقط */}
          <div style={{
            background:'linear-gradient(90deg,#7c4dff 0%,#00bcd4 100%)', 
            borderRadius: window.innerWidth < 500 ? 12 : 16, 
            padding: window.innerWidth < 500 ? '1rem 1.2rem' : '1.2rem 1.5rem', 
            marginBottom: window.innerWidth < 500 ? 12 : 18, 
            width:'100%', 
            maxWidth: window.innerWidth < 500 ? 300 : 340, 
            boxShadow:'0 2px 12px #00bcd422', 
            display:'flex', 
            flexDirection:'column', 
            alignItems:'center'
          }}>
            <div style={{
              fontWeight:900, 
              fontSize: window.innerWidth < 500 ? 18 : 22, 
              color:'#fff', 
              marginBottom:6
            }}>
              {doctor.name}
            </div>
            <div style={{
              color:'#fff', 
              fontWeight:700, 
              fontSize: window.innerWidth < 500 ? 14 : 17, 
              letterSpacing:0.5
            }}>
              {specialties[doctor.specialty] || doctor.specialty}
            </div>
          </div>
          
          {/* باقي المعلومات كما هي */}
          <img 
            src={getImageUrl(doctor)} 
            alt={doctor.name} 
            onError={(e) => {
              // إذا فشل تحميل الصورة الحقيقية، استخدم شعار المشروع
              e.target.src = '/logo.png';
            }}
            style={{
              width: window.innerWidth < 500 ? 70 : 90, 
              height: window.innerWidth < 500 ? 70 : 90, 
              borderRadius:'50%', 
              objectFit:'cover', 
              border:'3px solid #7c4dff', 
              cursor:'pointer'
            }} 
            title="اضغط لتكبير الصورة" 
            onClick={()=>setShowImageModal(true)} 
          />
          <div style={{
            fontWeight:900, 
            fontSize: window.innerWidth < 500 ? 20 : 26, 
            color:'#222'
          }}>
            {doctor.name}
          </div>
          <div style={{
            color:'#7c4dff', 
            fontWeight:700, 
            fontSize: window.innerWidth < 500 ? 15 : 18
          }}>
            {specialties[doctor.specialty] || doctor.specialty}
          </div>
          <div style={{
            fontSize: window.innerWidth < 500 ? 14 : 16, 
            color:'#888'
          }}>
            <span role="img" aria-label="governorate">🏛️</span> {provinces[doctor.province] || doctor.province} &nbsp;
            <span role="img" aria-label="area">📍</span> {doctor.area}
          </div>
          {doctor.clinicLocation && (
            <div style={{
              color:'#444', 
              fontSize: window.innerWidth < 500 ? 13 : 15, 
              marginTop:6
            }}>
              <b>{t('clinic_location_label')}:</b> {doctor.clinicLocation}
            </div>
          )}
          {doctor.mapLocation && (
            <div style={{marginTop: 8}}>
              <button
                onClick={() => window.open(doctor.mapLocation, '_blank')}
                style={{
                  background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: window.innerWidth < 500 ? '0.6rem 1.2rem' : '0.8rem 1.5rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: window.innerWidth < 500 ? 12 : 14,
                  boxShadow: '0 2px 8px #4CAF5033',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  margin: '0 auto'
                }}
              >
                🗺️ {t('open_map_location')}
              </button>
            </div>
          )}
          {doctor.phone && (
            <div style={{
              color:'#444', 
              fontSize: window.innerWidth < 500 ? 13 : 15, 
              marginTop:6
            }}>
              <b>{t('phone_label')}:</b> {doctor.phone}
            </div>
          )}
          {doctor.about && (
            <div style={{
              color:'#333', 
              fontSize: window.innerWidth < 500 ? 14 : 16, 
              marginTop: window.innerWidth < 500 ? 12 : 18, 
              textAlign:'center', 
              lineHeight:1.8, 
              background:'#f7fafd', 
              borderRadius:10, 
              padding: window.innerWidth < 500 ? '0.8rem 0.5rem' : '1rem 0.7rem'
            }}>
              <b>{t('about_doctor_label')}:</b><br/>{doctor.about}
            </div>
          )}
          
          {/* زر حجز لمستخدم آخر */}
          <button
            onClick={() => setShowNoteModal(true)}
            style={{
              background: 'linear-gradient(90deg, #ff9800 0%, #ff5722 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: window.innerWidth < 500 ? '0.6rem 1.2rem' : '0.8rem 1.5rem',
              fontWeight: 600,
              fontSize: window.innerWidth < 500 ? 13 : 15,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: window.innerWidth < 500 ? 8 : 12,
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(255, 152, 0, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(255, 152, 0, 0.3)';
            }}
          >
                         📝 {window.innerWidth < 500 ? t('book_for_other_user_short') : t('book_for_other_user')}
          </button>
        </div>
        
        {/* الأوقات المتاحة */}
        <div style={{marginTop: window.innerWidth < 500 ? 20 : 30}}>
          <div style={{
            fontWeight:700, 
            fontSize: window.innerWidth < 500 ? 16 : 18, 
            color:'#7c4dff', 
            marginBottom:10
          }}>
            {t('choose_booking_day')}
          </div>
          {/* شريط أيام الأسبوع بالكردية */}
          <div style={{
            display:'flex', 
            justifyContent:'space-between', 
            margin:'0 0 6px 0', 
            fontWeight:700, 
            color:'#7c4dff', 
            fontSize: window.innerWidth < 500 ? 12 : 15
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
                        background: isBooked ? '#f5f5f5' : (selectedTime === time ? '#7c4dff' : '#f0f0f0'),
                        color: isBooked ? '#999' : (selectedTime === time ? '#fff' : '#333'),
                        border:'none', 
                        borderRadius:12, 
                        padding: window.innerWidth < 500 ? '0.6rem 1rem' : '0.8rem 1.2rem', 
                        fontWeight:700, 
                        fontSize: window.innerWidth < 500 ? 12 : 14, 
                        cursor: isBooked ? 'not-allowed' : 'pointer', 
                        boxShadow: selectedTime === time ? '0 2px 8px #7c4dff44' : '0 1px 4px #00000022',
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
          marginTop: window.innerWidth < 500 ? 12 : 18, 
          display:'flex', 
          flexDirection:'column', 
          gap: window.innerWidth < 500 ? 8 : 10
        }}>
          <input type="hidden" value={selectedDate ? selectedDate.toISOString().slice(0,10) : ''} />
          <input type="hidden" value={selectedTime} />
          <label style={{
            fontSize: window.innerWidth < 500 ? 14 : 16,
            fontWeight: 600,
            color: '#333'
          }}>
            {t('reason_optional')}
          </label>
          <textarea 
            value={reason} 
            onChange={e=>setReason(e.target.value)} 
            rows={2} 
            style={{
              padding: window.innerWidth < 500 ? 6 : 8, 
              borderRadius:7, 
              border:'2px solid #00bcd4', 
              outline:'none', 
              fontSize: window.innerWidth < 500 ? 14 : 16, 
              minHeight: window.innerWidth < 500 ? 40 : 48, 
              background:'#f7fafd'
            }} 
          />
          <button 
            type="submit" 
            disabled={booking || !selectedDate || !selectedTime} 
            style={{
              background:'#7c4dff', 
              color:'#fff', 
              border:'none', 
              borderRadius:8, 
              padding: window.innerWidth < 500 ? '0.6rem 0' : '0.7rem 0', 
              fontWeight:700, 
              fontSize: window.innerWidth < 500 ? 15 : 17, 
              cursor:'pointer', 
              marginTop:8
            }}
          >
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