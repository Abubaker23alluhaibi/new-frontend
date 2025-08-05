# 🚀 دليل النشر - Tabib IQ Frontend

## ✅ فحص ما قبل النشر

### الأمان
- [x] إزالة جميع `console.log` من الكود
- [x] حذف مجلد `build/` القديم
- [x] إعدادات منع الكاش مفعلة
- [x] ملفات البيئة محمية

### الأداء
- [x] تحسين إعدادات i18n
- [x] إزالة ملفات التطوير الزائدة
- [x] تحسين Service Worker

## 🛠️ خطوات النشر

### 1. تنظيف المشروع
```bash
# تشغيل سكريبت التنظيف
chmod +x clean-production.sh
./clean-production.sh
```

### 2. بناء المشروع
```bash
npm run build
```

### 3. فحص الملفات
```bash
# فحص حجم الملفات
du -sh build/*
```

### 4. النشر
```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod --dir=build
```

## 📋 قائمة التحقق

### قبل النشر
- [ ] تشغيل `npm test` (إذا كان متوفراً)
- [ ] فحص التطبيق محلياً
- [ ] التأكد من عمل جميع الوظائف
- [ ] فحص الصور والملفات الثابتة

### بعد النشر
- [ ] فحص الموقع المباشر
- [ ] اختبار تسجيل الدخول
- [ ] اختبار حجز المواعيد
- [ ] فحص الأداء

## 🔧 إعدادات الإنتاج

### متغيرات البيئة
```env
REACT_APP_API_URL=https://web-production-78766.up.railway.app
REACT_APP_ENV=production
NODE_ENV=production
GENERATE_SOURCEMAP=false
```

### إعدادات الأمان
- منع عرض Source Maps
- إزالة console.log
- تفعيل HTTPS
- إعدادات CORS صحيحة

## 📞 الدعم

في حالة وجود مشاكل:
1. راجع ملفات السجلات
2. تحقق من متغيرات البيئة
3. تأكد من صحة API URL 