import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PaymentHistory.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function PaymentHistory() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    const mobileNumber = currentUser?.mobileNumber;

    if (!mobileNumber) {
      setError('No logged in user.');
      setLoading(false);
      return;
    }

    const fetchPayments = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/payments/${mobileNumber}`);
        const data = await response.json();
        if (response.ok && data.success) {
          setPayments(data.payments);
        } else {
          throw new Error(data.message || 'Failed to load payments');
        }
      } catch (err) {
        console.error(err);
        setError('Unable to load payment history from backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return (
    <div className="page-shell">
      <div className="page-card">
        <h2>Payment History</h2>
        <p className="page-subtitle">Your recent transactions with QuickMech.</p>

        <div className="payment-table">
          <div className="table-row table-header">
            <span>Date</span>
            <span>Mechanic</span>
            <span>Amount</span>
            <span>Status</span>
          </div>
          {loading ? (
            <div className="table-row">
              <span>Loading payment history...</span>
            </div>
          ) : error ? (
            <div className="table-row">
              <span>{error}</span>
            </div>
          ) : payments.length === 0 ? (
            <div className="table-row">
              <span>No payment records found.</span>
            </div>
          ) : (
            payments.map((payment) => (
              <div key={payment._id} className="table-row">
                <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                <span>{payment.mechanicName}</span>
                <span>{`₹${payment.amount}`}</span>
                <span>{payment.status}</span>
              </div>
            ))
          )}
        </div>

        <button className="btn-back-page" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
      </div>
    </div>
  );
}

export default PaymentHistory;
