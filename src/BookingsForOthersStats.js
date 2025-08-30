import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { normalizePhone } from './utils/phoneUtils';

const BookingsForOthersStats = () => {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [persons, setPersons] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPerson, setNewPerson] = useState({ name: '', phone: '' });
  const [timePeriod, setTimePeriod] = useState('all_time');
  const [loading, setLoading] = useState(false);

  // جلب الأشخاص المضافين
  useEffect(() => {
    if (profile?._id) {
      fetchPersons();
    }
  }, [profile?._id]);

  const fetchPersons = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/doctors/${profile._id}/bookings-for-others`);
      if (response.ok) {
        const data = await response.json();
        setPersons(data);
      }
    } catch (error) {
      console.error('Error fetching persons:', error);
    }
  };

  // إضافة شخص جديد
  const handleAddPerson = async () => {
    if (!newPerson.name.trim() || !newPerson.phone.trim()) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }

    setLoading(true);
    try {
      const normalizedPhone = normalizePhone(newPerson.phone);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/doctors/${profile._id}/bookings-for-others`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPerson.name.trim(),
          phone: normalizedPhone
        })
      });

      if (response.ok) {
        toast.success(t('doctor_dashboard.person_added_success'));
        setNewPerson({ name: '', phone: '' });
        setShowAddModal(false);
        fetchPersons();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || t('doctor_dashboard.error_adding_person'));
      }
    } catch (error) {
      toast.error(t('doctor_dashboard.error_adding_person'));
    } finally {
      setLoading(false);
    }
  };

  // إزالة شخص
  const handleRemovePerson = async (personId) => {
    if (!window.confirm('هل أنت متأكد من إزالة هذا الشخص؟')) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/doctors/${profile._id}/bookings-for-others/${personId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success(t('doctor_dashboard.person_removed_success'));
        fetchPersons();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || t('doctor_dashboard.error_removing_person'));
      }
    } catch (error) {
      toast.error(t('doctor_dashboard.error_removing_person'));
    }
  };

  // حساب الإحصائيات حسب الفترة الزمنية
  const calculateStats = (person) => {
    const now = new Date();
    let filteredBookings = person.bookings || [];

    if (timePeriod === 'this_week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredBookings = filteredBookings.filter(booking => new Date(booking.date) >= weekAgo);
    } else if (timePeriod === 'this_month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
      filteredBookings = filteredBookings.filter(booking => new Date(booking.date) >= monthAgo);
    }

    const totalBookings = filteredBookings.length;
    const attendedBookings = filteredBookings.filter(booking => booking.attendance === 'attended').length;
    const attendanceRate = totalBookings > 0 ? Math.round((attendedBookings / totalBookings) * 100) : 0;

    return { totalBookings, attendedBookings, attendanceRate };
  };

  return (
    <div style={{
      background: '#f7fafd',
      minHeight: '100vh',
      padding: '1rem'
    }}>
      {/* العنوان */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{
          color: '#0A8F82',
          fontSize: '2rem',
          fontWeight: 800,
          marginBottom: '0.5rem'
        }}>
          {t('doctor_dashboard.appointments_for_others')}
        </h1>
        <p style={{
          color: '#666',
          fontSize: '1rem'
        }}>
          {t('doctor_dashboard.appointments_for_others_description')}
        </p>
      </div>

      {/* زر إضافة شخص جديد */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            background: '#0A8F82',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            padding: '0.8rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(10, 143, 130, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span role="img" aria-label="add">➕</span>
          {t('doctor_dashboard.add_person')}
        </button>
      </div>

      {/* اختيار الفترة الزمنية */}
      <div style={{
        maxWidth: '600px',
        margin: '0 auto 2rem auto',
        textAlign: 'center'
      }}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontWeight: 700,
          color: '#0A8F82'
        }}>
          {t('doctor_dashboard.select_time_period')}:
        </label>
        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          style={{
            background: '#fff',
            border: '2px solid #0A8F82',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            fontWeight: 600,
            color: '#0A8F82',
            cursor: 'pointer',
            minWidth: '200px'
          }}
        >
          <option value="this_week">{t('doctor_dashboard.this_week')}</option>
          <option value="this_month">{t('doctor_dashboard.this_month')}</option>
          <option value="all_time">{t('doctor_dashboard.all_time')}</option>
        </select>
      </div>

      {/* عرض الأشخاص والإحصائيات */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {persons.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            color: '#666'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <p>{t('doctor_dashboard.no_persons_added')}</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            {persons.map((person) => {
              const stats = calculateStats(person);
              return (
                <div
                  key={person._id}
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    border: '1px solid #f0f0f0'
                  }}
                >
                  {/* معلومات الشخص */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div>
                      <h3 style={{
                        color: '#0A8F82',
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        margin: '0 0 0.5rem 0'
                      }}>
                        {person.name}
                      </h3>
                      <p style={{
                        color: '#666',
                        margin: 0,
                        fontSize: '1rem'
                      }}>
                        {person.phone}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemovePerson(person._id)}
                      style={{
                        background: '#e53935',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.5rem 1rem',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      {t('doctor_dashboard.remove_person')}
                    </button>
                  </div>

                  {/* الإحصائيات */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1rem'
                  }}>
                    <div style={{
                      textAlign: 'center',
                      padding: '1rem',
                      background: '#f8f9fa',
                      borderRadius: '12px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{
                        fontSize: '2rem',
                        fontWeight: 900,
                        color: '#0A8F82',
                        marginBottom: '0.5rem'
                      }}>
                        {stats.totalBookings}
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#666',
                        fontWeight: 600
                      }}>
                        {t('doctor_dashboard.bookings_count')}
                      </div>
                    </div>

                    <div style={{
                      textAlign: 'center',
                      padding: '1rem',
                      background: '#f8f9fa',
                      borderRadius: '12px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{
                        fontSize: '2rem',
                        fontWeight: 900,
                        color: '#28a745',
                        marginBottom: '0.5rem'
                      }}>
                        {stats.attendedBookings}
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#666',
                        fontWeight: 600
                      }}>
                        {t('doctor_dashboard.attended_count')}
                      </div>
                    </div>

                    <div style={{
                      textAlign: 'center',
                      padding: '1rem',
                      background: '#f8f9fa',
                      borderRadius: '12px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{
                        fontSize: '2rem',
                        fontWeight: 900,
                        color: '#ffc107',
                        marginBottom: '0.5rem'
                      }}>
                        {stats.attendanceRate}%
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#666',
                        fontWeight: 600
                      }}>
                        {t('doctor_dashboard.attendance_rate')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* مودال إضافة شخص جديد */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }} onClick={() => setShowAddModal(false)}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{
              color: '#0A8F82',
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              {t('doctor_dashboard.add_person')}
            </h2>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                color: '#333'
              }}>
                {t('doctor_dashboard.person_name')}:
              </label>
              <input
                type="text"
                value={newPerson.name}
                onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                placeholder={t('doctor_dashboard.add_person_placeholder')}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0A8F82';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                color: '#333'
              }}>
                {t('doctor_dashboard.person_phone')}:
              </label>
              <input
                type="tel"
                value={newPerson.phone}
                onChange={(e) => setNewPerson({ ...newPerson, phone: e.target.value })}
                placeholder={t('doctor_dashboard.phone_placeholder')}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0A8F82';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.8rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {t('doctor_dashboard.cancel')}
              </button>
              <button
                onClick={handleAddPerson}
                disabled={loading}
                style={{
                  background: '#0A8F82',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.8rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                {loading ? '...' : t('doctor_dashboard.confirm_add')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsForOthersStats;
