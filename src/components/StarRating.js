import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const StarRating = ({ 
  rating = 0, 
  onRatingChange, 
  interactive = false, 
  size = 'medium',
  showText = true,
  doctorId,
  userId,
  onRatingSubmit
}) => {
  const { t } = useTranslation();
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // تحديد أحجام النجوم
  const getStarSize = () => {
    switch (size) {
      case 'small': return { fontSize: '14px', gap: '2px' };
      case 'large': return { fontSize: '24px', gap: '4px' };
      default: return { fontSize: '18px', gap: '3px' };
    }
  };

  const starSize = getStarSize();

  // دالة مساعدة للتصميم المتجاوب
  const isMobile = () => window.innerWidth <= 768;

  const handleStarClick = async (clickedRating) => {
    if (!interactive || !onRatingChange) return;
    
    setIsSubmitting(true);
    try {
      await onRatingChange(clickedRating);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarHover = (hoveredRating) => {
    if (!interactive) return;
    setHoveredRating(hoveredRating);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setHoveredRating(0);
  };

  const getRatingText = (ratingValue) => {
    if (ratingValue === 0) return t('no_rating');
    if (ratingValue <= 1) return t('very_poor');
    if (ratingValue <= 2) return t('poor');
    if (ratingValue <= 3) return t('average');
    if (ratingValue <= 4) return t('good');
    return t('excellent');
  };

  const getRatingColor = (ratingValue) => {
    if (ratingValue === 0) return '#ddd';
    if (ratingValue <= 2) return '#ff6b6b';
    if (ratingValue <= 3) return '#ffa726';
    if (ratingValue <= 4) return '#66bb6a';
    return '#4caf50';
  };

  const displayRating = hoveredRating || rating;
  const ratingColor = getRatingColor(displayRating);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: isMobile() ? '0.3rem' : '0.5rem',
      flexWrap: 'wrap'
    }}>
      {/* النجوم */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: starSize.gap
      }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          const isHovered = interactive && star <= hoveredRating;
          
          return (
            <span
              key={star}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => handleStarHover(star)}
              onMouseLeave={handleMouseLeave}
              style={{
                fontSize: starSize.fontSize,
                color: isFilled ? ratingColor : '#ddd',
                cursor: interactive ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                filter: isHovered ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none',
                userSelect: 'none'
              }}
              role={interactive ? "button" : "img"}
              aria-label={`${star} ${t('stars')}`}
              tabIndex={interactive ? 0 : -1}
              onKeyDown={(e) => {
                if (interactive && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleStarClick(star);
                }
              }}
            >
              ★
            </span>
          );
        })}
      </div>

      {/* النص والتفاصيل */}
      {showText && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile() ? '0.3rem' : '0.5rem',
          flexWrap: 'wrap'
        }}>
          <span style={{
            fontSize: isMobile() ? '12px' : '14px',
            fontWeight: '600',
            color: ratingColor,
            minWidth: 'fit-content'
          }}>
            {displayRating > 0 ? `${displayRating.toFixed(1)}` : '0.0'}
          </span>
          
          <span style={{
            fontSize: isMobile() ? '10px' : '12px',
            color: '#666',
            fontWeight: '500'
          }}>
            ({getRatingText(displayRating)})
          </span>
        </div>
      )}

      {/* رسالة النجاح */}
      {showSuccess && (
        <div style={{
          fontSize: isMobile() ? '10px' : '12px',
          color: '#4caf50',
          fontWeight: '600',
          animation: 'fadeInOut 2s ease-in-out'
        }}>
          ✓ {t('rating_submitted')}
        </div>
      )}

      {/* مؤشر التحميل */}
      {isSubmitting && (
        <div style={{
          fontSize: isMobile() ? '10px' : '12px',
          color: '#0A8F82',
          fontWeight: '600'
        }}>
          {t('submitting')}...
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-5px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

export default StarRating;
