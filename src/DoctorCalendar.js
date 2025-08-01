import React, { useState } from 'react';
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

  // إذا لم يتم تمرير القيم كمُدخلات، استخرجها من الكود القديم (للاستخدام المستقل)
  const [internalSelectedDate, setInternalSelectedDate] = useState(getToday());
  const [internalYear, setInternalYear] = useState(new Date().getFullYear());
  const [internalMonth, setInternalMonth] = useState(new Date().getMonth());

  // إذا لم يتم تمرير props استخدم القيم الداخلية
  const _selectedDate = selectedDate || internalSelectedDate;
  const _setSelectedDate = setSelectedDate || setInternalSelectedDate;
  const _year = year !== undefined ? year : internalYear;
  const _month = month !== undefined ? month : internalMonth;
  const _daysArr = daysArr || Array.from({length: new Date(_year, _month + 1, 0).getDate()}, (_,i)=>i+1);
  const _appointments = appointments || [];
  const weekdays = t('weekdays', { returnObjects: true }) || ['شەممە', 'یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'هەینی'];
  const months = t('months', { returnObjects: true }) || [
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
    <div style={{background:'#f7fafd', minHeight:'100vh', padding:'2rem 0'}}>
      <div style={{maxWidth:450, margin:'0 auto', background:'#fff', borderRadius:20, boxShadow:'0 8px 32px rgba(0,0,0,0.08)', padding:'2.5rem 2rem', textAlign:'center'}}>
        <h3 style={{color:'#7c4dff', marginBottom:24, fontWeight:800, fontSize:22}}>
          📅 {t('my_calendar')}
        </h3>
        {/* معلومات الشهر */}
        <div style={{background:'linear-gradient(135deg, #7c4dff 0%, #00bcd4 100%)', color:'#fff', borderRadius:12, padding:'1rem', marginBottom:20, fontWeight:700, fontSize:16}}>
          {new Date(_year, _month).toLocaleDateString('ku', { month: 'long', year: 'numeric' })}
        </div>
        {/* أيام الأسبوع */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:4, marginBottom:12}}>
          {(t('weekdays', { returnObjects: true }) || ['شەممە', 'یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'هەینی']).map(day => (
            <div key={day} style={{textAlign:'center', fontWeight:700, color:'#7c4dff', fontSize:12, padding:'0.5rem'}}>
              {day}
            </div>
          ))}
        </div>
        {/* التقويم */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:4, marginBottom:20}}>
          {_daysArr.map(day => {
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
                background: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(255, 152, 0, 0.4)',
                transform: 'scale(1.1)'
              };
            } else if (isSelected) {
              buttonStyle = {
                ...buttonStyle,
                background: 'linear-gradient(135deg, #00bcd4 0%, #009688 100%)',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(0, 188, 212, 0.4)'
              };
            } else if (hasAppointment) {
              buttonStyle = {
                ...buttonStyle,
                background: 'linear-gradient(135deg, #7c4dff 0%, #673ab7 100%)',
                color: '#fff',
                boxShadow: '0 2px 6px rgba(124, 77, 255, 0.3)'
              };
            } else {
              buttonStyle = {
                ...buttonStyle,
                background: '#f5f5f5',
                color: '#666',
                border: '1px solid #e0e0e0'
              };
            }
            return (
              <button 
                key={day} 
                onClick={() => _setSelectedDate(dateStr)}
                style={buttonStyle}
              >
                {day}
              </button>
            );
          })}
        </div>
        {/* شرح الألوان */}
        <div style={{display:'flex', justifyContent:'center', gap:16, marginBottom:20, flexWrap:'wrap'}}>
          <div style={{display:'flex', alignItems:'center', gap:6, fontSize:12}}>
            <div style={{width:12, height:12, borderRadius:'50%', background:'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)'}}></div>
            <span>{t('calendar_today')}</span>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:6, fontSize:12}}>
            <div style={{width:12, height:12, borderRadius:'50%', background:'linear-gradient(135deg, #7c4dff 0%, #673ab7 100%)'}}></div>
            <span>{t('calendar_has_appointments')}</span>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:6, fontSize:12}}>
            <div style={{width:12, height:12, borderRadius:'50%', background:'linear-gradient(135deg, #00bcd4 0%, #009688 100%)'}}></div>
            <span>{t('calendar_selected')}</span>
          </div>
        </div>
        {/* مواعيد اليوم المحدد */}
        <div style={{background:'#f8f9fa', borderRadius:12, padding:'1.5rem', marginBottom:20}}>
          <div style={{fontWeight:700, color:'#7c4dff', marginBottom:12, fontSize:16}}>
            📅 {t('appointments_for_date', { date: _formatDate(_selectedDate) })}
          </div>
          {_dayAppointments.length === 0 ? (
            <div style={{color:'#888', fontStyle:'italic'}}>{t('no_appointments')}</div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:8}}>
              {_dayAppointments.map(a => (
                <div key={a._id} style={{
                  background:'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                  borderRadius:8,
                  padding:'0.8rem 1rem',
                  color:'#333',
                  fontWeight:600,
                  borderLeft:'4px solid #7c4dff'
                }}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div>
                      <div style={{color:'#7c4dff', fontWeight:700}}>🕐 {a.time}</div>
                      <div>👤 {a.userId?.first_name || a.userName}</div>
                      {a.userId?.phone && <div style={{fontSize:12, color:'#666'}}>📞 {a.userId.phone}</div>}
                    </div>
                    <span style={{
                      background:'#7c4dff',
                      color:'#fff',
                      padding:'0.2rem 0.6rem',
                      borderRadius:12,
                      fontSize:11,
                      fontWeight:700
                    }}>
                      {a.status || t('confirmed')}
                    </span>
                  </div>
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