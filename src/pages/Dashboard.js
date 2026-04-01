import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import mechanics from "../data/mechanicsData";
import "./Dashboard.css";
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const Dashboard = () => {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const userName = storedUser?.username || "User";

  const spendingData = [
    { month: "Jan", amount: 450 },
    { month: "Feb", amount: 780 },
    { month: "Mar", amount: 920 },
    { month: "Apr", amount: 630 },
    { month: "May", amount: 1100 },
    { month: "Jun", amount: 860 },
  ];

  const totalSpent = spendingData.reduce((sum, item) => sum + item.amount, 0);
  const maxSpent = Math.max(...spendingData.map((item) => item.amount));

  const chartWidth = 460;
  const chartHeight = 180;
  const chartMargin = 28;
  const usableWidth = chartWidth - chartMargin * 2;
  const usableHeight = chartHeight - chartMargin * 2;

  const chartCoordinates = spendingData.map((item, index) => {
    const x = chartMargin + (usableWidth / (spendingData.length - 1)) * index;
    const y =
      chartHeight -
      chartMargin -
      (item.amount / maxSpent) * usableHeight;
    return { month: item.month, amount: item.amount, x, y };
  });

  const chartPoints = chartCoordinates
    .map(({ x, y }) => `${x},${y}`)
    .join(" ");

  const handleLogout = async () => {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (storedUser?.mobileNumber && storedUser?.username) {
      fetch(`${API_BASE_URL}/api/auth/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileNumber: storedUser.mobileNumber,
          username: storedUser.username,
          eventType: 'logout'
        })
      }).catch((error) => {
        console.warn('Could not record logout session:', error);
      });
    }

    localStorage.removeItem("user");
    navigate("/");
  };

  // ✅ States
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [locationError, setLocationError] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported ❌");
      return;
    }

    setLoadingLocation(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLocation({ lat, lng });
        setLoadingLocation(false);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );

          const data = await res.json();

          const place =
            data.address?.village ||
            data.address?.town ||
            data.address?.city ||
            data.address?.suburb ||
            data.address?.county ||
            "Unknown location";

          setLocationName(place);
        } catch (err) {
          console.log("Error fetching place name:", err);
          setLocationName("");
        }
      },
      (error) => {
        console.log("Location error:", error);
        setLocationError(error.message || "Unable to fetch location");
        setLoadingLocation(false);
      }
    );
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const openNavigation = (mechanic) => {
    if (!location) {
      alert("Please fetch your location first to start navigation.");
      return;
    }

    const origin = `${location.lat},${location.lng}`;
    const destination = `${mechanic.lat},${mechanic.lng}`;
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(destination)}&travelmode=driving`;

    window.open(mapsUrl, "_blank");
  };

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(1);
  };


  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <svg
  viewBox="0 0 500 100"
  className="signature-logo"
>
  <text
    x="10"
    y="70"
    className="signature-text"
  >
    QuickMech
  </text>
</svg>
          <div className="header-user">
            <span className="user-name">Welcome, {userName}</span>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="dashboard-main">
        <div className="dashboard-section">
          <h2 className="section-title">Find Mechanics Near You</h2>

          {/* ✅ Show place name */}
          {locationName && (
            <p style={{ marginBottom: "10px" }}>
              📍 You are in: {locationName}
              {loadingLocation && " (updating...)"}
            </p>
          )}
          {locationError && (
            <p style={{ color: "#d9534f", marginBottom: "10px" }}>
              ⚠️ {locationError}
            </p>
          )}

          <div className="mechanics-grid">
            {mechanics.map((mechanic) => {
              return (
                <div key={mechanic.id} className="mechanic-card">
                  <div className="mechanic-header">
                    <div className="mechanic-avatar">
                      {mechanic.image}
                    </div>

                    <div className="mechanic-info">
                      <h3 className="mechanic-name">
                        {mechanic.name}
                      </h3>
                      <p className="mechanic-distance">
                        {location
                          ? `${getDistanceFromLatLonInKm(
                              location.lat,
                              location.lng,
                              mechanic.lat,
                              mechanic.lng
                            )} km away`
                          : mechanic.distance}
                      </p>
                    </div>

                    <div className="mechanic-rating">
                      <span className="rating-stars">
                        ⭐ {mechanic.rating}
                      </span>
                      <span className="rating-count">
                        ({mechanic.reviews})
                      </span>
                    </div>
                  </div>

                <div className="mechanic-services">
                  <p className="services-label">Services:</p>
                  <div className="services-tags">
                    {mechanic.services.map((service, idx) => (
                      <span key={idx} className="service-tag">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mechanic-availability">
                  <span className="availability-badge">
                    {mechanic.availability}
                  </span>
                </div>

                <div className="mechanic-card-actions">
                  <button
                    className="btn-book"
                    onClick={() =>
                      navigate("/book", {
                        state: {
                          mechanic: mechanic,
                          userLocation: location,
                          placeName: locationName,
                        },
                      })
                    }
                  >
                    Book Now
                  </button>

                  <Link
                    to={`/mechanic/${mechanic.id}`}
                    state={{ mechanic, userLocation: location }}
                    className="btn-details"
                  >
                    View Details
                  </Link>

                  <button
                    className="btn-nav"
                    onClick={() => openNavigation(mechanic)}
                  >
                    Start Navigation
                  </button>
                </div>
              </div>
            )})}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2 className="section-title">Quick Actions</h2>

          <div className="actions-list">
            <div className="actions-row">
              <button
                className="action-btn action-btn-small"
                onClick={fetchLocation}
              >
                <span className="action-icon">📍</span>
                <span className="action-text">
                  {loadingLocation ? "Finding Location..." : "You are in"}
                </span>
              </button>
              <button
                className="action-btn"
                onClick={() => navigate("/payment-history")}
              >
                <span className="action-icon">💳</span>
                <span className="action-text">
                  Payment History
                </span>
              </button>
            </div>

            <div className="actions-row">
              <button
                className="action-btn"
                onClick={() => navigate("/ratings-reviews")}
              >
                <span className="action-icon">⭐</span>
                <span className="action-text">
                  Ratings & Reviews
                </span>
              </button>
            </div>

            <div className="actions-row">
              <button
                className="action-btn"
                onClick={() => navigate("/referral")}
              >
                <span className="action-icon">👥</span>
                <span className="action-text">
                  Referral Program
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="spend-section spend-section-small">
          <div className="spend-header">
            <div>
              <h2 className="section-title">Spending Overview</h2>
              <p className="spend-summary">Money spent over the last 6 months</p>
            </div>
            <div className="spend-total">₹{totalSpent}</div>
          </div>

          <div className="spend-graph-wrapper">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="spend-line-chart spend-line-chart-small"
            >
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#764ba2" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {[0.25, 0.5, 0.75, 1].map((step, index) => (
                <line
                  key={index}
                  x1={chartMargin}
                  y1={chartMargin + usableHeight * (1 - step)}
                  x2={chartWidth - chartMargin}
                  y2={chartMargin + usableHeight * (1 - step)}
                  stroke="#dbeafe"
                  strokeWidth="1"
                />
              ))}

              <polyline
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={chartPoints}
              />

              {chartCoordinates.map((point) => (
                <g key={point.month}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="6"
                    fill="#4f46e5"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                </g>
              ))}
            </svg>

            <div className="spend-chart-labels spend-chart-labels-small">
              {spendingData.map((item) => (
                <span key={item.month}>{item.month}</span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;