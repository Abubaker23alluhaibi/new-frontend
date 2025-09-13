// دالة توحيد رقم الهاتف العراقي
export function normalizePhone(phone) {
  if (!phone) return phone;
  // إزالة جميع الأحرف غير الرقمية
  let cleaned = phone.replace(/\D/g, '');
  
  // إذا بدأ بـ 964، احذفها
  if (cleaned.startsWith('964')) {
    cleaned = cleaned.substring(3);
  }
  
  // إذا بدأ بـ 0، احذفها
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // إرجاع الرقم كما هو بدون إضافة مفتاح العراق
  // يمكن للمستخدم إدخال 07 أو 7 أو 964
  return cleaned;
}

// دالة تنسيق رقم الهاتف للعرض
export function formatPhoneForDisplay(phone) {
  if (!phone) return phone;
  const normalized = normalizePhone(phone);
  // إضافة 0 في البداية للعرض
  return `0${normalized}`;
}

// دالة التحقق من صحة رقم الهاتف العراقي
export function isValidIraqiPhone(phone) {
  if (!phone) return false;
  const normalized = normalizePhone(phone);
  // رقم الهاتف العراقي يجب أن يكون 9 أرقام (بدون مفتاح العراق)
  // يقبل الأرقام التي تبدأ بـ 7 (مثل 07 أو 7)
  return /^7\d{8}$/.test(normalized);
} 