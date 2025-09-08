import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import DatePicker from 'react-datepicker';
import { ar } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import './BookForOtherPage.css';

function BookForOtherPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // معلومات المريض
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [reason, setReason] = useState('');
  
  // البحث في أسماء المرضى
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // حالات الحجز والتقويم
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [success, setSuccess] = useState('');
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  
  // أيام الأسبوع والشهور
  const weekdays = useMemo(() => ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'], []);
  const months = useMemo(() => [
    'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
    'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'
  ], []);

  // دالة للحصول على رابط الصورة
  const getImageUrl = (doctor) => {
    if (!doctor) return '/logo.png';
    const img = doctor?.image || doctor?.profileImage;
    if (!img) return '/logo.png';
    if (img.startsWith('/uploads/')) return process.env.REACT_APP_API_URL + img;
    if (img.startsWith('http')) return img;
    return '/logo.png';
  };

  const fetchDoctorDetails = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctors`);
      const data = await response.json();
      const found = data.find(d => d._id === id);
      if (found) {
        setDoctor(found);
      } else {
        setError('الطبيب غير موجود');
      }
    } catch (err) {
      setError('خطأ في جلب بيانات الطبيب');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // دالة البحث في أسماء المرضى
  const searchPatients = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/search-patients?q=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } catch (err) {
      console.error('خطأ في البحث:', err);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // دالة اختيار مريض من نتائج البحث
  const selectPatient = (patient) => {
    setPatientName(patient.name);
    setPatientPhone(patient.phone);
    setPatientAge(patient.age || '');
    setSearchTerm('');
    setShowSearchResults(false);
  };

  useEffect(() => {
    // التحقق من تسجيل الدخول
    const savedUser = localStorage.getItem('user');
    const savedProfile = localStorage.getItem('profile');
    const hasUser = user || profile;
    const hasSavedData = savedUser || savedProfile;
    
    if (!hasSavedData && !hasUser) {
      const currentUrl = window.location.pathname + window.location.search;
      navigate(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }
    
    fetchDoctorDetails();
  }, [id, user, profile, navigate, fetchDoctorDetails]);

  // useEffect للبحث في أسماء المرضى
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        searchPatients(searchTerm);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300); // تأخير 300ms لتجنب البحث المتكرر

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchPatients]);

  // إغلاق نتائج البحث عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSearchResults && !event.target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchResults]);

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

  const fetchBookedAppointments = useCallback(async (doctorId, date) => {
    if (isLoadingAppointments) return; // منع الطلبات المتكررة
    
    setIsLoadingAppointments(true);
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
      console.error('Error fetching booked appointments:', error);
      setBookedTimes([]);
    } finally {
      setIsLoadingAppointments(false);
    }
  }, [isLoadingAppointments]);

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

  // useEffect للتقويم والأوقات المتاحة
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
    
    const dayName = weekdays[selectedDate.getDay()];
    const workTime = doctor?.workTimes?.find(wt => wt.day === dayName);
    
    if (workTime && workTime.from && workTime.to) {
      const slots = generateTimeSlots(workTime.from, workTime.to);
      setAvailableTimes(slots);
      
      // جلب المواعيد المحجوزة فقط إذا لم تكن جارية بالفعل
      if (!isLoadingAppointments && doctor?._id) {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        fetchBookedAppointments(doctor._id, dateString);
      }
    } else {
      setAvailableTimes([]);
      setBookedTimes([]);
    }
  }, [selectedDate, doctor, generateTimeSlots, isDayAvailable, fetchBookedAppointments, isLoadingAppointments, weekdays]);

  const handleBooking = async (e) => {
    e.preventDefault();
    
    // التحقق من تسجيل الدخول
    if (!user?._id && !profile?._id) {
      setSuccess('يجب تسجيل الدخول أولاً');
      return;
    }
    
    if (!patientName || !patientPhone || !selectedDate || !selectedTime) {
      setSuccess('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    if (!patientAge) {
      setSuccess('يرجى إدخال العمر');
      return;
    }
    
    const ageNum = parseInt(patientAge);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setSuccess('يرجى إدخال عمر صحيح');
      return;
    }

    setBookingLoading(true);
    setSuccess('');
    
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    try {
      if (!doctor?._id) {
        setSuccess('خطأ: بيانات الطبيب غير متوفرة');
        return;
      }

      const appointmentData = {
        userId: user?._id || profile?._id,
        doctorId: doctor._id,
        userName: profile?.first_name || user?.first_name || 'مستخدم',
        doctorName: doctor.name,
        patientName,
        patientPhone,
        patientAge: parseInt(patientAge),
        reason: reason || '',
        date: dateString,
        time: selectedTime,
        isBookingForOther: true,
        bookerName: profile?.first_name || user?.first_name || 'مستخدم',
        duration: doctor?.appointmentDuration || 30
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData)
      });

      if (response.ok) {
        setBookingSuccess(true);
        // إظهار رسالة تأكيد قبل الانتقال
        const shouldNavigate = window.confirm('تم الحجز بنجاح! هل تريد الانتقال إلى صفحة الطبيب؟');
        if (shouldNavigate) {
          navigate(`/doctor/${id}`);
        }
        // إخفاء رسالة النجاح بعد 3 ثوانٍ
        setTimeout(() => {
          setBookingSuccess(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        setSuccess(errorData.message || 'حدث خطأ في الحجز');
      }
    } catch (err) {
      setSuccess('حدث خطأ في الحجز');
    } finally {
      setBookingLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="book-for-other-container">
        <div className="loading">جاري التحميل...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="book-for-other-container">
        <div className="error">{error}</div>
        <button onClick={() => navigate('/')} className="btn-primary">
          العودة للرئيسية
        </button>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="book-for-other-container">
        <div className="success-message">
          <div className="success-icon">✅</div>
          <h2>تم الحجز بنجاح!</h2>
          <p>سيتم توجيهك إلى صفحة الطبيب...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="book-for-other-container">
      <div className="book-for-other-header">
        <button 
          onClick={() => navigate(`/doctor/${id}`)}
          className="back-button"
        >
          ← العودة
        </button>
        <h1>حجز موعد لشخص آخر</h1>
        {doctor && (
          <div className="doctor-info">
            <img 
              src={getImageUrl(doctor)} 
              alt={doctor?.name || 'طبيب'} 
              onError={(e) => {
                e.target.src = '/logo.png';
              }}
              className="doctor-avatar"
            />
            <div className="doctor-details">
              <h2>{doctor?.name || 'طبيب'}</h2>
              <p>{doctor?.specialty || 'تخصص'}</p>
            </div>
          </div>
        )}
      </div>

      <div className="booking-form">
        <div className="form-section">
          <h3>معلومات المريض</h3>
          
          {/* البحث في أسماء المرضى */}
          <div className="form-group">
            <label>{t('search_patients')}</label>
            <div className="search-container" style={{position: 'relative'}}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('search_patients_placeholder')}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              {isSearching && (
                <div style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#7c4dff'
                }}>
                  {t('searching_patients')}
                </div>
              )}
              
              {/* نتائج البحث */}
              {showSearchResults && searchResults.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {searchResults.map((patient, index) => (
                    <div
                      key={index}
                      onClick={() => selectPatient(patient)}
                      style={{
                        padding: '0.75rem',
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                      onMouseLeave={(e) => e.target.style.background = '#fff'}
                    >
                      <div>
                        <div style={{fontWeight: '600', color: '#7c4dff'}}>{patient.name}</div>
                        <div style={{fontSize: '0.9rem', color: '#666'}}>{patient.phone}</div>
                      </div>
                      <div style={{fontSize: '0.8rem', color: '#999'}}>
                        {patient.age ? `${patient.age} ${t('years_old')}` : t('patient_age_unknown')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {showSearchResults && searchResults.length === 0 && !isSearching && searchTerm && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  padding: '0.75rem',
                  textAlign: 'center',
                  color: '#666'
                }}>
                  {t('no_patients_found')}
                </div>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label>الاسم الكامل *</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="أدخل اسم المريض"
              required
            />
          </div>

          <div className="form-group">
            <label>رقم الهاتف *</label>
            <input
              type="tel"
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              placeholder="أدخل رقم الهاتف"
              required
            />
          </div>

          <div className="form-group">
            <label>العمر *</label>
            <input
              type="number"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
              placeholder="أدخل العمر"
              min="1"
              max="120"
              required
            />
          </div>

          <div className="form-group">
            <label>سبب الزيارة</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="أدخل سبب الزيارة (اختياري)"
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>اختيار الموعد</h3>
          
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
        </div>

        <form onSubmit={handleBooking} className="booking-actions">
          <div className="form-actions">
            <button
              type="submit"
              disabled={!patientName || !patientPhone || !patientAge || !selectedDate || !selectedTime || bookingLoading}
              className="btn-primary"
            >
              {bookingLoading ? 'جاري الحجز...' : 'تأكيد الحجز'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate(`/doctor/${id}`)}
              className="btn-secondary"
            >
              إلغاء
            </button>
          </div>
          
          {success && (
            <div className="success-message">{success}</div>
          )}
        </form>
      </div>
    </div>
  );
}

export default BookForOtherPage;
