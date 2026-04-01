import React from "react";
import { useNavigate } from "react-router-dom";
import "./RatingsReviews.css";

function RatingsReviews() {
  const navigate = useNavigate();

  const reviews = [
    { id: 1, mechanic: "John Mechanic", rating: 4.8, comment: "Fast and reliable service." },
    { id: 2, mechanic: "Sarah Auto Care", rating: 4.9, comment: "Great communication and quality repair." },
    { id: 3, mechanic: "Mike's Auto Shop", rating: 4.7, comment: "Good value for money." },
  ];

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
