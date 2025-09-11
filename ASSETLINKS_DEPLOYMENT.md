# إعداد Android App Links - ملف assetlinks.json

## المشكلة
تم رفض التطبيق من Google Play Store بسبب مشكلة في ربط التطبيق بالموقع الإلكتروني.

## الحل المطبق

### 1. تم تحديث ملف assetlinks.json
الملف موجود في: `frontend-iq/public/.well-known/assetlinks.json`

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.tabibiq.mobile",
      "sha256_cert_fingerprints": [
        "FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C"
      ]
    }
  }
]
```

### 2. تم تحديث إعدادات Vercel
تم تحديث `vercel.json` لضمان:
- عدم إعادة توجيه ملفات `.well-known`
- إضافة Content-Type الصحيح لملف assetlinks.json
- إعداد Cache-Control مناسب

### 3. خطوات النشر

#### للفرونت إند (Vercel):
```bash
cd frontend-iq
npm run build
# رفع التغييرات إلى Git
git add .
git commit -m "Fix Android App Links - Update assetlinks.json"
git push
```

#### التحقق من النشر:
بعد النشر، تأكد من أن الملف متاح على:
`https://www.tabib-iq.com/.well-known/assetlinks.json`

### 4. اختبار الربط

#### باستخدام Android Studio:
1. افتح Android Studio
2. استخدم "App Link Assistant"
3. أدخل الرابط: `https://www.tabib-iq.com/doctor`

#### باستخدام ADB:
```bash
adb shell pm verify-app-links --re-verify com.tabibiq.mobile
```

### 5. ملاحظات مهمة

- تأكد من أن `sha256_cert_fingerprints` صحيح ومطابق لشهادة التطبيق
- الملف يجب أن يكون متاحاً بدون عمليات إعادة توجيه
- Content-Type يجب أن يكون `application/json`
- يجب أن يكون الملف متاحاً عبر HTTPS

### 6. التحقق من صحة SHA256 Fingerprint

للتأكد من صحة SHA256 fingerprint:
```bash
keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
```

## النتيجة المتوقعة
بعد تطبيق هذه التغييرات ونشرها، يجب أن يتم قبول التطبيق في Google Play Store.
