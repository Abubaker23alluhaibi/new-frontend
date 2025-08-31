// نظام صلاحيات الدكتور
// يحدد ما يمكن للسكرتيرة رؤيته وما يمكن للدكتور فقط

export const DOCTOR_PERMISSIONS = {
  // صلاحيات السكرتيرة (يمكن مشاركتها)
  SECRETARY: {
    VIEW_APPOINTMENTS: true,           // عرض المواعيد
    MANAGE_APPOINTMENTS: true,         // إدارة المواعيد (إلغاء، تأجيل)
    VIEW_PATIENT_INFO: true,           // عرض معلومات المرضى
    MANAGE_WORK_TIMES: true,           // إدارة أوقات العمل
    VIEW_NOTIFICATIONS: true,          // عرض الإشعارات
    MANAGE_BASIC_PROFILE: true,        // إدارة المعلومات الأساسية
    VIEW_ANALYTICS: true,              // عرض الإحصائيات الأساسية
    MANAGE_ADVERTISEMENTS: true,       // إدارة الإعلانات
  },
  
  // صلاحيات الدكتور فقط (لا يمكن مشاركتها)
  DOCTOR_ONLY: {
    MANAGE_SPECIAL_APPOINTMENTS: true, // إدارة المواعيد الخاصة
    VIEW_FINANCIAL_DATA: true,         // عرض البيانات المالية
    MANAGE_ADVANCED_SETTINGS: true,    // إدارة الإعدادات المتقدمة
    VIEW_PATIENT_HISTORY: true,        // عرض تاريخ المرضى الكامل
    MANAGE_MEDICAL_NOTES: true,        // إدارة الملاحظات الطبية
    VIEW_ADMIN_PANEL: true,            // الوصول للوحة الإدارة
    MANAGE_ACCOUNT_SECURITY: true,     // إدارة أمان الحساب
    EXPORT_PATIENT_DATA: true,         // تصدير بيانات المرضى
  }
};

// دالة للتحقق من الصلاحيات
export const checkDoctorPermission = (permission, userType, isOwner = false) => {
  // إذا كان المستخدم هو الدكتور نفسه، له جميع الصلاحيات
  if (isOwner) return true;
  
  // إذا كان المستخدم سكرتيرة، له صلاحيات السكرتيرة فقط
  if (userType === 'secretary') {
    return DOCTOR_PERMISSIONS.SECRETARY[permission] || false;
  }
  
  // إذا كان المستخدم ليس دكتور أو سكرتيرة، لا صلاحيات
  if (userType !== 'doctor') return false;
  
  // الدكتور له جميع الصلاحيات
  return true;
};

// دالة لتحديد نوع المستخدم تجاه حساب الدكتور
export const getUserAccessLevel = (currentUser, doctorId) => {
  if (!currentUser || !doctorId) return 'none';
  
  // إذا كان المستخدم هو الدكتور نفسه
  if (currentUser._id === doctorId && currentUser.user_type === 'doctor') {
    return 'owner';
  }
  
  // إذا كان المستخدم سكرتيرة لهذا الدكتور
  if (currentUser.user_type === 'secretary' && currentUser.doctorId === doctorId) {
    return 'secretary';
  }
  
  // إذا كان المستخدم دكتور آخر
  if (currentUser.user_type === 'doctor') {
    return 'other_doctor';
  }
  
  // مستخدم عادي
  return 'regular_user';
};

// دالة لإخفاء العناصر الحساسة
export const shouldHideSensitiveElement = (elementType, accessLevel) => {
  const sensitiveElements = {
    'financial_data': ['secretary', 'other_doctor', 'regular_user'],
    'medical_notes': ['secretary', 'other_doctor', 'regular_user'],
    'admin_panel': ['secretary', 'other_doctor', 'regular_user'],
    'account_security': ['secretary', 'other_doctor', 'regular_user'],
    'patient_history': ['other_doctor', 'regular_user'],
    'special_appointments': ['other_doctor', 'regular_user'],
    'export_data': ['secretary', 'other_doctor', 'regular_user']
  };
  
  return sensitiveElements[elementType]?.includes(accessLevel) || false;
};

// دالة لتحديد الأيقونات والأزرار المرئية
export const getVisibleElements = (accessLevel) => {
  const baseElements = [
    'appointments',
    'work_times',
    'notifications',
    'basic_profile',
    'analytics',
    'advertisements'
  ];
  
  if (accessLevel === 'owner') {
    return [...baseElements, 'all_features'];
  } else if (accessLevel === 'secretary') {
    return baseElements;
  } else {
    return ['view_only'];
  }
};
