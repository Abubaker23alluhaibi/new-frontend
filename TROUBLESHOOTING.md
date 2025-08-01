# دليل حل المشاكل - Tabib IQ

## المشاكل الشائعة وحلولها

### 1. مشكلة الصفحة البيضاء عند الوصول المباشر للروابط

**المشكلة:** عند محاولة الوصول مباشرة لرابط مثل `/doctor/123` تظهر صفحة بيضاء.

**الحل:**
- تأكد من وجود ملف `_redirects` في مجلد `public` مع المحتوى التالي:
  ```
  /*    /index.html   200
  ```
- تأكد من وجود ملف `vercel.json` (إذا كنت تستخدم Vercel) مع المحتوى التالي:
  ```json
  {
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```

### 2. مشكلة عدم حفظ الرابط عند تسجيل الدخول

**المشكلة:** عند محاولة الوصول لصفحة محمية، يتم إعادة التوجيه لصفحة تسجيل الدخول ولكن لا يتم العودة للصفحة المطلوبة بعد تسجيل الدخول.

**الحل:**
- تأكد من أن `ProtectedRoute` يحفظ الرابط في `redirect` parameter
- تأكد من أن صفحة `Login` تتعامل مع `redirect` parameter بشكل صحيح

### 3. مشكلة التحميل البطيء

**المشكلة:** التطبيق يأخذ وقت طويل للتحميل.

**الحل:**
- تأكد من أن `loading` state في `AuthContext` يعمل بشكل صحيح
- تحقق من console logs للتأكد من عدم وجود أخطاء
- تأكد من أن API URL صحيح في ملفات البيئة

### 4. مشكلة عدم عمل التوجيه في Production

**المشكلة:** التوجيه يعمل في Development ولكن لا يعمل في Production.

**الحل:**
- تأكد من إعدادات النشر في `netlify.toml` أو `vercel.json`
- تأكد من أن جميع الملفات المطلوبة موجودة في مجلد `public`
- تحقق من console logs في Production

## خطوات التشخيص

### 1. فتح Developer Tools
- اضغط `F12` لفتح Developer Tools
- انتقل إلى تبويب `Console`
- ابحث عن أي أخطاء أو رسائل تحذير

### 2. فحص Network Tab
- انتقل إلى تبويب `Network`
- تأكد من أن جميع الطلبات تنتهي بنجاح
- تحقق من أن API calls تعمل بشكل صحيح

### 3. فحص Application Tab
- انتقل إلى تبويب `Application`
- تحقق من `Local Storage` و `Session Storage`
- تأكد من وجود بيانات المستخدم

## رسائل Console المهمة

### رسائل النجاح:
- `🚀 App: تم تحميل التطبيق بنجاح`
- `✅ AuthContext: تم استرجاع بيانات المستخدم`
- `✅ ProtectedRoute: تم الوصول للصفحة بنجاح`

### رسائل التحذير:
- `⏳ ProtectedRoute: جاري التحقق من حالة المستخدم...`
- `🔄 Login: إعادة التوجيه بعد تسجيل الدخول`

### رسائل الخطأ:
- `❌ AuthContext: خطأ في تحليل بيانات المستخدم`
- `❌ ProtectedRoute: لا يوجد مستخدم - إعادة توجيه للصفحة الرئيسية`

## إعدادات البيئة المطلوبة

### ملف `.env.development`:
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

### ملف `.env.production`:
```
REACT_APP_API_URL=https://your-backend-url.com
REACT_APP_ENV=production
```

## الاتصال بالدعم

إذا لم تحل المشكلة بعد تطبيق هذه الحلول، يرجى:
1. التقاط screenshot للخطأ
2. نسخ رسائل Console
3. وصف الخطوات التي أدت للمشكلة
4. إرسال المعلومات للفريق التقني 