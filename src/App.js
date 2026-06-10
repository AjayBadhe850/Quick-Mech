import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import OTPVerification from "./pages/OTPVerification";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import UploadPics from "./pages/UploadPics";
import Referral from "./pages/Referral";
import Booking from "./pages/Booking";
import PaymentHistory from "./pages/PaymentHistory";
import RatingsReviews from "./pages/RatingsReviews";
import MechanicDetails from "./pages/MechanicDetails";

function App() {
  useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = Boolean(user);
  const isAdmin = user?.role === "admin";

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/otp" element={<OTPVerification />} />

      <Route
        path="/dashboard"
        element={isLoggedIn ? <Dashboard /> : <Navigate to="/" replace />}
      />

      <Route
        path="/admin"
        element={isAdmin ? <Admin /> : <Navigate to="/" replace />}
      />

      <Route
        path="/upload-pics"
        element={isAdmin ? <UploadPics /> : <Navigate to="/" replace />}
      />

      <Route
        path="/referral"
        element={isLoggedIn ? <Referral /> : <Navigate to="/" replace />}
      />

      
      <Route
        path="/book"
        element={isLoggedIn ? <Booking /> : <Navigate to="/" replace />}
      />

      <Route
        path="/mechanic/:id"
        element={isLoggedIn ? <MechanicDetails /> : <Navigate to="/" replace />}
      />

      <Route
        path="/payment-history"
        element={isLoggedIn ? <PaymentHistory /> : <Navigate to="/" replace />}
      />

      <Route
        path="/ratings-reviews"
        element={isLoggedIn ? <RatingsReviews /> : <Navigate to="/" replace />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;