'use client';

import { useState, useEffect, useCallback } from 'react';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import { useSafeSession } from './useSafeSession';

export default function ProductReviews({ product }) {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { session } = useSafeSession();

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/reviews?productId=${product.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [product.id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleReviewSubmitted = () => {
    // Re-fetch reviews to show the new one
    fetchReviews();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="mt-16 pt-10 border-t border-gray-200">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">مراجعات العملاء</h2>

      <div className="space-y-8">
        {isLoading ? (
          <p>جاري تحميل المراجعات...</p>
        ) : error ? (
          <p className="text-red-500">خطأ في تحميل المراجعات: {error}</p>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="border-b pb-6">
              <div className="flex items-center mb-2">
                <p className="font-semibold text-gray-800">{review.author}</p>
                <p className="text-sm text-gray-500 mx-2">-</p>
                <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
              </div>
              <StarRating initialRating={review.rating} />
              <p className="mt-3 text-gray-700">{review.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-600">لا توجد مراجعات لهذا المنتج حتى الآن.</p>
        )}
      </div>

      {/* Only show the review form to logged-in users */}
      {session && (
        <ReviewForm productId={product.id} onReviewSubmitted={handleReviewSubmitted} />
      )}
    </div>
  );
}