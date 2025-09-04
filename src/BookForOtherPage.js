import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import { ar } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import './BookForOtherPage.css';

function BookForOtherPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // معلومات المريض
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [reason, setReason] = useState('');
  
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
  const weekdays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const months = [
    'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
    'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'
  ];

  useEffect(() => {
    fetchDoctorDetails();
  }, [id]);

  const fetchDoctorDetails = async () => {
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
  };

  const getAvailableDays = () => {
    if (!doctor?.workTimes || !Array.isArray(doctor.workTimes)) return [];
    return doctor.workTimes.map(wt => wt.day).filter(Boolean);
  };

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
  }, [doctor?.workTimes, doctor?.vacationDays]);

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
    const workTime = doctor.workTimes.find(wt => wt.day === dayName);
    
    if (workTime && workTime.from && workTime.to) {
      const slots = generateTimeSlots(workTime.from, workTime.to);
      setAvailableTimes(slots);
      
      // جلب المواعيد المحجوزة فقط إذا لم تكن جارية بالفعل
      if (!isLoadingAppointments) {
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
  }, [selectedDate, doctor, generateTimeSlots, isDayAvailable, fetchBookedAppointments, isLoadingAppointments]);

  const handleBooking = async (e) => {
    e.preventDefault();
    
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
      const appointmentData = {
        doctorId: doctor._id,
        patientName,
        patientPhone,
        patientAge: parseInt(patientAge),
        reason: reason || '',
        date: dateString,
        time: selectedTime,
        isBookingForOther: true,
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
        setTimeout(() => {
          navigate(`/doctor/${id}`);
        }, 2000);
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
            <h2>{doctor.name}</h2>
            <p>{doctor.specialty}</p>
          </div>
        )}
      </div>

      <div className="booking-form">
        <div className="form-section">
          <h3>معلومات المريض</h3>
          
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
