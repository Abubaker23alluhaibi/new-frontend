import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { useTranslation } from 'react-i18next';
import { normalizePhone } from './utils/phoneUtils';

const provinces = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كركوك', 'السليمانية', 'دهوك', 'ذي قار', 'صلاح الدين', 'الأنبار', 'واسط', 'ميسان', 'بابل', 'القادسية', 'ديالى', 'المثنى', 'كربلاء', 'حلبجة'
];
const specialties = [
  'جراحة عامة', 'جراحة عظام', 'طب الأطفال', 'طب العيون', 'طب الأسنان', 'أمراض القلب', 'جلدية', 'نسائية وتوليد', 'أنف وأذن وحنجرة', 'باطنية', 'أعصاب', 'أورام', 'أشعة', 'تخدير', 'طب الأسرة', 'طب الطوارئ', 'طب نفسي', 'طب الكلى', 'طب الروماتيزم', 'طب المسالك البولية', 'أخرى'
];

// استبدل جميع أسماء التخصصات والفئات بالنصوص الكردية
// const specialtiesGrouped = [
//   {
//     category: "پزیشکی گشتی و بنەڕەتی",
//     specialties: ["پزیشکی گشتی", "خێزان", "منداڵ", "ژن و لەدایکبوون", "فوریت", "پزیشکی پیران"]
//   },
//   {
//     category: "پسپۆری ناوخۆ",
//     specialties: ["باطنی", "نەخۆشی دڵ", "نەخۆشی سەروو سەفەر", "نەخۆشی هەزمەوەر", "کلی", "غدد و شەکر", "نەخۆشی خوێن", "نەخۆشی تووشبوو", "روماتیزم", "ئۆرام", "عەصاب", "دەروونی"]
//   },
//   {
//     category: "پسپۆری جەراحی",
//     specialties: ["جراحی گشتی", "جراحی عەظام", "جراحی عەصاب", "جراحی دڵ و سەروو سەفەر", "جراحی جوانکاری", "جراحی توێژینەوەی خوێن", "جراحی مەسالك", "جراحی منداڵ", "جراحی گوش و لووت و حەنجەرە", "جراحی دەندان و ڕوو و چاو"]
//   },
//   {
//     category: "پسپۆری سەر و قژ و دەندان",
//     specialties: ["چاو", "گوش و لووت و حەنجەرە", "دەندان", "جراحی ڕوو و چاو"]
//   },
//   {
//     category: "پسپۆری منداڵی ورد",
//     specialties: ["تازە لەدایکبوو", "دڵی منداڵ", "هەزمەوەری منداڵ", "عەصابی منداڵ"]
//   },
//   {
//     category: "پسپۆری پزیشکی یاریدەدەر",
//     specialties: ["تخدیر", "ئاشعە", "پزیشکی نوو", "پوست", "تاقیکردنەوە", "پزیشکی گەشەپێدەر", "وەرزشی", "پزیشکی یاسایی", "پزیشکی ئازار", "پزیشکی پیشەیی", "تەندروستی گشتی"]
//   },
//   {
//     category: "زانستە پزیشکییە یاریدەدەرەکان",
//     specialties: ["پرستاری", "خواردنی پزیشکی", "گەشەپێدانی جەستە", "دەرمانسازی", "ئاشعە", "تاقیکردنەوەی پزیشکی"]
//   }
// ];
// const allCategories = specialtiesGrouped.map(cat => cat.category);
// const allSubSpecialties = specialtiesGrouped.flatMap(cat => cat.specialties);

