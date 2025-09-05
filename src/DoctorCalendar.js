import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';

function getToday() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function DoctorCalendar({ appointments, year, month, daysArr, selectedDate, setSelectedDate, formatDate, dayAppointments }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  // إذا لم يتم تمرير القيم كمُدخلات، استخرجها من الكود القديم (للاستخدام المستقل)
  const [internalSelectedDate, setInternalSelectedDate] = useState(getToday());
  const [internalYear, setInternalYear] = useState(new Date().getFullYear());
  const [internalMonth, setInternalMonth] = useState(new Date().getMonth());
  const [internalAppointments, setInternalAppointments] = useState([]);

  // جلب المواعيد إذا لم يتم تمريرها
  useEffect(() => {
    if (!appointments || appointments.length === 0) {
      const fetchAppointments = async () => {
        try {
          // استخدام نفس الطريقة المستخدمة في DoctorDashboard
          const profile = JSON.parse(localStorage.getItem('user') || '{}');
          const doctorId = profile._id || user?._id || 1;
          
          const res = await fetch(`${process.env.REACT_APP_API_URL}/doctor-appointments/${doctorId}?t=${Date.now()}`);
          
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          
          const data = await res.json();
          setInternalAppointments(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error('❌ DoctorCalendar: خطأ في جلب المواعيد:', error);
          setInternalAppointments([]);
        }
      };
      
      fetchAppointments();
    }
  }, [appointments, user?._id]);

  // إذا لم يتم تمرير props استخدم القيم الداخلية
  const _selectedDate = selectedDate || internalSelectedDate;
  const _setSelectedDate = setSelectedDate || setInternalSelectedDate;
  const _year = year !== undefined ? year : internalYear;
  const _month = month !== undefined ? month : internalMonth;
  const _appointments = appointments && appointments.length > 0 ? appointments : internalAppointments;
  
  // ترتيب أيام الأسبوع للبدء من السبت (كما هو مطلوب في التقويم العربي/الكردي)
  // الترتيب: السبت(0), الأحد(1), الاثنين(2), الثلاثاء(3), الأربعاء(4), الخميس(5), الجمعة(6)
  const weekdays = (t('weekdays', { returnObjects: true }) && Array.isArray(t('weekdays', { returnObjects: true }))) ? t('weekdays', { returnObjects: true }) : 
                   (t('weekdays_array', { returnObjects: true }) && Array.isArray(t('weekdays_array', { returnObjects: true }))) ? t('weekdays_array', { returnObjects: true }) : 
                   ['شەممە', 'یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'هەینی'];
  const months = (t('months', { returnObjects: true }) && Array.isArray(t('months', { returnObjects: true }))) ? t('months', { returnObjects: true }) : [
    'کانونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران',
    'تەمموز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانونی یەکەم'
  ];
  const _formatDate = formatDate || ((dateString) => {
    const date = new Date(dateString);
    const weekday = weekdays[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${weekday}، ${day}ی ${month} ${year}`;
  });
  const _dayAppointments = dayAppointments || _appointments.filter(a => {
    const aDate = new Date(a.date).toISOString().slice(0,10);
    return aDate === _selectedDate;
  });

  return (
    <div style={{background:'#fff', minHeight:'100vh', padding:'2rem 0'}}>
      <div style={{maxWidth:450, margin:'0 auto', background:'#fff', borderRadius:20, boxShadow:'0 8px 32px rgba(10, 143, 130, 0.15)', padding:'2.5rem 2rem', textAlign:'center', border: '1px solid #e8f5e8'}}>
        {/* زر العودة */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
          <button 
            onClick={() => navigate('/doctor-dashboard')}
            style={{
              background:'#0A8F82',
              color:'#fff',
              border:'none',
              borderRadius:12,
              padding:'0.8rem 1.5rem',
              fontSize:14,
              fontWeight:700,
              cursor:'pointer',
              display:'flex',
              alignItems:'center',
              gap:8,
              transition:'all 0.3s ease',
              boxShadow:'0 4px 12px rgba(10, 143, 130, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(10, 143, 130, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(10, 143, 130, 0.3)';
            }}
          >
            ← {t('back')}
          </button>
          <h3 style={{color:'#0A8F82', fontWeight:800, fontSize:22, margin:0, flex:1, textAlign:'center'}}>
            📅 {t('my_calendar')}
          </h3>
          <div style={{width:80}}></div> {/* مساحة فارغة للتوازن */}
        </div>
        {/* معلومات الشهر مع أزرار التنقل */}
        <div style={{background:'#0A8F82', color:'#fff', borderRadius:12, padding:'1rem', marginBottom:20, fontWeight:700, fontSize:16, display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 4px 12px rgba(10, 143, 130, 0.3)'}}>
          <button 
            onClick={() => {
              if (_month === 0) {
                setInternalYear(_year - 1);
                setInternalMonth(11);
              } else {
                setInternalMonth(_month - 1);
              }
            }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              borderRadius: '50%',
              width: 36,
              height: 36,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.3)';
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            ‹
          </button>
          
          <div style={{textAlign: 'center', flex: 1, position: 'relative'}}>
            {new Date(_year, _month).toLocaleDateString('ku', { month: 'long', year: 'numeric' })}
            <button 
              onClick={() => {
                const today = new Date();
                setInternalYear(today.getFullYear());
                setInternalMonth(today.getMonth());
                setInternalSelectedDate(today.toISOString().slice(0, 10));
              }}
              style={{
                position: 'absolute',
                top: -8,
                right: -8,
                background: 'rgba(255,255,255,0.3)',
                border: 'none',
                color: '#fff',
                borderRadius: '50%',
                width: 24,
                height: 24,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              title="العودة لليوم الحالي"
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.5)';
                e.target.style.transform = 'scale(1.2)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.3)';
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              🏠
            </button>
          </div>
          
          <button 
            onClick={() => {
              if (_month === 11) {
                setInternalYear(_year + 1);
                setInternalMonth(0);
              } else {
                setInternalMonth(_month + 1);
              }
            }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              borderRadius: '50%',
              width: 36,
              height: 36,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.3)';
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            ›
          </button>
        </div>
        {/* أيام الأسبوع */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:4, marginBottom:12}}>
          {weekdays.map(day => (
            <div key={day} style={{textAlign:'center', fontWeight:700, color:'#0A8F82', fontSize:12, padding:'0.5rem'}}>
              {day}
            </div>
          ))}
        </div>
        {/* التقويم */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:4, marginBottom:20}}>
          {(() => {
            // حساب اليوم الأول من الشهر وعدد الأيام
            const firstDay = new Date(_year, _month, 1);
            const lastDay = new Date(_year, _month + 1, 0);
            const daysInMonth = lastDay.getDate();
            
            // حساب يوم الأسبوع للبداية - طريقة مبسطة
            // JavaScript: 0=الأحد, 1=الاثنين, 2=الثلاثاء, 3=الأربعاء, 4=الخميس, 5=الجمعة, 6=السبت
            // نريد: 0=السبت, 1=الأحد, 2=الاثنين, 3=الثلاثاء, 4=الأربعاء, 5=الخميس, 6=الجمعة
            const jsDay = firstDay.getDay(); // 0-6
            let startDay;
            
            if (jsDay === 0) { // الأحد
              startDay = 1; // الأحد في العمود الثاني
            } else if (jsDay === 6) { // السبت
              startDay = 0; // السبت في العمود الأول
            } else {
              startDay = jsDay + 1; // باقي الأيام
            }
            
            const calendarDays = [];
            
            // إضافة الأيام الفارغة في بداية الشهر
            for (let i = 0; i < startDay; i++) {
              calendarDays.push(null);
            }
            
            // إضافة أيام الشهر
            for (let day = 1; day <= daysInMonth; day++) {
              calendarDays.push(day);
            }
            
            return calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} style={{width: 40, height: 40}}></div>;
              }
              
              const dateStr = `${_year}-${String(_month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              const isToday = dateStr === getToday();
              const hasAppointment = _appointments.some(a => {
                const aDate = new Date(a.date).toISOString().slice(0,10);
                return aDate === dateStr;
              });
              const isSelected = _selectedDate === dateStr;
              
              let buttonStyle = {
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: 'none',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              };
              
              if (isToday) {
                buttonStyle = {
                  ...buttonStyle,
                  background: '#0A8F82',
                  color: '#fff',
                  boxShadow: '0 2px 8px rgba(10, 143, 130, 0.4)',
                  transform: 'scale(1.1)',
                  fontWeight: 'bold'
                };
              } else if (isSelected) {
                buttonStyle = {
                  ...buttonStyle,
                  background: '#0A8F82',
                  color: '#fff',
                  boxShadow: '0 2px 8px rgba(10, 143, 130, 0.4)',
                  opacity: 0.8
                };
              } else if (hasAppointment) {
                buttonStyle = {
                  ...buttonStyle,
                  background: '#0A8F82',
                  color: '#fff',
                  boxShadow: '0 2px 6px rgba(10, 143, 130, 0.3)',
                  opacity: 0.9
                };
              } else {
                buttonStyle = {
                  ...buttonStyle,
                  background: '#f8f9fa',
                  color: '#666',
                  border: '1px solid #e8f5e8'
                };
              }
              
              return (
                <button 
                  key={day} 
                  onClick={() => _setSelectedDate(dateStr)}
                  style={buttonStyle}
                  onMouseEnter={(e) => {
                    if (!isToday && !isSelected && !hasAppointment) {
                      e.target.style.background = '#e8f5e8';
                      e.target.style.color = '#0A8F82';
                      e.target.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isToday && !isSelected && !hasAppointment) {
                      e.target.style.background = '#f8f9fa';
                      e.target.style.color = '#666';
                      e.target.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {day}
                </button>
              );
            });
          })()}
        </div>
        {/* شرح الألوان */}
        <div style={{display:'flex', justifyContent:'center', gap:16, marginBottom:20, flexWrap:'wrap'}}>
          <div style={{display:'flex', alignItems:'center', gap:6, fontSize:12}}>
            <div style={{width:12, height:12, borderRadius:'50%', background:'#0A8F82', boxShadow:'0 1px 3px rgba(10, 143, 130, 0.3)'}}></div>
            <span>{t('calendar_today')}</span>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:6, fontSize:12}}>
            <div style={{width:12, height:12, borderRadius:'50%', background:'#0A8F82', opacity:0.9, boxShadow:'0 1px 3px rgba(10, 143, 130, 0.3)'}}></div>
            <span>{t('calendar_has_appointments')}</span>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:6, fontSize:12}}>
            <div style={{width:12, height:12, borderRadius:'50%', background:'#0A8F82', opacity:0.8, boxShadow:'0 1px 3px rgba(10, 143, 130, 0.3)'}}></div>
            <span>{t('calendar_selected')}</span>
          </div>
        </div>
        {/* مواعيد اليوم المحدد */}
        <div style={{background:'#f8f9fa', borderRadius:12, padding:'1.5rem', marginBottom:20, border: '1px solid #e8f5e8'}}>
          <div style={{fontWeight:700, color:'#0A8F82', marginBottom:12, fontSize:16}}>
            📅 {t('appointments_for_date', { date: _formatDate(_selectedDate) })}
          </div>
          {_dayAppointments.length === 0 ? (
            <div style={{color:'#888', fontStyle:'italic'}}>{t('no_appointments')}</div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:8}}>
              {_dayAppointments.map(a => (
                <div key={a._id} style={{
                  background:'#fff',
                  borderRadius:8,
                  padding:'0.8rem 1rem',
                  color:'#333',
                  fontWeight:600,
                  borderLeft:'4px solid #0A8F82',
                  boxShadow:'0 2px 8px rgba(10, 143, 130, 0.1)',
                  border: '1px solid #e8f5e8'
                }}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div>
                      <div style={{color:'#0A8F82', fontWeight:700}}>🕐 {a.time}</div>
                      <div>👤 {a.isBookingForOther
                        ? (a.patientName || 'غير محدد')
                        : (a.userId?.first_name || a.userName)
                      }</div>
                      {a.userId?.phone && <div style={{fontSize:12, color:'#666'}}>📞 {a.userId.phone}</div>}
                    </div>
                    <span style={{
                      background:'#0A8F82',
                      color:'#fff',
                      padding:'0.2rem 0.6rem',
                      borderRadius:12,
                      fontSize:11,
                      fontWeight:700
                    }}>
                      {a.status || t('confirmed')}
                    </span>
                  </div>
                                      {/* عرض اسم الحاجز إذا كان الحجز لشخص آخر */}
                    {a.isBookingForOther && (
                      <div style={{color:'#666', fontSize:'0.9rem', marginTop:'0.5rem'}}>
                        👥 {t('booking.booker_name')}: {a.bookerName || a.userName}
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default DoctorCalendar; 