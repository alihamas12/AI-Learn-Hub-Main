import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Fake reviews shown on every course to build social proof
const FAKE_REVIEWS = [
  {
    id: 'fake-1',
    user_name: 'Sarah Johnson',
    rating: 5,
    review_text: 'Absolutely amazing course! The content is well-structured and the instructor explains everything clearly. I landed a job within 2 months of completing this course!',
    created_at: '2025-12-14T10:22:00Z',
  },
  {
    id: 'fake-2',
    user_name: 'Mohammed Al-Rashid',
    rating: 5,
    review_text: 'Best investment I made this year. The practical projects are incredibly useful and the community is super supportive. Highly recommend to anyone looking to upskill.',
    created_at: '2026-01-03T08:45:00Z',
  },
  {
    id: 'fake-3',
    user_name: 'Emma Clarke',
    rating: 4,
    review_text: 'Really solid course with great depth. I learned so much in just a few weeks. The only reason I give 4 stars is I wish there were more advanced topics covered.',
    created_at: '2026-01-18T14:10:00Z',
  },
  {
    id: 'fake-4',
    user_name: 'James Okafor',
    rating: 5,
    review_text: 'Exceeded all my expectations. The lessons are engaging and packed with real-world examples. I have recommended this to all my colleagues.',
    created_at: '2026-02-02T11:30:00Z',
  },
  {
    id: 'fake-5',
    user_name: 'Priya Sharma',
    rating: 5,
    review_text: 'Incredible value for money! The instructor is knowledgeable and very responsive. This platform is seriously underrated. 10/10 would recommend.',
    created_at: '2026-02-20T09:15:00Z',
  },
];

// Compute a blended average including fake reviews
function getBlendedAverage(realAvg, realCount) {
  const fakeTotal = FAKE_REVIEWS.reduce((sum, r) => sum + r.rating, 0);
  const fakeCount = FAKE_REVIEWS.length;
  const totalRating = realAvg * realCount + fakeTotal;
  const totalCount = realCount + fakeCount;
  return totalCount > 0 ? totalRating / totalCount : 4.8;
}

export default function CourseReviews({ courseId, isEnrolled, userId }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(4.8);
  const [totalReviews, setTotalReviews] = useState(FAKE_REVIEWS.length);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchAverageRating();
  }, [courseId]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API}/reviews/${courseId}`);
      setReviews(response.data);
      if (userId) {
        const userReview = response.data.find(r => r.user_id === userId);
        setHasReviewed(!!userReview);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const fetchAverageRating = async () => {
    try {
      const response = await axios.get(`${API}/reviews/${courseId}/average`);
      const realAvg = response.data.average_rating || 0;
      const realCount = response.data.total_reviews || 0;
      const blended = getBlendedAverage(realAvg, realCount);
      setAverageRating(blended);
      setTotalReviews(realCount + FAKE_REVIEWS.length);
    } catch (error) {
      setAverageRating(4.8);
      setTotalReviews(FAKE_REVIEWS.length);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      await axios.post(
        `${API}/reviews`,
        {
          course_id: courseId,
          rating,
          review_text: reviewText
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Review submitted successfully!');
      setShowReviewForm(false);
      setRating(0);
      setReviewText('');
      fetchReviews();
      fetchAverageRating();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (count, interactive = false, hoverRating = 0) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={interactive ? 28 : 20}
        fill={index < (hoverRating || count) ? '#f59e0b' : 'none'}
        color={index < (hoverRating || count) ? '#f59e0b' : '#d1d5db'}
        onClick={interactive ? () => setRating(index + 1) : undefined}
        onMouseEnter={interactive ? () => setRating(index + 1) : undefined}
        style={interactive ? { cursor: 'pointer' } : {}}
      />
    ));
  };

  // Merge fake + real reviews, sorted by date (newest first)
  const allReviews = [
    ...FAKE_REVIEWS,
    ...reviews,
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div className="course-reviews" data-testid="course-reviews">
      {/* Average Rating Section */}
      <div className="reviews-header">
        <div className="average-rating-display">
          <div className="average-number">{averageRating.toFixed(1)}</div>
          <div className="stars-container">
            {renderStars(Math.round(averageRating))}
          </div>
          <div className="total-reviews">{totalReviews} reviews</div>
        </div>

        {isEnrolled && !hasReviewed && (
          <Button onClick={() => setShowReviewForm(!showReviewForm)}>
            Write a Review
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="review-form" data-testid="review-form">
          <h3>Write Your Review</h3>
          <div className="rating-selector">
            <label>Your Rating:</label>
            <div className="stars-interactive">
              {renderStars(rating, true)}
            </div>
          </div>
          <Textarea
            data-testid="review-textarea"
            placeholder="Share your experience with this course..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
          />
          <div className="form-actions">
            <Button variant="outline" onClick={() => setShowReviewForm(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={loading}
              data-testid="submit-review-btn"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="reviews-list">
        <h3>Student Reviews</h3>
        {allReviews.map((review) => (
          <div key={review.id} className="review-card" data-testid={`review-${review.id}`}>
            <div className="review-header">
              <div className="reviewer-info">
                <div className="reviewer-avatar">
                  {review.user_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="reviewer-name">{review.user_name}</div>
                  <div className="review-date">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="review-stars">
                {renderStars(review.rating)}
              </div>
            </div>
            {review.review_text && (
              <p className="review-text">{review.review_text}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
