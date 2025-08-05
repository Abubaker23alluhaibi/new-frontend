#!/bin/bash

echo "🧹 بدء تنظيف المشروع للإنتاج..."

# حذف مجلد build إذا كان موجوداً
if [ -d "build" ]; then
    echo "🗑️ حذف مجلد build..."
    rm -rf build
fi

# حذف node_modules وإعادة تثبيت
echo "📦 إعادة تثبيت التبعيات..."
rm -rf node_modules package-lock.json
npm install

# تنظيف الكاش
echo "🧹 تنظيف الكاش..."
npm cache clean --force

# بناء المشروع للإنتاج
echo "🏗️ بناء المشروع للإنتاج..."
npm run build

# فحص حجم الملفات
echo "📊 حجم الملفات النهائية:"
du -sh build/*

echo "✅ تم تنظيف المشروع بنجاح!"
echo "🚀 جاهز للنشر!" 