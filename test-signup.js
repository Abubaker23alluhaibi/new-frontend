// ملف اختبار إنشاء الحساب
// يمكن تشغيله في المتصفح أو Node.js

const API_URL = 'https://web-production-78766.up.railway.app';

// اختبار إنشاء حساب مستخدم
async function testUserSignUp() {
  try {
    console.log('🧪 اختبار إنشاء حساب مستخدم...');
    
    const userData = {
      fullName: 'أحمد محمد',
      email: 'test.user@example.com',
      phone: '07501234567',
      password: '123456',
      user_type: 'user'
    };

    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    console.log('✅ استجابة إنشاء حساب المستخدم:', {
      status: response.status,
      data
    });

    return { success: response.ok, data };
  } catch (error) {
    console.error('❌ خطأ في إنشاء حساب المستخدم:', error);
    return { success: false, error: error.message };
  }
}

// اختبار إنشاء حساب طبيب
async function testDoctorSignUp() {
  try {
    console.log('🧪 اختبار إنشاء حساب طبيب...');
    
    const doctorData = {
      fullName: 'د. فاطمة علي',
      email: 'test.doctor@example.com',
      phone: '07501234568',
      password: '123456',
      specialty: 'الطب العام',
      experience: '5',
      appointmentDuration: 30,
      province: 'بغداد',
      area: 'الكرادة',
      user_type: 'doctor'
    };

    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(doctorData)
    });

    const data = await response.json();
    console.log('✅ استجابة إنشاء حساب الطبيب:', {
      status: response.status,
      data
    });

    return { success: response.ok, data };
  } catch (error) {
    console.error('❌ خطأ في إنشاء حساب الطبيب:', error);
    return { success: false, error: error.message };
  }
}

// اختبار تسجيل الدخول
async function testLogin(email, password, loginType) {
  try {
    console.log(`🧪 اختبار تسجيل الدخول كـ ${loginType}...`);
    
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password,
        loginType: loginType
      })
    });

    const data = await response.json();
    console.log(`✅ استجابة تسجيل الدخول كـ ${loginType}:`, {
      status: response.status,
      data
    });

    return { success: response.ok, data };
  } catch (error) {
    console.error(`❌ خطأ في تسجيل الدخول كـ ${loginType}:`, error);
    return { success: false, error: error.message };
  }
}

// تشغيل جميع الاختبارات
async function runAllTests() {
  console.log('🚀 بدء تشغيل اختبارات إنشاء الحساب...\n');

  // اختبار إنشاء حساب مستخدم
  const userResult = await testUserSignUp();
  console.log('\n');

  // اختبار إنشاء حساب طبيب
  const doctorResult = await testDoctorSignUp();
  console.log('\n');

  // اختبار تسجيل الدخول للمستخدم
  if (userResult.success) {
    await testLogin('test.user@example.com', '123456', 'user');
    console.log('\n');
  }

  // اختبار تسجيل الدخول للطبيب
  if (doctorResult.success) {
    await testLogin('test.doctor@example.com', '123456', 'doctor');
    console.log('\n');
  }

  console.log('🏁 انتهت جميع الاختبارات');
}

// تشغيل الاختبارات إذا كان الملف يعمل في المتصفح
if (typeof window !== 'undefined') {
  window.testSignUp = {
    testUserSignUp,
    testDoctorSignUp,
    testLogin,
    runAllTests
  };
  console.log('🧪 تم تحميل اختبارات إنشاء الحساب. استخدم window.testSignUp.runAllTests() لتشغيلها');
}

// تشغيل الاختبارات إذا كان الملف يعمل في Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testUserSignUp,
    testDoctorSignUp,
    testLogin,
    runAllTests
  };
}


