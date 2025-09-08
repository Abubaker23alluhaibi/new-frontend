import { useTranslation } from 'react-i18next';

/**
 * Utility functions for proper date formatting with timezone handling
 * Fixes the issue where toLocaleDateString shows incorrect dates
 */

/**
 * Formats a date string to display in the correct timezone
 * @param {string|Date} dateString - The date to format
 * @param {string} format - The format type ('date', 'datetime', 'time')
 * @param {string} language - The language for formatting (defaults to current i18n language)
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, format = 'date', language = null) {
  if (!dateString) {
    return 'تاريخ غير صحيح';
  }

  let date;
  try {
    if (typeof dateString === 'string' && dateString.includes('-')) {
      // Handle YYYY-MM-DD format by creating local date
      const [year, month, day] = dateString.split('-').map(Number);
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return 'تاريخ غير صحيح';
      }
      date = new Date(year, month - 1, day); // month - 1 because getMonth() starts from 0
    } else {
      date = new Date(dateString);
    }
    
    // Validate the created date
    if (isNaN(date.getTime())) {
      return 'تاريخ غير صحيح';
    }
    
    // Get current language
    const currentLang = language || (typeof window !== 'undefined' && window.i18n?.language) || 'ar';
    
    // Get localized month and day names
    const { weekdays, months } = getLocalizedNames(currentLang);
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const weekday = weekdays[date.getDay()];
    
    // Format based on type
    switch (format) {
      case 'datetime':
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        return `${weekday}، ${day} ${month} ${year} - ${hour}:${minute}`;
      
      case 'time':
        const timeHour = String(date.getHours()).padStart(2, '0');
        const timeMinute = String(date.getMinutes()).padStart(2, '0');
        return `${timeHour}:${timeMinute}`;
      
      case 'date':
      default:
        // Different formatting for different languages
        if (currentLang.startsWith('ku')) {
          return `${weekday}، ${day}ی ${month} ${year}`;
        } else {
          return `${weekday}، ${day} ${month} ${year}`;
        }
    }
    
  } catch (error) {
    console.log('Error in formatDate:', error);
    return 'تاريخ غير صحيح';
  }
}

/**
 * Formats a date for notifications with proper timezone handling
 * @param {string|Date} dateString - The date to format
 * @param {string} language - The language for formatting
 * @returns {string} Formatted date string for notifications
 */
export function formatNotificationDate(dateString, language = null) {
  if (!dateString) {
    return 'تاريخ غير صحيح';
  }

  let date;
  try {
    // Handle different date formats
    if (typeof dateString === 'string') {
      if (dateString.includes('T')) {
        // ISO string format
        date = new Date(dateString);
      } else if (dateString.includes('-')) {
        // YYYY-MM-DD format
        const [year, month, day] = dateString.split('-').map(Number);
        if (isNaN(year) || isNaN(month) || isNaN(day)) {
          return 'تاريخ غير صحيح';
        }
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }
    
    // Validate the date
    if (isNaN(date.getTime())) {
      return 'تاريخ غير صحيح';
    }
    
    // Get current language
    const currentLang = language || (typeof window !== 'undefined' && window.i18n?.language) || 'ar';
    
    // Get localized names
    const { weekdays, months } = getLocalizedNames(currentLang);
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const weekday = weekdays[date.getDay()];
    
    // Format for notifications
    if (currentLang.startsWith('ku')) {
      return `${weekday}، ${day}ی ${month} ${year}`;
    } else {
      return `${weekday}، ${day} ${month} ${year}`;
    }
    
  } catch (error) {
    console.log('Error in formatNotificationDate:', error);
    return 'تاريخ غير صحيح';
  }
}

/**
 * Gets localized day and month names
 * @param {string} language - The language code
 * @returns {object} Object containing weekdays and months arrays
 */
function getLocalizedNames(language) {
  // Default Arabic names
  let weekdays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  let months = [
    'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
    'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'
  ];
  
  try {
    // Try to get from i18n if available
    if (typeof window !== 'undefined' && window.i18n) {
      const weekdaysFromTranslation = window.i18n.t('weekdays', { returnObjects: true });
      const monthsFromTranslation = window.i18n.t('months', { returnObjects: true });
      
      if (Array.isArray(weekdaysFromTranslation)) {
        weekdays = weekdaysFromTranslation;
      }
      if (Array.isArray(monthsFromTranslation)) {
        months = monthsFromTranslation;
      }
    }
  } catch (error) {
    console.log('Error getting localized names from i18n:', error);
  }
  
  return { weekdays, months };
}

/**
 * Formats a date for display in a specific format
 * @param {string|Date} dateString - The date to format
 * @param {string} format - The format string (e.g., 'DD/MM/YYYY', 'MM/DD/YYYY')
 * @returns {string} Formatted date string
 */
export function formatDateCustom(dateString, format = 'DD/MM/YYYY') {
  if (!dateString) {
    return 'تاريخ غير صحيح';
  }

  let date;
  try {
    if (typeof dateString === 'string' && dateString.includes('-')) {
      const [year, month, day] = dateString.split('-').map(Number);
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return 'تاريخ غير صحيح';
      }
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
      return 'تاريخ غير صحيح';
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return format
      .replace('DD', day)
      .replace('MM', month)
      .replace('YYYY', year);
      
  } catch (error) {
    console.log('Error in formatDateCustom:', error);
    return 'تاريخ غير صحيح';
  }
}

/**
 * Gets a relative time string (e.g., "منذ ساعتين", "أمس")
 * @param {string|Date} dateString - The date to format
 * @param {string} language - The language for formatting
 * @returns {string} Relative time string
 */
export function getRelativeTime(dateString, language = 'ar') {
  if (!dateString) {
    return 'تاريخ غير صحيح';
  }

  let date;
  try {
    if (typeof dateString === 'string' && dateString.includes('-')) {
      const [year, month, day] = dateString.split('-').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
      return 'تاريخ غير صحيح';
    }
    
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (language.startsWith('ku')) {
      if (diffInMinutes < 1) return 'ئێستا';
      if (diffInMinutes < 60) return `${diffInMinutes} خولەک پێشتر`;
      if (diffInHours < 24) return `${diffInHours} کاتژمێر پێشتر`;
      if (diffInDays === 1) return 'دوێنێ';
      if (diffInDays < 7) return `${diffInDays} ڕۆژ پێشتر`;
      return formatNotificationDate(dateString, language);
    } else {
      if (diffInMinutes < 1) return 'الآن';
      if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
      if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
      if (diffInDays === 1) return 'أمس';
      if (diffInDays < 7) return `منذ ${diffInDays} أيام`;
      return formatNotificationDate(dateString, language);
    }
    
  } catch (error) {
    console.log('Error in getRelativeTime:', error);
    return 'تاريخ غير صحيح';
  }
}
