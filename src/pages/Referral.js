import React, { useState } from 'react';
import './Referral.css';

const Referral = ({ userName }) => {
  const [copied, setCopied] = useState(false);
  const referralCode = 'QM2024USER789';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    { label: 'People Referred', value: '12', icon: '👥' },
    { label: 'Earnings', value: '₹1,200', icon: '💰' },
    { label: 'Active Referrals', value: '5', icon: '✓' },
  ];

  const referrals = [
    { name: 'Rajesh Kumar', date: '2024-02-01', amount: '₹200', status: 'Completed' },
    { name: 'Priya Singh', date: '2024-01-28', amount: '₹200', status: 'Completed' },
    { name: 'Amit Patel', date: '2024-01-25', amount: '₹200', status: 'Pending' },
    { name: 'Neha Sharma', date: '2024-01-20', amount: '₹200', status: 'Completed' },
  ];

  return (
    <div className="referral-container">
      {/* Header */}
      <header className="referral-header">
        <div className="referral-header-content">
          <h1>Referral Program</h1>
          <p>Earn money by referring friends to QuickMech</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="referral-main">
        {/* Hero Section */}
        <section className="referral-hero">
          <div className="hero-content">
            <div className="hero-text">
              <h2>Share the QuickMech Experience</h2>
              <p>Invite your friends and earn rewards for every successful referral</p>
              <ul className="benefits-list">
                <li>✓ Earn ₹200 per successful referral</li>
                <li>✓ Unlimited earning potential</li>
                <li>✓ Instant rewards to your wallet</li>
                <li>✓ No activation fees</li>
              </ul>
            </div>
            <div className="hero-image">🎁</div>
          </div>
        </section>

        {/* Referral Code Section */}
        <section className="referral-code-section">
          <h3>Your Referral Code</h3>
          <div className="referral-code-box">
            <code className="referral-code">{referralCode}</code>
            <button 
              className={`btn-copy ${copied ? 'copied' : ''}`}
              onClick={handleCopyCode}
            >
              {copied ? '✓ Copied!' : 'Copy Code'}
            </button>
          </div>
          <p className="code-instruction">Share this code with your friends. They'll get ₹100 off on first booking!</p>
        </section>

        {/* Stats Section */}
        <section className="referral-stats">
          <h3>Your Referral Stats</h3>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="how-it-works">
          <h3>How It Works</h3>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Share Your Code</h4>
              <p>Share your unique referral code with friends via WhatsApp, SMS, or any platform</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h4>Friend Joins</h4>
              <p>Your friend signs up using your referral code and gets ₹100 off on first booking</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h4>You Earn</h4>
              <p>Complete the referral and earn ₹200 instantly to your QuickMech wallet</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h4>Use Anytime</h4>
              <p>Use your earned money for any service bookings on QuickMech</p>
            </div>
          </div>
        </section>

        {/* Referral History */}
        <section className="referral-history">
          <h3>Recent Referrals</h3>
          <div className="referral-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral, index) => (
                  <tr key={index}>
                    <td>{referral.name}</td>
                    <td>{referral.date}</td>
                    <td>{referral.amount}</td>
                    <td>
                      <span className={`status-badge ${referral.status.toLowerCase()}`}>
                        {referral.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA Section */}
        <section className="referral-cta">
          <h3>Ready to Earn?</h3>
          <p>Invite your friends now and start earning rewards!</p>
          <button className="btn-share-now">Share Now</button>
        </section>
      </main>
    </div>
  );
};

export default Referral;
