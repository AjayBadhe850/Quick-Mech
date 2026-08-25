import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { paymentsAPI } from "../services/api";
import "./PaymentHistory.css";

function PaymentHistory() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    const mobileNumber = currentUser?.mobileNumber;

    if (!mobileNumber) {
      setError('No logged in user session.');
      setLoading(false);
      return;
    }

    const fetchPayments = async () => {
      try {
        const response = await paymentsAPI.getForUser(mobileNumber);
        const list = response.data?.payments || response.payments || [];
        setPayments(list);
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
            payments.map((payment, idx) => (
              <div key={payment.id || payment._id || idx} className="table-row">
                <span>{new Date(payment.createdAt || Date.now()).toLocaleDateString()}</span>
                <span>{payment.mechanic?.name || payment.mechanicName || "QuickMech Service"}</span>
                <span>{`₹${payment.amount}`}</span>
                <span style={{ textTransform: 'capitalize' }}>{payment.status}</span>
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
