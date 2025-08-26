/**
 * ملف ثوابت التخصصات الطبية
 * يحتوي على جميع التخصصات مع مفاتيحها وأرقامها للربط مع قاعدة البيانات
 */

export const SPECIALTY_KEYS = {
  // الطب العام والأساسي
  GENERAL_MEDICINE: 'general_medicine',
  FAMILY_MEDICINE: 'family_medicine',
  PEDIATRICS: 'pediatrics',
  GYNECOLOGY_OBSTETRICS: 'gynecology_obstetrics',
  EMERGENCY_MEDICINE: 'emergency_medicine',
  GERIATRICS: 'geriatrics',
  COMMUNITY_MEDICINE: 'community_medicine',
  PREVENTIVE_MEDICINE: 'preventive_medicine',

  // التخصصات الباطنية
  INTERNAL_MEDICINE: 'internal_medicine',
  CARDIOLOGY: 'cardiology',
  GASTROENTEROLOGY: 'gastroenterology',
  HEMATOLOGY: 'hematology',
  NEPHROLOGY: 'nephrology',
  ENDOCRINOLOGY: 'endocrinology',
  INFECTIOUS_DISEASES: 'infectious_diseases',
  RHEUMATOLOGY: 'rheumatology',
  ONCOLOGY: 'oncology',
  NEUROLOGY: 'neurology',
  PSYCHIATRY: 'psychiatry',
  IMMUNOLOGY: 'immunology',
  PULMONOLOGY: 'pulmonology',
  UROLOGY: 'urology',
  DERMATOLOGY: 'dermatology',

  // التخصصات الجراحية
  GENERAL_SURGERY: 'general_surgery',
  ORTHOPEDIC_SURGERY: 'orthopedic_surgery',
  NEUROSURGERY: 'neurosurgery',
  CARDIOTHORACIC_SURGERY: 'cardiothoracic_surgery',
  PLASTIC_SURGERY: 'plastic_surgery',
  VASCULAR_SURGERY: 'vascular_surgery',
  UROLOGICAL_SURGERY: 'urological_surgery',
  PEDIATRIC_SURGERY: 'pediatric_surgery',
  ENT_SURGERY: 'ent_surgery',
  MAXILLOFACIAL_SURGERY: 'maxillofacial_surgery',
  PLASTIC_RECONSTRUCTIVE_SURGERY: 'plastic_reconstructive_surgery',
  LAPAROSCOPIC_SURGERY: 'laparoscopic_surgery',

  // تخصصات الرأس والأسنان
  OPHTHALMOLOGY: 'ophthalmology',
  ENT: 'ent',
  DENTISTRY: 'dentistry',
  ORAL_MEDICINE_SURGERY: 'oral_medicine_surgery',
  ORTHODONTICS: 'orthodontics',
  COSMETIC_DENTISTRY: 'cosmetic_dentistry',

  // تخصصات الأطفال الدقيقة
  NEONATOLOGY: 'neonatology',
  PEDIATRIC_CARDIOLOGY: 'pediatric_cardiology',
  PEDIATRIC_GASTROENTEROLOGY: 'pediatric_gastroenterology',
  PEDIATRIC_NEUROLOGY: 'pediatric_neurology',
  PEDIATRIC_HEMATOLOGY: 'pediatric_hematology',
  PEDIATRIC_ENDOCRINOLOGY: 'pediatric_endocrinology',
  PEDIATRIC_NEPHROLOGY: 'pediatric_nephrology',
  PEDIATRIC_RHEUMATOLOGY: 'pediatric_rheumatology',

  // التخصصات الطبية المساندة
  ANESTHESIOLOGY: 'anesthesiology',
  RADIOLOGY: 'radiology',
  NUCLEAR_MEDICINE: 'nuclear_medicine',
  MEDICAL_LABORATORY: 'medical_laboratory',
  PHYSICAL_MEDICINE_REHABILITATION: 'physical_medicine_rehabilitation',
  SPORTS_MEDICINE: 'sports_medicine',
  FORENSIC_MEDICINE: 'forensic_medicine',
  PAIN_MEDICINE: 'pain_medicine',
  OCCUPATIONAL_MEDICINE: 'occupational_medicine',
  PUBLIC_HEALTH: 'public_health',
  REHABILITATION_MEDICINE: 'rehabilitation_medicine',
  PALLIATIVE_CARE: 'palliative_care',
  ADVANCED_EMERGENCY_MEDICINE: 'advanced_emergency_medicine',
  INTENSIVE_CARE_MEDICINE: 'intensive_care_medicine',

  // العلوم الطبية المساندة
  NURSING: 'nursing',
  CLINICAL_NUTRITION: 'clinical_nutrition',
  PHYSICAL_THERAPY: 'physical_therapy',
  PHARMACY: 'pharmacy',
  MEDICAL_PSYCHOLOGY: 'medical_psychology',
  OCCUPATIONAL_THERAPY: 'occupational_therapy',
  SPEECH_THERAPY: 'speech_therapy',
  RESPIRATORY_THERAPY: 'respiratory_therapy',
  MEDICAL_LABORATORY_TECHNOLOGY: 'medical_laboratory_technology',

  // التخصصات الجديدة والمتطورة
  GENOMIC_MEDICINE: 'genomic_medicine',
  STEM_CELL_MEDICINE: 'stem_cell_medicine',
  PERSONALIZED_MEDICINE: 'personalized_medicine',
  NON_SURGICAL_COSMETIC_MEDICINE: 'non_surgical_cosmetic_medicine',
  OBESITY_MEDICINE: 'obesity_medicine',
  SLEEP_MEDICINE: 'sleep_medicine',
  TRAVEL_MEDICINE: 'travel_medicine',
  SPACE_MEDICINE: 'space_medicine',
  DIVING_MEDICINE: 'diving_medicine',
  ADVANCED_SPORTS_MEDICINE: 'advanced_sports_medicine',
  ADVANCED_GERIATRICS: 'advanced_geriatrics',
  NEUROPATHIC_PAIN_MEDICINE: 'neuropathic_pain_medicine',
  VASCULAR_MEDICINE: 'vascular_medicine',
  IMMUNOLOGY_ALLERGY_MEDICINE: 'immunology_allergy_medicine'
};

