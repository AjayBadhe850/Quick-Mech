import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import './OTPVerification.css';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [contactValue, setContactValue] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.mobileNumber || location.state?.contactValue) {
      setContactValue(location.state.contactValue || location.state.mobileNumber);
    } else {
      navigate('/');
    }
  }, [location, navigate]);

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        const next = document.getElementById(`otp-${index + 1}`);
        if (next) next.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      if (prev) prev.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const data = await authAPI.verifyOtp(contactValue.trim(), otpCode);

      if (data.success) {
        const userData = {
          id: data.user?.id,
          username: data.username || data.user?.username,
          mobileNumber: data.mobileNumber || data.user?.mobileNumber || contactValue,
          role: data.user?.role?.toLowerCase() || 'user',
          referralCode: data.user?.referralCode || ''
        };

        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        localStorage.setItem('user', JSON.stringify(userData));

        navigate('/dashboard', {
          state: {
            user: data.user,
            username: userData.username,
            mobileNumber: userData.mobileNumber
          }
        });
      } else {
        setError(data.message || 'Failed to verify OTP');
        setAttemptsRemaining(data.attemptsRemaining || 5);
        setOtp(['', '', '', '', '', '']);
      }
    } catch (err) {
      setError(err.message || 'Backend not reachable. Please try again.');
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setIsVerifying(true);

    try {
      const data = await authAPI.resendOtp(contactValue.trim());

      if (data.success) {
        setOtp(['', '', '', '', '', '']);
        setAttemptsRemaining(5);
        setSuccessMessage('New OTP sent!');
        const first = document.getElementById('otp-0');
        if (first) first.focus();
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError(err.message || 'Backend not reachable. Please try again.');
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-card">
        <h2 className="otp-title">Verify OTP</h2>
        <p className="otp-subtitle">
          Enter the 6-digit code sent to {contactValue}
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        {attemptsRemaining <= 2 && attemptsRemaining > 0 && (
          <div className="alert alert-warning">
            {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
          </div>
        )}

        <form className="otp-form" onSubmit={handleVerify}>
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
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
            onClick={handleResend}
            disabled={isVerifying}
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
};

export default OTPVerification;
