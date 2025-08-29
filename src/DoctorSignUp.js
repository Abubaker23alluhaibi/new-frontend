import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { useTranslation } from 'react-i18next';
import { normalizePhone } from './utils/phoneUtils';

const provinces = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كركوك', 'السليمانية', 'دهوك', 'ذي قار', 'صلاح الدين', 'الأنبار', 'واسط', 'ميسان', 'بابل', 'القادسية', 'ديالى', 'المثنى', 'كربلاء', 'حلبجة'
];
const specialties = [
  // التخصصات الأساسية الموجودة
  'جراحة عامة', 'جراحة عظام', 'طب الأطفال', 'طب العيون', 'طب الأسنان', 'أمراض القلب', 'جلدية', 'نسائية وتوليد', 'أنف وأذن وحنجرة', 'باطنية', 'أعصاب', 'أورام', 'أشعة', 'تخدير', 'طب الأسرة', 'طب الطوارئ', 'طب نفسي', 'طب الكلى', 'طب الروماتيزم', 'طب المسالك البولية',
  
  // التخصصات الجديدة المضافة
  'طب المناعة', 'طب الصدر', 'طب المسالك البولية', 'طب الجلد', 'طب المجتمع', 'طب الوقاية', 'طب المسنين', 'طب التأهيل', 'الرعاية التلطيفية', 'طب الطوارئ المتقدم', 'طب العناية المركزة',
  
  // التخصصات الجراحية الجديدة
  'جراحة التجميل والترميم', 'جراحة المناظير', 'جراحة الأوعية الدموية', 'جراحة الأعصاب', 'جراحة القلب والصدر', 'جراحة الأطفال', 'جراحة الوجه والفكين',
  
  // تخصصات الأسنان الجديدة
  'طب وجراحة الفم', 'تقويم الأسنان', 'طب الأسنان التجميلي',
  
  // تخصصات الأطفال الدقيقة
  'حديثي الولادة', 'قلب الأطفال', 'الجهاز الهضمي للأطفال', 'أعصاب الأطفال', 'أمراض الدم للأطفال', 'أمراض الغدد للأطفال', 'أمراض الكلى للأطفال', 'أمراض الروماتيزم للأطفال',
  
  // العلوم الطبية المساندة الجديدة
  'علم النفس الطبي', 'العلاج الوظيفي', 'علاج النطق', 'العلاج التنفسي', 'تقنية المختبرات الطبية', 'التغذية العلاجية', 'العلاج الطبيعي', 'الصيدلة',
  
  // التخصصات المتطورة والجديدة
  'طب الجينوم', 'طب الخلايا الجذعية', 'الطب الشخصي', 'طب التجميل غير الجراحي', 'طب السمنة', 'طب النوم', 'طب السفر', 'طب الفضاء', 'طب الغوص', 'طب الرياضة المتقدم', 'طب الشيخوخة المتقدم', 'طب الألم العصبي', 'طب الأوعية الدموية', 'طب المناعة والتحسس',
  
  'أخرى'
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
  // التعامل مع التخصصات مع قيم احتياطية
  const specialtiesGrouped = t('specialty_categories', { returnObjects: true }) || [];
  
  // بناء قائمة التخصصات من specialty_categories
  const specialtiesList = Array.isArray(specialtiesGrouped) ? 
    specialtiesGrouped.flatMap(cat => 
      cat.specialties.map(specialty => ({ 
        key: specialty, 
        label: specialty,
        category: cat.category 
      }))
    ) : 
    // قائمة احتياطية من التخصصات المحلية
    specialties.map(specialty => ({ 
      key: specialty, 
      label: specialty,
      category: 'تخصصات عامة'
    }));
  
  const allCategories = Array.isArray(specialtiesGrouped) ? 
    specialtiesGrouped.map(cat => cat.category) : 
    [];
  
  const allSubSpecialties = Array.isArray(specialtiesGrouped) ? 
    specialtiesGrouped.flatMap(cat => cat.specialties) : 
    [];

  // دالة اختيار من البحث مع فحص الأمان
  function handleSearchSelect(value) {
    if (Array.isArray(allCategories) && allCategories.includes(value)) {
      setSelectedCategory(value);
      setSelectedSpecialty("");
      setForm(prev => ({...prev, specialty: ""}));
    } else if (Array.isArray(allSubSpecialties) && allSubSpecialties.includes(value)) {
      setSelectedSpecialty(value);
      setForm(prev => ({...prev, specialty: value}));
      // حدد التخصص العام تلقائياً إذا كان التخصص الفرعي تابع له
      if (Array.isArray(specialtiesGrouped)) {
        const parentCat = specialtiesGrouped.find(cat => 
          Array.isArray(cat.specialties) && cat.specialties.includes(value)
        );
        if (parentCat) setSelectedCategory(parentCat.category);
      }
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
  
  // أيام الأسبوع الاحتياطية في حالة فشل الترجمة
  const fallbackWeekDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const navigate = useNavigate();
  
  // التعامل مع أيام الأسبوع من ملف الترجمة - استخدام useMemo لضمان التحديث
  const weekDays = useMemo(() => {
    const weekdaysData = t('weekdays', { returnObjects: true });
    const weekdaysArrayData = t('weekdays_array', { returnObjects: true });
    
    // إذا كان weekdays مصفوفة، استخدمه
    if (Array.isArray(weekdaysData)) {
      return weekdaysData;
    }
    
    // إذا كان weekdays_array مصفوفة، استخدمه
    if (Array.isArray(weekdaysArrayData)) {
      return weekdaysArrayData;
    }
    
    // إذا كان weekdays كائن، حوله إلى مصفوفة
    if (weekdaysData && typeof weekdaysData === 'object' && !Array.isArray(weekdaysData)) {
      return Object.values(weekdaysData);
    }
    
    // قيم افتراضية باللغة العربية
    return fallbackWeekDays;
  }, [t]); // إعادة حساب عند تغيير الترجمة

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
          if (window.confirm(t('account_created_success_whatsapp_confirm'))) {
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
         <div className="doctor-signup-container" style={{
       background: '#ffffff',
       minHeight: '100vh',
       position: 'relative',
       padding: '1rem 0.5rem',
       fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
       maxWidth: '100vw',
       overflowX: 'hidden'
     }}>
             {/* Header Section */}
       <div style={{
         textAlign: 'center',
         marginBottom: '1.5rem',
         padding: '1.5rem',
         background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
         borderRadius: '16px',
         border: '2px solid #e0f7fa'
       }}>
         <h1 style={{
           color: '#00695c',
           fontSize: '1.8rem',
           fontWeight: '700',
           margin: '0 0 0.5rem 0',
           textShadow: '0 2px 4px rgba(0, 105, 92, 0.1)'
         }}>
           {t('doctor_signup_title')}
         </h1>
         <p style={{
           color: '#0A8F82',
           fontSize: '1rem',
           margin: '0',
           fontWeight: '500'
         }}>
           {t('join_professional_doctors')}
         </p>
       </div>

      {/* Progress Steps */}
             <div style={{
         display: 'flex',
         justifyContent: 'center',
         marginBottom: '2rem',
         gap: '0.3rem',
         flexWrap: 'wrap'
       }}>
         {[1, 2, 3, 4].map((stepNumber) => (
           <div key={stepNumber} style={{
             width: '40px',
             height: '40px',
             borderRadius: '50%',
             background: step >= stepNumber 
               ? 'linear-gradient(135deg, #0A8F82 0%, #0A8F82 100%)' 
               : '#f0f0f0',
             color: step >= stepNumber ? '#fff' : '#999',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             fontWeight: 'bold',
             fontSize: '1rem',
             boxShadow: step >= stepNumber 
               ? '0 4px 15px rgba(10, 143, 130, 0.4)' 
               : 'none',
             transition: 'all 0.3s ease',
             minWidth: '40px',
             minHeight: '40px'
           }}>
             {stepNumber}
           </div>
         ))}
       </div>

      <form className="doctor-signup-form" onSubmit={step === 1 ? handleFirstStep : step === 2 ? handleSecondStep : step === 3 ? handleFourthStep : handleThirdStep} encType="multipart/form-data">
        {success ? (
          <div style={{
            background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
            color: '#2e7d32',
            borderRadius: '24px',
            padding: '3rem 2rem',
            textAlign: 'center',
            fontWeight: '700',
            fontSize: '1.2rem',
            boxShadow: '0 8px 32px rgba(46, 125, 50, 0.15)',
            border: '3px solid #0A8F82',
            marginBottom: '2rem',
            maxWidth: '500px',
            margin: '0 auto 2rem'
          }}>
            <div style={{
              fontSize: '4rem', 
              marginBottom: '1.5rem',
              filter: 'drop-shadow(0 4px 8px rgba(76, 175, 80, 0.3))'
            }}>✅</div>
            <div style={{marginBottom: '1.5rem', lineHeight: '1.8'}}>
              <div style={{fontSize: '1.4rem', marginBottom: '1rem', fontWeight: '800'}}>
                تم إنشاء حساب الطبيب بنجاح! 🎉
              </div>
              <span style={{fontSize: '1.1rem', fontWeight: '600', color: '#1b5e20'}}>
                {t('send_documents_whatsapp')}
              </span>
            </div>
            <div style={{
              background: '#f1f8e9',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '2px solid #66bb6a',
              marginBottom: '1.5rem'
            }}>
              <p style={{margin: '0 0 1rem 0', fontSize: '1rem', color: '#2e7d32'}}>
                <strong>📱 {t('whatsapp_number_label')}:</strong> +9647769012619
              </p>
              <p style={{margin: '0', fontSize: '0.9rem', color: '#388e3c'}}>
                📋 {t('required_documents')}: {t('personal_id')} + {t('union_certificate')}
              </p>
            </div>
            <button 
              onClick={resetForm} 
              style={{
                background: 'linear-gradient(135deg, #0A8F82 0%, #0A8F82 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '16px',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(10, 143, 130, 0.4)',
                transition: 'all 0.3s ease',
                minWidth: '200px'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 6px 20px rgba(10, 143, 130, 0.5)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(10, 143, 130, 0.4)';
              }}
            >
              {t('register_another_doctor')}
            </button>
          </div>
        ) : (
                     step === 1 ? (
             <div style={{
               maxWidth: '500px', 
               width: '100%',
               margin: '0 auto', 
               padding: '1.5rem',
               background: '#ffffff',
               borderRadius: '24px',
               boxShadow: '0 8px 32px rgba(0, 188, 212, 0.1)',
               border: '2px solid #e0f7fa',
               boxSizing: 'border-box'
             }}>
              <h2 style={{
                textAlign: 'center', 
                marginBottom: '2rem',
                color: '#00695c',
                fontSize: '1.8rem',
                fontWeight: '700'
              }}>
                📝 {t('basic_info')}
              </h2>
                             <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem'}}>
                 <div>
                   <label style={{
                     fontWeight: '600', 
                     marginBottom: '0.4rem', 
                     display: 'block',
                     color: '#00695c',
                     fontSize: '0.9rem'
                   }}>
                     {t('full_name')}
                   </label>
                                       <input
                      type="text"
                      name="name"
                      placeholder={t('full_name')}
                      value={form.name}
                      onChange={handleChange}
                      style={{
                        padding: '0.8rem 1rem', 
                        borderRadius: '12px', 
                        border: '2px solid #e0f7fa', 
                        width: '100%',
                        fontSize: '0.9rem',
                        background: '#f8fdfd',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box',
                        minWidth: '0',
                        maxWidth: '100%'
                      }}
                     onFocus={(e) => {
                       e.target.style.borderColor = '#00bcd4';
                       e.target.style.background = '#ffffff';
                       e.target.style.boxShadow = '0 0 0 3px rgba(0, 188, 212, 0.1)';
                     }}
                     onBlur={(e) => {
                       e.target.style.borderColor = '#e0f7fa';
                       e.target.style.background = '#f8fdfd';
                       e.target.style.boxShadow = 'none';
                     }}
                   />
                 </div>
                 <div>
                   <label style={{
                     fontWeight: '600', 
                     marginBottom: '0.4rem', 
                     display: 'block',
                     color: '#00695c',
                     fontSize: '0.9rem'
                   }}>
                     {t('email')}
                   </label>
                                       <input
                      type="email"
                      name="email"
                      placeholder={t('email')}
                      value={form.email}
                      onChange={handleChange}
                      style={{
                        padding: '0.8rem 1rem', 
                        borderRadius: '12px', 
                        border: '2px solid #e0f7fa', 
                        width: '100%',
                        fontSize: '0.9rem',
                        background: '#f8fdfd',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box',
                        minWidth: '0',
                        maxWidth: '100%'
                      }}
                     onFocus={(e) => {
                       e.target.style.borderColor = '#00bcd4';
                       e.target.style.background = '#ffffff';
                       e.target.style.boxShadow = '0 0 0 3px rgba(0, 188, 212, 0.1)';
                     }}
                     onBlur={(e) => {
                       e.target.style.borderColor = '#e0f7fa';
                       e.target.style.background = '#f8fdfd';
                       e.target.style.boxShadow = 'none';
                     }}
                   />
                 </div>
                 <div style={{display: 'flex', gap: '0.6rem', alignItems: 'center'}}>
                   <div style={{
                     background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)', 
                     borderRadius: '12px', 
                     border: '2px solid #00bcd4', 
                     padding: '0.8rem 1rem', 
                     fontWeight: '600', 
                     color: '#00695c', 
                     fontSize: '0.9rem', 
                     minWidth: '70px', 
                     textAlign: 'center',
                     boxShadow: '0 2px 8px rgba(0, 188, 212, 0.2)'
                   }}>
                     +964
                   </div>
                                       <input
                      type="text"
                      name="phone"
                      placeholder={t('phone_placeholder')}
                      value={form.phone}
                      onChange={handleChange}
                      style={{
                        borderRadius: '12px', 
                        width: '100%', 
                        padding: '0.8rem 1rem', 
                        border: '2px solid #e0f7fa', 
                        fontSize: '0.9rem',
                        background: '#f8fdfd',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box',
                        minWidth: '0',
                        maxWidth: '100%'
                      }}
                     onFocus={(e) => {
                       e.target.style.borderColor = '#00bcd4';
                       e.target.style.background = '#ffffff';
                       e.target.style.boxShadow = '0 0 0 3px rgba(0, 188, 212, 0.1)';
                     }}
                     onBlur={(e) => {
                       e.target.style.borderColor = '#e0f7fa';
                       e.target.style.background = '#f8fdfd';
                       e.target.style.boxShadow = 'none';
                     }}
                   />
                 </div>
                 {/* ملاحظة مهمة حول رقم الواتساب */}
                 <div style={{
                   background: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
                   border: '2px solid #ffc107',
                   borderRadius: '12px',
                   padding: '0.8rem',
                   marginBottom: '0.5rem',
                   fontSize: '0.85rem',
                   color: '#f57c00',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '0.8rem'
                 }}>
                   <span style={{fontSize: '1.2rem'}}>📱</span>
                   <div>
                     <div style={{fontWeight: '600', marginBottom: '0.2rem'}}>{t('whatsapp_note_title')}:</div>
                     <div>{t('whatsapp_note_doctor')}</div>
                   </div>
                 </div>
                 <div>
                   <label style={{
                     fontWeight: '600', 
                     marginBottom: '0.4rem',
                     color: '#00695c',
                     fontSize: '0.9rem'
                   }}>
                     {t('password')}
                   </label>
                                       <input
                      type="password"
                      name="password"
                      placeholder={t('password')}
                      value={form.password}
                      onChange={handleChange}
                      style={{
                        marginBottom: '0.3rem', 
                        padding: '0.8rem 1rem', 
                        borderRadius: '12px', 
                        border: '2px solid #e0f7fa', 
                        width: '100%',
                        fontSize: '0.9rem',
                        background: '#f8fdfd',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box',
                        minWidth: '0',
                        maxWidth: '100%'
                      }}
                     onFocus={(e) => {
                       e.target.style.borderColor = '#00bcd4';
                       e.target.style.background = '#ffffff';
                       e.target.style.boxShadow = '0 0 0 3px rgba(0, 188, 212, 0.1)';
                     }}
                     onBlur={(e) => {
                       e.target.style.borderColor = '#e0f7fa';
                       e.target.style.background = '#f8fdfd';
                       e.target.style.boxShadow = 'none';
                     }}
                   />
                 </div>
                 <div>
                   <label style={{
                     fontWeight: '600', 
                     marginBottom: '0.4rem',
                     color: '#00695c',
                     fontSize: '0.9rem'
                   }}>
                     {t('confirm_password')}
                   </label>
                                       <input
                      type="password"
                      name="confirm"
                      placeholder={t('confirm_password')}
                      value={form.confirm}
                      onChange={handleChange}
                      style={{
                        marginBottom: '0.3rem', 
                        padding: '0.8rem 1rem', 
                        borderRadius: '12px', 
                        border: '2px solid #e0f7fa', 
                        width: '100%',
                        fontSize: '0.9rem',
                        background: '#f8fdfd',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box',
                        minWidth: '0',
                        maxWidth: '100%'
                      }}
                     onFocus={(e) => {
                       e.target.style.borderColor = '#00bcd4';
                       e.target.style.background = '#ffffff';
                       e.target.style.boxShadow = '0 0 0 3px rgba(0, 188, 212, 0.1)';
                     }}
                     onBlur={(e) => {
                       e.target.style.borderColor = '#e0f7fa';
                       e.target.style.background = '#f8fdfd';
                       e.target.style.boxShadow = 'none';
                     }}
                   />
                 </div>
               </div>
              {error && typeof error === 'string' && error.trim() && (
                <div style={{
                  background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
                  color: '#c62828',
                  padding: '1rem 1.5rem',
                  borderRadius: '12px',
                  marginBottom: '1.5rem',
                  border: '2px solid #ef5350',
                  textAlign: 'center',
                  fontWeight: '600'
                }}>
                  {error}
                </div>
              )}
              <button type="submit" style={{
                width: '100%', 
                padding: '1.3rem', 
                borderRadius: '18px', 
                background: 'linear-gradient(135deg, #0A8F82 0%, #0A8F82 100%)', 
                color: '#fff', 
                fontWeight: '800', 
                fontSize: '1.1rem', 
                border: 'none', 
                marginTop: '1rem', 
                boxShadow: '0 4px 20px rgba(10, 143, 130, 0.4)', 
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 25px rgba(10, 143, 130, 0.5)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 20px rgba(10, 143, 130, 0.4)';
              }}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4v16m8-8H4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t('next')}
              </button>
            </div>
                                             ) : step === 2 ? (
               <div style={{
                 maxWidth: '500px', 
                 width: '100%',
                 margin: '0 auto', 
                 padding: '1.5rem',
                 background: '#ffffff',
                 borderRadius: '24px',
                 boxShadow: '0 8px 32px rgba(0, 188, 212, 0.1)',
                 border: '2px solid #e0f7fa',
                 boxSizing: 'border-box'
               }}>
                <h2 style={{
                  textAlign: 'center', 
                  marginBottom: '2rem',
                  color: '#00695c',
                  fontSize: '1.8rem',
                  fontWeight: '700'
                }}>
                  🏥 {t('clinic_info')}
                </h2>
                                 <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                   <div>
                     <label style={{
                       fontWeight: '600', 
                       marginBottom: '0.4rem', 
                       display: 'block',
                       color: '#00695c',
                       fontSize: '0.9rem'
                     }}>
                       {t('province')}
                     </label>
                     <select
                       name="province"
                       value={form.province}
                       onChange={handleChange}
                       style={{
                         padding: '0.8rem 1rem', 
                         borderRadius: '12px', 
                         border: '2px solid #e0f7fa', 
                         width: '100%',
                         fontSize: '0.9rem',
                         background: '#f8fdfd',
                         transition: 'all 0.3s ease',
                         boxSizing: 'border-box'
                       }}
                       onFocus={(e) => {
                         e.target.style.borderColor = '#00bcd4';
                         e.target.style.background = '#ffffff';
                         e.target.style.boxShadow = '0 0 0 3px rgba(0, 188, 212, 0.1)';
                       }}
                       onBlur={(e) => {
                         e.target.style.borderColor = '#e0f7fa';
                         e.target.style.background = '#f8fdfd';
                         e.target.style.boxShadow = 'none';
                       }}>
                       <option value="">{t('choose_province')}</option>
                       {Array.isArray(provinces) && provinces.map(p => (
                         <option key={p} value={p}>{p}</option>
                       ))}
                     </select>
                   </div>
                   <div>
                     <label style={{
                       fontWeight: '600', 
                       marginBottom: '0.4rem', 
                       display: 'block',
                       color: '#00695c',
                       fontSize: '0.9rem'
                     }}>
                       {t('area_address')}
                     </label>
                     <input
                       type="text"
                       name="area"
                       placeholder={t('area_address')}
                       value={form.area}
                       onChange={handleChange}
                       style={{
                         padding: '0.8rem 1rem', 
                         borderRadius: '12px', 
                         border: '2px solid #e0f7fa', 
                         width: '100%',
                         fontSize: '0.9rem',
                         background: '#f8fdfd',
                         transition: 'all 0.3s ease',
                         boxSizing: 'border-box'
                       }}
                       onFocus={(e) => {
                         e.target.style.borderColor = '#00bcd4';
                         e.target.style.background = '#ffffff';
                         e.target.style.boxShadow = '0 0 0 3px rgba(0, 188, 212, 0.1)';
                       }}
                       onBlur={(e) => {
                         e.target.style.borderColor = '#e0f7fa';
                         e.target.style.background = '#f8fdfd';
                         e.target.style.boxShadow = 'none';
                       }}
                     />
                   </div>
                   <div>
                     <label style={{
                       fontWeight: '600', 
                       marginBottom: '0.4rem', 
                       display: 'block',
                       color: '#00695c',
                       fontSize: '0.9rem'
                     }}>
                       {t('clinic_location')}
                     </label>
                     <input
                       type="text"
                       name="clinicLocation"
                       placeholder={t('clinic_location')}
                       value={form.clinicLocation}
                       onChange={handleChange}
                       style={{
                         padding: '0.8rem 1rem', 
                         borderRadius: '12px', 
                         border: '2px solid #e0f7fa', 
                         width: '100%',
                         fontSize: '0.9rem',
                         background: '#f8fdfd',
                         transition: 'all 0.3s ease',
                         boxSizing: 'border-box'
                       }}
                       onFocus={(e) => {
                         e.target.style.borderColor = '#00bcd4';
                         e.target.style.background = '#ffffff';
                         e.target.style.boxShadow = '0 0 0 3px rgba(0, 188, 212, 0.1)';
                       }}
                       onBlur={(e) => {
                         e.target.style.borderColor = '#e0f7fa';
                         e.target.style.background = '#f8fdfd';
                         e.target.style.boxShadow = 'none';
                       }}
                     />
                   </div>
                   <div>
                     <label style={{
                       fontWeight: '600', 
                       marginBottom: '0.4rem', 
                       display: 'block',
                       color: '#00695c',
                       fontSize: '0.9rem'
                     }}>
                       📍 {t('map_location')}
                     </label>
                                           <input
                        type="url"
                        name="mapLocation"
                        placeholder={t('map_location_placeholder')}
                        value={form.mapLocation}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          padding: '0.8rem 1rem', 
                          borderRadius: '12px', 
                          border: '2px solid #e0f7fa',
                          fontSize: '0.9rem',
                          background: '#f8fdfd',
                          transition: 'all 0.3s ease',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#00bcd4';
                          e.target.style.background = '#ffffff';
                          e.target.style.boxShadow = '0 0 0 3px rgba(0, 188, 212, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e0f7fa';
                          e.target.style.background = '#f8fdfd';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                     <div style={{marginTop: '0.3rem', fontSize: '0.8rem', color: '#0A8F82', textAlign: 'right'}}>
                       💡 {t('map_location_help')}
                     </div>
                   </div>
                   <div>
                     <label style={{
                       fontWeight: '600', 
                       marginBottom: '0.4rem', 
                       display: 'block',
                       color: '#00695c',
                       fontSize: '0.9rem'
                     }}>
                       {t('choose_category')}
                     </label>
                     <select
                       value={selectedCategory}
                       onChange={e => { 
                         setSelectedCategory(e.target.value); 
                         setForm(prev => ({...prev, specialty: ''}));
                       }}
                       style={{
                         padding: '0.8rem 1rem', 
                         borderRadius: '12px', 
                         border: '2px solid #e0f7fa', 
                         width: '100%',
                         fontSize: '0.9rem',
                         background: '#f8fdfd',
                         transition: 'all 0.3s ease',
                         boxSizing: 'border-box'
                       }}
                       onFocus={(e) => {
                         e.target.style.borderColor = '#00bcd4';
                         e.target.style.background = '#ffffff';
                         e.target.style.boxShadow = '0 0 0 3px rgba(0, 188, 212, 0.1)';
                       }}
                       onBlur={(e) => {
                         e.target.style.borderColor = '#e0f7fa';
                         e.target.style.background = '#f8fdfd';
                         e.target.style.boxShadow = 'none';
                       }}>
                       <option value="">{t('choose_category')}</option>
                       {Array.isArray(allCategories) && allCategories.map(cat => (
                         <option key={cat} value={cat}>{cat}</option>
                       ))}
                     </select>
                   </div>
                   <div>
                     <label style={{
                       fontWeight: '600', 
                       marginBottom: '0.4rem', 
                       display: 'block',
                       color: '#00695c',
                       fontSize: '0.9rem'
                     }}>
                       {t('choose_specialty')}
                     </label>
                     <select
                       name="specialty"
                       value={form.specialty}
                       onChange={handleChange}
                       style={{
                         padding: '0.8rem 1rem', 
                         borderRadius: '12px', 
                         border: '2px solid #e0f7fa', 
                         width: '100%',
                         fontSize: '0.9rem',
                         background: '#f8fdfd',
                         transition: 'all 0.3s ease',
                         boxSizing: 'border-box'
                       }}
                       onFocus={(e) => {
                         e.target.style.borderColor = '#00bcd4';
                         e.target.style.background = '#ffffff';
                         e.target.style.boxShadow = '0 0 0 3px rgba(0, 188, 212, 0.1)';
                       }}
                       onBlur={(e) => {
                         e.target.style.borderColor = '#e0f7fa';
                         e.target.style.background = '#f8fdfd';
                         e.target.style.boxShadow = 'none';
                       }}>
                       <option value="">{t('choose_specialty')}</option>
                       {Array.isArray(specialtiesList) && 
                         (selectedCategory ? 
                           specialtiesList.filter(s => s.category === selectedCategory).map(s => (
                             <option key={s.key} value={s.key}>{s.label}</option>
                           )) :
                           specialtiesList.map(s => (
                             <option key={s.key} value={s.key}>{s.label}</option>
                           ))
                         )
                       }
                     </select>
                   </div>
                   <div>
                     <label style={{
                       fontWeight: '600', 
                       marginBottom: '0.4rem', 
                       display: 'block',
                       color: '#00695c',
                       fontSize: '0.9rem'
                     }}>
                       {t('experience_years')}
                     </label>
                     <input 
                       type="number" 
                       name="experienceYears" 
                       placeholder={t('experience_years')} 
                       value={form.experienceYears} 
                       onChange={handleChange} 
                       min={0} 
                       style={{
                         width: '100%', 
                         padding: '0.8rem 1rem', 
                         borderRadius: '12px', 
                         border: '2px solid #e0f7fa',
                         fontSize: '0.9rem',
                         background: '#f8fdfd',
                         transition: 'all 0.3s ease',
                         boxSizing: 'border-box'
                       }}
                       onFocus={(e) => {
                         e.target.style.borderColor = '#00bcd4';
                         e.target.style.background = '#ffffff';
                         e.target.style.boxShadow = '0 0 0 3px rgba(0, 188, 212, 0.1)';
                       }}
                       onBlur={(e) => {
                         e.target.style.borderColor = '#e0f7fa';
                         e.target.style.background = '#f8fdfd';
                         e.target.style.boxShadow = 'none';
                       }}
                     />
                   </div>
                   <div style={{ marginBottom: '0.5rem' }}>
                     <label style={{ 
                       fontWeight: '600', 
                       color: '#00695c', 
                       marginBottom: '0.4rem', 
                       display: 'block',
                       fontSize: '0.9rem'
                     }}>
                       {t('appointment_duration_label')}
                     </label>
                     <select
                       value={form.appointmentDuration || '30'}
                       onChange={e => setForm(prev => ({ ...prev, appointmentDuration: e.target.value }))}
                       style={{
                         width: '100%',
                         padding: '0.8rem 1rem',
                         borderRadius: '12px',
                         border: '2px solid #e0f7fa',
                         fontSize: '0.9rem',
                         background: '#f8fdfd',
                         transition: 'all 0.3s ease',
                         boxSizing: 'border-box'
                       }}
                       onFocus={(e) => {
                         e.target.style.borderColor = '#00bcd4';
                         e.target.style.background = '#ffffff';
                         e.target.style.boxShadow = '0 0 0 3px rgba(0, 188, 212, 0.1)';
                       }}
                       onBlur={(e) => {
                         e.target.style.borderColor = '#e0f7fa';
                         e.target.style.background = '#f8fdfd';
                         e.target.style.boxShadow = 'none';
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
                {error && typeof error === 'string' && error.trim() && (
                  <div style={{
                    background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
                    color: '#c62828',
                    padding: '1rem 1.5rem',
                    borderRadius: '12px',
                    marginBottom: '1.5rem',
                    border: '2px solid #ef5350',
                    textAlign: 'center',
                    fontWeight: '600'
                  }}>
                    {error}
                  </div>
                )}
                <button type="submit" style={{
                  width: '100%', 
                  padding: '1.3rem', 
                  borderRadius: '18px', 
                  background: 'linear-gradient(135deg, #0A8F82 0%, #0A8F82 100%)', 
                  color: '#fff', 
                  fontWeight: '800', 
                  fontSize: '1.1rem', 
                  border: 'none', 
                  marginTop: '1rem', 
                  boxShadow: '0 4px 20px rgba(10, 143, 130, 0.4)', 
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 25px rgba(10, 143, 130, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 20px rgba(10, 143, 130, 0.4)';
                }}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4v16m8-8H4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t('next')}
                </button>
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '16px',
                    background: 'transparent',
                    color: '#0A8F82',
                    fontWeight: '600',
                    fontSize: '1rem',
                    border: '2px solid #e0f7fa',
                    marginTop: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#f0f9ff';
                    e.target.style.borderColor = '#0A8F82';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.borderColor = '#e0f7fa';
                  }}
                >
                  ← {t('back')}
                </button>
              </div>
                         ) : step === 3 ? (
               <div style={{
                 maxWidth: '500px', 
                 width: '100%',
                 margin: '0 auto', 
                 padding: '1.5rem',
                 background: '#ffffff',
                 borderRadius: '24px',
                 boxShadow: '0 8px 32px rgba(0, 188, 212, 0.1)',
                 border: '2px solid #e0f7fa',
                 boxSizing: 'border-box'
               }}>
                <h2 style={{
                  textAlign: 'center', 
                  marginBottom: '2rem',
                  color: '#00695c',
                  fontSize: '1.8rem',
                  fontWeight: '700'
                }}>
                  ⏰ {t('work_times')}
                </h2>
                <div style={{marginBottom: '1.5rem'}}>
                  <h4 style={{
                    color: '#0A8F82', 
                    marginBottom: '1rem', 
                    fontWeight: '700',
                    fontSize: '1.2rem'
                  }}>
                    {t('weekly_work_times')}
                  </h4>
                                     <div style={{
                     display: 'flex', 
                     flexDirection: 'column',
                     gap: '1rem', 
                     marginBottom: '1.5rem',
                     background: 'linear-gradient(135deg, #f8fdfd 0%, #e0f7fa 100%)',
                     padding: '1.5rem',
                     borderRadius: '16px',
                     border: '2px solid #e0f7fa'
                   }}>
                     {/* اختيار اليوم */}
                     <div style={{width: '100%'}}>
                       <label style={{
                         fontSize: '0.9rem', 
                         color: '#00695c', 
                         marginBottom: '0.5rem',
                         fontWeight: '600',
                         display: 'block'
                       }}>
                         📅 {t('day')}
                       </label>
                       <select 
                         value={newTime.day} 
                         onChange={e => setNewTime({...newTime, day: e.target.value})} 
                         style={{
                           width: '100%', 
                           borderRadius: '12px', 
                           padding: '0.8rem 1rem',
                           border: '2px solid #e0f7fa',
                           background: '#ffffff',
                           fontSize: '0.9rem',
                           transition: 'all 0.3s ease',
                           boxSizing: 'border-box'
                         }}
                         onFocus={(e) => {
                           e.target.style.borderColor = '#00bcd4';
                           e.target.style.boxShadow = '0 0 0 3px rgba(0, 188, 212, 0.1)';
                         }}
                         onBlur={(e) => {
                           e.target.style.borderColor = '#e0f7fa';
                           e.target.style.boxShadow = 'none';
                         }}
                       >
                         <option value="">{t('choose_day')}</option>
                         {Array.isArray(weekDays) && weekDays.length > 0 ? 
                           weekDays.map(d => <option key={d} value={d}>{d}</option>) :
                           fallbackWeekDays.map(d => <option key={d} value={d}>{d}</option>)
                         }
                       </select>
                     </div>
                     
                     {/* حقول الوقت */}
                     <div style={{
                       display: 'grid', 
                       gridTemplateColumns: '1fr 1fr', 
                       gap: '1rem',
                       alignItems: 'end'
                     }}>
                       <div>
                         <label style={{
                           fontSize: '0.9rem', 
                           color: '#00695c', 
                           marginBottom: '0.5rem',
                           fontWeight: '600',
                           display: 'block'
                         }}>
                           🕐 {t('from_time')}
                         </label>
                         <input 
                           type="time" 
                           value={newTime.from} 
                           onChange={e => setNewTime({...newTime, from: e.target.value})} 
                           style={{
                             width: '100%',
                             borderRadius: '12px', 
                             padding: '0.8rem', 
                             fontSize: '0.9rem',
                             border: '2px solid #e0f7fa',
                             background: '#ffffff',
                             transition: 'all 0.3s ease',
                             boxSizing: 'border-box'
                           }}
                           onFocus={(e) => {
                             e.target.style.borderColor = '#00bcd4';
                             e.target.style.boxShadow = '0 0 0 3px rgba(0, 188, 212, 0.1)';
                           }}
                           onBlur={(e) => {
                             e.target.style.borderColor = '#e0f7fa';
                             e.target.style.boxShadow = 'none';
                           }}
                         /> 
                       </div>
                       <div>
                         <label style={{
                           fontSize: '0.9rem', 
                           color: '#00695c', 
                           marginBottom: '0.5rem',
                           fontWeight: '600',
                           display: 'block'
                         }}>
                           🕐 {t('to_time')}
                         </label>
                         <input 
                           type="time" 
                           value={newTime.to} 
                           onChange={e => setNewTime({...newTime, to: e.target.value})} 
                           style={{
                             width: '100%',
                             borderRadius: '12px', 
                             padding: '0.8rem', 
                             fontSize: '0.9rem',
                             border: '2px solid #e0f7fa',
                             background: '#ffffff',
                             transition: 'all 0.3s ease',
                             boxSizing: 'border-box'
                           }}
                           onFocus={(e) => {
                             e.target.style.borderColor = '#00bcd4';
                             e.target.style.boxShadow = '0 0 0 3px rgba(0, 188, 212, 0.1)';
                           }}
                           onBlur={(e) => {
                             e.target.style.borderColor = '#e0f7fa';
                             e.target.style.boxShadow = 'none';
                           }}
                         /> 
                       </div>
                     </div>
                     
                     {/* زر الإضافة */}
                     <button 
                       type="button" 
                       onClick={handleAddTime}
                       style={{
                         width: '100%',
                         padding: '1rem', 
                         fontSize: '1rem',
                         borderRadius: '12px',
                         background: 'linear-gradient(135deg, #0A8F82 0%, #0A8F82 100%)',
                         color: '#fff',
                         border: 'none',
                         fontWeight: '600',
                         cursor: 'pointer',
                         transition: 'all 0.3s ease',
                         boxShadow: '0 2px 8px rgba(10, 143, 130, 0.3)',
                         marginTop: '0.5rem'
                       }}
                       onMouseOver={(e) => {
                         e.target.style.transform = 'translateY(-2px)';
                         e.target.style.boxShadow = '0 4px 16px rgba(10, 143, 130, 0.4)';
                       }}
                       onMouseOut={(e) => {
                         e.target.style.transform = 'translateY(0)';
                         e.target.style.boxShadow = '0 2px 8px rgba(10, 143, 130, 0.3)';
                       }}
                     >
                       ➕ {t('add_time')}
                     </button>
                   </div>
                  <div style={{marginBottom: '1rem'}}>
                    {workTimes.length === 0 && (
                      <span style={{
                        color: '#888', 
                        fontSize: '1rem',
                        fontStyle: 'italic',
                        textAlign: 'center',
                        display: 'block',
                        padding: '1rem',
                        background: '#f8f9fa',
                        borderRadius: '12px',
                        border: '2px dashed #e0f7fa'
                      }}>
                        {t('no_times_added')}
                      </span>
                    )}
                    {Array.isArray(workTimes) && workTimes.map((time, idx) => (
                      <div key={idx} style={{
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.8rem', 
                        background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)', 
                        borderRadius: '12px', 
                        padding: '0.8rem 1rem', 
                        marginBottom: '0.5rem',
                        border: '2px solid #00bcd4',
                        boxShadow: '0 2px 8px rgba(0, 188, 212, 0.1)'
                      }}>
                        <span style={{flex: 2, fontWeight: '600', color: '#00695c'}}>{time.day}</span>
                        <span style={{flex: 1, fontFamily: 'monospace', color: '#0A8F82', fontWeight: '600'}}>{time.from}</span>
                        <span style={{flex: 1, fontFamily: 'monospace', color: '#0A8F82', fontWeight: '600'}}>{time.to}</span>
                        <button 
                          type="button" 
                          style={{
                            background: 'none', 
                            border: 'none', 
                            color: '#e53935', 
                            fontWeight: '700', 
                            cursor: 'pointer', 
                            fontSize: '1.2rem',
                            padding: '0.2rem',
                            borderRadius: '50%',
                            width: '30px',
                            height: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease'
                          }} 
                          onClick={() => handleRemoveTime(idx)}
                          onMouseOver={(e) => {
                            e.target.style.background = '#ffebee';
                            e.target.style.transform = 'scale(1.1)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.background = 'none';
                            e.target.style.transform = 'scale(1)';
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{marginBottom: '1.5rem'}}>
                  <label style={{
                    fontWeight: '700', 
                    marginBottom: '0.5rem', 
                    display: 'block',
                    color: '#00695c',
                    fontSize: '1rem'
                  }}>
                    {t('about_optional')}
                  </label>
                  <textarea 
                    name="about" 
                    placeholder={t('about_optional')} 
                    value={form.about} 
                    onChange={handleChange} 
                    style={{
                      borderRadius: '16px', 
                      border: '2px solid #e0f7fa', 
                      padding: '1rem 1.2rem', 
                      minHeight: '80px', 
                      marginBottom: '0.5rem', 
                      resize: 'vertical',
                      width: '100%',
                      fontSize: '1rem',
                      background: '#f8fdfd',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#00bcd4';
                      e.target.style.background = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 188, 212, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0f7fa';
                      e.target.style.background = '#f8fdfd';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                {error && typeof error === 'string' && error.trim() && (
                  <div style={{
                    background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
                    color: '#c62828',
                    padding: '1rem 1.5rem',
                    borderRadius: '12px',
                    marginBottom: '1.5rem',
                    border: '2px solid #ef5350',
                    textAlign: 'center',
                    fontWeight: '600'
                  }}>
                    {error}
                  </div>
                )}
                <button type="submit" style={{
                  width: '100%', 
                  padding: '1.3rem', 
                  borderRadius: '18px', 
                  background: 'linear-gradient(135deg, #0A8F82 0%, #0A8F82 100%)', 
                  color: '#fff', 
                  fontWeight: '800', 
                  fontSize: '1.1rem', 
                  border: 'none', 
                  marginTop: '1rem', 
                  boxShadow: '0 4px 20px rgba(10, 143, 130, 0.4)', 
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 25px rgba(10, 143, 130, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 20px rgba(10, 143, 130, 0.4)';
                }}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4v16m8-8H4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t('next')}
                </button>
                <button 
                  type="button" 
                  onClick={() => setStep(2)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '16px',
                    background: 'transparent',
                    color: '#0A8F82',
                    fontWeight: '600',
                    fontSize: '1rem',
                    border: '2px solid #e0f7fa',
                    marginTop: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#f0f9ff';
                    e.target.style.borderColor = '#0A8F82';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.borderColor = '#e0f7fa';
                  }}
                >
                  ← {t('back')}
                </button>
              </div>
                         ) : step === 4 ? (
               <div style={{
                 maxWidth: '500px', 
                 width: '100%',
                 margin: '0 auto', 
                 padding: '1.5rem',
                 background: '#ffffff',
                 borderRadius: '24px',
                 boxShadow: '0 8px 32px rgba(0, 188, 212, 0.1)',
                 border: '2px solid #e0f7fa',
                 boxSizing: 'border-box'
               }}>
                <h2 style={{
                  textAlign: 'center', 
                  marginBottom: '2rem',
                  color: '#00695c',
                  fontSize: '1.8rem',
                  fontWeight: '700'
                }}>
                  📱 {t('work_times_send_documents')}
                </h2>
                <h3 style={{
                  color: '#0A8F82', 
                  marginBottom: '1.5rem', 
                  fontWeight: '800',
                  fontSize: '1.3rem',
                  textAlign: 'center'
                }}>
                  📱 {t('send_documents_whatsapp')}
                </h3>
                
                {/* صورة شخصية فقط */}
                <div style={{
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1.5rem', 
                  maxWidth: '400px', 
                  margin: '0 auto', 
                  marginBottom: '2rem'
                }}>
                  <div>
                    <label style={{
                      textAlign: 'right', 
                      fontSize: '1rem', 
                      color: '#0A8F82', 
                      marginBottom: '0.8rem', 
                      display: 'block',
                      fontWeight: '700'
                    }}>
                      {t('personal_image')} (اختيارية)
                    </label>
                    <input 
                      type="file" 
                      name="image" 
                      accept="image/*" 
                      onChange={handleChange} 
                      style={{
                        marginBottom: '0.8rem', 
                        width: '100%',
                        padding: '0.8rem',
                        borderRadius: '12px',
                        border: '2px dashed #e0f7fa',
                        background: '#f8fdfd'
                      }} 
                    />
                    {previewUrls.image && typeof previewUrls.image === 'string' && (
                      <div style={{
                        marginBottom: '1rem', 
                        textAlign: 'center'
                      }}>
                        <img 
                          src={previewUrls.image} 
                          alt={t('personal_image')} 
                          style={{
                            width: '120px', 
                            height: '120px', 
                            borderRadius: '50%', 
                            objectFit: 'cover', 
                            border: '3px solid #0A8F82', 
                            cursor: 'pointer',
                            boxShadow: '0 4px 16px rgba(10, 143, 130, 0.3)'
                          }} 
                          onClick={() => window.open(previewUrls.image, '_blank')} 
                          title="اضغط للتكبير" 
                        />
                        <button 
                          type="button" 
                          onClick={() => removePreview('image')} 
                          style={{
                            background: '#e53935', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '8px', 
                            padding: '0.5rem 1rem', 
                            marginTop: '0.8rem', 
                            fontSize: '0.9rem', 
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.background = '#c62828';
                            e.target.style.transform = 'scale(1.05)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.background = '#e53935';
                            e.target.style.transform = 'scale(1)';
                          }}
                        >
                          {t('remove')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* تعليمات الواتساب */}
                <div style={{
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
                  padding: '2rem', 
                  borderRadius: '20px', 
                  border: '3px solid #0A8F82', 
                  marginBottom: '2rem',
                  boxShadow: '0 4px 20px rgba(10, 143, 130, 0.1)'
                }}>
                  <div style={{textAlign: 'center', marginBottom: '1.5rem'}}>
                    <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📱</div>
                    <h4 style={{
                      color: '#0A8F82', 
                      margin: 0, 
                      fontWeight: '700',
                      fontSize: '1.3rem'
                    }}>
                      {t('send_documents_whatsapp')}
                    </h4>
                  </div>
                  
                  <div style={{marginBottom: '1.5rem'}}>
                    <p style={{
                      color: '#333', 
                      fontSize: '1rem', 
                      marginBottom: '1rem', 
                      textAlign: 'right',
                      fontWeight: '600'
                    }}>
                      <strong>📞 {t('whatsapp_number_label')}:</strong>
                    </p>
                    <a 
                      href="https://wa.me/+9647769012619" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        background: 'linear-gradient(135deg, #0A8F82 0%, #0A8F82 100%)',
                        color: '#fff',
                        padding: '1rem 1.5rem',
                        borderRadius: '16px',
                        textDecoration: 'none',
                        textAlign: 'center',
                        fontWeight: '700',
                        fontSize: '1.1rem',
                        marginBottom: '1.5rem',
                        boxShadow: '0 4px 16px rgba(10, 143, 130, 0.4)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(10, 143, 130, 0.5)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 16px rgba(10, 143, 130, 0.4)';
                      }}
                    >
                      📱 +9647769012619
                    </a>
                  </div>

                  <div style={{marginBottom: '1.5rem'}}>
                    <p style={{
                      color: '#333', 
                      fontSize: '1rem', 
                      marginBottom: '1rem', 
                      textAlign: 'right', 
                      fontWeight: '600'
                    }}>
                      📋 {t('required_documents')}:
                    </p>
                    <ul style={{
                      color: '#555', 
                      fontSize: '1rem', 
                      textAlign: 'right', 
                      margin: 0, 
                      paddingRight: '1.5rem',
                      lineHeight: '1.8'
                    }}>
                      <li>{t('id_front')}</li>
                      <li>{t('id_back')}</li>
                      <li>{t('syndicate_front')}</li>
                      <li>{t('syndicate_back')}</li>
                    </ul>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)', 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    border: '2px solid #ffc107',
                    textAlign: 'center'
                  }}>
                    <p style={{
                      color: '#f57c00', 
                      fontSize: '0.9rem', 
                      margin: 0, 
                      textAlign: 'center',
                      fontWeight: '600'
                    }}>
                      💡 <strong>{t('note')}:</strong> {t('auto_message_note')}
                    </p>
                  </div>
                </div>

                {error && typeof error === 'string' && error.trim() && (
                  <div style={{
                    background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
                    color: '#c62828',
                    padding: '1rem 1.5rem',
                    borderRadius: '12px',
                    marginBottom: '1.5rem',
                    border: '2px solid #ef5350',
                    textAlign: 'center',
                    fontWeight: '600'
                  }}>
                    {error}
                  </div>
                )}
                <div style={{
                  display: 'flex', 
                  gap: '1rem', 
                  marginTop: '1.5rem', 
                  justifyContent: 'center'
                }}>
                  <button type="submit" style={{
                    flex: 1,
                    padding: '1.3rem', 
                    borderRadius: '18px', 
                    background: 'linear-gradient(135deg, #0A8F82 0%, #0A8F82 100%)', 
                    color: '#fff', 
                    fontWeight: '800', 
                    fontSize: '1.1rem', 
                    border: 'none', 
                    marginTop: '0.5rem', 
                    boxShadow: '0 4px 20px rgba(10, 143, 130, 0.4)', 
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 25px rgba(10, 143, 130, 0.5)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 20px rgba(10, 143, 130, 0.4)';
                  }}>
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4v16m8-8H4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {t('create_account')}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setStep(3)}
                    style={{
                      padding: '1rem 1.5rem',
                      borderRadius: '16px',
                      background: 'transparent',
                      color: '#0A8F82',
                      fontWeight: '600',
                      fontSize: '1rem',
                      border: '2px solid #e0f7fa',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = '#f0f9ff';
                      e.target.style.borderColor = '#0A8F82';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.borderColor = '#e0f7fa';
                    }}
                  >
                    ← {t('back')}
                  </button>
                </div>
              </div>
            ) : null
        )}
      </form>
    </div>
  );
}

export default DoctorSignUp; 