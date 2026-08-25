import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { bookingsAPI, paymentsAPI } from "../services/api";
import "./Booking.css";

function Booking() {
  const location = useLocation();
  const navigate = useNavigate();

  const mechanic = location.state?.mechanic;

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [showUpiDetails, setShowUpiDetails] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const bookingAmount = 499;

  const handleBooking = async () => {
    if (!date || !time) {
      alert("Please select date and time ❌");
      return;
    }

    setLoading(true);
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

    try {
      if (mechanic?.id) {
        const res = await bookingsAPI.create({
          mechanicId: mechanic.id,
          bookingDate: date,
          bookingTime: time,
          amount: bookingAmount,
          notes: `Booking at ${mechanic.name}`,
          userMobile: currentUser?.mobileNumber,
          username: currentUser?.username
        });
        if (res.booking?.id) {
          setBookingId(res.booking.id);
        }
      }
    } catch (err) {
      console.warn("Booking saved locally:", err.message);
    } finally {
      setLoading(false);
      setConfirmed(true);
    }
  };

  const handlePayment = async () => {
    setShowUpiDetails(true);
    setPaymentMessage("Scan the QR code or use the UPI ID below to complete payment.");

    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    const userMobile = currentUser?.mobileNumber || 'unknown';
    const username = currentUser?.username || 'Guest';

    try {
      await paymentsAPI.record({
        userMobile,
        username,
        mechanicId: mechanic?.id || 0,
        bookingId: bookingId || null,
        amount: bookingAmount,
        status: 'completed',
        method: 'upi',
        notes: `Booking date ${date} ${time}`
      });
    } catch (error) {
      console.warn('Unable to store payment to backend:', error.message);
    }
  };

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText("7396230359@upi");
      setPaymentMessage("UPI ID copied to clipboard.");
    } catch {
      setPaymentMessage("Unable to copy UPI ID. Please copy manually.");
    }
  };

  return (
    <div className="booking-container">
      <div className="booking-card">
        <h2 className="booking-title">Booking Page</h2>

        {mechanic ? (
          <div className="mechanic-info-box">
            <h3>{mechanic.name}</h3>
            <p>⭐ {mechanic.rating}</p>
            <p>{mechanic.distance}</p>
          </div>
        ) : (
          <p>No mechanic selected</p>
        )}

        {!confirmed ? (
          <div className="booking-form">
            <label>Select Date:</label>
            <input
              type="date"
              className="booking-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <label>Select Time:</label>
            <input
              type="time"
              className="booking-input"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />

            <button className="btn-confirm" onClick={handleBooking} disabled={loading}>
              {loading ? "Confirming..." : "Confirm Booking"}
            </button>
          </div>
        ) : (
          <div className="booking-success">
            <h3>✅ Booking Confirmed!</h3>
            <p>
              {mechanic?.name || "Mechanic"} will arrive on {date} at {time}
            </p>

            <div className="payment-actions">
              {!showUpiDetails ? (
                <button
                  className="btn-pay"
                  onClick={handlePayment}
                >
                  {`Pay ₹${bookingAmount}`}
                </button>
              ) : (
                <div className="upi-payment-panel">
                  <div className="upi-qr">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                        `upi://pay?pa=7396230359@upi&pn=QuickMech&am=${bookingAmount}&cu=INR&tn=QuickMech%20Service`
                      )}`}
                      alt="UPI QR code"
                    />
                  </div>
                  <div className="upi-details">
                    <p><strong>UPI ID:</strong> 7396230359@upi</p>
                    <p><strong>Amount:</strong> ₹{bookingAmount}</p>
                    <p><strong>Note:</strong> QuickMech service booking</p>
                    <button className="btn-copy" onClick={handleCopyUpi}>
                      Copy UPI ID
                    </button>
                  </div>
                </div>
              )}

              {paymentMessage && (
                <p className="payment-message">{paymentMessage}</p>
              )}
            </div>

            <button
              className="btn-back"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Booking;
