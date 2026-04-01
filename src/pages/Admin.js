import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mechanicsData from '../data/mechanicsData';
import './Admin.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getStoredMechanicImages = (id) => {
  try {
    const stored = JSON.parse(localStorage.getItem('mechanicImages') || '{}');
    return stored[id] || [];
  } catch {
    return [];
  }
};

const saveStoredMechanicImages = (id, images) => {
  try {
    const stored = JSON.parse(localStorage.getItem('mechanicImages') || '{}');
    stored[id] = images;
    localStorage.setItem('mechanicImages', JSON.stringify(stored));
  } catch {
    // ignore storage errors
  }
};

const defaultSiteSettings = {
  siteName: 'QuickMech',
  tagline: 'Mechanic Near You',
  supportEmail: 'support@quickmech.com',
  contactNumber: '7396230359',
  referralCode: 'QM2024USER789',
  welcomeMessage: 'Edit site content, mechanics, and booking details from this admin panel.',
};

const defaultBookings = [
  {
    id: 1,
    customer: 'Riya Sharma',
    mechanic: 'John Mechanic',
    date: '2026-04-01',
    amount: 499,
    status: 'Confirmed',
  },
  {
    id: 2,
    customer: 'Amit Patel',
    mechanic: "Sarah Auto Care",
    date: '2026-03-28',
    amount: 650,
    status: 'Pending',
  },
  {
    id: 3,
    customer: 'Neha Singh',
    mechanic: "Mike's Auto Shop",
    date: '2026-03-25',
    amount: 720,
    status: 'Completed',
  },
];

