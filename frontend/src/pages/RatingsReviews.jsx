import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { reviewsAPI } from "../services/api";
import "./RatingsReviews.css";

function RatingsReviews() {
  const navigate = useNavigate();

  const defaultReviews = [
    { id: 1, mechanic: "John Mechanic", rating: 4.8, comment: "Fast and reliable service." },
    { id: 2, mechanic: "Sarah Auto Care", rating: 4.9, comment: "Great communication and quality repair." },
    { id: 3, mechanic: "Mike's Auto Shop", rating: 4.7, comment: "Good value for money." },
  ];

  const [reviews, setReviews] = useState(defaultReviews);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await reviewsAPI.getAll();
        const list = response.data?.reviews || response.reviews;
        if (Array.isArray(list) && list.length > 0) {
          const formatted = list.map(r => ({
            id: r.id,
            mechanic: r.mechanic?.name || r.username || "Verified Mechanic",
            rating: r.rating,
            comment: r.comment
          }));
          setReviews(formatted);
        }
      } catch (err) {
        console.warn("Using default reviews fallback:", err.message);
      }
    };

    fetchReviews();
  }, []);

  return (
    <div className="page-shell">
      <div className="page-card">
        <h2>Ratings & Reviews</h2>
        <p className="page-subtitle">See what customers say about the mechanics.</p>

        <div className="review-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <h3>{review.mechanic}</h3>
                <span className="review-score">⭐ {review.rating}</span>
              </div>
              <p>{review.comment}</p>
            </div>
          ))}
        </div>

        <button className="btn-back-page" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
      </div>
    </div>
  );
}

export default RatingsReviews;
