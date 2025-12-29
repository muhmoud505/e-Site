'use client';

import React, { useState } from 'react';

const StarIcon = ({ filled, halfFilled, ...props }) => (
  <svg
    {...props}
    className={`w-5 h-5 ${filled || halfFilled ? 'text-yellow-400' : 'text-gray-300'}`}
    fill={halfFilled ? "url(#half-fill)" : "currentColor"}
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="half-fill">
        <stop offset="50%" stopColor="currentColor" />
        <stop offset="50%" stopColor="rgb(209 213 219)" stopOpacity="1" />
      </linearGradient>
    </defs>
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.365 2.444a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.365-2.444a1 1 0 00-1.175 0l-3.365 2.444c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 8.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
  </svg>
);

export default function StarRating({
  initialRating = 0,
  reviewCount,
  isInteractive = false,
  onSetRating,
}) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  const displayRating = isInteractive ? hover || rating : Number(initialRating);
  const totalStars = 5;

  return (
    <div className="flex items-center mt-1">
      <div className={`flex items-center ${isInteractive ? 'cursor-pointer' : ''}`}>
        {[...Array(totalStars)].map((_, index) => {
          const ratingValue = index + 1;
          const isFilled = ratingValue <= displayRating;
          const isHalfFilled = !isInteractive && !isFilled && ratingValue - 0.5 === displayRating;

          if (isInteractive) {
            return (
              <button
                type="button"
                key={ratingValue}
                onClick={() => {
                  setRating(ratingValue);
                  if (onSetRating) onSetRating(ratingValue);
                }}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(0)}
                className="focus:outline-none"
                aria-label={`Rate ${ratingValue} out of ${totalStars}`}
              >
                <StarIcon filled={isFilled} />
              </button>
            );
          }

          return (
            <StarIcon key={ratingValue} filled={isFilled} halfFilled={isHalfFilled} />
          );
        })}
      </div>
      {reviewCount !== undefined && (
        <span className="text-gray-500 text-sm ml-2">
          ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
}