// قائمة التخصصات مع أرقامها للربط مع قاعدة البيانات
export const SPECIALTIES_WITH_IDS = [
  // الطب العام والأساسي
  { id: 0, key: SPECIALTY_KEYS.GENERAL_MEDICINE, name_ar: 'الطب العام', name_en: 'General Medicine', name_ku: 'پزیشکی گشتی', category: 'الطب العام والأساسي' },
  { id: 1, key: SPECIALTY_KEYS.FAMILY_MEDICINE, name_ar: 'طب الأسرة', name_en: 'Family Medicine', name_ku: 'خێزان', category: 'الطب العام والأساسي' },
  { id: 2, key: SPECIALTY_KEYS.PEDIATRICS, name_ar: 'طب الأطفال', name_en: 'Pediatrics', name_ku: 'منداڵ', category: 'الطب العام والأساسي' },
  { id: 3, key: SPECIALTY_KEYS.GYNECOLOGY_OBSTETRICS, name_ar: 'طب النساء والتوليد', name_en: 'Gynecology & Obstetrics', name_ku: 'ژن و لەدایکبوون', category: 'الطب العام والأساسي' },
  { id: 4, key: SPECIALTY_KEYS.EMERGENCY_MEDICINE, name_ar: 'الطوارئ', name_en: 'Emergency', name_ku: 'فوریت', category: 'الطب العام والأساسي' },
  { id: 5, key: SPECIALTY_KEYS.GERIATRICS, name_ar: 'طب المسنين', name_en: 'Geriatrics', name_ku: 'پزیشکی پیران', category: 'الطب العام والأساسي' },
  { id: 6, key: SPECIALTY_KEYS.COMMUNITY_MEDICINE, name_ar: 'طب المجتمع', name_en: 'Community Medicine', name_ku: 'پزیشکی کۆمەڵگا', category: 'الطب العام والأساسي' },
  { id: 7, key: SPECIALTY_KEYS.PREVENTIVE_MEDICINE, name_ar: 'طب الوقاية', name_en: 'Preventive Medicine', name_ku: 'پزیشکی پاراستن', category: 'الطب العام والأساسي' },

  // التخصصات الباطنية
  { id: 8, key: SPECIALTY_KEYS.INTERNAL_MEDICINE, name_ar: 'الباطنية', name_en: 'Internal Medicine', name_ku: 'باطنی', category: 'التخصصات الباطنية' },
  { id: 9, key: SPECIALTY_KEYS.CARDIOLOGY, name_ar: 'أمراض القلب', name_en: 'Cardiology', name_ku: 'نەخۆشی دڵ', category: 'التخصصات الباطنية' },
  { id: 10, key: SPECIALTY_KEYS.GASTROENTEROLOGY, name_ar: 'أمراض الجهاز الهضمي', name_en: 'Gastroenterology', name_ku: 'نەخۆشی هەزمەوەر', category: 'التخصصات الباطنية' },
  { id: 11, key: SPECIALTY_KEYS.HEMATOLOGY, name_ar: 'أمراض الدم', name_en: 'Hematology', name_ku: 'نەخۆشی خوێن', category: 'التخصصات الباطنية' },
  { id: 12, key: SPECIALTY_KEYS.NEPHROLOGY, name_ar: 'الكلى', name_en: 'Nephrology', name_ku: 'کلی', category: 'التخصصات الباطنية' },
  { id: 13, key: SPECIALTY_KEYS.ENDOCRINOLOGY, name_ar: 'الغدد والسكري', name_en: 'Endocrinology & Diabetes', name_ku: 'غدد و شەکر', category: 'التخصصات الباطنية' },
  { id: 14, key: SPECIALTY_KEYS.INFECTIOUS_DISEASES, name_ar: 'الأمراض المعدية', name_en: 'Infectious Diseases', name_ku: 'نەخۆشی تووشبوو', category: 'التخصصات الباطنية' },
  { id: 15, key: SPECIALTY_KEYS.RHEUMATOLOGY, name_ar: 'الروماتيزم', name_en: 'Rheumatology', name_ku: 'روماتیزم', category: 'التخصصات الباطنية' },
  { id: 16, key: SPECIALTY_KEYS.ONCOLOGY, name_ar: 'الأورام', name_en: 'Oncology', name_ku: 'ئۆرام', category: 'التخصصات الباطنية' },
  { id: 17, key: SPECIALTY_KEYS.NEUROLOGY, name_ar: 'الأعصاب', name_en: 'Neurology', name_ku: 'عەصاب', category: 'التخصصات الباطنية' },
  { id: 18, key: SPECIALTY_KEYS.PSYCHIATRY, name_ar: 'الطب النفسي', name_en: 'Psychiatry', name_ku: 'دەروونی', category: 'التخصصات الباطنية' },
  { id: 19, key: SPECIALTY_KEYS.IMMUNOLOGY, name_ar: 'طب المناعة', name_en: 'Immunology', name_ku: 'پزیشکی بەرگری', category: 'التخصصات الباطنية' },
  { id: 20, key: SPECIALTY_KEYS.PULMONOLOGY, name_ar: 'طب الصدر', name_en: 'Pulmonology', name_ku: 'پزیشکی سینگ', category: 'التخصصات الباطنية' },
  { id: 21, key: SPECIALTY_KEYS.UROLOGY, name_ar: 'طب المسالك البولية', name_en: 'Urology', name_ku: 'پزیشکی میزڕۆژ', category: 'التخصصات الباطنية' },
  { id: 22, key: SPECIALTY_KEYS.DERMATOLOGY, name_ar: 'طب الجلد', name_en: 'Dermatology', name_ku: 'پزیشکی پێست', category: 'التخصصات الباطنية' },

  // التخصصات الجراحية
  { id: 23, key: SPECIALTY_KEYS.GENERAL_SURGERY, name_ar: 'الجراحة العامة', name_en: 'General Surgery', name_ku: 'جراحی گشتی', category: 'التخصصات الجراحية' },
  { id: 24, key: SPECIALTY_KEYS.ORTHOPEDIC_SURGERY, name_ar: 'جراحة العظام', name_en: 'Orthopedic Surgery', name_ku: 'جراحی عەظام', category: 'التخصصات الجراحية' },
  { id: 25, key: SPECIALTY_KEYS.NEUROSURGERY, name_ar: 'جراحة الأعصاب', name_en: 'Neurosurgery', name_ku: 'جراحی عەصاب', category: 'التخصصات الجراحية' },
  { id: 26, key: SPECIALTY_KEYS.CARDIOTHORACIC_SURGERY, name_ar: 'جراحة القلب والصدر', name_en: 'Cardiothoracic Surgery', name_ku: 'جراحی دڵ و سەروو سەفەر', category: 'التخصصات الجراحية' },
  { id: 27, key: SPECIALTY_KEYS.PLASTIC_SURGERY, name_ar: 'جراحة التجميل', name_en: 'Plastic Surgery', name_ku: 'جراحی جوانکاری', category: 'التخصصات الجراحية' },
  { id: 28, key: SPECIALTY_KEYS.VASCULAR_SURGERY, name_ar: 'جراحة الأوعية الدموية', name_en: 'Vascular Surgery', name_ku: 'جراحی توێژینەوەی خوێن', category: 'التخصصات الجراحية' },
  { id: 29, key: SPECIALTY_KEYS.UROLOGICAL_SURGERY, name_ar: 'جراحة المسالك البولية', name_en: 'Urology Surgery', name_ku: 'جراحی مەسالك', category: 'التخصصات الجراحية' },
  { id: 30, key: SPECIALTY_KEYS.PEDIATRIC_SURGERY, name_ar: 'جراحة الأطفال', name_en: 'Pediatric Surgery', name_ku: 'جراحی منداڵ', category: 'التخصصات الجراحية' },
  { id: 31, key: SPECIALTY_KEYS.ENT_SURGERY, name_ar: 'جراحة الأنف والأذن والحنجرة', name_en: 'ENT Surgery', name_ku: 'جراحی گوش و لووت و حەنجەرە', category: 'التخصصات الجراحية' },
  { id: 32, key: SPECIALTY_KEYS.MAXILLOFACIAL_SURGERY, name_ar: 'جراحة الوجه والفكين', name_en: 'Maxillofacial Surgery', name_ku: 'جراحی دەندان و ڕوو و چاو', category: 'التخصصات الجراحية' },
  { id: 33, key: SPECIALTY_KEYS.PLASTIC_RECONSTRUCTIVE_SURGERY, name_ar: 'جراحة التجميل والترميم', name_en: 'Plastic & Reconstructive Surgery', name_ku: 'جراحی جوانکاری و دووبارە دروستکردنەوە', category: 'التخصصات الجراحية' },
  { id: 34, key: SPECIALTY_KEYS.LAPAROSCOPIC_SURGERY, name_ar: 'جراحة المناظير', name_en: 'Laparoscopic Surgery', name_ku: 'جراحی مەنزەرە', category: 'التخصصات الجراحية' },

  // تخصصات الرأس والأسنان
  { id: 35, key: SPECIALTY_KEYS.OPHTHALMOLOGY, name_ar: 'العيون', name_en: 'Ophthalmology', name_ku: 'چاو', category: 'تخصصات الرأس والأسنان' },
  { id: 36, key: SPECIALTY_KEYS.ENT, name_ar: 'الأنف والأذن والحنجرة', name_en: 'ENT', name_ku: 'گوش و لووت و حەنجەرە', category: 'تخصصات الرأس والأسنان' },
  { id: 37, key: SPECIALTY_KEYS.DENTISTRY, name_ar: 'الأسنان', name_en: 'Dentistry', name_ku: 'دەندان', category: 'تخصصات الرأس والأسنان' },
  { id: 38, key: SPECIALTY_KEYS.ORAL_MEDICINE_SURGERY, name_ar: 'طب وجراحة الفم', name_en: 'Oral Medicine & Surgery', name_ku: 'پزیشکی و جراحی دەم', category: 'تخصصات الرأس والأسنان' },
  { id: 39, key: SPECIALTY_KEYS.ORTHODONTICS, name_ar: 'تقويم الأسنان', name_en: 'Orthodontics', name_ku: 'ڕاستکردنەوەی دەندان', category: 'تخصصات الرأس والأسنان' },
  { id: 40, key: SPECIALTY_KEYS.COSMETIC_DENTISTRY, name_ar: 'طب الأسنان التجميلي', name_en: 'Cosmetic Dentistry', name_ku: 'پزیشکی دەندان جوانکاری', category: 'تخصصات الرأس والأسنان' },

  // تخصصات الأطفال الدقيقة
  { id: 41, key: SPECIALTY_KEYS.NEONATOLOGY, name_ar: 'حديثي الولادة', name_en: 'Neonatology', name_ku: 'تازە لەدایکبوو', category: 'تخصصات الأطفال الدقيقة' },
  { id: 42, key: SPECIALTY_KEYS.PEDIATRIC_CARDIOLOGY, name_ar: 'قلب الأطفال', name_en: 'Pediatric Cardiology', name_ku: 'دڵی منداڵ', category: 'تخصصات الأطفال الدقيقة' },
  { id: 43, key: SPECIALTY_KEYS.PEDIATRIC_GASTROENTEROLOGY, name_ar: 'الجهاز الهضمي للأطفال', name_en: 'Pediatric Gastroenterology', name_ku: 'هەزمەوەری منداڵ', category: 'تخصصات الأطفال الدقيقة' },
  { id: 44, key: SPECIALTY_KEYS.PEDIATRIC_NEUROLOGY, name_ar: 'أعصاب الأطفال', name_en: 'Pediatric Neurology', name_ku: 'عەصابی منداڵ', category: 'تخصصات الأطفال الدقيقة' },
  { id: 45, key: SPECIALTY_KEYS.PEDIATRIC_HEMATOLOGY, name_ar: 'أمراض الدم للأطفال', name_en: 'Pediatric Hematology', name_ku: 'نەخۆشی خوێنی منداڵ', category: 'تخصصات الأطفال الدقيقة' },
  { id: 46, key: SPECIALTY_KEYS.PEDIATRIC_ENDOCRINOLOGY, name_ar: 'أمراض الغدد للأطفال', name_en: 'Pediatric Endocrinology', name_ku: 'نەخۆشی غددی منداڵ', category: 'تخصصات الأطفال الدقيقة' },
  { id: 47, key: SPECIALTY_KEYS.PEDIATRIC_NEPHROLOGY, name_ar: 'أمراض الكلى للأطفال', name_en: 'Pediatric Nephrology', name_ku: 'نەخۆشی کلی منداڵ', category: 'تخصصات الأطفال الدقيقة' },
  { id: 48, key: SPECIALTY_KEYS.PEDIATRIC_RHEUMATOLOGY, name_ar: 'أمراض الروماتيزم للأطفال', name_en: 'Pediatric Rheumatology', name_ku: 'نەخۆشی روماتیزمی منداڵ', category: 'تخصصات الأطفال الدقيقة' },

  // التخصصات الطبية المساندة
  { id: 49, key: SPECIALTY_KEYS.ANESTHESIOLOGY, name_ar: 'التخدير', name_en: 'Anesthesia', name_ku: 'تخدیر', category: 'التخصصات الطبية المساندة' },
  { id: 50, key: SPECIALTY_KEYS.RADIOLOGY, name_ar: 'الأشعة', name_en: 'Radiology', name_ku: 'ئاشعە', category: 'التخصصات الطبية المساندة' },
  { id: 51, key: SPECIALTY_KEYS.NUCLEAR_MEDICINE, name_ar: 'الطب النووي', name_en: 'Nuclear Medicine', name_ku: 'پزیشکی نوو', category: 'التخصصات الطبية المساندة' },
  { id: 52, key: SPECIALTY_KEYS.MEDICAL_LABORATORY, name_ar: 'التحاليل الطبية', name_en: 'Medical Laboratory', name_ku: 'تاقیکردنەوە', category: 'التخصصات الطبية المساندة' },
  { id: 53, key: SPECIALTY_KEYS.PHYSICAL_MEDICINE_REHABILITATION, name_ar: 'الطب الطبيعي والتأهيلي', name_en: 'Physical Medicine & Rehabilitation', name_ku: 'پزیشکی گەشەپێدەر', category: 'التخصصات الطبية المساندة' },
  { id: 54, key: SPECIALTY_KEYS.SPORTS_MEDICINE, name_ar: 'الطب الرياضي', name_en: 'Sports Medicine', name_ku: 'وەرزشی', category: 'التخصصات الطبية المساندة' },
  { id: 55, key: SPECIALTY_KEYS.FORENSIC_MEDICINE, name_ar: 'الطب الشرعي', name_en: 'Forensic Medicine', name_ku: 'پزیشکی یاسایی', category: 'التخصصات الطبية المساندة' },
  { id: 56, key: SPECIALTY_KEYS.PAIN_MEDICINE, name_ar: 'طب الألم', name_en: 'Pain Medicine', name_ku: 'پزیشکی ئازار', category: 'التخصصات الطبية المساندة' },
  { id: 57, key: SPECIALTY_KEYS.OCCUPATIONAL_MEDICINE, name_ar: 'طب المهنة', name_en: 'Occupational Medicine', name_ku: 'پزیشکی پیشەیی', category: 'التخصصات الطبية المساندة' },
  { id: 58, key: SPECIALTY_KEYS.PUBLIC_HEALTH, name_ar: 'الصحة العامة', name_en: 'Public Health', name_ku: 'تەندروستی گشتی', category: 'التخصصات الطبية المساندة' },
  { id: 59, key: SPECIALTY_KEYS.REHABILITATION_MEDICINE, name_ar: 'طب التأهيل', name_en: 'Rehabilitation Medicine', name_ku: 'پزیشکی ڕێکخستن', category: 'التخصصات الطبية المساندة' },
  { id: 60, key: SPECIALTY_KEYS.PALLIATIVE_CARE, name_ar: 'الرعاية التلطيفية', name_en: 'Palliative Care', name_ku: 'چاودێری ئاسوودە', category: 'التخصصات الطبية المساندة' },
  { id: 61, key: SPECIALTY_KEYS.ADVANCED_EMERGENCY_MEDICINE, name_ar: 'طب الطوارئ المتقدم', name_en: 'Advanced Emergency Medicine', name_ku: 'پزیشکی فوریتی پێشکەوتوو', category: 'التخصصات الطبية المساندة' },
  { id: 62, key: SPECIALTY_KEYS.INTENSIVE_CARE_MEDICINE, name_ar: 'طب العناية المركزة', name_en: 'Intensive Care Medicine', name_ku: 'پزیشکی چاودێری چڕ', category: 'التخصصات الطبية المساندة' },

  // العلوم الطبية المساندة
  { id: 63, key: SPECIALTY_KEYS.NURSING, name_ar: 'التمريض', name_en: 'Nursing', name_ku: 'پرستاری', category: 'العلوم الطبية المساندة' },
  { id: 64, key: SPECIALTY_KEYS.CLINICAL_NUTRITION, name_ar: 'التغذية العلاجية', name_en: 'Clinical Nutrition', name_ku: 'خواردنی پزیشکی', category: 'العلوم الطبية المساندة' },
  { id: 65, key: SPECIALTY_KEYS.PHYSICAL_THERAPY, name_ar: 'العلاج الطبيعي', name_en: 'Physical Therapy', name_ku: 'گەشەپێدانی جەستە', category: 'العلوم الطبية المساندة' },
  { id: 66, key: SPECIALTY_KEYS.PHARMACY, name_ar: 'الصيدلة', name_en: 'Pharmacy', name_ku: 'دەرمانسازی', category: 'العلوم الطبية المساندة' },
  { id: 67, key: SPECIALTY_KEYS.MEDICAL_PSYCHOLOGY, name_ar: 'علم النفس الطبي', name_en: 'Medical Psychology', name_ku: 'دەروونناسی پزیشکی', category: 'العلوم الطبية المساندة' },
  { id: 68, key: SPECIALTY_KEYS.OCCUPATIONAL_THERAPY, name_ar: 'العلاج الوظيفي', name_en: 'Occupational Therapy', name_ku: 'چارەسەری پیشەیی', category: 'العلوم الطبية المساندة' },
  { id: 69, key: SPECIALTY_KEYS.SPEECH_THERAPY, name_ar: 'علاج النطق', name_en: 'Speech Therapy', name_ku: 'چارەسەری قسەکردن', category: 'العلوم الطبية المساندة' },
  { id: 70, key: SPECIALTY_KEYS.RESPIRATORY_THERAPY, name_ar: 'العلاج التنفسي', name_en: 'Respiratory Therapy', name_ku: 'چارەسەری هەناسە', category: 'العلوم الطبية المساندة' },
  { id: 71, key: SPECIALTY_KEYS.MEDICAL_LABORATORY_TECHNOLOGY, name_ar: 'تقنية المختبرات الطبية', name_en: 'Medical Laboratory Technology', name_ku: 'تەکنەلۆجی تاقیکردنەوەی پزیشکی', category: 'العلوم الطبية المساندة' },

  // التخصصات الجديدة والمتطورة
  { id: 72, key: SPECIALTY_KEYS.GENOMIC_MEDICINE, name_ar: 'طب الجينوم', name_en: 'Genomic Medicine', name_ku: 'پزیشکی جینۆم', category: 'التخصصات الجديدة والمتطورة' },
  { id: 73, key: SPECIALTY_KEYS.STEM_CELL_MEDICINE, name_ar: 'طب الخلايا الجذعية', name_en: 'Stem Cell Medicine', name_ku: 'پزیشکی خانەی بنەڕەت', category: 'التخصصات الجديدة والمتطورة' },
  { id: 74, key: SPECIALTY_KEYS.PERSONALIZED_MEDICINE, name_ar: 'الطب الشخصي', name_en: 'Personalized Medicine', name_ku: 'پزیشکی کەسی', category: 'التخصصات الجديدة والمتطورة' },
  { id: 75, key: SPECIALTY_KEYS.NON_SURGICAL_COSMETIC_MEDICINE, name_ar: 'طب التجميل غير الجراحي', name_en: 'Non-Surgical Cosmetic Medicine', name_ku: 'پزیشکی جوانکاری نە جەراحی', category: 'التخصصات الجديدة والمتطورة' },
  { id: 76, key: SPECIALTY_KEYS.OBESITY_MEDICINE, name_ar: 'طب السمنة', name_en: 'Obesity Medicine', name_ku: 'پزیشکی قەڵەوی', category: 'التخصصات الجديدة والمتطورة' },
  { id: 77, key: SPECIALTY_KEYS.SLEEP_MEDICINE, name_ar: 'طب النوم', name_en: 'Sleep Medicine', name_ku: 'پزیشکی خەو', category: 'التخصصات الجديدة والمتطورة' },
  { id: 78, key: SPECIALTY_KEYS.TRAVEL_MEDICINE, name_ar: 'طب السفر', name_en: 'Travel Medicine', name_ku: 'پزیشکی گەشت', category: 'التخصصات الجديدة والمتطورة' },
  { id: 79, key: SPECIALTY_KEYS.SPACE_MEDICINE, name_ar: 'طب الفضاء', name_en: 'Space Medicine', name_ku: 'پزیشکی بۆشایی', category: 'التخصصات الجديدة والمتطورة' },
  { id: 80, key: SPECIALTY_KEYS.DIVING_MEDICINE, name_ar: 'طب الغوص', name_en: 'Diving Medicine', name_ku: 'پزیشکی مەلوان', category: 'التخصصات الجديدة والمتطورة' },
  { id: 81, key: SPECIALTY_KEYS.ADVANCED_SPORTS_MEDICINE, name_ar: 'طب الرياضة المتقدم', name_en: 'Advanced Sports Medicine', name_ku: 'پزیشکی وەرزشی پێشکەوتوو', category: 'التخصصات الجديدة والمتطورة' },
  { id: 82, key: SPECIALTY_KEYS.ADVANCED_GERIATRICS, name_ar: 'طب الشيخوخة المتقدم', name_en: 'Advanced Geriatrics', name_ku: 'پزیشکی پیرانی پێشکەوتوو', category: 'التخصصات الجديدة والمتطورة' },
  { id: 83, key: SPECIALTY_KEYS.NEUROPATHIC_PAIN_MEDICINE, name_ar: 'طب الألم العصبي', name_en: 'Neuropathic Pain Medicine', name_ku: 'پزیشکی ئازاری عەصابی', category: 'التخصصات الجديدة والمتطورة' },
  { id: 84, key: SPECIALTY_KEYS.VASCULAR_MEDICINE, name_ar: 'طب الأوعية الدموية', name_en: 'Vascular Medicine', name_ku: 'پزیشکی خوێنڕاگ', category: 'التخصصات الجديدة والمتطورة' },
  { id: 85, key: SPECIALTY_KEYS.IMMUNOLOGY_ALLERGY_MEDICINE, name_ar: 'طب المناعة والتحسس', name_en: 'Immunology & Allergy Medicine', name_ku: 'پزیشکی بەرگری و هەستیاری', category: 'التخصصات الجديدة والمتطورة' }
];