function DoctorSignUp() {
  // 2. أضف جميع useState هنا داخل المكون
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const { t } = useTranslation();
  const specialtiesGrouped = t('specialty_categories', { returnObjects: true });
  const specialties = t('specialties', { returnObjects: true }) || {};
  // بناء قائمة التخصصات كمصفوفة مفاتيح
  const specialtiesList = Object.keys(specialties).map(key => ({ key, label: specialties[key] }));
  const allCategories = specialtiesGrouped.map(cat => cat.category);
  const allSubSpecialties = specialtiesGrouped.flatMap(cat => cat.specialties);

  // دالة اختيار من البحث
  function handleSearchSelect(value) {
    if (allCategories.includes(value)) {
      setSelectedCategory(value);
      setSelectedSpecialty("");
      setForm(prev => ({...prev, specialty: ""}));
    } else if (allSubSpecialties.includes(value)) {
      setSelectedSpecialty(value);
      setForm(prev => ({...prev, specialty: value}));
      // حدد التخصص العام تلقائياً إذا كان التخصص الفرعي تابع له
      const parentCat = specialtiesGrouped.find(cat => cat.specialties.includes(value));
      if (parentCat) setSelectedCategory(parentCat.category);
    }
    setSearchValue("");
  }

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
    specialty: '',
    province: '',
    area: '',
    clinicLocation: '',
    mapLocation: '', // رابط الموقع على الخريطة
    image: null, // الصورة الشخصية فقط
    about: '',
    experienceYears: '',
    appointmentDuration: '30' // مدة الموعد الافتراضية بالدقائق
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [workTimes, setWorkTimes] = useState([]); // [{day, from, to}]
  const [newTime, setNewTime] = useState({day: '', from: '', to: ''});
  const [previewUrls, setPreviewUrls] = useState({
    image: null // الصورة الشخصية فقط
  });
  const navigate = useNavigate();
  const weekDays = t('weekdays', { returnObjects: true });

  useEffect(() => {
    if (success) {
      // لا توجه تلقائياً، فقط أظهر رسالة انتظار الموافقة
    }
  }, [success]);

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : value
    });
    
    // إنشاء معاينة للصور
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrls(prev => ({
            ...prev,
            [name]: e.target.result
          }));
        };
        reader.readAsDataURL(file);
      } else {
        // إذا كان ملف PDF، أظهر أيقونة PDF
        setPreviewUrls(prev => ({
          ...prev,
          [name]: 'pdf'
        }));
      }
    } else {
      // إزالة المعاينة إذا تم إزالة الملف
      setPreviewUrls(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleFirstStep = e => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.phone || !form.password || !form.confirm) {
      setError(t('fill_all_fields'));
      return;
    }
    if (form.password !== form.confirm) {
      setError(t('passwords_not_match'));
      return;
    }
    setStep(2);
  };

  const resetForm = () => {
    setStep(1);
    setForm({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirm: '',
      specialty: '',
      province: '',
      area: '',
      clinicLocation: '',
      mapLocation: '', // رابط الموقع على الخريطة
      image: null, // الصورة الشخصية فقط
      about: '',
      experienceYears: '',
      appointmentDuration: '30'
    });
    setPreviewUrls({
      image: null // الصورة الشخصية فقط
    });
    setWorkTimes([]);
    setNewTime({day: '', from: '', to: ''});
  };

  const handleSecondStep = e => {
    e.preventDefault();
    setError('');
    // تحقق فقط من الحقول النصية المطلوبة في هذه الصفحة
    if (!form.province || !form.area || !form.clinicLocation) {
      setError('تکایە خانەکان پڕبکەوە (پارێزگا، ناوچە، ناونیشان)');
      return;
    }
    setStep(3);
  };

  const handleAddTime = () => {
    setError('');
    if (!newTime.day || !newTime.from || !newTime.to) {
      setError(t('choose_day_and_time'));
      return;
    }
    setWorkTimes([...workTimes, newTime]);
    setNewTime({day: '', from: '', to: ''});
  };

  const handleRemoveTime = idx => {
    setWorkTimes(workTimes.filter((_, i) => i !== idx));
  };

  const removePreview = (fieldName) => {
    setForm(prev => ({
      ...prev,
      [fieldName]: null
    }));
    setPreviewUrls(prev => ({
      ...prev,
      [fieldName]: null
    }));
  };

  const handleThirdStep = async (e) => {
    e.preventDefault();
    setError('');
    if (workTimes.length === 0) {
      setError(t('add_at_least_one_time'));
      return;
    }
    
    // تجهيز البيانات للإرسال (فقط الصورة الشخصية)
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('phone', normalizePhone(form.phone)); // توحيد رقم الهاتف
    formData.append('password', form.password);
    formData.append('specialty', form.specialty);
    formData.append('province', form.province);
    formData.append('area', form.area);
    formData.append('clinicLocation', form.clinicLocation);
    formData.append('mapLocation', form.mapLocation);
    formData.append('about', form.about);
    if (form.experienceYears) formData.append('experienceYears', form.experienceYears);
    formData.append('workTimes', JSON.stringify(workTimes));
    formData.append('appointmentDuration', form.appointmentDuration);
    
    // إضافة الصورة الشخصية فقط (اختيارية)
    if (form.image) {
      formData.append('image', form.image);
    }
    
    try {
      const res = await fetch(process.env.REACT_APP_API_URL + '/register-doctor', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('error_occurred'));
      
      // عرض رسالة النجاح مع رابط الواتساب
      setSuccess(true);
      
      // إذا كان هناك رابط واتساب، عرضه للمستخدم
      if (data.whatsappLink) {
        setTimeout(() => {
          if (window.confirm('تم إنشاء الحساب بنجاح! هل تريد فتح الواتساب لإرسال الوثائق؟')) {
            window.open(data.whatsappLink, '_blank');
          }
        }, 1000);
      }
      
    } catch (err) {
      setError(err.message);
    }
  };

  // 1. أضف دالة الانتقال للخطوة الرابعة
  const handleFourthStep = (e) => {
    e.preventDefault();
    setError('');
    setStep(4);
  };

  return (
    <div className="login-container" style={{
      background: `linear-gradient(135deg, rgba(0, 188, 212, 0.9) 0%, rgba(0, 150, 136, 0.9) 100%), url('/images/doctor-capsule.jpg') center center/cover no-repeat`,
      minHeight: '100vh',
      position: 'relative',
    }}>
      <form className="login-box" onSubmit={step === 1 ? handleFirstStep : step === 2 ? handleSecondStep : step === 3 ? handleFourthStep : handleThirdStep} encType="multipart/form-data">
        {success ? (
          <div style={{
            background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
            color: '#00796b',
            borderRadius: 16,
            padding: '2rem 1.5rem',
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '1.1rem',
            boxShadow: '0 4px 20px #00bcd433',
            border: '2px solid #00bcd4',
            marginBottom: '1rem'
          }}>
            <div style={{fontSize: '3rem', marginBottom: '1rem'}}>✅</div>
            <div style={{marginBottom: '1rem', lineHeight: '1.6'}}>
              ✅ تم إنشاء حساب الطبيب بنجاح!<br/>
              <span style={{fontSize: '0.95rem', fontWeight: 600, color: '#00695c'}}>
                يرجى إرسال الوثائق المطلوبة على الواتساب
              </span>
            </div>
            <div style={{
              background: '#f8f9fa',
              padding: 16,
              borderRadius: 8,
              border: '1px solid #25d366',
              marginBottom: 16
            }}>
              <p style={{margin: '0 0 12px 0', fontSize: '0.9rem', color: '#333'}}>
                <strong>📱 رقم الواتساب:</strong> +9647769012619
              </p>
              <p style={{margin: '0', fontSize: '0.85rem', color: '#666'}}>
                📋 الوثائق المطلوبة: الهوية الشخصية + شهادة النقابة
              </p>
            </div>
            <button 
              onClick={resetForm} 
              style={{
                background: 'linear-gradient(135deg, #009688 0%, #00796b 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '0.8rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px #00968844',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {t('register_another_doctor')}
            </button>
          </div>
        ) : (
          step === 1 ? (
            <div style={{maxWidth:400, margin:'0 auto', padding:'0 1rem'}}>
            <h2 style={{textAlign:'center', marginBottom:18}}>{t('doctor_signup_title')}</h2>
                <div style={{display:'flex', flexDirection:'column', gap:12, marginBottom:10}}>
                  <div>
                    <label style={{fontWeight:600, marginBottom:4, display:'block'}}>{t('full_name')}</label>
                    <input
                      type="text"
                      name="name"
                      placeholder={t('full_name')}
                      value={form.name}
                      onChange={handleChange}
                      style={{padding:'1rem 1.1rem', borderRadius:12, border:'1.5px solid #b2dfdb', width:'100%'}}
                    />
                  </div>
                  <div>
                    <label style={{fontWeight:600, marginBottom:4, display:'block'}}>{t('email')}</label>
                    <input
                      type="email"
                      name="email"
                      placeholder={t('email')}
                      value={form.email}
                      onChange={handleChange}
                      style={{padding:'1rem 1.1rem', borderRadius:12, border:'1.5px solid #b2dfdb', width:'100%'}}
                    />
                  </div>
                  <div style={{display:'flex', gap:8, alignItems:'center'}}>
                    <div style={{background:'#e0f7fa', borderRadius:10, border:'1.5px solid #b2dfdb', padding:'0.7rem 0.7rem', fontWeight:700, color:'#009688', fontSize:'1.08rem', minWidth:60, maxWidth:70}}>
                      +964
                    </div>
                    <input
                      type="text"
                      name="phone"
                      placeholder={t('phone_placeholder')}
                      value={form.phone}
                      onChange={handleChange}
                      style={{borderRadius:12, width:'100%', padding:'0.7rem 0.7rem', border:'1.5px solid #b2dfdb', fontSize:15}}
                    />
                  </div>
                  {/* ملاحظة مهمة حول رقم الواتساب */}
                  <div style={{
                    background: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    borderRadius: 8,
                    padding: '0.8rem',
                    marginBottom: '1rem',
                    fontSize: '0.9rem',
                    color: '#856404',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <span style={{fontSize: '1.2rem'}}>📱</span>
                    <div>
                      <div style={{fontWeight: 700, marginBottom: 2}}>{t('whatsapp_note_title')}:</div>
                      <div>{t('whatsapp_note_doctor')}</div>
                    </div>
                  </div>
                  <div>
                    <label style={{fontWeight:600, marginBottom:4}}>{t('password')}</label>
                    <input
                      type="password"
                      name="password"
                      placeholder={t('password')}
                      value={form.password}
                      onChange={handleChange}
                      style={{marginBottom:10, padding:'1rem 1.1rem', borderRadius:12, border:'1.5px solid #b2dfdb', width:'100%'}}
                    />
                  </div>
                  <div>
                    <label style={{fontWeight:600, marginBottom:4}}>{t('confirm_password')}</label>
                    <input
                      type="password"
                      name="confirm"
                      placeholder={t('confirm_password')}
                      value={form.confirm}
                      onChange={handleChange}
                      style={{marginBottom:10, padding:'1rem 1.1rem', borderRadius:12, border:'1.5px solid #b2dfdb', width:'100%'}}
                    />
                  </div>
                </div>
                {error && <div className="login-error">{error}</div>}
                <button type="submit" style={{width:'100%', padding:'1.1rem', borderRadius:14, background:'linear-gradient(135deg, #00bcd4 0%, #009688 100%)', color:'#fff', fontWeight:800, fontSize:18, border:'none', marginTop:10, boxShadow:'0 2px 8px #00bcd433', letterSpacing:1}}>
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" style={{marginLeft: 6}} xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4v16m8-8H4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t('next')}
                </button>
            </div>
          ) : step === 2 ? (
            <div style={{maxWidth:400, margin:'0 auto', padding:'0 1rem'}}>
              <h2 style={{textAlign:'center', marginBottom:18}}>{t('doctor_signup_title')}</h2>
              <div style={{display:'flex', flexDirection:'column', gap:12}}>
                <div>
                  <label style={{fontWeight:600, marginBottom:4, display:'block'}}>{t('province')}</label>
                  <select
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    style={{padding:'1rem 1.1rem', borderRadius:12, border:'1.5px solid #b2dfdb', width:'100%'}}>
                    <option value="">{t('choose_province')}</option>
                    {provinces.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{fontWeight:600, marginBottom:4, display:'block'}}>{t('area_address')}</label>
                  <input
                    type="text"
                    name="area"
                    placeholder={t('area_address')}
                    value={form.area}
                    onChange={handleChange}
                    style={{padding:'1rem 1.1rem', borderRadius:12, border:'1.5px solid #b2dfdb', width:'100%'}}
                  />
                </div>
                <div>
                  <label style={{fontWeight:600, marginBottom:4, display:'block'}}>{t('clinic_location')}</label>
                  <input
                    type="text"
                    name="clinicLocation"
                    placeholder={t('clinic_location')}
                    value={form.clinicLocation}
                    onChange={handleChange}
                    style={{padding:'1rem 1.1rem', borderRadius:12, border:'1.5px solid #b2dfdb', width:'100%'}}
                  />
                </div>
                <div>
                  <label style={{fontWeight:600, marginBottom:4, display:'block'}}>📍 {t('map_location')}</label>
                  <div style={{display: 'flex', gap: 8, marginBottom: 8}}>
                    <input
                      type="url"
                      name="mapLocation"
                      placeholder={t('map_location_placeholder')}
                      value={form.mapLocation}
                      onChange={handleChange}
                      style={{flex: 1, padding:'1rem 1.1rem', borderRadius:12, border:'1.5px solid #b2dfdb'}}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt(t('enter_map_location'));
                        if (url && url.trim()) {
                          setForm(prev => ({...prev, mapLocation: url.trim()}));
                          alert(t('map_location_added'));
                        }
                      }}
                      style={{
                        padding: '1rem 1.5rem',
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                        color: '#fff',
                        border: 'none',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 8px #4CAF5033'
                      }}
                    >
                      🗺️ {t('add_map_location')}
                    </button>
                  </div>
                  <div style={{marginTop: 8, fontSize: '0.85rem', color: '#666', textAlign: 'right'}}>
                    💡 {t('map_location_help')}
                  </div>
                </div>
                <div>
                  <label style={{fontWeight:600, marginBottom:4, display:'block'}}>{t('choose_category')}</label>
                  <select
                    value={selectedCategory}
                    onChange={e => { setSelectedCategory(e.target.value); }}
                    style={{padding:'1rem 1.1rem', borderRadius:12, border:'1.5px solid #b2dfdb', width:'100%'}}>
                    <option value="">{t('choose_category')}</option>
                    {allCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{fontWeight:600, marginBottom:4, display:'block'}}>{t('choose_specialty')}</label>
                  <select
                    name="specialty"
                    value={form.specialty}
                    onChange={handleChange}
                    style={{padding: '1rem 1.1rem', borderRadius: 12, border: '1.5px solid #b2dfdb', width:'100%'}}>
                    <option value="">{t('choose_specialty')}</option>
                    {specialtiesList.map(s => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <input type="number" name="experienceYears" placeholder={t('experience_years')} value={form.experienceYears} onChange={handleChange} min={0} style={{width:'100%', padding:'1rem 1.1rem', borderRadius:12, border:'1.5px solid #b2dfdb'}} />
                </div>
                {/* حقل اختيار مدة الموعد الافتراضية */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontWeight: 600, color: '#333', marginBottom: 4, display: 'block' }}>
                    {t('appointment_duration_label')}
                  </label>
                  <select
                    value={form.appointmentDuration}
                    onChange={e => setForm(prev => ({ ...prev, appointmentDuration: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.7rem',
                      borderRadius: 8,
                      border: '1.5px solid #00bcd4',
                      fontSize: 16,
                      background: '#f7fafd',
                      marginTop: 2
                    }}
                    required
                  >
                    <option value="5">5 {t('minutes')}</option>
                    <option value="10">10 {t('minutes')}</option>
                    <option value="15">15 {t('minute')}</option>
                    <option value="20">20 {t('minutes')}</option>
                    <option value="30">30 {t('minutes')}</option>
                    <option value="45">45 {t('minutes')}</option>
                    <option value="60">60 {t('minutes')}</option>
                  </select>
                </div>
              </div>
              {error && <div className="login-error">{error}</div>}
              <button type="submit" style={{width:'100%', padding:'1.1rem', borderRadius:14, background:'linear-gradient(135deg, #00bcd4 0%, #009688 100%)', color:'#fff', fontWeight:800, fontSize:18, border:'none', marginTop:10, boxShadow:'0 2px 8px #00bcd433', letterSpacing:1}}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" style={{marginLeft: 6}} xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4v16m8-8H4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t('next')}
              </button>
              <button type="button" className="signup-link-btn" style={{marginTop:8, width:'100%'}} onClick={()=>setStep(1)}>{t('back')}</button>
            </div>
          ) : step === 3 ? (
            <div style={{maxWidth:400, margin:'0 auto', padding:'0 1rem'}}>
              <h2 style={{textAlign:'center', marginBottom:18}}>{t('doctor_signup_title')}</h2>
                <div style={{marginBottom: 10}}>
                  <h4 style={{color:'#009688', marginBottom: 8, fontWeight:700}}>{t('weekly_work_times')}</h4>
                  <div style={{display:'flex', gap:6, marginBottom:8}}>
                    <select value={newTime.day} onChange={e=>setNewTime({...newTime, day: e.target.value})} style={{flex:2, borderRadius:8, padding:'.5rem'}}>
                      <option value="">{t('day')}</option>
                      {Array.isArray(weekDays) && weekDays.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                    <div style={{display:'flex', gap:8}}>
                      <div style={{flex:1, display:'flex', flexDirection:'column'}}>
                        <label style={{fontSize:13, color:'#009688', marginBottom:2}}>{t('from_time')}</label>
                        <input type="time" value={newTime.from} onChange={e=>setNewTime({...newTime, from: e.target.value})} style={{borderRadius:8, padding:'.7rem', width:'100%', fontSize:16}} />
                      </div>
                      <div style={{flex:1, display:'flex', flexDirection:'column'}}>
                        <label style={{fontSize:13, color:'#009688', marginBottom:2}}>{t('to_time')}</label>
                        <input type="time" value={newTime.to} onChange={e=>setNewTime({...newTime, to: e.target.value})} style={{borderRadius:8, padding:'.7rem', width:'100%', fontSize:16}} />
                      </div>
                    </div>
                    <button type="button" className="signup-link-btn" style={{padding:'0.5rem 1rem', fontSize:15}} onClick={handleAddTime}>{t('add')}</button>
                  </div>
                  <div style={{marginBottom:8}}>
                    {workTimes.length === 0 && <span style={{color:'#888', fontSize:14}}>{t('no_times_added')}</span>}
                    {workTimes.map((t, idx) => (
                      <div key={idx} style={{display:'flex', alignItems:'center', gap:8, background:'#e0f7fa', borderRadius:7, padding:'0.3rem 0.7rem', marginBottom:4}}>
                        <span style={{flex:2}}>{t.day}</span>
                        <span style={{flex:1, fontFamily:'monospace'}}>{t.from}</span>
                        <span style={{flex:1, fontFamily:'monospace'}}>{t.to}</span>
                        <button type="button" style={{background:'none', border:'none', color:'#e53935', fontWeight:700, cursor:'pointer', fontSize:18}} onClick={()=>handleRemoveTime(idx)}>&times;</button>
                      </div>
                    ))}
                  </div>
                </div>
                <textarea name="about" placeholder={t('about_optional')} value={form.about} onChange={handleChange} style={{borderRadius:10, border:'1.5px solid #b2dfdb', padding:'0.8rem 1rem', minHeight:70, marginBottom:10, resize:'vertical'}} />
                {error && <div className="login-error">{error}</div>}
                <button type="submit" style={{width:'100%', padding:'1.1rem', borderRadius:14, background:'linear-gradient(135deg, #00bcd4 0%, #009688 100%)', color:'#fff', fontWeight:800, fontSize:18, border:'none', marginTop:10, boxShadow:'0 2px 8px #00bcd433', letterSpacing:1}}>
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" style={{marginLeft: 6}} xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4v16m8-8H4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t('next')}
                </button>
                <button type="button" className="signup-link-btn" style={{marginTop:8}} onClick={()=>setStep(2)}>{t('back')}</button>
            </div>
          ) : step === 4 ? (
            <div style={{maxWidth:400, margin:'0 auto', padding:'0 1rem'}}>
              <h2 style={{textAlign:'center', marginBottom:18}}>{t('doctor_signup_title')}</h2>
              <h3 style={{color:'#009688', marginBottom:14, fontWeight:800}}>📱 {t('send_documents_whatsapp')}</h3>
              
              {/* صورة شخصية فقط */}
              <div style={{display:'flex', flexDirection:'column', gap:18, maxWidth:400, margin:'0 auto', marginBottom: 24}}>
                <div>
                  <label style={{textAlign: 'right', fontSize: 15, color: '#009688', marginBottom: 6, display:'block'}}>{t('personal_image')} (اختيارية)</label>
                  <input type="file" name="image" accept="image/*" onChange={handleChange} style={{marginBottom: 6, width:'100%'}} />
                  {previewUrls.image && (
                    <div style={{marginBottom: 8, textAlign: 'center'}}>
                      <img src={previewUrls.image} alt={t('personal_image')} style={{width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '3px solid #7c4dff', cursor:'pointer'}} onClick={() => window.open(previewUrls.image, '_blank')} title="اضغط للتكبير" />
                      <button type="button" onClick={() => removePreview('image')} style={{background: '#e53935', color: '#fff', border: 'none', borderRadius: 5, padding: '0.3rem 0.8rem', marginTop: 5, fontSize: 12, cursor: 'pointer'}}>{t('remove')}</button>
                    </div>
                  )}
                </div>
              </div>

              {/* تعليمات الواتساب */}
              <div style={{background: '#f8f9fa', padding: 20, borderRadius: 12, border: '2px solid #25d366', marginBottom: 20}}>
                <div style={{textAlign: 'center', marginBottom: 16}}>
                  <div style={{fontSize: 32, marginBottom: 8}}>📱</div>
                  <h4 style={{color: '#25d366', margin: 0, fontWeight: 700}}>{t('send_documents_whatsapp')}</h4>
                </div>
                
                <div style={{marginBottom: 16}}>
                  <p style={{color: '#333', fontSize: 14, marginBottom: 12, textAlign: 'right'}}>
                    <strong>📞 {t('whatsapp_number_label')}:</strong>
                  </p>
                  <a 
                    href="https://wa.me/+9647769012619" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      background: '#25d366',
                      color: '#fff',
                      padding: '12px 20px',
                      borderRadius: 8,
                      textDecoration: 'none',
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: 16,
                      marginBottom: 16,
                      boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)'
                    }}
                  >
                    📱 +9647769012619
                  </a>
                </div>

                <div style={{marginBottom: 16}}>
                  <p style={{color: '#333', fontSize: 14, marginBottom: 8, textAlign: 'right', fontWeight: 600}}>
                    📋 {t('required_documents')}:
                  </p>
                  <ul style={{color: '#555', fontSize: 13, textAlign: 'right', margin: 0, paddingRight: 20}}>
                    <li>{t('id_front')}</li>
                    <li>{t('id_back')}</li>
                    <li>{t('syndicate_front')}</li>
                    <li>{t('syndicate_back')}</li>
                  </ul>
                </div>

                <div style={{background: '#fff3cd', padding: 12, borderRadius: 8, border: '1px solid #ffeaa7'}}>
                  <p style={{color: '#856404', fontSize: 12, margin: 0, textAlign: 'center'}}>
                    💡 <strong>{t('note')}:</strong> {t('auto_message_note')}
                  </p>
                </div>
              </div>

              {error && <div className="login-error">{error}</div>}
              <div style={{display:'flex', gap:12, marginTop:18, justifyContent:'center'}}>
                <button type="submit" style={{width:'100%', padding:'1.1rem', borderRadius:14, background:'linear-gradient(135deg, #00bcd4 0%, #009688 100%)', color:'#fff', fontWeight:800, fontSize:18, border:'none', marginTop:10, boxShadow:'0 2px 8px #00bcd433', letterSpacing:1}}>
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" style={{marginLeft: 6}} xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4v16m8-8H4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {t('create_account')}
                  </button>
                <button type="button" className="signup-link-btn" style={{marginTop:0}} onClick={()=>setStep(3)}>{t('back')}</button>
              </div>
            </div>
          ) : null
        )}
      </form>
    </div>
  );
}

export default DoctorSignUp; 