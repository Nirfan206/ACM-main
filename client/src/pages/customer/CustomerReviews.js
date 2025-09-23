import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import StarRating from "../../components/StarRating";
import { logout } from "../../utils/authUtils";

function CustomerReviews() {
  const [myReviews, setMyReviews] = useState([]);
  const [availableBookings, setAvailableBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [reviewsRes, bookingsRes] = await Promise.all([
        api.get("/api/reviews", { headers }),
        api.get("/api/customer/bookings", { headers })
      ]);

      const reviews = reviewsRes.data || [];
      const allBookings = bookingsRes.data || [];

      const completedBookings = allBookings.filter(
        (b) => b.status === "Completed" && !reviews.some((r) => r.booking?._id === b._id)
      );

      setMyReviews(reviews);
      setAvailableBookings(completedBookings);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Failed to load data. Please try again later.");
      const s = err.response?.status;
      if (s === 401 || s === 403) {
        logout();
        navigate("/login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch only; no timers or auto reloads
    fetchData();
  }, [navigate]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedBookingId || rating === 0 || !reviewText.trim()) {
      setError("Please select a booking, provide a rating, and write a comment.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const res = await api.post(
        "/api/reviews",
        { booking: selectedBookingId, rating, comment: reviewText.trim() },
        { headers }
      );

      const created = res.data;

      // Optimistic UI: clear form and update lists immediately
      setSuccess("Review submitted successfully! Thank you for your feedback. ✅");
      setSelectedBookingId("");
      setReviewText("");
      setRating(0);

      // Update local state without full refetch if API returns the created review
      if (created && created._id) {
        setMyReviews((prev) => [created, ...prev]);
        setAvailableBookings((prev) => prev.filter((b) => b._id !== selectedBookingId));
      } else {
        await fetchData();
      }

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(err.response?.data?.message || "Failed to submit review. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="card profile-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 className="card-title text-center">⭐ My Reviews</h3>
        <button onClick={fetchData} className="btn btn-outline">Refresh</button>
      </div>

      {error && <div className="status-message error">{error}</div>}
      {success && <div className="status-message success">{success}</div>}

      {/* Review Form */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h4 style={{ marginBottom: "1rem", color: "var(--color-text)" }}>Submit a New Review</h4>
        <form onSubmit={handleReviewSubmit}>
          <div className="form-group">
            <label>Select Completed Booking:</label>
            <select
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              className="form-control"
              required
            >
              <option value="">Select a booking to review</option>
              {availableBookings.length === 0 ? (
                <option disabled>No completed bookings available for review.</option>
              ) : (
                availableBookings.map((booking) => (
                  <option key={booking._id} value={booking._id}>
                    {booking.service?.type || "Unknown Service"} on{" "}
                    {new Date(booking.date).toLocaleDateString()}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Rating:</label>
            <StarRating editable={true} rating={rating} onRatingChange={setRating} />
          </div>

          <div className="form-group">
            <label>Comment:</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience..."
              rows="4"
              className="form-control"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!selectedBookingId || rating === 0 || !reviewText.trim()}
          >
            Submit Review
          </button>
        </form>
      </div>

      {/* Submitted Reviews */}
      <div className="service-history-section">
        <h4 style={{ marginBottom: "1rem", color: "var(--color-text)" }}>My Submitted Reviews</h4>
        {myReviews.length === 0 ? (
          <p className="text-center text-light">No reviews yet.</p>
        ) : (
          <div className="reviews-container" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px" }}>
            {myReviews.map((review) => (
              <div
                key={review._id}
                className="review-card"
                style={{ padding: "15px", border: "1px solid var(--border)", borderRadius: "8px", boxShadow: "var(--shadow)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <h5 style={{ margin: 0, color: "var(--color-primary)" }}>
                    {review.booking?.service?.type || "N/A Service"}
                  </h5>
                  <span style={{ fontSize: "0.85rem", color: "var(--color-textLight)" }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <StarRating rating={review.rating} />
                <p style={{ marginTop: "10px", color: "var(--color-text)" }}>{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerReviews;
