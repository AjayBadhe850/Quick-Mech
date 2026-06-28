import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import "./OTPVerification.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [contactValue, setContactValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);

  const navigate = useNavigate();
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://localhost:5000";
  const displayName = username.trim() || "User";
  const ADMIN_USERNAME = "Ajay_Badhe";
  const ADMIN_PASSWORD_OR_OTP = "7396230359";

  const isValidContact = (value) => {
    const trimmedValue = value.trim();
    return /^\d{10}$/.test(trimmedValue) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue);
  };

  const handleGetOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!username.trim()) {
      setError("Please enter your name");
      return;
    }

    if (username.trim() === ADMIN_USERNAME && contactValue === ADMIN_PASSWORD_OR_OTP) {
      localStorage.setItem(
        'user',
        JSON.stringify({
          username: ADMIN_USERNAME,
          mobileNumber: ADMIN_PASSWORD_OR_OTP,
          role: 'admin',
        })
      );
      navigate('/admin');
      return;
    }

    if (!isValidContact(contactValue)) {
      setError("Please enter a valid 10-digit mobile number or email address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, contactValue }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(`OTP sent to ${contactValue}`);
        setIsFlipped(true);
        setAttemptsRemaining(5);
        setOtp(['', '', '', '', '', '']);
        console.log("DEV OTP:", data.devOtp); 
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("Backend not reachable. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMobileChange = (e) => {
    setContactValue(e.target.value);
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactValue,
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const userData = {
          username: data.username || username,
          mobileNumber: data.mobileNumber || contactValue,
          referralCode: data.user?.referralCode || '',
        };

        localStorage.setItem('user', JSON.stringify(userData));

        fetch(`${API_BASE_URL}/api/auth/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mobileNumber: userData.mobileNumber,
            username: userData.username,
            eventType: 'login'
          })
        }).catch((error) => {
          console.warn('Could not record login session:', error);
        });

        navigate('/dashboard', {
          state: {
            user: data.user,
            username: userData.username,
            mobileNumber: userData.mobileNumber,
          },
        });
      } else {
        setError(data.message || 'Failed to verify OTP');
        setAttemptsRemaining(data.attemptsRemaining || attemptsRemaining - 1);
        setOtp(['', '', '', '', '', '']);
      }
    } catch (err) {
      setError('Backend not reachable. Please try again.');
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setIsVerifying(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contactValue }),
      });

      const data = await response.json();

      if (data.success) {
        setOtp(['', '', '', '', '', '']);
        setAttemptsRemaining(5);
        const firstInput = document.getElementById('otp-0');
        if (firstInput) firstInput.focus();
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Backend not reachable. Please try again.');
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="login-container">
      
      <div className="login-left">
        <div className="login-content">
          <div className="login-heading-svg-wrapper">
            <svg viewBox="0 0 1000 120" className="login-heading-svg" preserveAspectRatio="xMinYMin meet">
              <text x="0" y="90" className="login-heading-svg-text">
                Stuck on the Road?
              </text>
            </svg>
          </div>
          <p className="login-subheading">
            QuickMech connects you to nearby mechanics instantly
          </p>
        </div>
      </div>

      
      <div className="login-right">
        <div className="login-card">
          <h2 className="brand-title">QuickMech</h2>
          <p className="brand-subtitle">Mechanic Near You</p>
          <p className="login-welcome">Welcome, {displayName}</p>

          {error && <div className="alert alert-error">{error}</div>}
          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}

          <div className="card-inner-wrapper">
            <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>
              <div className="card-face card-front">
                <form className="login-form" onSubmit={handleGetOTP}>
            <div className="form-group">
              <label>User Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Mobile Number or Email Address</label>
              <input
                type="text"
                placeholder="Enter mobile number or email address"
                value={contactValue}
                onChange={handleMobileChange}
                autoComplete="email"
                required
              />
            </div>

            <button type="submit" className="btn-otp" disabled={loading}>
              {loading ? "Sending OTP..." : "Get OTP"}
            </button>
          </form>
              </div>
              <div className="card-face card-back">
                <div className="otp-form-wrapper">
                  <h2 className="otp-title">Verify OTP</h2>
                  <p className="otp-subtitle">
                    Enter the 6-digit code sent to {contactValue}
                  </p>

                  {attemptsRemaining <= 2 && attemptsRemaining > 0 && (
                    <div className="alert alert-warning">
                      {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
                    </div>
                  )}

                  <form className="otp-form" onSubmit={handleVerifyOtp}>
                    <div className="otp-inputs">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleOtpChange(e, index)}
                          onKeyDown={(e) => handleOtpKeyDown(e, index)}
                          className="otp-input"
                          inputMode="numeric"
                          disabled={isVerifying}
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="btn-verify"
                      disabled={otp.join('').length !== 6 || isVerifying}
                    >
                      {isVerifying ? 'Verifying...' : 'Verify'}
                    </button>
                  </form>

                  <p className="resend-text">
                    Didn't receive code?{' '}
                    <button
                      type="button"
                      className="btn-resend-link"
                      onClick={handleResendOtp}
                      disabled={isVerifying}
                    >
                      Resend
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
