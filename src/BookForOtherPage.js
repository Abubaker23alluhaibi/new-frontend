import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  
  // حالات الحجز
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

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

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedTime('');
    
    if (date && doctor) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/appointments/available-slots/${doctor._id}?date=${date}`);
        const data = await response.json();
        setAvailableSlots(data.slots || []);
      } catch (err) {
        console.error('Error fetching slots:', err);
        setAvailableSlots([]);
      }
    }
  };

  const handleBooking = async () => {
    if (!patientName || !patientPhone || !selectedDate || !selectedTime) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setBookingLoading(true);
    
    try {
      const appointmentData = {
        doctorId: doctor._id,
        patientName,
        patientPhone,
        patientAge: patientAge || null,
        reason: reason || null,
        date: selectedDate,
        time: selectedTime,
        isBookingForOther: true
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
        alert(errorData.message || 'حدث خطأ في الحجز');
      }
    } catch (err) {
      alert('حدث خطأ في الحجز');
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
            <label>العمر</label>
            <input
              type="number"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
              placeholder="أدخل العمر (اختياري)"
              min="0"
              max="120"
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
          
          <div className="form-group">
            <label>التاريخ *</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {selectedDate && (
            <div className="form-group">
              <label>الوقت *</label>
              <div className="time-slots">
                {availableSlots.length > 0 ? (
                  availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      className={`time-slot ${selectedTime === slot ? 'selected' : ''}`}
                      onClick={() => setSelectedTime(slot)}
                    >
                      {slot}
                    </button>
                  ))
                ) : (
                  <p className="no-slots">لا توجد مواعيد متاحة في هذا التاريخ</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            onClick={handleBooking}
            disabled={!patientName || !patientPhone || !selectedDate || !selectedTime || bookingLoading}
            className="btn-primary"
          >
            {bookingLoading ? 'جاري الحجز...' : 'تأكيد الحجز'}
          </button>
          
          <button
            onClick={() => navigate(`/doctor/${id}`)}
            className="btn-secondary"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookForOtherPage;
