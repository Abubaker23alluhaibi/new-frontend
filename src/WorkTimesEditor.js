import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import 'react-datepicker/dist/react-datepicker.css';

function WorkTimesEditor({ profile, onClose, onUpdate, fetchAllAppointments }) {
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

  // دالة لتنظيف التخزين المؤقت وإعادة تحميل البيانات
  const refreshData = () => {
    // تنظيف التخزين المؤقت
    localStorage.removeItem('vacationDays_lastUpdated');
    
    // إعادة تحميل البيانات من profile مع التأكد من أنها مصفوفات
    if (profile?.workTimes && Array.isArray(profile.workTimes)) {
      // التأكد من أن جميع أوقات الدوام تحتوي على الحقول المطلوبة
      const validatedWorkTimes = profile.workTimes.map(wt => {
        // التأكد من أن الكائن صحيح
        if (!wt || typeof wt !== 'object') {
          console.error('❌ كائن workTime غير صحيح في refreshData:', wt);
          return null;
        }
        
        // التأكد من وجود الحقول الأساسية
        if (!wt.day || !wt.from || !wt.to) {
          console.error('❌ كائن workTime يفتقد الحقول الأساسية في refreshData:', wt);
          return null;
        }
        
        const validated = {
          day: wt.day,
          from: wt.from,
          to: wt.to
        };
        
        console.log('✅ تم التحقق من workTime في refreshData:', validated);
        return validated;
      }).filter(Boolean); // إزالة القيم الفارغة
      
      setWorkTimes(validatedWorkTimes);
    } else {
      setWorkTimes([]);
    }
    
    if (profile?.vacationDays && Array.isArray(profile.vacationDays)) {
      const convertedVacations = convertOldVacationData(profile.vacationDays);
      setVacationDays(convertedVacations);
    } else {
      setVacationDays([]);
    }
    
    setSuccess('تم تحديث البيانات المحلية بنجاح');
    // إزالة رسالة النجاح بعد 2 ثانية
    setTimeout(() => setSuccess(''), 2000);
    
    console.log('🔄 تم تحديث البيانات المحلية');
  };

  useEffect(() => {
    // تهيئة أوقات الدوام - تأكد من أنها دائماً مصفوفة
    if (profile?.workTimes && Array.isArray(profile.workTimes) && profile.workTimes.length > 0) {
      // التأكد من أن جميع أوقات الدوام تحتوي على الحقول المطلوبة
      const validatedWorkTimes = profile.workTimes.map(wt => {
        // التأكد من أن الكائن صحيح
        if (!wt || typeof wt !== 'object') {
          console.error('❌ كائن workTime غير صحيح في useEffect:', wt);
          return null;
        }
        
        // التأكد من وجود الحقول الأساسية
        if (!wt.day || !wt.from || !wt.to) {
          console.error('❌ كائن workTime يفتقد الحقول الأساسية في useEffect:', wt);
          return null;
        }
        
        const validated = {
          day: wt.day,
          from: wt.from,
          to: wt.to
        };
        
        console.log('✅ تم التحقق من workTime في useEffect:', validated);
        return validated;
      }).filter(Boolean); // إزالة القيم الفارغة
      
      setWorkTimes(validatedWorkTimes);
    } else {
      // إذا لم تكن موجودة أو فارغة، أضف وقت افتراضي فوراً
      const defaultWorkTime = { 
        day: 'الأحد', 
        from: '09:00', 
        to: '17:00'
      };
      
      // التحقق من صحة الكائن الافتراضي
      console.log('✅ إضافة workTime افتراضي في useEffect:', defaultWorkTime);
      
      setWorkTimes([defaultWorkTime]);
      setSuccess('تم إضافة وقت دوام افتراضي - يرجى تحديد اليوم والوقت');
      setTimeout(() => setSuccess(''), 3000);
    }
    
    // تهيئة أيام الإجازات - تأكد من أنها دائماً مصفوفة
    if (profile?.vacationDays && Array.isArray(profile.vacationDays)) {
      // تحويل البيانات القديمة إلى الجديدة
      const convertedVacations = convertOldVacationData(profile.vacationDays);
      setVacationDays(convertedVacations);
      
      // التحقق من timestamp للتأكد من أن البيانات محدثة
      const lastUpdated = profile.lastUpdated || localStorage.getItem('vacationDays_lastUpdated');
      if (lastUpdated) {
        console.log('🕒 آخر تحديث لأيام الإجازات:', new Date(lastUpdated).toLocaleString('ar-SA'));
      }
      
      // إذا كانت البيانات مختلفة، قم بتحديثها في قاعدة البيانات
      if (JSON.stringify(convertedVacations) !== JSON.stringify(profile.vacationDays)) {
        console.log('🔄 تحويل بيانات الإجازات القديمة إلى الجديدة:', {
          old: profile.vacationDays,
          new: convertedVacations
        });
      }
    } else {
      // إذا لم تكن موجودة، ابدأ بمصفوفة فارغة
      setVacationDays([]);
    }
    
    console.log('🔄 WorkTimesEditor: تم تهيئة البيانات:', {
      workTimes: profile?.workTimes || [],
      vacationDays: profile?.vacationDays || []
    });
  }, [profile]);

  // دوال أوقات العمل
  const addWorkTime = () => {
    // البحث عن يوم متاح (غير مستخدم)
    const usedDays = workTimes.map(wt => wt.day);
    const availableDays = weekdays.filter(day => !usedDays.includes(day));
    
    let selectedDay = 'الأحد';
    if (availableDays.length > 0) {
      selectedDay = availableDays[0];
    } else {
      setError('جميع أيام الأسبوع مستخدمة - يرجى إزالة يوم واحد أولاً');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    // إضافة وقت دوام جديد مع يوم متاح
    const newWorkTime = { 
      day: selectedDay, 
      from: '09:00', 
      to: '17:00'
    };
    
    // التحقق من صحة الكائن الجديد
    console.log('✅ إضافة workTime جديد:', newWorkTime);
    
    setWorkTimes([...workTimes, newWorkTime]);
    
    if (workTimes.length === 0) {
      setSuccess('تم إضافة أول وقت دوام - يرجى تحديد اليوم والوقت');
    } else {
      setSuccess('تم إضافة وقت دوام جديد - يرجى تحديد اليوم والوقت');
    }
    
    // إزالة رسالة النجاح بعد 3 ثوانٍ
    setTimeout(() => setSuccess(''), 3000);
  };

  const removeWorkTime = (index) => {
    const removedTime = workTimes[index];
    setWorkTimes(workTimes.filter((_, i) => i !== index));
    
    // إضافة رسالة تأكيد
    if (removedTime && removedTime.day) {
      setSuccess(`تم إزالة وقت الدوام لـ ${removedTime.day}`);
    } else {
      setSuccess('تم إزالة وقت الدوام');
    }
    
    // إزالة رسالة النجاح بعد 3 ثوانٍ
    setTimeout(() => setSuccess(''), 3000);
    
    // إذا لم تتبق أوقات دوام، أضف وقت افتراضي
    if (workTimes.length === 1) {
      setTimeout(() => {
        const defaultWorkTime = { 
          day: 'الأحد', 
          from: '09:00', 
          to: '17:00'
        };
        
        // التحقق من صحة الكائن الافتراضي
        console.log('✅ إضافة workTime افتراضي جديد:', defaultWorkTime);
        
        setWorkTimes([defaultWorkTime]);
        setSuccess('تم إضافة وقت دوام افتراضي جديد - يرجى تحديد اليوم والوقت');
        setTimeout(() => setSuccess(''), 3000);
      }, 1000);
    }
  };

  const updateWorkTime = (index, field, value) => {
    const updated = [...workTimes];
    updated[index] = { ...updated[index], [field]: value };
    
    // التحقق من تكرار اليوم إذا تم تغيير اليوم
    if (field === 'day') {
      const otherDays = updated.filter((_, i) => i !== index).map(wt => wt.day);
      if (otherDays.includes(value)) {
        setError(`اليوم ${value} مستخدم بالفعل - يرجى اختيار يوم آخر`);
        setTimeout(() => setError(''), 3000);
        return;
      }
    }
    
    // لا حاجة للحقول الإضافية في الشكل البسيط
    
    setWorkTimes(updated);
    
    // إضافة رسالة تأكيد عند تحديث البيانات
    if (field === 'day' && value) {
      setSuccess(`تم تحديث اليوم إلى ${value}`);
      setTimeout(() => setSuccess(''), 2000);
    } else if (field === 'from' && value) {
      setSuccess(`تم تحديث وقت البداية إلى ${value}`);
      setTimeout(() => setSuccess(''), 2000);
    } else if (field === 'to' && value) {
      setSuccess(`تم تحديث وقت النهاية إلى ${value}`);
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  // دوال أيام الإجازات - مبسطة لتخزين التواريخ فقط
  const addVacationDay = (date) => {
    if (date) {
      // التحقق من عدم تكرار التاريخ
      if (vacationDays.includes(date)) {
        setError(`التاريخ ${date} موجود بالفعل في قائمة الإجازات`);
        setTimeout(() => setError(''), 3000);
        return;
      }
      
      setVacationDays([...vacationDays, date]);
      setSuccess(`تم إضافة يوم إجازة: ${date}`);
      // إزالة رسالة النجاح بعد 3 ثوانٍ
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const removeVacationDay = (index) => {
    const removedVacation = vacationDays[index];
    setVacationDays(vacationDays.filter((_, i) => i !== index));
    
    // إضافة رسالة تأكيد
    setSuccess(t('vacation_removed_success', { date: removedVacation }));
    
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
    // استخدام التاريخ المحلي بدلاً من UTC لتجنب مشكلة تغيير التاريخ
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
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
      // استخدام التاريخ المحلي بدلاً من UTC
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      weekDates.push(dateStr);
    }
    setSelectedDates([...new Set([...selectedDates, ...weekDates])]);
  };

  const selectWeekend = () => {
    const currentMonthDates = [];
    const year = currentYear;
    const month = currentMonth;
    
    for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
      const date = new Date(year, month, day);
      if (date.getDay() === 5 || date.getDay() === 6) { // الجمعة والسبت
        // استخدام التاريخ المحلي بدلاً من UTC
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        currentMonthDates.push(dateStr);
      }
    }
    setSelectedDates([...new Set([...selectedDates, ...currentMonthDates])]);
  };

  const selectWorkDays = () => {
    const currentMonthDates = [];
    const year = currentYear;
    const month = currentMonth;
    
    for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
      const date = new Date(year, month, day);
      if (date.getDay() !== 5 && date.getDay() !== 6) { // {t('work_days_comment')}
        // استخدام التاريخ المحلي بدلاً من UTC
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        currentMonthDates.push(dateStr);
      }
    }
    setSelectedDates([...new Set([...selectedDates, ...currentMonthDates])]);
  };

  const clearAllDates = () => {
    setSelectedDates([]);
  };



  const addSelectedDatesAsVacations = () => {
    // التحقق من عدم تكرار التواريخ
    const existingDates = new Set(vacationDays);
    const newVacations = selectedDates.filter(date => !existingDates.has(date));
    const duplicateDates = selectedDates.filter(date => existingDates.has(date));
    
    if (newVacations.length === 0) {
      setError('جميع التواريخ المحددة موجودة بالفعل في قائمة الإجازات');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setVacationDays([...vacationDays, ...newVacations]);
    setSelectedDates([]);
    
    if (duplicateDates.length > 0) {
      setSuccess(`تم إضافة ${newVacations.length} يوم إجازة جديد. ${duplicateDates.length} تاريخ موجود بالفعل.`);
    } else {
      setSuccess(t('vacations_saved_success', { count: newVacations.length }));
    }
    
    setTimeout(() => setSuccess(''), 4000);
  };

  // دالة لإلغاء إجازة محددة وإعادتها كيوم متاح
  const cancelVacation = (vacation) => {
    // إزالة من قائمة الإجازات
    setVacationDays(vacationDays.filter(v => v !== vacation));
    
    // إضافة رسالة تأكيد
    setSuccess(t('vacation_cancelled_success', { date: vacation }));
    
    // إزالة من الأيام المحددة إذا كان موجوداً
    setSelectedDates(selectedDates.filter(date => date !== vacation));
    
    // إزالة رسالة النجاح بعد 3 ثوانٍ
    setTimeout(() => setSuccess(''), 3000);
  };

  // دالة للتحقق من صحة بيانات أوقات الدوام
  const validateWorkTimes = (workTimes) => {
    return workTimes.map(wt => {
      // التأكد من أن الكائن صحيح
      if (!wt || typeof wt !== 'object') {
        console.error('❌ كائن workTime غير صحيح:', wt);
        return null;
      }
      
      // التأكد من وجود الحقول الأساسية
      if (!wt.day || !wt.from || !wt.to) {
        console.error('❌ كائن workTime يفتقد الحقول الأساسية:', wt);
        return null;
      }
      
      // الشكل البسيط: day, from, to فقط
      const validated = {
        day: wt.day,
        from: wt.from,
        to: wt.to
      };
      
      console.log('✅ تم التحقق من workTime:', validated);
      return validated;
    }).filter(Boolean); // إزالة القيم الفارغة
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // التحقق من صحة البيانات قبل الإرسال
    if (!Array.isArray(workTimes)) {
      setError(t('work_times_validation_error'));
      setLoading(false);
      return;
    }

    if (!Array.isArray(vacationDays)) {
      setError(t('vacation_days_validation_error'));
      setLoading(false);
      return;
    }

    // التحقق من أن أوقات الدوام تحتوي على بيانات صحيحة
    const hasValidWorkTimes = workTimes.every(wt => 
      wt && typeof wt === 'object' && 
      wt.day && wt.day.trim() !== '' && wt.from && wt.to
    );

    if (!hasValidWorkTimes) {
      setError('يرجى ملء جميع بيانات أوقات الدوام (اليوم، من، إلى) قبل الحفظ');
      setLoading(false);
      return;
    }

    // التحقق من أن هناك على الأقل وقت دوام واحد
    if (workTimes.length === 0) {
      setError('يجب إضافة وقت دوام واحد على الأقل. يرجى إضافة وقت دوام أولاً.');
      setLoading(false);
      return;
    }
    
    // التحقق من أن جميع أوقات الدوام تحتوي على بيانات صحيحة
    const emptyWorkTimes = workTimes.filter(wt => !wt.day || wt.day.trim() === '' || !wt.from || !wt.to);
    if (emptyWorkTimes.length > 0) {
      setError('يرجى ملء جميع بيانات أوقات الدوام (اليوم، من، إلى) قبل الحفظ');
      setLoading(false);
      return;
    }

    // إضافة المزيد من التفاصيل في console.log
    console.log('✅ WorkTimesEditor: البيانات صحيحة قبل الإرسال:', {
      workTimes: workTimes.length,
      vacationDays: vacationDays.length,
      sampleWorkTime: workTimes.length > 0 ? workTimes[0] : 'لا توجد أوقات دوام',
      allWorkTimes: workTimes,
      allVacationDays: vacationDays
    });
    
    // إضافة سجل مفصل لكل عنصر في workTimes
    console.log('🔍 تفاصيل workTimes قبل التنسيق:');
    workTimes.forEach((wt, index) => {
      console.log(`  WorkTime ${index + 1}:`, {
        day: wt.day,
        from: wt.from,
        to: wt.to,
        hasStartTime: !!wt.start_time,
        hasEndTime: !!wt.end_time,
        hasIsAvailable: wt.is_available !== undefined,
        startTime: wt.start_time,
        endTime: wt.end_time,
        isAvailable: wt.is_available,
        isObject: typeof wt === 'object',
        isNotNull: wt !== null,
        isNotUndefined: wt !== undefined
      });
    });
    
    // التحقق من تكرار الأيام
    const days = workTimes.map(wt => wt.day);
    const uniqueDays = [...new Set(days)];
    if (days.length !== uniqueDays.length) {
      console.error('❌ يوجد تكرار في الأيام:', days);
      setError('لا يمكن تكرار نفس اليوم أكثر من مرة - يرجى إزالة التكرار');
      setLoading(false);
      return;
    }
    
    // التحقق من أن جميع workTimes تحتوي على الحقول الأساسية
    const invalidWorkTimes = workTimes.filter(wt => 
      !wt || typeof wt !== 'object' || !wt.day || !wt.from || !wt.to
    );
    
    if (invalidWorkTimes.length > 0) {
      console.error('❌ يوجد workTimes غير صحيح:', invalidWorkTimes);
      setError('خطأ في بيانات أوقات الدوام - يرجى المحاولة مرة أخرى');
      setLoading(false);
      return;
    }

    try {
      // التحقق النهائي من البيانات قبل الإرسال - إزالة الأوقات الفارغة
      const sanitizedWorkTimes = workTimes.filter(wt => wt && wt.day && wt.day.trim() !== '' && wt.from && wt.to);
      
      // التأكد من أن جميع أوقات الدوام تحتوي على الحقول المطلوبة
      const validatedWorkTimes = validateWorkTimes(sanitizedWorkTimes);
      
      console.log('🔍 sanitizedWorkTimes بعد التصفية:', sanitizedWorkTimes);
      console.log('🔍 validatedWorkTimes بعد التحقق:', validatedWorkTimes);
      
      // إضافة سجل مفصل لكل عنصر في validatedWorkTimes
      validatedWorkTimes.forEach((wt, index) => {
        console.log(`🔍 ValidatedWorkTime ${index + 1}:`, {
          day: wt.day,
          from: wt.from,
          to: wt.to,
          hasDay: !!wt.day,
          hasFrom: !!wt.from,
          hasTo: !!wt.to,
          isObject: typeof wt === 'object',
          isNotNull: wt !== null,
          isNotUndefined: wt !== undefined,
          dayType: typeof wt.day,
          fromType: typeof wt.from,
          toType: typeof wt.to,
          dayLength: wt.day ? wt.day.length : 0,
          fromLength: wt.from ? wt.from.length : 0,
          toLength: wt.to ? wt.to.length : 0,
          dayTrimmed: wt.day ? wt.day.trim() : '',
          fromTrimmed: wt.from ? wt.from.trim() : '',
          toTrimmed: wt.to ? wt.to.trim() : ''
        });
      });
      
      // تنسيق البيانات بالشكل البسيط المطلوب من السيرفر
      const formattedWorkTimes = validatedWorkTimes.map(wt => {
        // التحقق من صحة البيانات قبل التنسيق
        if (!wt || !wt.day || !wt.from || !wt.to) {
          console.error('❌ بيانات غير صحيحة قبل التنسيق:', wt);
          return null;
        }
        
        // الشكل البسيط: day, from, to فقط
        const formatted = {
          day: wt.day,
          from: wt.from,
          to: wt.to
        };
        
        // إضافة سجل لكل عنصر بعد التنسيق
        console.log(`🔧 FormattedWorkTime:`, formatted);
        
        return formatted;
      }).filter(Boolean); // إزالة القيم الفارغة
      
      // إضافة سجل للبيانات المرسلة
      const dataToSend = { workTimes: formattedWorkTimes, vacationDays: vacationDays };
      console.log('📤 WorkTimesEditor: البيانات المرسلة إلى السيرفر:', JSON.stringify(dataToSend, null, 2));
      
      // إضافة سجل مفصل للبيانات النهائية
      console.log('🔍 البيانات النهائية قبل الإرسال:');
      console.log('  workTimes:', dataToSend.workTimes);
      console.log('  vacationDays:', dataToSend.vacationDays);
      
      // إضافة سجل مفصل لـ formattedWorkTimes
      console.log('🔍 formattedWorkTimes النهائي:', formattedWorkTimes);
      
      // التحقق من أن formattedWorkTimes يحتوي على بيانات
      if (!formattedWorkTimes || formattedWorkTimes.length === 0) {
        console.error('❌ formattedWorkTimes فارغ أو غير صحيح');
        setError('خطأ في تنسيق البيانات - يرجى المحاولة مرة أخرى');
        setLoading(false);
        return;
      }
      
      // التحقق النهائي من أن جميع الكائنات تحتوي على الحقول الأساسية
      const finalValidation = formattedWorkTimes.every(wt => 
        wt && wt.day && wt.from && wt.to
      );
      
      if (!finalValidation) {
        console.error('❌ التحقق النهائي فشل - بعض الكائنات لا تحتوي على الحقول الأساسية');
        console.error('❌ formattedWorkTimes:', formattedWorkTimes);
        setError('خطأ في تنسيق البيانات - يرجى المحاولة مرة أخرى');
        setLoading(false);
        return;
      }
      
      console.log('✅ التحقق النهائي نجح - جميع الكائنات تحتوي على الحقول الأساسية');
      
      // إضافة سجل مفصل للبيانات المرسلة
      console.log('🔍 تفاصيل البيانات المرسلة:', {
        workTimesCount: dataToSend.workTimes.length,
        vacationDaysCount: dataToSend.vacationDays.length,
        workTimesDetails: dataToSend.workTimes.map(wt => ({
          day: wt.day,
          from: wt.from,
          to: wt.to,
          type: typeof wt,
          isObject: typeof wt === 'object',
          hasAllFields: wt && wt.day && wt.from && wt.to,
          dayValid: wt.day && wt.day.trim() !== '',
          fromValid: wt.from && wt.from.trim() !== '',
          toValid: wt.to && wt.to.trim() !== ''
        }))
      });
      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctor/${profile._id}/work-schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ WorkTimesEditor: تم تحديث الجدول بنجاح:', data);
        setSuccess(t('changes_saved'));
        // تحديث البيانات المحلية فوراً مع timestamp
        const updatedData = {
          workTimes: data.workTimes || workTimes,
          vacationDays: data.vacationDays || vacationDays,
          lastUpdated: new Date().toISOString()
        };
        console.log('🔄 WorkTimesEditor: إرسال البيانات المحدثة:', updatedData);
        
        // تحديث البيانات المحلية أولاً مع timestamp
        if (profile) {
          const updatedProfile = { 
            ...profile, 
            workTimes: updatedData.workTimes,
            vacationDays: updatedData.vacationDays,
            lastUpdated: updatedData.lastUpdated
          };
          localStorage.setItem('profile', JSON.stringify(updatedProfile));
          
          // إضافة timestamp منفصل لأيام الإجازات
          localStorage.setItem('vacationDays_lastUpdated', updatedData.lastUpdated);
        }
        
        // تحديث state المحلي فوراً
        setWorkTimes(updatedData.workTimes);
        setVacationDays(updatedData.vacationDays);
        
        // إرسال البيانات المحدثة فوراً
        if (onUpdate && typeof onUpdate === 'function') {
          try {
            onUpdate(updatedData);
          } catch (error) {
            console.error('❌ خطأ في استدعاء onUpdate:', error);
          }
        }
        
        // إعادة جلب المواعيد بعد تأخير قصير
        if (fetchAllAppointments && typeof fetchAllAppointments === 'function') {
          setTimeout(() => {
            try {
              fetchAllAppointments();
            } catch (error) {
              console.error('❌ خطأ في استدعاء fetchAllAppointments:', error);
            }
          }, 500);
        }
      } else {
        console.error('❌ WorkTimesEditor: خطأ من السيرفر:', data);
        console.error('❌ تفاصيل الخطأ:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          body: data
        });
        
        // رسائل خطأ أكثر وضوحاً
        if (data.error) {
          setError(data.error);
        } else if (response.status === 400) {
          setError('خطأ في التحقق من صحة البيانات - يرجى التأكد من إدخال جميع البيانات المطلوبة');
        } else {
          setError('حدث خطأ أثناء تحديث الجدول');
        }
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
                        {/* {t('work_times_tab')} */}
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
            
            {/* رسالة توجيهية إذا لم تكن هناك أوقات دوام */}
            {workTimes.length === 0 && (
              <div style={{
                background: '#fff3cd',
                color: '#856404',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #ffeaa7',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                💡 يرجى إضافة وقت دوام واحد على الأقل قبل الحفظ
                <br />
                <button
                  type="button"
                  onClick={() => addWorkTime()}
                  style={{
                    background: '#856404',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    marginTop: '0.5rem'
                  }}
                >
                  ➕ إضافة وقت دوام افتراضي
                </button>
              </div>
            )}
          </div>
        )}

                        {/* {t('vacation_days_tab')} */}
        {activeTab === 'vacationDays' && (
          <div>
            <h3 style={{ color: '#0A8F82', marginBottom: '1rem', fontSize: '1.2rem' }}>
              🏖️ {t('vacation_days')}
            </h3>

            {/* {t('advanced_calendar')} */}
            <div style={{ 
              background: '#fff', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              marginBottom: '2rem'
            }}>
              <h4 style={{ color: '#333', marginBottom: '1rem', textAlign: 'center' }}>
                {t('vacation_calendar_title')}
              </h4>
              
              {/* {t('month_navigation')} */}
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
                    {t(['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'][currentMonth])} {currentYear}
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

              {/* {t('quick_selection_buttons')} */}
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
                  {t('select_weekend')}
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
                  {t('select_work_days')}
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
                  {t('clear_all')}
                </button>
                <button
                  type="button"
                  onClick={refreshData}
                  style={{
                    background: '#0A8F82',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                  title={t('refresh_local_data')}
                >
                  🔄 {t('refresh')}
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
                {/* {t('weekdays')} */}
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
                  const startDate = new Date(firstDay);
                  startDate.setDate(startDate.getDate() - firstDay.getDay());
                  
                  const days = [];
                  for (let i = 0; i < 42; i++) {
                    const date = new Date(startDate);
                    date.setDate(startDate.getDate() + i);
                    
                    if (date.getMonth() === currentMonth) {
                      // استخدام التاريخ المحلي بدلاً من UTC
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      const dateStr = `${year}-${month}-${day}`;
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
                    {t('selected_days_count', { count: selectedDates.length })}
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
                    ✅ {t('save_selected_days')}
                  </button>
                </div>
              )}
            </div>

            {/* {t('current_vacation_days_list')} */}
            <div style={{ 
              background: '#fff', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
            }}>
                              <h4 style={{ color: '#333', marginBottom: '1rem' }}>
                  {t('current_vacation_days')} ({vacationDays.length})
                </h4>
              
              {vacationDays.length === 0 ? (
                                  <p style={{ color: '#666', textAlign: 'center', fontStyle: 'italic' }}>
                    {t('no_vacation_days')}
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
                            🏖️ {t('vacation')}
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
                          title={t('cancel_vacation_tooltip')}
                        >
                          🔄 {t('cancel_vacation')}
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
                          title={t('delete_vacation_tooltip')}
                        >
                          🗑️ {t('delete')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

                              {/* {t('add_vacation_manually_comment')} */}
              <div style={{ marginTop: '1.5rem' }}>
                                  <h5 style={{ color: '#333', marginBottom: '1rem' }}>
                    {t('add_vacation_manually')}
                  </h5>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.3rem', color: '#333', fontWeight: '600', fontSize: '0.9rem' }}>
                                              {t('vacation_date')}
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
                    ➕ {t('add')}
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