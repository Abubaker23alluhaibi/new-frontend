import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const provinces = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كركوك', 'السليمانية', 'دهوك', 'ذي قار', 'صلاح الدين', 'الأنبار', 'واسط', 'ميسان', 'بابل', 'القادسية', 'ديالى', 'المثنى', 'كربلاء', 'حلبجة'
];

const specialties = [
  'جراحة عامة', 'جراحة عظام', 'طب الأطفال', 'طب العيون', 'طب الأسنان', 'أمراض القلب', 'جلدية', 'نسائية وتوليد', 'أنف وأذن وحنجرة', 'باطنية', 'أعصاب', 'أورام', 'أشعة', 'تخدير', 'طب الأسرة', 'طب الطوارئ', 'طب نفسي', 'طب الكلى', 'طب الروماتيزم', 'طب المسالك البولية', 'أخرى'
];

function DoctorProfile({ onClose, edit: editProp = false, modal = false }) {
  const { profile, updateProfile, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    province: '',
    area: '',
    clinicLocation: '',
    mapLocation: '', // رابط الموقع على الخريطة
    about: '',
    profileImage: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [edit, setEdit] = useState(editProp || false);

  // دالة مساعدة لمسار صورة الطبيب
  const getImageUrl = img => {
    if (!img) return null;
    
    // إذا كانت الصورة من Cloudinary (تبدأ بـ https://res.cloudinary.com)
    if (img.startsWith('https://res.cloudinary.com')) {
      return img;
    }
    
    // إذا كانت الصورة محلية (تبدأ بـ /uploads/)
    if (img.startsWith('/uploads/')) {
      return process.env.REACT_APP_API_URL + img;
    }
    
    // إذا كانت الصورة رابط كامل
    if (img.startsWith('http')) {
      return img;
    }
    
    return null;
  };
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // تحديث النموذج عند تغيير البيانات الشخصية
  useEffect(() => {
    // إذا تم تمرير editProp، استخدمه. وإلا اترك الحالة الحالية
    if (editProp !== undefined) {
      setEdit(editProp);
    }
  }, [editProp]);

  useEffect(() => {
    if (profile) {
      console.log('🔍 profile data:', profile);
      console.log('🔍 profile.image:', profile.image);
      console.log('🔍 profile.profileImage:', profile.profileImage);
      setForm({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        specialty: profile.specialty || '',
        province: profile.province || '',
        area: profile.area || '',
        clinicLocation: profile.clinicLocation || '',
        mapLocation: profile.mapLocation || '', // رابط الموقع على الخريطة
        about: profile.about || '',
        profileImage: profile.profileImage || profile.image || ''
      });
      setImageLoadError(false);
    } else if (user) {
      // إذا لم يكن هناك profile، استخدم user
      console.log('🔍 user data:', user);
      console.log('🔍 user.image:', user.image);
      console.log('🔍 user.profileImage:', user.profileImage);
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        specialty: user.specialty || '',
        province: user.province || '',
        area: user.area || '',
        clinicLocation: user.clinicLocation || '',
        mapLocation: user.mapLocation || '', // رابط الموقع على الخريطة
        about: user.about || '',
        profileImage: user.profileImage || user.image || ''
      });
      setImageLoadError(false);
    }
  }, [profile, user]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('📸 تم اختيار صورة جديدة:', file.name, file.size, file.type);
      
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        alert('يجب أن يكون الملف صورة (JPG, PNG, GIF, etc.)');
        return;
      }
      
      // التحقق من حجم الملف (أقل من 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }

      setSelectedImage(file);
      setImageLoadError(false);
      
      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('✅ تم إنشاء معاينة للصورة');
        setImagePreview(e.target.result);
        // إظهار رسالة تأكيد
        setMsg('تم اختيار صورة جديدة! اضغط "حفظ التغييرات" لحفظ الصورة.');
      };
      reader.onerror = () => {
        console.error('❌ خطأ في قراءة الصورة');
        alert('خطأ في قراءة الصورة المختارة');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async e => {
    e.preventDefault();
    
    // إذا لم يكن في وضع التعديل، لا تفعل شيئاً
    if (!edit) {
      return;
    }
    
    setError('');
    setMsg('');
    setLoading(true);
    
    console.log('💾 بدء حفظ بيانات الملف الشخصي...');
    
    if (!form.name || !form.email || !form.phone || !form.specialty) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      setLoading(false);
      return;
    }

    try {
      let updatedForm = { ...form };
      
      // إذا كان هناك صورة جديدة، ارفعها أولاً
      if (selectedImage) {
        console.log('📤 رفع الصورة الجديدة...');
        const formData = new FormData();
        formData.append('image', selectedImage);
        
        const uploadRes = await fetch(`${process.env.REACT_APP_API_URL}/upload-profile-image`, {
          method: 'POST',
          body: formData
        });
        
        console.log('📤 استجابة رفع الصورة:', uploadRes.status);
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          console.log('✅ تم رفع الصورة بنجاح:', uploadData.imageUrl);
          
          // تحديث حقل image بدلاً من profileImage للتوافق مع تسجيل الحساب
          updatedForm.image = uploadData.imageUrl;
          updatedForm.profileImage = uploadData.imageUrl;
        } else {
          const errorData = await uploadRes.json();
          console.error('❌ خطأ في رفع الصورة:', errorData);
          throw new Error(errorData.error || 'خطأ في رفع الصورة');
        }
      }

      console.log('💾 تحديث بيانات الملف الشخصي...');
      const { error, data } = await updateProfile(updatedForm);
      
      if (error) {
        console.error('❌ خطأ في تحديث الملف الشخصي:', error);
        setError(error);
      } else {
        console.log('✅ تم تحديث الملف الشخصي بنجاح:', data);
        setMsg('تم تحديث الملف الشخصي بنجاح!');
        setEdit(false);
        setSelectedImage(null);
        setImagePreview(null);
        setImageLoadError(false);
      }
    } catch (err) {
      console.error('❌ خطأ في حفظ البيانات:', err);
      setError(err.message || 'حدث خطأ أثناء حفظ التغييرات');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEdit(false);
    setError('');
    setMsg('');
    setSelectedImage(null);
    setImagePreview(null);
    setImageLoadError(false);
    const currentData = profile || user;
    setForm({
      name: currentData?.name || '',
      email: currentData?.email || '',
      phone: currentData?.phone || '',
      specialty: currentData?.specialty || '',
      province: currentData?.province || '',
      area: currentData?.area || '',
      clinicLocation: currentData?.clinicLocation || '',
      mapLocation: currentData?.mapLocation || '', // رابط الموقع على الخريطة
      about: currentData?.about || '',
      profileImage: currentData?.profileImage || currentData?.image || ''
    });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('كلمة المرور الجديدة غير متطابقة');
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/doctor-password/${profile?._id || user?._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordForm.newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setMsg('تم تغيير كلمة المرور بنجاح');
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(data.error || t('error_changing_password'));
      }
    } catch (err) {
              setError(t('error_changing_password'));
    } finally {
      setLoading(false);
    }
  };

  if (!profile && !user) {
  return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f7fafd'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{color: '#7c4dff', fontSize: 48, marginBottom: 16}}>⏳</div>
          <h3 style={{color: '#333', marginBottom: 8}}>جاري تحميل البيانات...</h3>
          <p style={{color: '#666', marginBottom: 20}}>يرجى الانتظار قليلاً</p>
          <button 
            onClick={() => navigate('/doctor-dashboard')}
            style={{
              background: '#7c4dff',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '0.7rem 1.5rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: modal ? undefined : '100vh',
      background: modal ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: modal ? 0 : '2rem 1rem',
      position: 'relative'
    }}>
      {/* زر إغلاق في الزاوية العلوية اليمنى */}
      {onClose && (
        <button onClick={onClose} style={{position:'absolute', top:18, right:18, background:'none', border:'none', color:'#e53935', fontSize:26, fontWeight:900, cursor:'pointer', zIndex:10}}>&times;</button>
      )}
      {/* زر العودة للوحة التحكم عندما تكون صفحة مستقلة */}
      {!modal && (
        <button onClick={() => navigate('/doctor-dashboard')} style={{
          position:'absolute', 
          top:18, 
          left:18, 
          background:'rgba(255,255,255,0.9)', 
          border:'none', 
          color:'#7c4dff', 
          fontSize:16, 
          fontWeight:700, 
          cursor:'pointer', 
          zIndex:10,
          padding: '0.5rem 1rem',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          ← {t('back_to_dashboard')}
        </button>
      )}
      <div style={{
        maxWidth: 700,
        margin: '0 auto',
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #7c4dff 0%, #00bcd4 100%)',
          padding: '2rem',
          textAlign: 'center',
          color: '#fff'
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: 32,
            overflow: 'hidden',
            position: 'relative'
          }}>
            {(imagePreview || (form.profileImage && !imageLoadError)) ? (
              <img 
                src={imagePreview || getImageUrl(form.profileImage)}
                alt="الصورة الشخصية"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%'
                }}
                onError={(e) => {
                  console.log('❌ فشل تحميل الصورة:', e.target.src);
                  console.log('🔍 form.profileImage:', form.profileImage);
                  console.log('🔍 getImageUrl result:', getImageUrl(form.profileImage));
                  setImageLoadError(true);
                }}
                onLoad={() => {
                  console.log('✅ تم تحميل الصورة بنجاح');
                  setImageLoadError(false);
                }}
              />
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>👨‍⚕️</span>
            )}
            {edit && (
              <label style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: '#7c4dff',
                color: '#fff',
                borderRadius: '50%',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 14,
                boxShadow: '0 2px 8px rgba(124, 77, 255, 0.4)',
                transition: 'all 0.3s ease',
                border: '2px solid #fff'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 4px 12px rgba(124, 77, 255, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 2px 8px rgba(124, 77, 255, 0.4)';
              }}
              title="تغيير الصورة الشخصية"
              >
                📷
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>
          <h2 style={{margin: 0, fontWeight: 900, fontSize: 24}}>{t('doctor_profile_title')}</h2>
          <p style={{margin: '0.5rem 0 0', opacity: 0.9}}>{t('edit_doctor_account_data')}</p>
        </div>

        {/* Form */}
        <div style={{padding: '2rem'}}>
          <form onSubmit={handleSave}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
              {/* الاسم الكامل */}
              <div style={{marginBottom: 20}}>
                <label style={{
                  display: 'block',
                  color: '#7c4dff',
                  fontWeight: 700,
                  marginBottom: 8,
                  fontSize: 14
                }}>
                  {t('full_name')} *
                </label>
                <input 
                  type="text" 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange} 
                  disabled={!edit}
                  style={{
                    width: '100%',
                    borderRadius: 12,
                    padding: '0.8rem 1rem',
                    border: edit ? '2px solid #7c4dff' : '2px solid #e0e0e0',
                    fontSize: 16,
                    transition: 'all 0.3s ease',
                    background: edit ? '#fff' : '#f8f9fa'
                  }}
                  placeholder={t('enter_full_name')}
                />
              </div>

              {/* البريد الإلكتروني */}
              <div style={{marginBottom: 20}}>
                <label style={{
                  display: 'block',
                  color: '#7c4dff',
                  fontWeight: 700,
                  marginBottom: 8,
                  fontSize: 14
                }}>
                  {t('email')} *
                </label>
                <input 
                  type="email" 
                  name="email" 
                  value={form.email} 
                  onChange={handleChange} 
                  disabled={!edit}
                  style={{
                    width: '100%',
                    borderRadius: 12,
                    padding: '0.8rem 1rem',
                    border: edit ? '2px solid #7c4dff' : '2px solid #e0e0e0',
                    fontSize: 16,
                    transition: 'all 0.3s ease',
                    background: edit ? '#fff' : '#f8f9fa'
                  }}
                  placeholder={t('enter_email')}
                />
              </div>

              {/* رقم الهاتف */}
              <div style={{marginBottom: 20}}>
                <label style={{
                  display: 'block',
                  color: '#7c4dff',
                  fontWeight: 700,
                  marginBottom: 8,
                  fontSize: 14
                }}>
                  {t('phone')} *
                </label>
                <input 
                  type="text" 
                  name="phone" 
                  value={form.phone} 
                  onChange={handleChange} 
                  disabled={!edit}
                  style={{
                    width: '100%',
                    borderRadius: 12,
                    padding: '0.8rem 1rem',
                    border: edit ? '2px solid #7c4dff' : '2px solid #e0e0e0',
                    fontSize: 16,
                    transition: 'all 0.3s ease',
                    background: edit ? '#fff' : '#f8f9fa'
                  }}
                  placeholder={t('enter_phone')}
                />
              </div>

              {/* التخصص */}
              <div style={{marginBottom: 20}}>
                <label style={{
                  display: 'block',
                  color: '#7c4dff',
                  fontWeight: 700,
                  marginBottom: 8,
                  fontSize: 14
                }}>
                  {t('specialty')} *
                </label>
                <select 
                  name="specialty" 
                  value={form.specialty} 
                  onChange={handleChange} 
                  disabled={!edit}
                  style={{
                    width: '100%',
                    borderRadius: 12,
                    padding: '0.8rem 1rem',
                    border: edit ? '2px solid #7c4dff' : '2px solid #e0e0e0',
                    fontSize: 16,
                    transition: 'all 0.3s ease',
                    background: edit ? '#fff' : '#f8f9fa',
                    cursor: edit ? 'pointer' : 'not-allowed'
                  }}
                >
                  <option value="">{t('choose_specialty')}</option>
                  {specialties.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              {/* المحافظة */}
              <div style={{marginBottom: 20}}>
                <label style={{
                  display: 'block',
                  color: '#7c4dff',
                  fontWeight: 700,
                  marginBottom: 8,
                  fontSize: 14
                }}>
                  {t('province')}
                </label>
                <select 
                  name="province" 
                  value={form.province} 
                  onChange={handleChange} 
                  disabled={!edit}
                  style={{
                    width: '100%',
                    borderRadius: 12,
                    padding: '0.8rem 1rem',
                    border: edit ? '2px solid #7c4dff' : '2px solid #e0e0e0',
                    fontSize: 16,
                    transition: 'all 0.3s ease',
                    background: edit ? '#fff' : '#f8f9fa',
                    cursor: edit ? 'pointer' : 'not-allowed'
                  }}
                >
                  <option value="">{t('choose_province')}</option>
                  {provinces.map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>

              {/* المنطقة */}
              <div style={{marginBottom: 20}}>
                <label style={{
                  display: 'block',
                  color: '#7c4dff',
                  fontWeight: 700,
                  marginBottom: 8,
                  fontSize: 14
                }}>
                  {t('area')}
                </label>
                <input 
                  type="text" 
                  name="area" 
                  value={form.area} 
                  onChange={handleChange} 
                  disabled={!edit}
                  style={{
                    width: '100%',
                    borderRadius: 12,
                    padding: '0.8rem 1rem',
                    border: edit ? '2px solid #7c4dff' : '2px solid #e0e0e0',
                    fontSize: 16,
                    transition: 'all 0.3s ease',
                    background: edit ? '#fff' : '#f8f9fa'
                  }}
                  placeholder={t('enter_area')}
                />
        </div>
        </div>

            {/* موقع العيادة */}
            <div style={{marginBottom: 20}}>
              <label style={{
                display: 'block',
                color: '#7c4dff',
                fontWeight: 700,
                marginBottom: 8,
                fontSize: 14
              }}>
                {t('clinic_location')}
              </label>
              <input 
                type="text" 
                name="clinicLocation" 
                value={form.clinicLocation} 
                onChange={handleChange} 
                disabled={!edit}
                style={{
                  width: '100%',
                  borderRadius: 12,
                  padding: '0.8rem 1rem',
                  border: edit ? '2px solid #7c4dff' : '2px solid #e0e0e0',
                  fontSize: 16,
                  transition: 'all 0.3s ease',
                  background: edit ? '#fff' : '#f8f9fa'
                }}
                placeholder={t('enter_clinic_address')}
              />
        </div>

            {/* رابط الموقع على الخريطة */}
            <div style={{marginBottom: 20}}>
              <label style={{
                display: 'block',
                color: '#7c4dff',
                fontWeight: 700,
                marginBottom: 8,
                fontSize: 14
              }}>
                📍 {t('map_location')}
              </label>
              <div style={{display: 'flex', gap: 8, marginBottom: 8}}>
                <input 
                  type="url" 
                  name="mapLocation" 
                  value={form.mapLocation} 
                  onChange={handleChange} 
                  disabled={!edit}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    padding: '0.8rem 1rem',
                    border: edit ? '2px solid #7c4dff' : '2px solid #e0e0e0',
                    fontSize: 16,
                    transition: 'all 0.3s ease',
                    background: edit ? '#fff' : '#f8f9fa'
                  }}
                  placeholder={t('map_location_placeholder')}
                />
                {edit && (
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt('أدخل رابط Google Maps لموقع العيادة:');
                      if (url && url.trim()) {
                        setForm(prev => ({...prev, mapLocation: url.trim()}));
                        alert(t('map_location_added'));
                      }
                    }}
                    style={{
                      padding: '0.8rem 1.2rem',
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 8px #4CAF5033',
                      fontSize: 14
                    }}
                  >
                    🗺️ {t('add_map_location')}
                  </button>
                )}
              </div>
              {edit && (
                <div style={{marginTop: 8, fontSize: '0.85rem', color: '#666', textAlign: 'right'}}>
                  💡 {t('map_location_help')}
                </div>
              )}
        </div>

            {/* عن الطبيب */}
            <div style={{marginBottom: 20}}>
              <label style={{
                display: 'block',
                color: '#7c4dff',
                fontWeight: 700,
                marginBottom: 8,
                fontSize: 14
              }}>
                {t('about_doctor')}
              </label>
              <textarea 
                name="about" 
                value={form.about} 
                onChange={handleChange} 
                disabled={!edit}
                rows={4}
                style={{
                  width: '100%',
                  borderRadius: 12,
                  padding: '0.8rem 1rem',
                  border: edit ? '2px solid #7c4dff' : '2px solid #e0e0e0',
                  fontSize: 16,
                  transition: 'all 0.3s ease',
                  background: edit ? '#fff' : '#f8f9fa',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                placeholder={t('write_brief_about_experience')}
              />
        </div>

            {/* رسائل الحالة */}
            {error && (
              <div style={{
                background: '#ffebee',
                color: '#c62828',
                padding: '0.8rem',
                borderRadius: 8,
                marginBottom: 16,
                border: '1px solid #ffcdd2',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span>⚠️</span>
                {error}
        </div>
            )}
            
            {msg && (
              <div style={{
                background: '#e8f5e8',
                color: '#2e7d32',
                padding: '0.8rem',
                borderRadius: 8,
                marginBottom: 16,
                border: '1px solid #c8e6c9',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span>✅</span>
                {msg}
        </div>
            )}

            {/* أزرار التحكم */}
            <div style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              marginTop: 24,
              flexWrap: 'wrap'
            }}>
          {!edit ? (
            <>
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEdit(true);
                    setMsg('تم تفعيل وضع التعديل! يمكنك الآن تعديل البيانات والصورة الشخصية.');
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #7c4dff 0%, #00bcd4 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '0.8rem 2rem',
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(124, 77, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  title="تعديل البيانات الشخصية والصورة"
                >
                  ✏️ تعديل البيانات
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowPasswordModal(true)}
                  style={{
                    background: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '0.8rem 2rem',
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  title="تغيير كلمة المرور"
                >
                  🔒 تغيير كلمة المرور
                </button>
            </>
          ) : (
            <>
                  <button 
                    type="submit"
                    disabled={loading}
                    style={{
                      background: loading ? '#ccc' : 'linear-gradient(135deg, #00bcd4 0%, #009688 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 12,
                      padding: '0.8rem 2rem',
                      fontWeight: 700,
                      fontSize: 16,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: loading ? 'none' : '0 4px 15px rgba(0, 188, 212, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    title={selectedImage ? 'حفظ التغييرات والصورة الجديدة' : 'حفظ التغييرات'}
                  >
                    {loading ? '⏳ جاري الحفظ...' : selectedImage ? '💾 حفظ الصورة والتغييرات' : '💾 حفظ التغييرات'}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCancel}
                    style={{
                      background: '#f5f5f5',
                      color: '#666',
                      border: '2px solid #e0e0e0',
                      borderRadius: 12,
                      padding: '0.8rem 2rem',
                      fontWeight: 700,
                      fontSize: 16,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    title="إلغاء التعديل والعودة للعرض"
                  >
                    ❌ إلغاء التعديل
                  </button>
            </>
          )}
        </div>
      </form>


        </div>
      </div>

      {/* نافذة تغيير كلمة المرور */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 4000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '2rem',
            maxWidth: 400,
            width: '90vw',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowPasswordModal(false)}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: 'none',
                border: 'none',
                color: '#e53935',
                fontSize: 24,
                fontWeight: 900,
                cursor: 'pointer'
              }}
            >
              &times;
            </button>
            
            <h3 style={{
              color: '#7c4dff',
              marginBottom: 20,
              fontWeight: 700,
              fontSize: 20,
              textAlign: 'center'
            }}>
              🔒 تغيير كلمة المرور
            </h3>

            <form onSubmit={handlePasswordChange}>
              <div style={{marginBottom: 16}}>
                <label style={{
                  display: 'block',
                  color: '#7c4dff',
                  fontWeight: 700,
                  marginBottom: 8,
                  fontSize: 14
                }}>
                  كلمة المرور الجديدة *
                </label>
                <input 
                  type="password" 
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  style={{
                    width: '100%',
                    borderRadius: 12,
                    padding: '0.8rem 1rem',
                    border: '2px solid #7c4dff',
                    fontSize: 16,
                    transition: 'all 0.3s ease'
                  }}
                  placeholder="أدخل كلمة المرور الجديدة"
                  required
                />
              </div>

              <div style={{marginBottom: 20}}>
                <label style={{
                  display: 'block',
                  color: '#7c4dff',
                  fontWeight: 700,
                  marginBottom: 8,
                  fontSize: 14
                }}>
                  تأكيد كلمة المرور *
                </label>
                <input 
                  type="password" 
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  style={{
                    width: '100%',
                    borderRadius: 12,
                    padding: '0.8rem 1rem',
                    border: '2px solid #7c4dff',
                    fontSize: 16,
                    transition: 'all 0.3s ease'
                  }}
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  required
                />
              </div>

              <div style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'center'
              }}>
                <button 
                  type="submit"
                  disabled={loading}
                  style={{
                    background: loading ? '#ccc' : 'linear-gradient(135deg, #00bcd4 0%, #009688 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '0.8rem 2rem',
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? '⏳ جاري التغيير...' : '💾 تغيير كلمة المرور'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowPasswordModal(false)}
                  style={{
                    background: '#f5f5f5',
                    color: '#666',
                    border: '2px solid #e0e0e0',
                    borderRadius: 12,
                    padding: '0.8rem 2rem',
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  ❌ إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorProfile; 