const Admin = () => {
  const navigate = useNavigate();

  const [siteSettings, setSiteSettings] = useState(() => {
    return (
      JSON.parse(localStorage.getItem('adminSiteSettings')) || defaultSiteSettings
    );
  });
  const [mechanics, setMechanics] = useState(() => {
    return (
      JSON.parse(localStorage.getItem('adminMechanics')) || mechanicsData
    );
  });
  const [bookings, setBookings] = useState(() => {
    return (
      JSON.parse(localStorage.getItem('adminBookings')) || defaultBookings
    );
  });
  const [editMechanic, setEditMechanic] = useState(null);
  const [storedMechanicImages, setStoredMechanicImages] = useState([]);
  const [adminSaveMessage, setAdminSaveMessage] = useState('');

  useEffect(() => {
    const fetchAdminSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/settings`);
        const data = await response.json();
        if (response.ok && data.success && data.settings) {
          setSiteSettings(data.settings);
        }
      } catch (error) {
        console.warn('Could not load admin settings from backend:', error);
      }
    };

    fetchAdminSettings();
  }, []);

  useEffect(() => {
    localStorage.setItem('adminSiteSettings', JSON.stringify(siteSettings));
  }, [siteSettings]);

  useEffect(() => {
    localStorage.setItem('adminMechanics', JSON.stringify(mechanics));
  }, [mechanics]);

  useEffect(() => {
    localStorage.setItem('adminBookings', JSON.stringify(bookings));
  }, [bookings]);

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

    localStorage.removeItem('user');
    navigate('/');
  };

  const handleSettingsChange = (field, value) => {
    setSiteSettings((prev) => ({ ...prev, [field]: value }));
  };

  const saveAdminSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAdminSaveMessage('Admin settings saved to backend successfully.');
      } else {
        setAdminSaveMessage('Failed to save admin settings.');
      }
    } catch (error) {
      console.error(error);
      setAdminSaveMessage('Failed to save admin settings to backend.');
    }
  };

  const startMechanicEdit = (mechanic) => {
    setEditMechanic({ ...mechanic });
    setStoredMechanicImages(getStoredMechanicImages(mechanic.id));
  };

  const updateMechanicField = (field, value) => {
    setEditMechanic((prev) => ({ ...prev, [field]: value }));
  };

  const deleteMechanicImage = (imageUrl) => {
    if (!editMechanic) return;

    if (editMechanic.images?.includes(imageUrl)) {
      setEditMechanic((prev) => ({
        ...prev,
        images: prev.images.filter((image) => image !== imageUrl),
      }));
      return;
    }

    const updatedStored = storedMechanicImages.filter((image) => image !== imageUrl);
    setStoredMechanicImages(updatedStored);
    saveStoredMechanicImages(editMechanic.id, updatedStored);
  };

  const saveMechanic = () => {
    setMechanics((prev) =>
      prev.map((item) => (item.id === editMechanic.id ? editMechanic : item))
    );
    setEditMechanic(null);
    setStoredMechanicImages([]);
  };

  const cancelMechanicEdit = () => {
    setEditMechanic(null);
  };

  const updateBookingStatus = (bookingId, status) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId ? { ...booking, status } : booking
      )
    );
  };

  const handleUploadPics = () => {
    if (editMechanic?.id) {
      navigate('/upload-pics', {
        state: { mechanicId: editMechanic.id },
      });
    }
  };

  const combinedMechanicImages = editMechanic
    ? [
        ...(editMechanic.images || []),
        ...storedMechanicImages.filter(
          (image) => !(editMechanic.images || []).includes(image)
        ),
      ]
    : [];

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div>
          <h1>Admin Panel</h1>
          <p>Manage site content, mechanics, bookings, and referral details.</p>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="admin-main">
        <section className="admin-section">
          <div className="section-head">
            <div>
              <h2>Site Settings</h2>
              <p>Update the site title, contact details, and referral code.</p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="input-row">
              <label>Site Name</label>
              <input
                value={siteSettings.siteName}
                onChange={(e) => handleSettingsChange('siteName', e.target.value)}
              />
            </div>
            <div className="input-row">
              <label>Tagline</label>
              <input
                value={siteSettings.tagline}
                onChange={(e) => handleSettingsChange('tagline', e.target.value)}
              />
            </div>
            <div className="input-row">
              <label>Support Email</label>
              <input
                type="email"
                value={siteSettings.supportEmail}
                onChange={(e) => handleSettingsChange('supportEmail', e.target.value)}
              />
            </div>
            <div className="input-row">
              <label>Contact Number</label>
              <input
                value={siteSettings.contactNumber}
                onChange={(e) => handleSettingsChange('contactNumber', e.target.value)}
              />
            </div>
            <div className="input-row">
              <label>Referral Code</label>
              <input
                value={siteSettings.referralCode}
                onChange={(e) => handleSettingsChange('referralCode', e.target.value)}
              />
            </div>
            <div className="input-row input-full">
              <label>Welcome Message</label>
              <textarea
                rows="3"
                value={siteSettings.welcomeMessage}
                onChange={(e) => handleSettingsChange('welcomeMessage', e.target.value)}
              />
            </div>
          </div>
          <div className="settings-actions">
            <button className="btn-primary" type="button" onClick={saveAdminSettings}>
              Save Settings to Backend
            </button>
            {adminSaveMessage && <p className="settings-message">{adminSaveMessage}</p>}
          </div>
        </section>

        <section className="admin-section">
          <div className="section-head">
            <div>
              <h2>Mechanics</h2>
              <p>View and edit mechanic listings used in the app.</p>
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Rating</th>
                  <th>Reviews</th>
                  <th>Availability</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mechanics.map((mechanic) => (
                  <tr key={mechanic.id}>
                    <td>{mechanic.name}</td>
                    <td>{mechanic.rating}</td>
                    <td>{mechanic.reviews}</td>
                    <td>{mechanic.availability}</td>
                    <td>{mechanic.address}</td>
                    <td>
                      <button
                        className="btn-secondary"
                        onClick={() => startMechanicEdit(mechanic)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {editMechanic && (
          <section className="admin-section">
            <div className="section-head">
              <div>
                <h2>Edit Mechanic</h2>
                <p>Update the selected mechanic details and save changes.</p>
              </div>
            </div>

            <div className="settings-grid">
              <div className="input-row">
                <label>Name</label>
                <input
                  value={editMechanic.name}
                  onChange={(e) => updateMechanicField('name', e.target.value)}
                />
              </div>
              <div className="input-row">
                <label>Rating</label>
                <input
                  type="number"
                  step="0.1"
                  value={editMechanic.rating}
                  onChange={(e) => updateMechanicField('rating', e.target.value)}
                />
              </div>
              <div className="input-row">
                <label>Reviews</label>
                <input
                  type="number"
                  value={editMechanic.reviews}
                  onChange={(e) => updateMechanicField('reviews', e.target.value)}
                />
              </div>
              <div className="input-row">
                <label>Availability</label>
                <input
                  value={editMechanic.availability}
                  onChange={(e) => updateMechanicField('availability', e.target.value)}
                />
              </div>
              <div className="input-row input-full">
                <label>Address</label>
                <input
                  value={editMechanic.address}
                  onChange={(e) => updateMechanicField('address', e.target.value)}
                />
              </div>
              <div className="input-row input-full">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={editMechanic.description}
                  onChange={(e) => updateMechanicField('description', e.target.value)}
                />
              </div>
              <div className="input-row input-full">
                <label>Services (comma-separated)</label>
                <input
                  value={editMechanic.services.join(', ')}
                  onChange={(e) =>
                    updateMechanicField(
                      'services',
                      e.target.value.split(',').map((item) => item.trim())
                    )
                  }
                />
              </div>

              {combinedMechanicImages.length > 0 && (
                <div className="input-row input-full">
                  <label>Shop Images</label>
                  <div className="image-preview-row">
                    {combinedMechanicImages.map((src, idx) => (
                      <div key={idx} className="image-card">
                        <img
                          src={src}
                          alt={`Shop ${idx + 1}`}
                        />
                        <button
                          type="button"
                          className="btn-image-delete"
                          onClick={() => deleteMechanicImage(src)}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="button-row">
              <button className="btn-primary" onClick={saveMechanic}>
                Save Mechanic
              </button>
              <button className="btn-secondary" type="button" onClick={handleUploadPics}>
                Add Pics
              </button>
              <button className="btn-secondary" onClick={cancelMechanicEdit}>
                Cancel
              </button>
            </div>
          </section>
        )}

        <section className="admin-section">
          <div className="section-head">
            <div>
              <h2>Bookings</h2>
              <p>Manage booking status and track recent service requests.</p>
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Mechanic</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.customer}</td>
                    <td>{booking.mechanic}</td>
                    <td>{booking.date}</td>
                    <td>₹{booking.amount}</td>
                    <td>{booking.status}</td>
                    <td>
                      <select
                        value={booking.status}
                        onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                      >
                        <option>Pending</option>
                        <option>Confirmed</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Admin;
