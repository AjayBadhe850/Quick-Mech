import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mechanicsData from '../data/mechanicsData';
import './Admin.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
    
  }
};

const createNewMechanic = () => ({
  id: Date.now(),
  name: '',
  rating: 0,
  reviews: 0,
  distance: '0 km away',
  category: 'General Repair',
  priceRange: '₹200 - ₹1500',
  featured: false,
  status: 'Active',
  availability: 'Available now',
  openingHours: '9:00 AM - 9:00 PM',
  image: '🔧',
  lat: 0,
  lng: 0,
  address: '',
  description: '',
  contactPerson: '',
  contactNumber: '',
  googleMapsUrl: '',
  images: [],
});

const defaultSiteSettings = {
  siteName: 'QuickMech',
  tagline: 'Mechanic Near You',
  supportEmail: 'support@quickmech.com',
  contactNumber: '7396230359',
  referralCode: 'QM2024USER789',
  welcomeMessage: 'Edit site content, mechanics, and booking details from this admin panel.',
  maintenanceMode: false,
  allowNewUsers: true,
  primarySupportChannel: 'Email',
  defaultServiceFee: 150,
  featuredAnnouncement: 'Launch offer: 15% off on first service',
  adminNote: 'Use this panel to manage shops, users, bookings, promotions and site tools.',
};

const defaultPromotionCodes = [
  {
    id: 1,
    code: 'WELCOME10',
    discount: '10%',
    expiresOn: '2026-12-31',
    active: true,
    description: 'First-time customer discount',
  },
  {
    id: 2,
    code: 'SPRING20',
    discount: '20%',
    expiresOn: '2026-05-31',
    active: true,
    description: 'Seasonal spring offer',
  },
];

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

const defaultUsers = [
  {
    id: 1,
    name: 'Riya Sharma',
    mobileNumber: '9876543210',
    role: 'customer',
    status: 'active',
    referralCode: 'REF12345',
  },
  {
    id: 2,
    name: 'Amit Patel',
    mobileNumber: '9123456780',
    role: 'customer',
    status: 'active',
    referralCode: 'REF23456',
  },
  {
    id: 3,
    name: 'John Admin',
    mobileNumber: '7396230359',
    role: 'admin',
    status: 'active',
    referralCode: 'ADMIN001',
  },
];

const defaultAuditLogs = [
  { id: 1, action: 'Admin logged in', time: '2026-04-01 09:12' },
  { id: 2, action: 'Added sample mechanic', time: '2026-04-01 09:15' },
  { id: 3, action: 'Updated site settings', time: '2026-04-01 09:18' },
];

