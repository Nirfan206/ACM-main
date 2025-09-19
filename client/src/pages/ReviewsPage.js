import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header'; // Import the Header component
import Footer from '../components/Footer'; // Import the Footer component
import StarRating from '../components/StarRating'; // Import the new StarRating component
import '../styles/ReviewsPage.css';

function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // Added error state for API calls

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/reviews/all');
        
        const formattedReviews = response.data.map(review => ({
          id: review._id,
          name: review.user ? review.user.profile?.name || 'Anonymous' : 'Anonymous',
          rating: review.rating, // Keep as number for StarRating component
          text: review.comment,
          date: new Date(review.createdAt).toLocaleDateString()
        }));
        
        setReviews(formattedReviews);
        setLoading(false);
        setError(''); // Clear any previous errors
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError(error.response?.data?.message || 'Failed to load reviews. Please try again.');
        // Fallback to sample data if API fails
        const sampleReviews = [
          { id: 1, name: 'John Doe', rating: 5, text: 'Excellent service! The technician was very professional and fixed my AC in no time.', date: '2023-08-15' },
          { id: 2, name: 'Jane Smith', rating: 4, text: 'Good service overall. The repair was done well but took a bit longer than expected.', date: '2023-07-22' },
          { id: 3, name: 'Robert Johnson', rating: 5, text: 'Very satisfied with the maintenance service. My AC is running better than ever!', date: '2023-06-30' },
          { id: 4, name: 'Sarah Williams', rating: 5, text: 'Prompt service and reasonable pricing. Will definitely use again!', date: '2023-05-18' },
          { id: 5, name: 'Michael Brown', rating: 4, text: 'The technician was knowledgeable and fixed my refrigerator quickly.', date: '2023-04-05' },
        ];
        setReviews(sampleReviews);
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  return (
    <div className="reviews-page">
      <Header /> {/* Use the imported Header component */}

      <main style={{ flex: 1, maxWidth: '900px', margin: '0 auto', width: '100%' /* Removed paddingTop here */ }}>
        <h2 className="section-title" style={{ color: 'var(--color-primary)', marginTop: '20px' }}>Customer Reviews</h2> {/* Added marginTop for spacing */}
        
        <div className="company-highlight">
          <p>See what our customers are saying about our services.</p>
          <div style={{ fontSize: '1.5rem', color: 'var(--color-accent)', fontWeight: 'bold', marginTop: '0.5rem' }}>5.0 / 5.0 Google reviews</div>
        </div>

        {error && <div className="status-message error">{error}</div>} {/* Display error message */}

        {loading ? (
          <div className="loading">Loading reviews...</div>
        ) : (
          <div className="reviews-container">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <h3 style={{ color: 'var(--color-primary)' }}>{review.name}</h3>
                  <span className="review-date">{review.date}</span>
                </div>
                <StarRating rating={review.rating} /> {/* Use StarRating component */}
                <p className="review-comment">{review.text}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
          <Link 
            to="/login" 
            style={{ 
              textDecoration: 'none', 
              display: 'inline-block', 
              padding: '12px 24px', 
              backgroundColor: 'var(--color-primary)', 
              color: 'var(--color-white)', 
              borderRadius: '4px', 
              fontWeight: 'bold', 
              transition: 'background-color 0.3s ease' 
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#388E3C'} // Darker green on hover
            onMouseOut={(e) => e.target.style.backgroundColor = 'var(--color-primary)'}
          >
            Login to Leave a Review
          </Link>
        </div>
      </main>

      <Footer /> {/* Use the imported Footer component */}
    </div>
  );
}

export default ReviewsPage;