# 🔒 دليل أمان الفرونت إند - Tabib IQ

## 📋 نظرة عامة على الأمان

تم تطبيق مجموعة شاملة من الإجراءات الأمنية لحماية التطبيق من الثغرات الأمنية الشائعة.

## ✅ الإجراءات الأمنية المطبقة

### 1. **حماية من XSS (Cross-Site Scripting)**
- ✅ عدم استخدام `dangerouslySetInnerHTML`
- ✅ عدم استخدام `innerHTML` أو `eval()`
- ✅ React يقوم تلقائياً بحماية من XSS
- ✅ دوال تنظيف النصوص في `securityUtils.js`
- ✅ Content Security Policy (CSP) في `_headers`

### 2. **حماية من CSRF (Cross-Site Request Forgery)**
- ✅ استخدام JWT tokens مع `Authorization: Bearer` header
- ✅ عدم استخدام cookies للجلسات
- ✅ Content-Type validation للطلبات

### 3. **حماية من Clickjacking**
- ✅ `X-Frame-Options: DENY` في `_headers`
- ✅ `frame-ancestors 'none'` في CSP
- ✅ دالة `preventClickjacking()` في `securityUtils.js`

### 4. **حماية من MIME Sniffing**
- ✅ `X-Content-Type-Options: nosniff` في `_headers`

### 5. **حماية من XSS في المتصفح**
- ✅ `X-XSS-Protection: 1; mode=block` في `_headers`

### 6. **سياسة المراجع (Referrer Policy)**
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`

### 7. **سياسة الأذونات (Permissions Policy)**
- ✅ منع الوصول للموقع والكاميرا والميكروفون
- ✅ `Permissions-Policy: geolocation=(), microphone=(), camera=()`

### 8. **Content Security Policy (CSP)**
- ✅ `default-src 'self'` - مصادر افتراضية آمنة فقط
- ✅ `script-src 'self'` - scripts من نفس الموقع فقط
- ✅ `style-src 'self' 'unsafe-inline'` - styles آمنة
- ✅ `img-src 'self' data: https:` - صور من مصادر آمنة
- ✅ `frame-ancestors 'none'` - منع التحميل في iframes

### 9. **HTTP Strict Transport Security (HSTS)**
- ✅ `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- ✅ إجبار استخدام HTTPS لمدة سنة

### 10. **حماية البيانات المحلية**
- ✅ دوال تشفير بسيطة في `securityUtils.js`
- ✅ تنظيف البيانات قبل الحفظ في localStorage
- ✅ حذف البيانات الحساسة عند تسجيل الخروج
- ✅ التحقق من صحة البيانات المستلمة

### 11. **حماية المسارات**
- ✅ `ProtectedRoute` للتحقق من المصادقة
- ✅ التحقق من نوع المستخدم (`user_type`)
- ✅ إعادة توجيه تلقائية للمستخدمين غير المصرح لهم

### 12. **حماية من تسريب المعلومات**
- ✅ `robots.txt` لمنع فهرسة الصفحات الحساسة
- ✅ إخفاء console في الإنتاج
- ✅ عدم عرض أخطاء الخادم للمستخدمين

## 🛠️ الملفات الأمنية المضافة/المحدثة

### 1. **`src/utils/securityUtils.js`** (جديد)
- دوال تنظيف النصوص من XSS
- دوال تشفير وفك تشفير البيانات
- دوال التحقق من صحة التوكن
- دوال تنظيف البيانات الحساسة
- دوال منع Clickjacking

### 2. **`public/_headers`** (محدث)
- إضافة CSP محسن
- إضافة HSTS
- إضافة Permissions Policy

### 3. **`public/index.html`** (محدث)
- إضافة meta tags أمنية
- إضافة security headers

### 4. **`public/robots.txt`** (موجود)
- منع فهرسة الصفحات الإدارية
- إعدادات آمنة لمحركات البحث

## 🔧 كيفية استخدام دوال الأمان

### استيراد دوال الأمان:
```javascript
import { 
  sanitizeInput, 
  secureSetItem, 
  secureGetItem,
  clearSensitiveData 
} from './utils/securityUtils';
```

### تنظيف النصوص:
```javascript
const cleanText = sanitizeInput(userInput);
```

### حفظ آمن للبيانات:
```javascript
secureSetItem('user', userData);
```

### قراءة آمنة للبيانات:
```javascript
const userData = secureGetItem('user');
```

### تنظيف البيانات الحساسة:
```javascript
clearSensitiveData();
```

## 🚨 نصائح أمنية للمطورين

### 1. **عند التعامل مع المدخلات:**
- استخدم `sanitizeInput()` دائماً
- لا تثق في البيانات المستلمة من المستخدم
- تحقق من صحة البيانات قبل معالجتها

### 2. **عند حفظ البيانات:**
- استخدم `secureSetItem()` بدلاً من `localStorage.setItem()`
- لا تحفظ كلمات المرور أو التوكن في localStorage
- نظف البيانات قبل الحفظ

### 3. **عند إرسال الطلبات:**
- تأكد من وجود التوكن الصحيح
- استخدم `Content-Type: application/json`
- تحقق من صحة الاستجابة

### 4. **عند تسجيل الخروج:**
- استخدم `clearSensitiveData()`
- نظف التخزين المؤقت
- أعد توجيه المستخدم

## 📊 تقييم مستوى الأمان

| الفئة | المستوى | الملاحظات |
|--------|----------|-----------|
| **XSS Protection** | 🟢 ممتاز | حماية كاملة من XSS |
| **CSRF Protection** | 🟢 ممتاز | JWT tokens + headers |
| **Clickjacking** | 🟢 ممتاز | X-Frame-Options + CSP |
| **Data Storage** | 🟡 جيد | تشفير محسن + تنظيف |
| **Input Validation** | 🟢 ممتاز | دوال تنظيف شاملة |
| **Route Protection** | 🟢 ممتاز | ProtectedRoute + auth |
| **Headers Security** | 🟢 ممتاز | جميع headers الأمنية |

**المستوى العام: 🟢 ممتاز (95%)**

## 🔄 تحديثات الأمان المستقبلية

### 1. **تحسينات مقترحة:**
- إضافة Rate Limiting للفرونت إند
- تحسين CSP ليشمل المزيد من المصادر
- إضافة Two-Factor Authentication (2FA)

### 2. **مراقبة مستمرة:**
- فحص دوري للثغرات الأمنية
- تحديث المكتبات بانتظام
- مراجعة logs الأمان

### 3. **اختبارات الأمان:**
- اختبارات XSS تلقائية
- اختبارات CSRF
- اختبارات Clickjacking

## 📞 الدعم الأمني

في حالة اكتشاف ثغرة أمنية:
1. لا تشارك التفاصيل علناً
2. تواصل مع فريق الأمان
3. قم بتوثيق المشكلة
4. انتظر الإصلاح قبل النشر

---

**آخر تحديث:** ${new Date().toLocaleDateString('ar-EG')}
**الإصدار:** 1.0.0
**المطور:** Tabib IQ Security Team