// دوال مساعدة للبحث في التخصصات
export const findSpecialtyById = (id) => {
  return SPECIALTIES_WITH_IDS.find(specialty => specialty.id === id);
};

export const findSpecialtyByKey = (key) => {
  return SPECIALTIES_WITH_IDS.find(specialty => specialty.key === key);
};

export const findSpecialtyByName = (name, language = 'ar') => {
  const nameField = `name_${language}`;
  return SPECIALTIES_WITH_IDS.find(specialty => specialty[nameField] === name);
};

export const getSpecialtiesByCategory = (category) => {
  return SPECIALTIES_WITH_IDS.filter(specialty => specialty.category === category);
};

export const getAllCategories = () => {
  return [...new Set(SPECIALTIES_WITH_IDS.map(specialty => specialty.category))];
};

export const searchSpecialties = (query, language = 'ar') => {
  const nameField = `name_${language}`;
  const lowerQuery = query.toLowerCase();
  return SPECIALTIES_WITH_IDS.filter(specialty => 
    specialty[nameField].toLowerCase().includes(lowerQuery) ||
    specialty.key.toLowerCase().includes(lowerQuery)
  );
};

// تصدير التخصصات كأسماء فقط للاستخدام في الواجهة
export const getSpecialtyNames = (language = 'ar') => {
  const nameField = `name_${language}`;
  return SPECIALTIES_WITH_IDS.map(specialty => ({
    id: specialty.id,
    key: specialty.key,
    name: specialty[nameField],
    category: specialty.category
  }));
};

export default SPECIALTIES_WITH_IDS;





