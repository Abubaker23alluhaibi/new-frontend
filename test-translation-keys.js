// ملف اختبار مفاتيح الترجمة
const ar = require('./frontend-iq/src/locales/ar/translation.json');
const en = require('./frontend-iq/src/locales/en/translation.json');
const ku = require('./frontend-iq/src/locales/ku/translation.json');

console.log('🔍 فحص مفاتيح الترجمة...\n');

// مفاتيح الترجمة المطلوبة لصفحة التحليل
const requiredKeys = [
  'analytics_full_title',
  'time_period_filter',
  'all_time',
  'weekly',
  'monthly',
  'yearly',
  'total_appointments',
  'total_patients',
  'average_appointments_per_day',
  'most_busy_day',
  'present_count',
  'absent_count',
  'attendance_analysis',
  'present',
  'absent',
  'attendance_percentage',
  'appointments_by_hour',
  'hour',
  'appointments_count',
  'status',
  'most_requested',
  'show_more',
  'show_less',
  'more',
  'appointments_by_weekday',
  'most_busy',
  'appointments_by_month',
  'weekly_analysis',
  'monthly_analysis',
  'yearly_analysis',
  'all_time_analysis',
  'loading',
  'back',
  'logout',
  'error_fetching_appointments'
];

console.log('📋 المفاتيح المطلوبة:');
requiredKeys.forEach(key => {
  const arValue = ar[key];
  const enValue = en[key];
  const kuValue = ku[key];
  
  console.log(`\n🔑 ${key}:`);
  console.log(`   العربية: ${arValue || '❌ مفقود'}`);
  console.log(`   English: ${enValue || '❌ مفقود'}`);
  console.log(`   کوردی: ${kuValue || '❌ مفقود'}`);
});

// فحص المفاتيح المفقودة
const missingKeys = {
  ar: [],
  en: [],
  ku: []
};

requiredKeys.forEach(key => {
  if (!ar[key]) missingKeys.ar.push(key);
  if (!en[key]) missingKeys.en.push(key);
  if (!ku[key]) missingKeys.ku.push(key);
});

console.log('\n❌ المفاتيح المفقودة:');
console.log(`العربية: ${missingKeys.ar.length > 0 ? missingKeys.ar.join(', ') : '✅ جميع المفاتيح موجودة'}`);
console.log(`English: ${missingKeys.en.length > 0 ? missingKeys.en.join(', ') : '✅ جميع المفاتيح موجودة'}`);
console.log(`کوردی: ${missingKeys.ku.length > 0 ? missingKeys.ku.join(', ') : '✅ جميع المفاتيح موجودة'}`);

console.log('\n✅ انتهى فحص الترجمة!');
