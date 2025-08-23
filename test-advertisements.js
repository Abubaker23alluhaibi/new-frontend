// ملف اختبار API الإعلانات
// يمكن تشغيله في وحدة تحكم المتصفح

const API_BASE = 'https://web-production-78766.up.railway.app';

// اختبار جلب إعلانات الأطباء
async function testDoctorsAds() {
  console.log('🧪 اختبار جلب إعلانات الأطباء...');
  try {
    const response = await fetch(`${API_BASE}/advertisements/doctors`);
    console.log('📡 استجابة إعلانات الأطباء:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ إعلانات الأطباء:', data);
      console.log('📊 عدد الإعلانات:', Array.isArray(data) ? data.length : 'غير مصفوفة');
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ خطأ في إعلانات الأطباء:', errorData);
    }
  } catch (err) {
    console.error('❌ خطأ في الاتصال بإعلانات الأطباء:', err);
  }
}

// اختبار جلب إعلانات المستخدمين
async function testUsersAds() {
  console.log('🧪 اختبار جلب إعلانات المستخدمين...');
  try {
    const response = await fetch(`${API_BASE}/advertisements/users`);
    console.log('📡 استجابة إعلانات المستخدمين:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ إعلانات المستخدمين:', data);
      console.log('📊 عدد الإعلانات:', Array.isArray(data) ? data.length : 'غير مصفوفة');
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ خطأ في إعلانات المستخدمين:', errorData);
    }
  } catch (err) {
    console.error('❌ خطأ في الاتصال بإعلانات المستخدمين:', err);
  }
}

// اختبار جلب إعلانات للجميع
async function testBothAds() {
  console.log('🧪 اختبار جلب إعلانات للجميع...');
  try {
    const response = await fetch(`${API_BASE}/advertisements/both`);
    console.log('📡 استجابة إعلانات للجميع:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ إعلانات للجميع:', data);
      console.log('📊 عدد الإعلانات:', Array.isArray(data) ? data.length : 'غير مصفوفة');
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ خطأ في إعلانات للجميع:', errorData);
    }
  } catch (err) {
    console.error('❌ خطأ في الاتصال بإعلانات للجميع:', err);
  }
}

// اختبار شامل
async function testAllAdEndpoints() {
  console.log('🚀 بدء اختبار شامل لجميع نقاط نهاية الإعلانات...');
  console.log('🔗 API Base URL:', API_BASE);
  console.log('⏰ الوقت:', new Date().toLocaleString('ar-IQ'));
  
  await testDoctorsAds();
  console.log('---');
  await testUsersAds();
  console.log('---');
  await testBothAds();
  
  console.log('🏁 انتهى الاختبار الشامل');
}

// تشغيل الاختبار
console.log('📋 لاختبار API الإعلانات، اكتب: testAllAdEndpoints()');
console.log('🔍 أو اكتب: testDoctorsAds() أو testUsersAds() أو testBothAds()');

