# 🏥 TabibiQ Frontend - منصة طبيب العراق

## 📋 الوصف | Description
منصة طبية شاملة لحجز المواعيد مع أفضل الأطباء في العراق. تطبيق React حديث مع واجهة مستخدم متجاوبة.

## 🚀 النشر | Deployment

### Vercel (المستحسن)
```bash
# رفع التحديثات
git add .
git commit -m "Update deployment configuration"
git push origin main
```

### إعدادات Vercel المطلوبة:
1. **Framework Preset**: Create React App
2. **Build Command**: `npm run build`
3. **Output Directory**: `build`
4. **Root Directory**: `frontend-iq`

### Environment Variables في Vercel:
```
REACT_APP_API_URL=https://web-production-78766.up.railway.app
REACT_APP_ENV=production
REACT_APP_VERSION=1.0.0
REACT_APP_NAME=TabibiQ
REACT_APP_DESCRIPTION=منصة طبية ذكية للعراق
GENERATE_SOURCEMAP=false
```

## 🛠️ التطوير المحلي | Local Development

### تثبيت التبعيات
```bash
cd frontend-iq
npm install
```

### تشغيل التطبيق
```bash
npm start
```

### بناء التطبيق
```bash
npm run build
```

## 📁 هيكل المشروع | Project Structure

```
frontend-iq/
├── public/
│   ├── index.html
│   ├── manifest.json
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── _redirects
│   └── _headers
├── src/
│   ├── components/
│   ├── pages/
│   ├── utils/
│   └── locales/
├── package.json
├── vercel.json
└── netlify.toml
```

## 🔧 الملفات المهمة | Important Files

### `vercel.json`
- إعدادات التوجيه للأحادية الصفحة (SPA)
- إعدادات الأمان

### `public/_redirects`
- توجيه جميع الطلبات إلى `index.html`

### `public/_headers`
- إعدادات الأمان والكاش

## 🌐 الروابط | Links

- **Frontend**: https://tabibiq.vercel.app
- **Backend**: https://web-production-78766.up.railway.app
- **WhatsApp**: https://wa.me/9647769012619

## 🐛 استكشاف الأخطاء | Troubleshooting

### مشاكل النشر على Vercel:
1. تأكد من إعداد Environment Variables
2. تحقق من Root Directory (`frontend-iq`)
3. تأكد من أن Backend يعمل على Railway

### مشاكل التوجيه:
1. تحقق من `vercel.json` rewrites
2. تأكد من وجود `public/_redirects`

## 📱 الميزات | Features

- ✅ واجهة مستخدم متجاوبة
- ✅ دعم متعدد اللغات (عربي، إنجليزي، كردي)
- ✅ نظام تسجيل دخول آمن
- ✅ حجز مواعيد طبية
- ✅ إدارة الملف الشخصي
- ✅ تذكير بالأدوية
- ✅ لوحة تحكم للأطباء
- ✅ لوحة تحكم للمراكز الطبية

## 🛡️ الأمان | Security

- HTTPS إجباري
- حماية من XSS
- حماية من Clickjacking
- إعدادات CORS آمنة

## 📊 SEO

- Schema.org structured data
- Sitemap.xml
- Robots.txt
- Meta tags محسنة
- Open Graph tags

---
**TabibiQ Team** 🏥 | **2024** 