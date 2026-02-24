import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CourseReviews({ courseId, isEnrolled, userId }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
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
      
      // Check if current user has reviewed
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
      setAverageRating(response.data.average_rating);
      setTotalReviews(response.data.total_reviews);
    } catch (error) {
      console.error('Failed to load rating:', error);
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
        {reviews.length === 0 ? (
          <div className="empty-reviews">
            <p>No reviews yet. Be the first to review this course!</p>
          </div>
        ) : (
          reviews.map((review) => (
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
          ))
        )}
      </div>
    </div>
  );
}
