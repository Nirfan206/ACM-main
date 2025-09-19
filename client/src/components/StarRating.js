import React from 'react';

const StarRating = ({ rating, maxStars = 5, onRatingChange = null, editable = false }) => {
  const stars = [];
  for (let i = 1; i <= maxStars; i++) {
    stars.push(
      <span
        key={i}
        className={`star ${i <= rating ? 'filled' : ''}`}
        style={{
          cursor: editable ? 'pointer' : 'default',
          color: i <= rating ? 'var(--color-accent)' : 'var(--border)',
          fontSize: '1.2rem',
          marginRight: '2px',
          transition: 'color 0.2s ease',
        }}
        onClick={() => editable && onRatingChange && onRatingChange(i)}
      >
        ★
      </span>
    );
  }
  return <div className="stars-display">{stars}</div>;
};

export default StarRating;