import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({ value = 0, onChange, readOnly = false, size = 'md' }) => {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const activeSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hoverValue || value) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange && onChange(star)}
            onMouseEnter={() => !readOnly && setHoverValue(star)}
            onMouseLeave={() => !readOnly && setHoverValue(0)}
            className={`transition-colors p-0.5 rounded ${
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            }`}
            aria-label={`${star} star`}
          >
            <Star
              className={`${activeSize} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300'
              }`}
            />
          </button>
        );
      })}
      {readOnly && value > 0 && (
        <span className="ml-1.5 text-xs font-semibold text-slate-700">
          {Number(value).toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
