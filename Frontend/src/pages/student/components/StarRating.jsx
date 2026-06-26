import React, { useState } from 'react';

function StarRating({ value = 0, onChange, readonly = false, size = 'medium' }) {
  const [hover, setHover] = useState(0);
  
  const sizeClasses = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-4xl'
  };
  
  const starClass = sizeClasses[size] || sizeClasses.medium;
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`cursor-${readonly ? 'default' : 'pointer'} transition-colors ${starClass} ${
            star <= (hover || value)
              ? 'text-yellow-400'
              : 'text-gray-300'
          }`}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{ 
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}
        >
          ★
        </span>
      ))}
      {value > 0 && (
        <span className="ml-2 text-gray-600 font-medium">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export default StarRating;
