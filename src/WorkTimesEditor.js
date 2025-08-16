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

  const weekdays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  // دالة لتحويل البيانات القديمة إلى الجديدة
  const convertOldVacationData = (oldVacationDays) => {
    if (!oldVacationDays || !Array.isArray(oldVacationDays)) {
      return [];
    }
    
    return oldVacationDays.map(vacation => {
      // إذا كانت البيانات بالهيكل الجديد (تاريخ فقط)
      if (typeof vacation === 'string') {
        return vacation;
      }
      
      // إذا كانت البيانات بالهيكل القديم (كائن مع type, date, etc.)
      if (vacation && typeof vacation === 'object') {
        if (vacation.type === 'single' && vacation.date) {
          return vacation.date;
        }
        // تجاهل الإجازات الشهرية والسنوية في الوقت الحالي
        return null;
      }
      
      return null;
    }).filter(Boolean); // إزالة القيم الفارغة
  };

  useEffect(() => {
    if (profile?.workTimes) {
      setWorkTimes(profile.workTimes);
    }
    if (profile?.vacationDays) {
      // تحويل البيانات القديمة إلى الجديدة
      const convertedVacations = convertOldVacationData(profile.vacationDays);
      setVacationDays(convertedVacations);
      
      // إذا كانت البيانات مختلفة، قم بتحديثها في قاعدة البيانات
      if (JSON.stringify(convertedVacations) !== JSON.stringify(profile.vacationDays)) {
        console.log('🔄 تحويل بيانات الإجازات القديمة إلى الجديدة:', {
          old: profile.vacationDays,
          new: convertedVacations
        });
      }
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

  // دوال أيام الإجازات - مبسطة لتخزين التواريخ فقط
  const addVacationDay = () => {
    setVacationDays([...vacationDays, '']);
  };

  const removeVacationDay = (index) => {
    const removedVacation = vacationDays[index];
    setVacationDays(vacationDays.filter((_, i) => i !== index));
    
    // إضافة رسالة تأكيد
    setSuccess(`تم إلغاء الإجازة: ${removedVacation}`);
    
    // إزالة من الأيام المحددة إذا كان موجوداً
    if (removedVacation) {
      setSelectedDates(selectedDates.filter(date => date !== removedVacation));
    }
  };

  const updateVacationDay = (index, value) => {
    const updated = [...vacationDays];
    updated[index] = value;
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
    return vacationDays.length;
  };

  const addSelectedDatesAsVacations = () => {
    const newVacations = selectedDates.map(date => date);
    
    setVacationDays([...vacationDays, ...newVacations]);
    setSelectedDates([]);
    setSuccess(`✅ تم حفظ ${newVacations.length} يوم كأيام إجازات بنجاح!`);
  };

  // دالة لإلغاء إجازة محددة وإعادتها كيوم متاح
  const cancelVacation = (vacation) => {
    // إزالة من قائمة الإجازات
    setVacationDays(vacationDays.filter(v => v !== vacation));
    
    // إضافة رسالة تأكيد
    setSuccess(`تم إلغاء الإجازة وإعادة اليوم ${vacation} كيوم متاح للحجز`);
    
    // إزالة من الأيام المحددة إذا كان موجوداً
    setSelectedDates(selectedDates.filter(date => date !== vacation));
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
            <h3 style={{ color: '#0A8F82', marginBottom: '1rem', fontSize: '1.2rem' }}>
              ⏰ {t('work_times')}
            </h3>
            
            {workTimes.map((workTime, index) => (
              <div key={index} style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr auto', 
                gap: '1rem', 
                alignItems: 'end',
                marginBottom: '1rem',
                padding: '1rem',
                background: '#f9f9f9',
                borderRadius: '8px'
              }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', color: '#333', fontWeight: '600' }}>
                    {t('day')}
                  </label>
                  <select
                    value={workTime.day}
                    onChange={(e) => updateWorkTime(index, 'day', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1.5px solid #ffcc02' }}
                    required
                  >
                    <option value="">{t('select_day')}</option>
                    <option value="الأحد">{t('sunday')}</option>
                    <option value="الاثنين">{t('monday')}</option>
                    <option value="الثلاثاء">{t('tuesday')}</option>
                    <option value="الأربعاء">{t('wednesday')}</option>
                    <option value="الخميس">{t('thursday')}</option>
                    <option value="الجمعة">{t('friday')}</option>
                    <option value="السبت">{t('saturday')}</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', color: '#333', fontWeight: '600' }}>
                    {t('from')}
                  </label>
                  <input
                    type="time"
                    value={workTime.from}
                    onChange={(e) => updateWorkTime(index, 'from', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1.5px solid #ffcc02' }}
                    required
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', color: '#333', fontWeight: '600' }}>
                    {t('to')}
                  </label>
                  <input
                    type="time"
                    value={workTime.to}
                    onChange={(e) => updateWorkTime(index, 'to', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1.5px solid #ffcc02' }}
                    required
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => removeWorkTime(index)}
                  style={{
                    background: '#ff4757',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  title={t('remove_work_time')}
                >
                  🗑️
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addWorkTime}
              style={{
                background: '#0A8F82',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.7rem 1.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                marginBottom: '1.5rem'
              }}
            >
              ➕ {t('add_work_time')}
            </button>
          </div>
        )}

        {/* تبويب أيام الإجازات */}
        {activeTab === 'vacationDays' && (
          <div>
            <h3 style={{ color: '#0A8F82', marginBottom: '1rem', fontSize: '1.2rem' }}>
              🏖️ {t('vacation_days')}
            </h3>

            {/* التقويم المتقدم */}
            <div style={{ 
              background: '#fff', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              marginBottom: '2rem'
            }}>
              <h4 style={{ color: '#333', marginBottom: '1rem', textAlign: 'center' }}>
                تقويم تحديد أيام الإجازات
              </h4>
              
              {/* تنقل الشهر */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '1.5rem' 
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
                    fontSize: '18px'
                  }}
                >
                  ⇦
                </button>
                
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ margin: '0', color: '#333', fontSize: '1.3rem' }}>
                    {t(`month_${currentMonth + 1}`)} {currentYear}
                  </h3>
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
                    fontSize: '18px'
                  }}
                >
                  ⇨
                </button>
              </div>

              {/* أزرار الاختيار السريع */}
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                marginBottom: '1rem',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <button
                  type="button"
                  onClick={selectWeekend}
                  style={{
                    background: '#ff6b35',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  تحديد نهاية الأسبوع
                </button>
                <button
                  type="button"
                  onClick={selectWorkDays}
                  style={{
                    background: '#4ecdc4',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  تحديد أيام الدوام
                </button>
                <button
                  type="button"
                  onClick={clearAllDates}
                  style={{
                    background: '#95a5a6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  مسح الكل
                </button>
              </div>

              {/* التقويم */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                gap: '2px',
                background: '#e0e0e0',
                padding: '2px',
                borderRadius: '8px'
              }}>
                {/* أيام الأسبوع */}
                {weekdays.map(day => (
                  <div key={day} style={{
                    background: '#f8f9fa',
                    padding: '0.8rem 0.5rem',
                    textAlign: 'center',
                    fontWeight: '600',
                    color: '#666',
                    fontSize: '0.9rem'
                  }}>
                    {day}
                  </div>
                ))}
                
                {/* الأيام */}
                {(() => {
                  const firstDay = new Date(currentYear, currentMonth, 1);
                  const lastDay = new Date(currentYear, currentMonth + 1, 0);
                  const startDate = new Date(firstDay);
                  startDate.setDate(startDate.getDate() - firstDay.getDay());
                  
                  const days = [];
                  for (let i = 0; i < 42; i++) {
                    const date = new Date(startDate);
                    date.setDate(startDate.getDate() + i);
                    
                    if (date.getMonth() === currentMonth) {
                      const dateStr = date.toISOString().split('T')[0];
                      const isSelected = selectedDates.includes(dateStr);
                      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                      const isToday = dateStr === new Date().toISOString().split('T')[0];
                      
                      days.push(
                        <div
                          key={i}
                          onClick={() => !isPast && handleDateClick(date)}
                          style={{
                            background: isSelected ? '#0A8F82' : '#fff',
                            color: isSelected ? '#fff' : isPast ? '#ccc' : '#333',
                            padding: '0.8rem 0.5rem',
                            textAlign: 'center',
                            cursor: isPast ? 'not-allowed' : 'pointer',
                            borderRadius: '4px',
                            position: 'relative',
                            border: isToday ? '2px solid #ffcc02' : '1px solid #e0e0e0',
                            opacity: isPast ? 0.5 : 1
                          }}
                        >
                          {date.getDate()}
                          {isSelected && (
                            <div style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              background: '#fff',
                              color: '#0A8F82',
                              fontSize: '8px',
                              padding: '1px 3px',
                              borderRadius: '8px',
                              fontWeight: 'bold'
                            }}>
                              غير متاح
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      days.push(<div key={i} style={{ padding: '0.8rem 0.5rem' }}></div>);
                    }
                  }
                  return days;
                })()}
              </div>

              {/* ملخص الأيام المحددة */}
              {selectedDates.length > 0 && (
                <div style={{ 
                  marginTop: '1rem', 
                  textAlign: 'center',
                  padding: '1rem',
                  background: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <p style={{ margin: '0 0 1rem 0', color: '#333', fontWeight: '600' }}>
                    تم تحديد {selectedDates.length} يوم
                  </p>
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
                      fontSize: '1rem'
                    }}
                  >
                    ✅ حفظ الأيام المحددة
                  </button>
                </div>
              )}
            </div>

            {/* قائمة أيام الإجازات الحالية */}
            <div style={{ 
              background: '#fff', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
            }}>
              <h4 style={{ color: '#333', marginBottom: '1rem' }}>
                أيام الإجازات الحالية ({vacationDays.length})
              </h4>
              
              {vacationDays.length === 0 ? (
                <p style={{ color: '#666', textAlign: 'center', fontStyle: 'italic' }}>
                  لا توجد أيام إجازات محددة
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {vacationDays.map((vacation, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          marginBottom: '0.5rem'
                        }}>
                          <span style={{ 
                            background: '#0A8F82', 
                            color: '#fff', 
                            padding: '0.2rem 0.5rem', 
                            borderRadius: '12px', 
                            fontSize: '0.8rem' 
                          }}>
                            🏖️ إجازة
                          </span>
                          <span style={{ color: '#333', fontWeight: '600' }}>
                            {vacation}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => cancelVacation(vacation)}
                          style={{
                            background: '#ffa502',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.4rem 0.8rem',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                          title="إلغاء الإجازة وإعادة اليوم كيوم متاح"
                        >
                          🔄 إلغاء
                        </button>
                        <button
                          type="button"
                          onClick={() => removeVacationDay(index)}
                          style={{
                            background: '#ff4757',
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
                  ))}
                </div>
              )}

              {/* إضافة إجازة يدوياً */}
              <div style={{ marginTop: '1.5rem' }}>
                <h5 style={{ color: '#333', marginBottom: '1rem' }}>
                  إضافة إجازة يدوياً
                </h5>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.3rem', color: '#333', fontWeight: '600', fontSize: '0.9rem' }}>
                      تاريخ الإجازة
                    </label>
                    <input
                      type="date"
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          setVacationDays([...vacationDays, e.target.value]);
                          e.target.value = '';
                        }
                      }}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1.5px solid #ffcc02' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addVacationDay}
                    style={{
                      background: '#0A8F82',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    ➕ إضافة
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* رسائل النجاح والخطأ */}
        {success && (
          <div style={{
            background: '#d4edda',
            color: '#155724',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '1px solid #c3e6cb'
          }}>
            {success}
          </div>
        )}

        {error && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </div>
        )}

        {/* أزرار الحفظ والإلغاء */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'flex-end',
          marginTop: '2rem'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.7rem 1.5rem',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#ccc' : '#0A8F82',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.7rem 1.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem'
            }}
          >
            {loading ? '⏳ جاري الحفظ...' : t('save_changes')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default WorkTimesEditor; 