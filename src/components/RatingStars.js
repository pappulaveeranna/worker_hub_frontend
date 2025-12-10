import React from 'react';

function RatingStars({ rating = 0, showText = false }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push('★');
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push('☆');
    } else {
      stars.push('☆');
    }
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      <span style={{ color: '#ffc107', fontSize: '18px' }}>
        {stars.join('')}
      </span>
      {showText && (
        <span style={{ marginLeft: '8px', color: '#666' }}>
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  );
}

export default RatingStars;