'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import StarRating from './StarRating';

export default function ReviewForm({ productId, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 || comment.trim() === '') {
      toast.error('الرجاء تقديم تقييم وتعليق.');
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, comment }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'حدث خطأ ما');
      }

      toast.success('شكراً لك على مراجعتك!');
      setRating(0);
      setComment('');
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4 p-6 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-xl font-semibold">أضف مراجعتك</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">تقييمك</label>
        <StarRating isInteractive={true} onSetRating={setRating} initialRating={rating} />
      </div>
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
          مراجعتك
        </label>
        <textarea
          id="comment"
          name="comment"
          rows="4"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
          placeholder="اكتب ما أعجبك أو لم يعجبك في هذا المنتج..."
          required
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting || rating === 0}
        className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'جاري الإرسال...' : 'إرسال المراجعة'}
      </button>
    </form>
  );
}