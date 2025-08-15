// ملف اختبار ميزة أيام الإجازات
// يمكن تشغيله في وحدة تحكم المتصفح لاختبار الوظائف

console.log('🧪 بدء اختبار ميزة أيام الإجازات...');

// اختبار إنشاء كائن إجازة
function testVacationCreation() {
  console.log('📝 اختبار إنشاء كائن إجازة...');
  
  const vacation = {
    type: 'single', // 'single', 'monthly', 'yearly'
    date: '2025-01-15',
    month: '',
    year: 2025,
    description: 'إجازة سنوية'
  };
  
  console.log('✅ تم إنشاء كائن الإجازة:', vacation);
  return vacation;
}

// اختبار التحقق من صحة البيانات
function testValidation(vacation) {
  console.log('🔍 اختبار التحقق من صحة البيانات...');
  
  const errors = [];
  
  if (!vacation.type) {
    errors.push('نوع الإجازة مطلوب');
  }
  
  if (vacation.type === 'single' && !vacation.date) {
    errors.push('التاريخ مطلوب للإجازة اليومية');
  }
  
  if (vacation.type === 'monthly' && !vacation.month) {
    errors.push('الشهر مطلوب للإجازة الشهرية');
  }
  
  if (!vacation.year) {
    errors.push('السنة مطلوبة');
  }
  
  if (errors.length === 0) {
    console.log('✅ جميع البيانات صحيحة');
  } else {
    console.log('❌ أخطاء في البيانات:', errors);
  }
  
  return errors.length === 0;
}

// اختبار حساب أيام الإجازات
function testVacationDaysCalculation(vacation) {
  console.log('📅 اختبار حساب أيام الإجازات...');
  
  let days = 0;
  
  switch (vacation.type) {
    case 'single':
      days = 1;
      break;
    case 'monthly':
      days = new Date(vacation.year, vacation.month, 0).getDate();
      break;
    case 'yearly':
      days = 365; // تقريبي
      break;
    default:
      days = 0;
  }
  
  console.log(`✅ عدد أيام الإجازة: ${days} يوم`);
  return days;
}

// اختبار إنشاء عدة إجازات
function testMultipleVacations() {
  console.log('🏖️ اختبار إنشاء عدة إجازات...');
  
  const vacations = [
    {
      type: 'single',
      date: '2025-01-15',
      year: 2025,
      description: 'إجازة سنوية'
    },
    {
      type: 'monthly',
      month: '7',
      year: 2025,
      description: 'إجازة شهرية'
    },
    {
      type: 'yearly',
      year: 2026,
      description: 'إجازة سنة كاملة'
    }
  ];
  
  console.log('✅ تم إنشاء عدة إجازات:', vacations);
  return vacations;
}

// اختبار حفظ البيانات في localStorage
function testLocalStorage(vacations) {
  console.log('💾 اختبار حفظ البيانات في localStorage...');
  
  try {
    localStorage.setItem('testVacations', JSON.stringify(vacations));
    const saved = JSON.parse(localStorage.getItem('testVacations'));
    
    if (JSON.stringify(saved) === JSON.stringify(vacations)) {
      console.log('✅ تم حفظ البيانات بنجاح في localStorage');
      return true;
    } else {
      console.log('❌ فشل في حفظ البيانات');
      return false;
    }
  } catch (error) {
    console.log('❌ خطأ في حفظ البيانات:', error);
    return false;
  }
}

// اختبار حساب إجمالي أيام الإجازات
function testTotalVacationDays(vacations) {
  console.log('📊 اختبار حساب إجمالي أيام الإجازات...');
  
  let totalDays = 0;
  
  vacations.forEach(vacation => {
    switch (vacation.type) {
      case 'single':
        totalDays += 1;
        break;
      case 'monthly':
        totalDays += new Date(vacation.year, vacation.month, 0).getDate();
        break;
      case 'yearly':
        totalDays += 365;
        break;
    }
  });
  
  console.log(`✅ إجمالي أيام الإجازات: ${totalDays} يوم`);
  return totalDays;
}

// تشغيل جميع الاختبارات
function runAllTests() {
  console.log('🚀 بدء تشغيل جميع الاختبارات...\n');
  
  // اختبار 1: إنشاء إجازة
  const vacation = testVacationCreation();
  console.log('');
  
  // اختبار 2: التحقق من صحة البيانات
  const isValid = testValidation(vacation);
  console.log('');
  
  // اختبار 3: حساب أيام الإجازة
  const days = testVacationDaysCalculation(vacation);
  console.log('');
  
  // اختبار 4: إنشاء عدة إجازات
  const vacations = testMultipleVacations();
  console.log('');
  
  // اختبار 5: حفظ البيانات
  const saved = testLocalStorage(vacations);
  console.log('');
  
  // اختبار 6: حساب إجمالي الأيام
  const totalDays = testTotalVacationDays(vacations);
  console.log('');
  
  // ملخص النتائج
  console.log('📋 ملخص نتائج الاختبارات:');
  console.log(`✅ إنشاء الإجازات: ${vacation ? 'نجح' : 'فشل'}`);
  console.log(`✅ التحقق من صحة البيانات: ${isValid ? 'نجح' : 'فشل'}`);
  console.log(`✅ حساب أيام الإجازة: ${days > 0 ? 'نجح' : 'فشل'}`);
  console.log(`✅ إنشاء عدة إجازات: ${vacations.length > 0 ? 'نجح' : 'فشل'}`);
  console.log(`✅ حفظ البيانات: ${saved ? 'نجح' : 'فشل'}`);
  console.log(`✅ حساب إجمالي الأيام: ${totalDays > 0 ? 'نجح' : 'فشل'}`);
  
  console.log('\n🎉 انتهت جميع الاختبارات!');
}

// تشغيل الاختبارات عند تحميل الملف
if (typeof window !== 'undefined') {
  // في المتصفح
  window.testVacationFeature = runAllTests;
  console.log('💡 لاختبار الميزة، اكتب: testVacationFeature()');
} else {
  // في Node.js
  runAllTests();
}

