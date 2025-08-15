import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ar } from 'date-fns/locale';

function WorkTimesEditor({ profile, onClose, onUpdate }) {
  const { t } = useTranslation();
  const [workTimes, setWorkTimes] = useState([]);
  const [vacationDays, setVacationDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('workTimes'); // 'workTimes' or 'vacationDays'
  
  // حالات التقويم المتقدم
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDates, setSelectedDates] = useState([]);
  const [vacationType, setVacationType] = useState('full'); // 'full' or 'partial'
  const [partialTimeFrom, setPartialTimeFrom] = useState('09:00');
  const [partialTimeTo, setPartialTimeTo] = useState('13:00');

  const weekdays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  useEffect(() => {
    if (profile?.workTimes) {
      setWorkTimes(profile.workTimes);
    }
    if (profile?.vacationDays) {
      setVacationDays(profile.vacationDays);
    }
  }, [profile]);

  // دوال أوقات العمل
  const addWorkTime = () => {
    setWorkTimes([...workTimes, { day: '', from: '09:00', to: '17:00' }]);
  };

  const removeWorkTime = (index) => {
    setWorkTimes(workTimes.filter((_, i) => i !== index));
  };

  const updateWorkTime = (index, field, value) => {
    const updated = [...workTimes];
    updated[index] = { ...updated[index], [field]: value };
    setWorkTimes(updated);
  };

  // دوال أيام الإجازات
  const addVacationDay = () => {
    setVacationDays([...vacationDays, { 
      type: 'single', // 'single', 'monthly', 'yearly'
      date: '', 
      month: '', 
      year: new Date().getFullYear(),
      description: '',
      isRecurring: false
    }]);
  };

  const removeVacationDay = (index) => {
    const removedVacation = vacationDays[index];
    setVacationDays(vacationDays.filter((_, i) => i !== index));
    
    // إضافة رسالة تأكيد
    setSuccess(`تم إلغاء الإجازة: ${removedVacation.date || removedVacation.month || removedVacation.year} - ${removedVacation.description}`);
    
    // إزالة من الأيام المحددة إذا كان موجوداً
    if (removedVacation.date) {
      setSelectedDates(selectedDates.filter(date => date !== removedVacation.date));
    }
  };

  const updateVacationDay = (index, field, value) => {
    const updated = [...vacationDays];
    updated[index] = { ...updated[index], [field]: value };
    setVacationDays(updated);
  };

  // دوال التقويم المتقدم
  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter(d => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  const selectWeek = (weekStart) => {
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      weekDates.push(date.toISOString().split('T')[0]);
    }
    setSelectedDates([...new Set([...selectedDates, ...weekDates])]);
  };

  const selectWeekend = () => {
    const today = new Date();
    const currentMonthDates = [];
    const year = currentYear;
    const month = currentMonth;
    
    for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
      const date = new Date(year, month, day);
      if (date.getDay() === 5 || date.getDay() === 6) { // الجمعة والسبت
        currentMonthDates.push(date.toISOString().split('T')[0]);
      }
    }
    setSelectedDates([...new Set([...selectedDates, ...currentMonthDates])]);
  };

  const selectWorkDays = () => {
    const today = new Date();
    const currentMonthDates = [];
    const year = currentYear;
    const month = currentMonth;
    
    for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
      const date = new Date(year, month, day);
      if (date.getDay() !== 5 && date.getDay() !== 6) { // أيام العمل
        currentMonthDates.push(date.toISOString().split('T')[0]);
      }
    }
    setSelectedDates([...new Set([...selectedDates, ...currentMonthDates])]);
  };

  const clearAllDates = () => {
    setSelectedDates([]);
  };

  // دالة لحساب إجمالي أيام الإجازات
  const getTotalVacationDays = () => {
    let total = 0;
    vacationDays.forEach(vacation => {
      if (vacation.type === 'single') {
        total += 1;
      } else if (vacation.type === 'monthly') {
        const daysInMonth = new Date(vacation.year, vacation.month, 0).getDate();
        total += daysInMonth;
      } else if (vacation.type === 'yearly') {
        total += 365; // تقريبي
      }
    });
    return total;
  };

  const addSelectedDatesAsVacations = () => {
    const newVacations = selectedDates.map(date => ({
      type: 'single',
      date: date,
      year: new Date(date).getFullYear(),
      description: vacationType === 'partial' ? `إجازة جزئية ${partialTimeFrom}-${partialTimeTo}` : 'إجازة يوم كامل',
      isPartial: vacationType === 'partial',
      partialTimeFrom: vacationType === 'partial' ? partialTimeFrom : null,
      partialTimeTo: vacationType === 'partial' ? partialTimeTo : null
    }));
    
    setVacationDays([...vacationDays, ...newVacations]);
    setSelectedDates([]);
    setSuccess(`✅ تم حفظ ${newVacations.length} يوم كأيام إجازات بنجاح!`);
  };

  // دالة لإلغاء إجازة محددة وإعادتها كيوم متاح
  const cancelVacation = (vacation) => {
    if (vacation.type === 'single' && vacation.date) {
      // إزالة من قائمة الإجازات
      setVacationDays(vacationDays.filter(v => v !== vacation));
      
      // إضافة رسالة تأكيد
      setSuccess(`تم إلغاء الإجازة وإعادة اليوم ${vacation.date} كيوم متاح للحجز`);
      
      // إزالة من الأيام المحددة إذا كان موجوداً
      setSelectedDates(selectedDates.filter(date => date !== vacation.date));
    } else if (vacation.type === 'monthly') {
      // إزالة الإجازة الشهرية
      setVacationDays(vacationDays.filter(v => v !== vacation));
      setSuccess(`تم إلغاء الإجازة الشهرية لشهر ${vacation.month}/${vacation.year}`);
    } else if (vacation.type === 'yearly') {
      // إزالة الإجازة السنوية
      setVacationDays(vacationDays.filter(v => v !== vacation));
      setSuccess(`تم إلغاء الإجازة السنوية لسنة ${vacation.year}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('📤 WorkTimesEditor: إرسال أوقات الدوام وأيام الإجازات المحدثة:', { workTimes, vacationDays });
      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctor/${profile._id}/work-schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workTimes, vacationDays })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ WorkTimesEditor: تم تحديث الجدول بنجاح:', data);
        setSuccess(t('changes_saved'));
        // إرسال البيانات المحدثة فوراً مع البيانات المستلمة من السيرفر
        setTimeout(() => {
          const updatedData = {
            workTimes: data.workTimes || workTimes,
            vacationDays: data.vacationDays || vacationDays
          };
          console.log('🔄 WorkTimesEditor: إرسال البيانات المحدثة:', updatedData);
          if (onUpdate && typeof onUpdate === 'function') {
            onUpdate(updatedData);
          }
        }, 1500);
      } else {
        console.error('❌ WorkTimesEditor: خطأ من السيرفر:', data);
        setError(data.error || 'حدث خطأ أثناء تحديث الجدول');
      }
    } catch (err) {
      console.error('❌ WorkTimesEditor: خطأ في تحديث الجدول:', err);
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* تبويبات التنقل */}
      <div style={{ 
        display: 'flex', 
        marginBottom: '1.5rem', 
        background: '#f5f5f5', 
        borderRadius: '8px', 
        padding: '0.3rem' 
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('workTimes')}
          style={{
            flex: 1,
            padding: '0.7rem 1rem',
            border: 'none',
            background: activeTab === 'workTimes' ? '#0A8F82' : 'transparent',
            color: activeTab === 'workTimes' ? '#fff' : '#666',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          ⏰ {t('work_times')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('vacationDays')}
          style={{
            flex: 1,
            padding: '0.7rem 1rem',
            border: 'none',
            background: activeTab === 'vacationDays' ? '#0A8F82' : 'transparent',
            color: activeTab === 'vacationDays' ? '#fff' : '#666',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          🏖️ {t('vacation_days')}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* تبويب أوقات الدوام */}
        {activeTab === 'workTimes' && (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: '#333', marginBottom: '0.5rem' }}>{t('work_times')}:</h4>
              {workTimes.length === 0 ? (
                <div style={{ color: '#666', fontStyle: 'italic' }}>لا توجد أوقات دوام محددة</div>
              ) : (
                workTimes.map((time, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    marginBottom: '0.5rem',
                    padding: '0.5rem',
                    background: '#f5f5f5',
                    borderRadius: '8px'
                  }}>
                    <select
                      value={time.day}
                      onChange={(e) => updateWorkTime(index, 'day', e.target.value)}
                      style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1.5px solid #b2dfdb' }}
                      required
                    >
                      <option value="">اختر اليوم</option>
                      {weekdays.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                    <input
                      type="time"
                      value={time.from}
                      onChange={(e) => updateWorkTime(index, 'from', e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '4px', border: '1.5px solid #b2dfdb' }}
                      required
                    />
                    <span style={{ alignSelf: 'center' }}>إلى</span>
                    <input
                      type="time"
                      value={time.to}
                      onChange={(e) => updateWorkTime(index, 'to', e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '4px', border: '1.5px solid #b2dfdb' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeWorkTime(index)}
                      style={{
                        background: '#e53935',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.5rem',
                        cursor: 'pointer'
                      }}
                    >
                      حذف
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={addWorkTime}
              style={{
                background: '#4caf50',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.7rem 1rem',
                marginBottom: '1rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              + إضافة يوم عمل
            </button>
          </div>
        )}

        {/* تبويب أيام الإجازات */}
        {activeTab === 'vacationDays' && (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: '#333', marginBottom: '0.5rem' }}>{t('vacation_days_title')}:</h4>
              
              {/* ملخص الإجازات الحالية */}
              {vacationDays.length > 0 && (
                <div style={{ 
                  background: '#e8f5e8', 
                  border: '1px solid #4caf50', 
                  borderRadius: '8px', 
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ fontWeight: '600', color: '#2e7d32' }}>
                      📊 ملخص الإجازات الحالية
                    </div>
                    <div style={{ 
                      background: '#4caf50', 
                      color: '#fff', 
                      padding: '0.3rem 0.8rem', 
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {getTotalVacationDays()} يوم إجازة
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    عدد الإجازات: {vacationDays.length} إجازة
                  </div>
                </div>
              )}
              
              {/* التقويم المتقدم */}
              <div style={{ 
                background: '#fff', 
                border: '2px solid #e0e0e0', 
                borderRadius: '12px', 
                padding: '1.5rem', 
                marginBottom: '1.5rem' 
              }}>
                {/* محدد السنة والشهر */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '1rem' 
                }}>
                  <button
                    type="button"
                    onClick={() => navigateMonth('prev')}
                    style={{
                      background: '#0A8F82',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      cursor: 'pointer',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ⇦
                  </button>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0A8F82' }}>
                      {['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][currentMonth]}
                    </div>
                    <div style={{ fontSize: '1rem', color: '#666' }}>
                      {currentYear}
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => navigateMonth('next')}
                    style={{
                      background: '#0A8F82',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      cursor: 'pointer',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ⇨
                  </button>
                </div>

                {/* أزرار التحديد السريع */}
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  marginBottom: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <button
                    type="button"
                    onClick={selectWeekend}
                    style={{
                      background: '#ff9800',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    تحديد نهاية الأسبوع
                  </button>
                  <button
                    type="button"
                    onClick={selectWorkDays}
                    style={{
                      background: '#4caf50',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    تحديد أيام الدوام
                  </button>
                  <button
                    type="button"
                    onClick={clearAllDates}
                    style={{
                      background: '#e53935',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    مسح الكل
                  </button>
                </div>

                {/* التقويم الشهري */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(7, 1fr)', 
                  gap: '2px',
                  marginBottom: '1rem'
                }}>
                  {/* أيام الأسبوع */}
                  {['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map(day => (
                    <div key={day} style={{
                      padding: '0.5rem',
                      textAlign: 'center',
                      fontWeight: '700',
                      color: '#0A8F82',
                      fontSize: '12px'
                    }}>
                      {day}
                    </div>
                  ))}
                  
                  {/* أيام الشهر */}
                  {(() => {
                    const firstDay = new Date(currentYear, currentMonth, 1);
                    const lastDay = new Date(currentYear, currentMonth + 1, 0);
                    const startDate = new Date(firstDay);
                    startDate.setDate(startDate.getDate() - firstDay.getDay());
                    
                    const days = [];
                    for (let i = 0; i < 42; i++) {
                      const date = new Date(startDate);
                      date.setDate(startDate.getDate() + i);
                      
                      const isCurrentMonth = date.getMonth() === currentMonth;
                      const isToday = date.toDateString() === new Date().toDateString();
                      const isSelected = selectedDates.includes(date.toISOString().split('T')[0]);
                      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                      
                      days.push(
                        <div
                          key={i}
                          onClick={() => !isPast && handleDateClick(date)}
                          style={{
                            padding: '0.5rem',
                            textAlign: 'center',
                            cursor: isPast ? 'not-allowed' : 'pointer',
                            background: isSelected ? '#0A8F82' : (isToday ? '#e3f2fd' : 'transparent'),
                            color: isSelected ? '#fff' : (isCurrentMonth ? '#333' : '#ccc'),
                            borderRadius: '4px',
                            border: isSelected ? '2px solid #0A8F82' : '1px solid transparent',
                            opacity: isPast ? 0.5 : 1,
                            position: 'relative'
                          }}
                        >
                          {date.getDate()}
                          {isSelected && (
                            <div style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '-8px',
                              background: '#ff5722',
                              color: '#fff',
                              borderRadius: '50%',
                              width: '16px',
                              height: '16px',
                              fontSize: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              ✕
                            </div>
                          )}
                        </div>
                      );
                    }
                    return days;
                  })()}
                </div>

                {/* إعدادات الإجازة */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '600', color: '#333' }}>
                      نوع الإجازة
                    </label>
                    <select
                      value={vacationType}
                      onChange={(e) => setVacationType(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1.5px solid #b2dfdb' }}
                    >
                      <option value="full">يوم كامل</option>
                      <option value="partial">جزئي</option>
                    </select>
                  </div>
                  
                  {vacationType === 'partial' && (
                    <>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '600', color: '#333' }}>
                          من
                        </label>
                        <input
                          type="time"
                          value={partialTimeFrom}
                          onChange={(e) => setPartialTimeFrom(e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1.5px solid #b2dfdb' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '600', color: '#333' }}>
                          إلى
                        </label>
                        <input
                          type="time"
                          value={partialTimeTo}
                          onChange={(e) => setPartialTimeTo(e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1.5px solid #b2dfdb' }}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* زر حفظ بسيط */}
                {selectedDates.length > 0 && (
                  <div style={{ 
                    textAlign: 'center',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#666', 
                      marginBottom: '0.5rem' 
                    }}>
                      تم تحديد {selectedDates.length} يوم
                    </div>
                    <button
                      type="button"
                      onClick={addSelectedDatesAsVacations}
                      style={{
                        background: '#0A8F82',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.7rem 1.5rem',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}
                    >
                      ✅ حفظ الأيام المحددة
                    </button>
                  </div>
                )}
              </div>

              {/* قائمة أيام الإجازات الموجودة */}
              {vacationDays.length === 0 ? (
                <div style={{ color: '#666', fontStyle: 'italic' }}>{t('no_vacation_days')}</div>
              ) : (
                vacationDays.map((vacation, index) => (
                  <div key={index} style={{ 
                    background: '#fff3e0',
                    border: '1px solid #ffcc02',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '0.8rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                      <h5 style={{ color: '#e65100', margin: 0, fontSize: '1rem' }}>{t('vacation_number')}{index + 1}</h5>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => cancelVacation(vacation)}
                          style={{
                            background: '#ff9800',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.4rem 0.8rem',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                          title="إلغاء الإجازة وإعادة اليوم كمتاح"
                        >
                          🔄 إلغاء
                        </button>
                        <button
                          type="button"
                          onClick={() => removeVacationDay(index)}
                          style={{
                            background: '#e53935',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.4rem 0.8rem',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                          title="حذف الإجازة نهائياً"
                        >
                          🗑️ حذف
                        </button>
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.3rem', color: '#333', fontWeight: '600', fontSize: '0.9rem' }}>
                          {t('vacation_type')}
                        </label>
                        <select
                          value={vacation.type}
                          onChange={(e) => updateVacationDay(index, 'type', e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1.5px solid #ffcc02' }}
                        >
                          <option value="single">{t('single_day')}</option>
                          <option value="monthly">{t('monthly')}</option>
                          <option value="yearly">{t('yearly')}</option>
                        </select>
                      </div>
                      
                      {vacation.type === 'single' && (
                        <div>
                                                  <label style={{ display: 'block', marginBottom: '0.3rem', color: '#333', fontWeight: '600', fontSize: '0.9rem' }}>
                          {t('vacation_date')}
                        </label>
                          <input
                            type="date"
                            value={vacation.date}
                            onChange={(e) => updateVacationDay(index, 'date', e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1.5px solid #ffcc02' }}
                            required
                          />
                        </div>
                      )}
                      
                      {vacation.type === 'monthly' && (
                        <div>
                                                  <label style={{ display: 'block', marginBottom: '0.3rem', color: '#333', fontWeight: '600', fontSize: '0.9rem' }}>
                          {t('vacation_month')}
                        </label>
                          <select
                            value={vacation.month}
                            onChange={(e) => updateVacationDay(index, 'month', e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1.5px solid #ffcc02' }}
                            required
                          >
                            <option value="">{t('select_month')}</option>
                            <option value="1">{t('january')}</option>
                            <option value="2">{t('february')}</option>
                            <option value="3">{t('march')}</option>
                            <option value="4">{t('april')}</option>
                            <option value="5">{t('may')}</option>
                            <option value="6">{t('june')}</option>
                            <option value="7">{t('july')}</option>
                            <option value="8">{t('august')}</option>
                            <option value="9">{t('september')}</option>
                            <option value="10">{t('october')}</option>
                            <option value="11">{t('november')}</option>
                            <option value="12">{t('december')}</option>
                          </select>
                        </div>
                      )}
                      
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.3rem', color: '#333', fontWeight: '600', fontSize: '0.9rem' }}>
                          {t('vacation_year')}
                        </label>
                        <input
                          type="number"
                          value={vacation.year}
                          onChange={(e) => updateVacationDay(index, 'year', e.target.value)}
                          min={new Date().getFullYear()}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1.5px solid #ffcc02' }}
                          required
                        />
                      </div>
                      
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '0.3rem', color: '#333', fontWeight: '600', fontSize: '0.9rem' }}>
                          {t('vacation_description')}
                        </label>
                        <input
                          type="text"
                          placeholder={t('vacation_description_placeholder')}
                          value={vacation.description}
                          onChange={(e) => updateVacationDay(index, 'description', e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1.5px solid #ffcc02' }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={addVacationDay}
              style={{
                background: '#ff9800',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.7rem 1rem',
                marginBottom: '1rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              + {t('add_vacation_day')}
            </button>
          </div>
        )}

        {/* أزرار الحفظ والإلغاء */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#0A8F82',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.7rem 1.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              flex: 1
            }}
          >
            {loading ? t('saving') : t('save_changes')}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#666',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.7rem 1.5rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            إلغاء
          </button>
        </div>

        {error && (
          <div style={{ color: '#e53935', marginTop: '0.5rem', fontSize: '14px' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ color: '#4caf50', marginTop: '0.5rem', fontSize: '14px' }}>
            {success}
          </div>
        )}
      </form>
    </div>
  );
}

export default WorkTimesEditor; 