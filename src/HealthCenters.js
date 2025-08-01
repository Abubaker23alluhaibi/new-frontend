import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';

function HealthCenters() {
  const { t } = useTranslation();
  const [healthCenters, setHealthCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchHealthCenters();
  }, []);

  const fetchHealthCenters = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/health-centers`);
      if (response.ok) {
        const data = await response.json();
        setHealthCenters(data);
      } else {
        // بيانات تجريبية في حالة فشل الاتصال
        setHealthCenters([
          {
            _id: 1,
            name: 'مركز الحياة الطبي',
            type: 'clinic',
            location: 'بغداد - الكاظمية',
            services: 'استشارات طبية، فحوصات مخبرية، أشعة سينية',
            specialties: 'طب عام، أمراض القلب، طب الأطفال',
            workingHours: 'الأحد - الخميس: 8:00 ص - 6:00 م',
            description: 'مركز طبي متكامل يقدم خدمات صحية عالية الجودة',
            phone: '+964 750 123 4567',
            email: 'info@lifeclinic.com',
            rating: 4.5,
            reviews: 128,
            logo: '🏥',
            doctors: [
              {
                _id: 'doc1',
                name: 'د. محمد حسن',
                specialty: 'طب عام',
                experience: '15 سنة',
                education: 'دكتوراه في الطب - جامعة بغداد',
                workingHours: 'الأحد - الخميس: 9:00 ص - 5:00 م',
                description: 'طبيب عام ذو خبرة واسعة في تشخيص وعلاج الأمراض العامة',
                phone: '+964 750 123 4568',
                email: 'dr.mohamed@lifeclinic.com'
              },
              {
                _id: 'doc2',
                name: 'د. سارة أحمد',
                specialty: 'أمراض القلب',
                experience: '12 سنة',
                education: 'دكتوراه في أمراض القلب - جامعة البصرة',
                workingHours: 'الأحد - الأربعاء: 10:00 ص - 4:00 م',
                description: 'اختصاصية في أمراض القلب والشرايين مع خبرة في القسطرة القلبية',
                phone: '+964 750 123 4569',
                email: 'dr.sara@lifeclinic.com'
              },
              {
                _id: 'doc3',
                name: 'د. علي محمود',
                specialty: 'طب الأطفال',
                experience: '8 سنوات',
                education: 'دكتوراه في طب الأطفال - جامعة الموصل',
                workingHours: 'الأحد - الخميس: 8:00 ص - 3:00 م',
                description: 'طبيب أطفال متخصص في رعاية الأطفال من الولادة حتى 18 سنة',
                phone: '+964 750 123 4570',
                email: 'dr.ali@lifeclinic.com'
              }
            ]
          },
          {
            _id: 2,
            name: 'مستشفى الأمل التخصصي',
            type: 'hospital',
            location: 'بغداد - المنصور',
            services: 'جراحة عامة، عناية مركزة، طوارئ 24/7',
            specialties: 'جراحة القلب، طب الأعصاب، طب العيون',
            workingHours: '24/7',
            description: 'مستشفى تخصصي متقدم يقدم رعاية صحية شاملة',
            phone: '+964 750 123 4568',
            email: 'info@hopehospital.com',
            rating: 4.8,
            reviews: 256,
            logo: '🏥',
            doctors: [
              {
                _id: 'doc4',
                name: 'د. أحمد علي',
                specialty: 'جراحة القلب',
                experience: '20 سنة',
                education: 'دكتوراه في جراحة القلب - جامعة القاهرة',
                workingHours: 'الأحد - الخميس: 8:00 ص - 6:00 م',
                description: 'جراح قلب متخصص في جراحات القلب المفتوح والقسطرة',
                phone: '+964 750 123 4571',
                email: 'dr.ahmed@hopehospital.com'
              },
              {
                _id: 'doc5',
                name: 'د. فاطمة محمد',
                specialty: 'طب الأعصاب',
                experience: '18 سنة',
                education: 'دكتوراه في طب الأعصاب - جامعة دمشق',
                workingHours: 'الأحد - الأربعاء: 9:00 ص - 5:00 م',
                description: 'اختصاصية في طب الأعصاب والدماغ مع خبرة في علاج السكتات الدماغية',
                phone: '+964 750 123 4572',
                email: 'dr.fatima@hopehospital.com'
              },
              {
                _id: 'doc6',
                name: 'د. نور الدين',
                specialty: 'طب العيون',
                experience: '14 سنة',
                education: 'دكتوراه في طب العيون - جامعة بغداد',
                workingHours: 'الأحد - الخميس: 10:00 ص - 4:00 م',
                description: 'طبيب عيون متخصص في جراحات العيون والليزر',
                phone: '+964 750 123 4573',
                email: 'dr.nour@hopehospital.com'
              }
            ]
          },
          {
            _id: 3,
            name: 'عيادة النور الطبية',
            type: 'clinic',
            location: 'بغداد - الأعظمية',
            services: 'استشارات طبية، فحوصات دورية، طب أسنان',
            specialties: 'طب عام، طب الأسنان، طب النساء',
            workingHours: 'الأحد - الخميس: 9:00 ص - 5:00 م',
            description: 'عيادة طبية تقدم رعاية شخصية ومهنية',
            phone: '+964 750 123 4569',
            email: 'info@nourclinic.com',
            rating: 4.3,
            reviews: 89,
            logo: '🏥',
            doctors: [
              {
                _id: 'doc7',
                name: 'د. زينب حسن',
                specialty: 'طب الأسنان',
                experience: '10 سنوات',
                education: 'دكتوراه في طب الأسنان - جامعة بغداد',
                workingHours: 'الأحد - الخميس: 9:00 ص - 5:00 م',
                description: 'طبيبة أسنان متخصصة في تجميل الأسنان والتركيبات',
                phone: '+964 750 123 4574',
                email: 'dr.zainab@nourclinic.com'
              },
              {
                _id: 'doc8',
                name: 'د. رنا محمد',
                specialty: 'طب النساء',
                experience: '12 سنة',
                education: 'دكتوراه في طب النساء والتوليد - جامعة البصرة',
                workingHours: 'الأحد - الأربعاء: 10:00 ص - 4:00 م',
                description: 'اختصاصية في طب النساء والتوليد مع خبرة في الولادة الطبيعية',
                phone: '+964 750 123 4575',
                email: 'dr.rana@nourclinic.com'
              }
            ]
          }
        ]);
      }
    } catch (error) {
      console.error('خطأ في جلب المراكز الصحية:', error);
              setError(t('error_loading_health_centers'));
    } finally {
      setLoading(false);
    }
  };

  const filteredCenters = healthCenters.filter(center => {
    const matchesSearch = center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         center.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         center.specialties.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || center.type === selectedType;
    const matchesSpecialty = selectedSpecialty === 'all' || 
                            center.specialties.toLowerCase().includes(selectedSpecialty.toLowerCase());
    
    return matchesSearch && matchesType && matchesSpecialty;
  });

  const getTypeLabel = (type) => {
    switch (type) {
      case 'hospital': return 'مستشفى';
      case 'clinic': return 'عيادة';
      case 'center': return 'مركز صحي';
      default: return type;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'hospital': return '#e74c3c';
      case 'clinic': return '#3498db';
      case 'center': return '#2ecc71';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(90deg, #7c4dff 0%, #00bcd4 100%)',
        color: 'white',
        fontSize: '1.2rem'
      }}>
        <div>جاري تحميل المراكز الصحية...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafd' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(90deg, #7c4dff 0%, #00bcd4 100%)',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontWeight: 900 }}>🏥 المراكز الصحية</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/home')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            الصفحة الرئيسية
          </button>
          {user && (
            <button
              onClick={() => navigate('/profile')}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              الملف الشخصي
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                🔍 البحث في المراكز الصحية
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث بالاسم، الموقع، أو التخصص..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                نوع المركز
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  fontSize: '1rem',
                  minWidth: '120px'
                }}
              >
                <option value="all">جميع الأنواع</option>
                <option value="hospital">مستشفى</option>
                <option value="clinic">عيادة</option>
                <option value="center">مركز صحي</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                التخصص
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  fontSize: '1rem',
                  minWidth: '150px'
                }}
              >
                <option value="all">جميع التخصصات</option>
                <option value="طب عام">طب عام</option>
                <option value="أمراض القلب">أمراض القلب</option>
                <option value="طب الأطفال">طب الأطفال</option>
                <option value="طب النساء">طب النساء</option>
                <option value="طب العيون">طب العيون</option>
                <option value="طب الأسنان">طب الأسنان</option>
                <option value="جراحة">جراحة</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div style={{ marginBottom: '1rem', color: '#666' }}>
          تم العثور على {filteredCenters.length} مركز صحي
        </div>

        {/* Health Centers Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredCenters.map(center => (
            <div key={center._id} style={{
              background: 'white',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onClick={() => {
              // هنا يمكن إضافة الانتقال لصفحة تفاصيل المركز
              alert(`سيتم إضافة صفحة تفاصيل المركز: ${center.name}`);
            }}
            >
              {/* Header */}
              <div style={{
                background: `linear-gradient(135deg, ${getTypeColor(center.type)} 0%, ${getTypeColor(center.type)}dd 100%)`,
                color: 'white',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{center.logo}</div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold' }}>{center.name}</h3>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '0.3rem 0.8rem',
                  borderRadius: 20,
                  fontSize: '0.85rem',
                  display: 'inline-block',
                  marginTop: '0.5rem'
                }}>
                  {getTypeLabel(center.type)}
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '1.5rem' }}>
                {/* Rating */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ color: '#ffc107', fontSize: '1.2rem' }}>
                    {'⭐'.repeat(Math.floor(center.rating))}
                    {center.rating % 1 !== 0 && '⭐'}
                  </div>
                  <span style={{ marginLeft: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                    {center.rating} ({center.reviews} تقييم)
                  </span>
                </div>

                {/* Location */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#666', marginLeft: '0.5rem' }}>📍</span>
                    <strong style={{ color: '#333' }}>الموقع:</strong>
                  </div>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{center.location}</p>
                </div>

                {/* Specialties */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#666', marginLeft: '0.5rem' }}>🏥</span>
                    <strong style={{ color: '#333' }}>التخصصات:</strong>
                  </div>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{center.specialties}</p>
                </div>

                {/* Services */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#666', marginLeft: '0.5rem' }}>🩺</span>
                    <strong style={{ color: '#333' }}>الخدمات:</strong>
                  </div>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{center.services}</p>
                </div>

                {/* Working Hours */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#666', marginLeft: '0.5rem' }}>🕒</span>
                    <strong style={{ color: '#333' }}>ساعات العمل:</strong>
                  </div>
                  {Array.isArray(center.workTimes) && center.workTimes.length > 0 ? (
                    (() => {
                      const validTimes = center.workTimes.filter(
                        t => t && typeof t.day === 'string' && typeof t.from === 'string' && typeof t.to === 'string'
                      );
                      return validTimes.length > 0 ? (
                        <ul style={{margin:0, padding:'0 1rem', color:'#666', fontSize:'0.9rem'}}>
                          {validTimes.map((t, idx) => (
                            <li key={idx}>{t.day} : {t.from} - {t.to}</li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>لا توجد أوقات دوام متوفرة</p>
                      );
                    })()
                  ) : center.workTimes && typeof center.workTimes === 'object' && !Array.isArray(center.workTimes) ? (
                    (() => {
                      const validDays = Object.entries(center.workTimes).filter(
                        ([, time]) =>
                          time &&
                          typeof time === 'object' &&
                          !Array.isArray(time) &&
                          typeof time.from === 'string' &&
                          typeof time.to === 'string' &&
                          // حماية إضافية: إذا كان time فيه مفاتيح أيام الأسبوع، تجاهله
                          !('sunday' in time || 'monday' in time || 'tuesday' in time || 'wednesday' in time || 'thursday' in time || 'friday' in time || 'saturday' in time)
                      );
                      return validDays.length > 0 ? (
                        <ul style={{margin:0, padding:'0 1rem', color:'#666', fontSize:'0.9rem'}}>
                          {validDays.map(([day, time], idx) => (
                            <li key={idx}>{day} : {time.from} - {time.to}</li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>لا توجد أوقات دوام متوفرة</p>
                      );
                    })()
                  ) : typeof center.workingHours === 'object' && !Array.isArray(center.workingHours) ? (
                    <ul style={{margin:0, padding:'0 1rem', color:'#666', fontSize:'0.9rem'}}>
                      {Object.entries(center.workingHours).map(([day, time], idx) => (
                        time && typeof time === 'object' && typeof time.from === 'string' && typeof time.to === 'string'
                          ? <li key={idx}>{day} : {time.from} - {time.to}</li>
                          : null
                      ))}
                    </ul>
                  ) : typeof center.workingHours === 'string' ? (
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{center.workingHours}</p>
                  ) : (
                    <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>لا توجد أوقات دوام متوفرة</p>
                  )}
                </div>

                {/* Contact */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#666', marginLeft: '0.5rem' }}>📞</span>
                    <strong style={{ color: '#333' }}>التواصل:</strong>
                  </div>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{center.phone}</p>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>{center.email}</p>
                </div>

                {/* Description */}
                {center.description && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#666', marginLeft: '0.5rem' }}>📝</span>
                      <strong style={{ color: '#333' }}>الوصف:</strong>
                    </div>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', lineHeight: '1.5' }}>
                      {center.description}
                    </p>
                  </div>
                )}

                {/* Doctors */}
                {center.doctors && center.doctors.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#666', marginLeft: '0.5rem' }}>👨‍⚕️</span>
                      <strong style={{ color: '#333' }}>الأطباء ({center.doctors.length}):</strong>
                    </div>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {center.doctors.map((doctor, index) => (
                        <div key={doctor._id} style={{
                          background: '#f8f9fa',
                          padding: '0.75rem',
                          borderRadius: 8,
                          marginBottom: '0.5rem',
                          border: '1px solid #e9ecef'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <div>
                              <strong style={{ color: '#333', fontSize: '0.95rem' }}>{doctor.name}</strong>
                              <div style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                                {doctor.specialty} • {doctor.experience}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // هنا يمكن إضافة الانتقال لصفحة حجز موعد مع الطبيب
                                alert(`سيتم إضافة صفحة حجز موعد مع: ${doctor.name}`);
                              }}
                              style={{
                                background: '#28a745',
                                color: 'white',
                                border: 'none',
                                padding: '0.4rem 0.8rem',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                              }}
                            >
                              حجز موعد
                            </button>
                          </div>
                          <div style={{ color: '#666', fontSize: '0.8rem', lineHeight: '1.4' }}>
                            <div>🕒 {doctor.workingHours}</div>
                            <div>📞 {doctor.phone}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`tel:${center.phone}`, '_blank');
                    }}
                    style={{
                      flex: 1,
                      background: '#4caf50',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}
                  >
                    📞 اتصل الآن
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`mailto:${center.email}`, '_blank');
                    }}
                    style={{
                      flex: 1,
                      background: '#2196f3',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}
                  >
                    📧 راسلنا
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredCenters.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#666'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏥</div>
            <h3>لا توجد مراكز صحية تطابق البحث</h3>
            <p>جرب تغيير معايير البحث أو البحث بكلمات مختلفة</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HealthCenters; 