const createNewUser = () => ({
  id: Date.now(),
  name: '',
  mobileNumber: '',
  role: 'customer',
  status: 'active',
  referralCode: '',
});

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
  const [users, setUsers] = useState(() => {
    return (
      JSON.parse(localStorage.getItem('adminUsers')) || defaultUsers
    );
  });
  const [promotionCodes, setPromotionCodes] = useState(() => {
    return (
      JSON.parse(localStorage.getItem('adminPromotionCodes')) || defaultPromotionCodes
    );
  });
  const [auditLogs, setAuditLogs] = useState(() => {
    return (
      JSON.parse(localStorage.getItem('adminAuditLogs')) || defaultAuditLogs
    );
  });
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationHistory, setNotificationHistory] = useState(() => {
    return JSON.parse(localStorage.getItem('adminNotificationHistory')) || [];
  });
  const [importAdminJson, setImportAdminJson] = useState('');
  const [editMechanic, setEditMechanic] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [storedMechanicImages, setStoredMechanicImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mechanicSortBy, setMechanicSortBy] = useState('Newest');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [bookingSearchTerm, setBookingSearchTerm] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('All');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [userStatusFilter, setUserStatusFilter] = useState('All');
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

  useEffect(() => {
    localStorage.setItem('adminUsers', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('adminPromotionCodes', JSON.stringify(promotionCodes));
  }, [promotionCodes]);

  useEffect(() => {
    localStorage.setItem('adminAuditLogs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('adminNotificationHistory', JSON.stringify(notificationHistory));
  }, [notificationHistory]);

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

  const startUserEdit = (user) => {
    setEditUser({ ...user });
  };

  const handleAddUser = () => {
    setEditUser(createNewUser());
  };

  const updateUserField = (field, value) => {
    setEditUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddMechanic = () => {
    setEditMechanic(createNewMechanic());
    setStoredMechanicImages([]);
  };

  const parseCoordinatesFromGoogleMapsUrl = (url) => {
    if (!url) return null;

    try {
      const decodedUrl = decodeURIComponent(url);
      const patterns = [
        /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
        /[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
        /[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
        /\/place\/.*\/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
      ];

      for (const pattern of patterns) {
        const match = decodedUrl.match(pattern);
        if (match) {
          return {
            lat: parseFloat(match[1]),
            lng: parseFloat(match[2]),
          };
        }
      }
    } catch (error) {
      console.warn('Failed to parse coordinates from URL:', url, error);
    }

    return null;
  };

  const prepareMechanicForSave = (mechanic) => {
    const updatedMechanic = { ...mechanic };
    const coords = parseCoordinatesFromGoogleMapsUrl(mechanic.googleMapsUrl);
    if (coords) {
      updatedMechanic.lat = coords.lat;
      updatedMechanic.lng = coords.lng;
    }
    return updatedMechanic;
  };

  const updateMechanicField = (field, value) => {
    setEditMechanic((prev) => {
      const updatedMechanic = { ...prev, [field]: value };
      if (field === 'googleMapsUrl') {
        const coords = parseCoordinatesFromGoogleMapsUrl(value);
        if (coords) {
          updatedMechanic.lat = coords.lat;
          updatedMechanic.lng = coords.lng;
        }
      }
      return updatedMechanic;
    });
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
    const mechanicToSave = prepareMechanicForSave(editMechanic);
    setMechanics((prev) => {
      const alreadyExists = prev.some((item) => item.id === mechanicToSave.id);
      if (alreadyExists) {
        return prev.map((item) => (item.id === mechanicToSave.id ? mechanicToSave : item));
      }
      return [...prev, mechanicToSave];
    });
    setEditMechanic(null);
    setStoredMechanicImages([]);
  };

  const deleteMechanic = (mechanicId) => {
    if (!window.confirm('Delete this shop?')) return;
    setMechanics((prev) => prev.filter((item) => item.id !== mechanicId));
    if (editMechanic?.id === mechanicId) {
      setEditMechanic(null);
      setStoredMechanicImages([]);
    }
  };

  const cancelMechanicEdit = () => {
    setEditMechanic(null);
  };

  const deleteUser = (userId) => {
    if (!window.confirm('Delete this user?')) return;
    setUsers((prev) => prev.filter((item) => item.id !== userId));
    if (editUser?.id === userId) {
      setEditUser(null);
    }
  };

  const saveUser = () => {
    setUsers((prev) => {
      const exists = prev.some((item) => item.id === editUser.id);
      if (exists) {
        return prev.map((item) => (item.id === editUser.id ? editUser : item));
      }
      return [...prev, editUser];
    });
    setEditUser(null);
  };

  const cancelUserEdit = () => {
    setEditUser(null);
  };

  const addAuditLog = (action) => {
    const time = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setAuditLogs((prev) => [
      { id: Date.now(), action, time },
      ...prev.slice(0, 49),
    ]);
  };

  const broadcastNotification = () => {
    if (!notificationMessage.trim()) return;
    const message = notificationMessage.trim();
    setNotificationHistory((prev) => [
      { id: Date.now(), message, time: new Date().toISOString().slice(0, 16) },
      ...prev,
    ]);
    setNotificationMessage('');
    addAuditLog(`Sent notification: ${message}`);
  };

  const addPromotionCode = () => {
    const newCode = {
      id: Date.now(),
      code: `CODE${Date.now()}`,
      discount: '5%',
      expiresOn: '2026-12-31',
      active: true,
      description: 'New promotion',
    };
    setPromotionCodes((prev) => [newCode, ...prev]);
    addAuditLog(`Added promotion code ${newCode.code}`);
  };

  const updatePromotionField = (id, field, value) => {
    setPromotionCodes((prev) =>
      prev.map((promo) => (promo.id === id ? { ...promo, [field]: value } : promo))
    );
  };

  const deletePromotionCode = (id) => {
    setPromotionCodes((prev) => prev.filter((promo) => promo.id !== id));
    addAuditLog(`Deleted promotion code ${id}`);
  };

  const exportAdminData = () => {
    const payload = {
      siteSettings,
      mechanics,
      bookings,
      users,
      promotionCodes,
      auditLogs,
      notificationHistory,
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2)).then(() => {
      addAuditLog('Exported admin data to clipboard');
      alert('Admin data copied to clipboard');
    });
  };

  const importAdminData = (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.siteSettings) setSiteSettings(data.siteSettings);
      if (data.mechanics) setMechanics(data.mechanics);
      if (data.bookings) setBookings(data.bookings);
      if (data.users) setUsers(data.users);
      if (data.promotionCodes) setPromotionCodes(data.promotionCodes);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      if (data.notificationHistory) setNotificationHistory(data.notificationHistory);
      addAuditLog('Imported admin data');
      alert('Admin data imported successfully');
    } catch (error) {
      alert('Invalid import data');
    }
  };

  const resetAdminPanel = () => {
    if (!window.confirm('Reset admin panel data to defaults?')) return;
    setSiteSettings(defaultSiteSettings);
    setMechanics(mechanicsData);
    setBookings(defaultBookings);
    setUsers(defaultUsers);
    setPromotionCodes(defaultPromotionCodes);
    setAuditLogs(defaultAuditLogs);
    setNotificationHistory([]);
    localStorage.removeItem('adminSiteSettings');
    localStorage.removeItem('adminMechanics');
    localStorage.removeItem('adminBookings');
    localStorage.removeItem('adminUsers');
    localStorage.removeItem('adminPromotionCodes');
    localStorage.removeItem('adminAuditLogs');
    localStorage.removeItem('adminNotificationHistory');
    addAuditLog('Reset admin panel to default data');
  };

  const duplicateMechanic = (mechanic) => {
    const clone = {
      ...mechanic,
      id: Date.now(),
      name: `${mechanic.name} Copy`,
      featured: false,
    };
    setMechanics((prev) => [clone, ...prev]);
    addAuditLog(`Duplicated mechanic ${mechanic.name}`);
  };

  const toggleMechanicFeatured = (mechanicId) => {
    setMechanics((prev) =>
      prev.map((item) =>
        item.id === mechanicId ? { ...item, featured: !item.featured } : item
      )
    );
    const changed = mechanics.find((item) => item.id === mechanicId);
    addAuditLog(`Toggled featured for ${changed?.name}`);
  };

  const availabilityOptions = [
    'All',
    ...Array.from(new Set(mechanics.map((mechanic) => mechanic.availability))).sort(),
  ];

  const allServices = Array.from(
    new Set(mechanics.flatMap((mechanic) => mechanic.services || []))
  ).sort();

  const filteredMechanics = mechanics.filter((mechanic) => {
    const lowerSearch = searchTerm.trim().toLowerCase();
    const matchesSearch =
      lowerSearch === '' ||
      [
        mechanic.name,
        mechanic.address,
        mechanic.contactPerson,
        mechanic.contactNumber,
        mechanic.description,
        mechanic.category,
      ].some((value) => value?.toLowerCase().includes(lowerSearch));

    const matchesAvailability =
      availabilityFilter === 'All' || mechanic.availability === availabilityFilter;

    const matchesService =
      serviceFilter === 'All' || mechanic.services.includes(serviceFilter);

    return matchesSearch && matchesAvailability && matchesService;
  });

  const sortedMechanics = [...filteredMechanics].sort((a, b) => {
    switch (mechanicSortBy) {
      case 'Rating':
        return b.rating - a.rating;
      case 'Reviews':
        return b.reviews - a.reviews;
      case 'Featured':
        return (b.featured === true) - (a.featured === true) || b.rating - a.rating;
      case 'Active':
        return (a.status === 'Active' ? 0 : 1) - (b.status === 'Active' ? 0 : 1);
      default:
        return b.id - a.id;
    }
  });

  const totalShops = mechanics.length;
  const availableShops = mechanics.filter((mechanic) =>
    mechanic.availability?.toLowerCase().includes('available')
  ).length;
  const mappedShops = mechanics.filter((mechanic) => mechanic.googleMapsUrl).length;
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter((booking) => booking.status === 'Completed').length;
  const pendingBookings = bookings.filter((booking) => booking.status === 'Pending').length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);
  const activeUsers = users.filter((user) => user.status === 'active').length;
  const inactiveUsers = users.filter((user) => user.status !== 'active').length;
  const adminUsers = users.filter((user) => user.role === 'admin').length;
  const featuredShops = mechanics.filter((mechanic) => mechanic.featured).length;

  const filteredBookings = bookings.filter((booking) => {
    const term = bookingSearchTerm.trim().toLowerCase();
    const matchesSearch =
      term === '' ||
      [booking.customer, booking.mechanic, booking.date, booking.status]
        .some((value) => value?.toLowerCase().includes(term));
    const matchesStatus =
      bookingStatusFilter === 'All' || booking.status === bookingStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter((user) => {
    const term = userSearchTerm.trim().toLowerCase();
    const matchesSearch =
      term === '' ||
      [user.name, user.mobileNumber, user.role, user.status, user.referralCode]
        .some((value) => value?.toLowerCase().includes(term));
    const matchesRole =
      userRoleFilter === 'All' || user.role === userRoleFilter;
    const matchesStatus =
      userStatusFilter === 'All' || user.status === userStatusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

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
            <div className="input-row">
              <label>Primary Support Channel</label>
              <select
                value={siteSettings.primarySupportChannel}
                onChange={(e) => handleSettingsChange('primarySupportChannel', e.target.value)}
              >
                <option value="Email">Email</option>
                <option value="Phone">Phone</option>
                <option value="Chat">Chat</option>
              </select>
            </div>
            <div className="input-row">
              <label>Default Service Fee</label>
              <input
                type="number"
                value={siteSettings.defaultServiceFee}
                onChange={(e) => handleSettingsChange('defaultServiceFee', Number(e.target.value))}
              />
            </div>
            <div className="input-row">
              <label>Maintenance Mode</label>
              <select
                value={siteSettings.maintenanceMode ? 'On' : 'Off'}
                onChange={(e) => handleSettingsChange('maintenanceMode', e.target.value === 'On')}
              >
                <option value="Off">Off</option>
                <option value="On">On</option>
              </select>
            </div>
            <div className="input-row">
              <label>Allow New User Signup</label>
              <select
                value={siteSettings.allowNewUsers ? 'Yes' : 'No'}
                onChange={(e) => handleSettingsChange('allowNewUsers', e.target.value === 'Yes')}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="input-row input-full">
              <label>Featured Announcement</label>
              <input
                value={siteSettings.featuredAnnouncement}
                onChange={(e) => handleSettingsChange('featuredAnnouncement', e.target.value)}
              />
            </div>
            <div className="input-row input-full">
              <label>Admin Note</label>
              <textarea
                rows="3"
                value={siteSettings.adminNote}
                onChange={(e) => handleSettingsChange('adminNote', e.target.value)}
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

        <section className="admin-section admin-stats-section">
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <span>Total Shops</span>
              <strong>{totalShops}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Available Now</span>
              <strong>{availableShops}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Mapped Shops</span>
              <strong>{mappedShops}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Total Bookings</span>
              <strong>{totalBookings}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Completed Bookings</span>
              <strong>{completedBookings}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Pending Bookings</span>
              <strong>{pendingBookings}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Total Revenue</span>
              <strong>₹{totalRevenue}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Active Users</span>
              <strong>{activeUsers}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Inactive Users</span>
              <strong>{inactiveUsers}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Admin Accounts</span>
              <strong>{adminUsers}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Featured Shops</span>
              <strong>{featuredShops}</strong>
            </div>
          </div>
        </section>

        <section className="admin-section">
          <div className="section-head">
            <div>
              <h2>Admin Tools</h2>
              <p>Export data, import state, reset defaults, and manage admin utilities.</p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="input-row">
              <label>Import Admin JSON</label>
              <textarea
                rows="5"
                value={importAdminJson}
                onChange={(e) => setImportAdminJson(e.target.value)}
                placeholder='Paste admin export JSON here'
              />
            </div>
            <div className="input-row">
              <label>Actions</label>
              <div className="button-row">
                <button className="btn-primary" type="button" onClick={() => importAdminData(importAdminJson)}>
                  Import Data
                </button>
                <button className="btn-primary" type="button" onClick={exportAdminData}>
                  Export Data
                </button>
                <button className="btn-secondary" type="button" onClick={resetAdminPanel}>
                  Reset Defaults
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="admin-section">
          <div className="section-head">
            <div>
              <h2>Mechanics</h2>
              <p>View and edit mechanic listings used in the app.</p>
            </div>
            <button className="btn-primary btn-add-shop" type="button" onClick={handleAddMechanic}>
              Add Shop
            </button>
          </div>

          <div className="admin-filters">
            <div className="filter-item">
              <label>Search shops</label>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, address, contact or description"
              />
            </div>
            <div className="filter-item">
              <label>Availability</label>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
              >
                {availabilityOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label>Service</label>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
              >
                <option value="All">All</option>
                {allServices.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label>Sort By</label>
              <select
                value={mechanicSortBy}
                onChange={(e) => setMechanicSortBy(e.target.value)}
              >
                <option value="Newest">Newest</option>
                <option value="Rating">Top Rating</option>
                <option value="Reviews">Most Reviews</option>
                <option value="Featured">Featured</option>
                <option value="Active">Active Status</option>
              </select>
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Rating</th>
                  <th>Reviews</th>
                  <th>Availability</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedMechanics.map((mechanic) => (
                  <tr key={mechanic.id}>
                    <td>{mechanic.name}</td>
                    <td>
                      <strong>{mechanic.contactPerson || mechanic.name}</strong>
                      <br />
                      <span>{mechanic.contactNumber || 'No contact'}</span>
                    </td>
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
                      <button
                        className="btn-secondary"
                        style={{ marginLeft: '8px', background: '#f8d7da', color: '#842029' }}
                        onClick={() => deleteMechanic(mechanic.id)}
                      >
                        Delete
                      </button>
                      <button
                        className="btn-secondary"
                        style={{ marginLeft: '8px' }}
                        onClick={() => duplicateMechanic(mechanic)}
                      >
                        Duplicate
                      </button>
                      <button
                        className="btn-secondary"
                        style={{ marginLeft: '8px' }}
                        onClick={() => toggleMechanicFeatured(mechanic.id)}
                      >
                        {mechanic.featured ? 'Unfeature' : 'Feature'}
                      </button>
                      {mechanic.googleMapsUrl && (
                        <a
                          href={mechanic.googleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-secondary btn-map-link"
                          style={{ marginLeft: '8px' }}
                        >
                          Map
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-section">
          <div className="section-head">
            <div>
              <h2>Users</h2>
              <p>Manage app users and admin accounts.</p>
            </div>
            <button className="btn-primary btn-add-shop" type="button" onClick={handleAddUser}>
              Add User
            </button>
          </div>

          <div className="admin-filters">
            <div className="filter-item">
              <label>Search users</label>
              <input
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                placeholder="Search by name, mobile, role or referral"
              />
            </div>
            <div className="filter-item">
              <label>Role</label>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="filter-item">
              <label>Status</label>
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Referral Code</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.mobileNumber}</td>
                    <td>{user.role}</td>
                    <td>{user.status}</td>
                    <td>{user.referralCode || '-'}</td>
                    <td>
                      <button
                        className="btn-secondary"
                        onClick={() => startUserEdit(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-secondary"
                        style={{ marginLeft: '8px', background: '#f8d7da', color: '#842029' }}
                        onClick={() => deleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-section">
          <div className="section-head">
            <div>
              <h2>Promotions</h2>
              <p>Create, edit, and manage coupon codes for customers.</p>
            </div>
            <button className="btn-primary btn-add-shop" type="button" onClick={addPromotionCode}>
              Add Promotion
            </button>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Expires On</th>
                  <th>Description</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {promotionCodes.map((promo) => (
                  <tr key={promo.id}>
                    <td>{promo.code}</td>
                    <td>{promo.discount}</td>
                    <td>{promo.expiresOn}</td>
                    <td>{promo.description}</td>
                    <td>{promo.active ? 'Yes' : 'No'}</td>
                    <td>
                      <input
                        type="text"
                        value={promo.description}
                        onChange={(e) => updatePromotionField(promo.id, 'description', e.target.value)}
                        style={{ width: '140px' }}
                      />
                      <select
                        value={promo.active ? 'Active' : 'Inactive'}
                        onChange={(e) => updatePromotionField(promo.id, 'active', e.target.value === 'Active')}
                        style={{ marginLeft: '8px' }}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      <button
                        className="btn-secondary"
                        style={{ marginLeft: '8px', background: '#f8d7da', color: '#842029' }}
                        onClick={() => deletePromotionCode(promo.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-section">
          <div className="section-head">
            <div>
              <h2>Notification Center</h2>
              <p>Send announcements to all users and track broadcast history.</p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="input-row input-full">
              <label>Notification Message</label>
              <textarea
                rows="3"
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                placeholder="Enter broadcast message"
              />
            </div>
            <div className="button-row">
              <button className="btn-primary" type="button" onClick={broadcastNotification}>
                Send Notification
              </button>
            </div>
          </div>

          <div className="admin-table-wrapper" style={{ marginTop: '18px' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Message</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {notificationHistory.map((note) => (
                  <tr key={note.id}>
                    <td>{note.message}</td>
                    <td>{note.time}</td>
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
              <div className="input-row">
                <label>Status</label>
                <select
                  value={editMechanic.status}
                  onChange={(e) => updateMechanicField('status', e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Paused">Paused</option>
                </select>
              </div>
              <div className="input-row">
                <label>Category</label>
                <input
                  value={editMechanic.category}
                  onChange={(e) => updateMechanicField('category', e.target.value)}
                />
              </div>
              <div className="input-row">
                <label>Price Range</label>
                <input
                  value={editMechanic.priceRange}
                  onChange={(e) => updateMechanicField('priceRange', e.target.value)}
                />
              </div>
              <div className="input-row">
                <label>Opening Hours</label>
                <input
                  value={editMechanic.openingHours}
                  onChange={(e) => updateMechanicField('openingHours', e.target.value)}
                />
              </div>
              <div className="input-row">
                <label>Featured</label>
                <select
                  value={editMechanic.featured ? 'Yes' : 'No'}
                  onChange={(e) => updateMechanicField('featured', e.target.value === 'Yes')}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              <div className="input-row input-full">
                <label>Address</label>
                <input
                  value={editMechanic.address}
                  onChange={(e) => updateMechanicField('address', e.target.value)}
                />
              </div>
              <div className="input-row">
                <label>Contact Person</label>
                <input
                  value={editMechanic.contactPerson || ''}
                  onChange={(e) => updateMechanicField('contactPerson', e.target.value)}
                />
              </div>
              <div className="input-row">
                <label>Contact Number</label>
                <input
                  value={editMechanic.contactNumber || ''}
                  onChange={(e) => updateMechanicField('contactNumber', e.target.value)}
                />
              </div>
              <div className="input-row input-full">
                <label>Google Maps Location Link</label>
                <input
                  value={editMechanic.googleMapsUrl || ''}
                  onChange={(e) => updateMechanicField('googleMapsUrl', e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                />
              </div>
              <div className="input-row">
                <label>Latitude</label>
                <input type="text" value={editMechanic.lat || ''} readOnly />
              </div>
              <div className="input-row">
                <label>Longitude</label>
                <input type="text" value={editMechanic.lng || ''} readOnly />
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

        {editUser && (
          <section className="admin-section">
            <div className="section-head">
              <div>
                <h2>Edit User</h2>
                <p>Update user details and save account settings.</p>
              </div>
            </div>

            <div className="settings-grid">
              <div className="input-row">
                <label>Name</label>
                <input
                  value={editUser.name}
                  onChange={(e) => updateUserField('name', e.target.value)}
                />
              </div>
              <div className="input-row">
                <label>Mobile Number</label>
                <input
                  value={editUser.mobileNumber}
                  onChange={(e) => updateUserField('mobileNumber', e.target.value)}
                />
              </div>
              <div className="input-row">
                <label>Role</label>
                <select
                  value={editUser.role}
                  onChange={(e) => updateUserField('role', e.target.value)}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="input-row">
                <label>Status</label>
                <select
                  value={editUser.status}
                  onChange={(e) => updateUserField('status', e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="input-row input-full">
                <label>Referral Code</label>
                <input
                  value={editUser.referralCode}
                  onChange={(e) => updateUserField('referralCode', e.target.value)}
                />
              </div>
            </div>

            <div className="button-row">
              <button className="btn-primary" onClick={saveUser}>
                Save User
              </button>
              <button className="btn-secondary" onClick={cancelUserEdit}>
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

          <div className="admin-filters">
            <div className="filter-item">
              <label>Search bookings</label>
              <input
                value={bookingSearchTerm}
                onChange={(e) => setBookingSearchTerm(e.target.value)}
                placeholder="Search by customer, mechanic, date or status"
              />
            </div>
            <div className="filter-item">
              <label>Status</label>
              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="filter-item">
              <label>Revenue total</label>
              <input value={`₹${totalRevenue}`} disabled />
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
                {filteredBookings.map((booking) => (
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
