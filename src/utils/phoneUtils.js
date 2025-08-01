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
  // إضافة 964 في البداية
  return `964${cleaned}`;
}

// دالة تنسيق رقم الهاتف للعرض
export function formatPhoneForDisplay(phone) {
  if (!phone) return phone;
  const normalized = normalizePhone(phone);
  return `+${normalized}`;
}

// دالة التحقق من صحة رقم الهاتف العراقي
export function isValidIraqiPhone(phone) {
  if (!phone) return false;
  const normalized = normalizePhone(phone);
  // رقم الهاتف العراقي يجب أن يكون 12 رقم (964 + 9 أرقام)
  return /^964\d{9}$/.test(normalized);
} 