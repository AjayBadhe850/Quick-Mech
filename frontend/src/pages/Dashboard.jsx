import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import defaultMechanics from "../data/mechanicsData";
import { mechanicsAPI, authAPI } from "../services/api";
import "./Dashboard.css";

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

  const [mechanicsList, setMechanicsList] = useState(() => {
    return JSON.parse(localStorage.getItem('adminMechanics') || 'null') || defaultMechanics;
  });

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
    if (storedUser?.mobileNumber && storedUser?.username) {
      authAPI.recordSession({
        mobileNumber: storedUser.mobileNumber,
        username: storedUser.username,
        eventType: 'logout'
      });
    }

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  const [location, setLocation] = useState(null);
  const [routeInfo, setRouteInfo] = useState({});
  const [locationName, setLocationName] = useState("");
  const [locationError, setLocationError] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [distanceFilter, setDistanceFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Recommended");
  const [favorites, setFavorites] = useState(() =>
    JSON.parse(localStorage.getItem("favoriteShops") || "[]")
  );
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState(() =>
    JSON.parse(localStorage.getItem("recentlyViewedShops") || "[]")
  );
  const [vehicleFilter, setVehicleFilter] = useState("All");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showOfferOnly, setShowOfferOnly] = useState(false);
  const [showCertifiedOnly, setShowCertifiedOnly] = useState(false);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [theme] = useState(
    localStorage.getItem("dashboardTheme") || "light"
  );
  const [savedLocations] = useState(() =>
    JSON.parse(localStorage.getItem("savedLocations") || "[]")
  );
  const [selectedLocationLabel, setSelectedLocationLabel] = useState("Current");
  const [showOffersPanel, setShowOffersPanel] = useState(true);
  const [viewMode] = useState("grid");
  const [savedSearches] = useState(() =>
    JSON.parse(localStorage.getItem("savedSearches") || "[]")
  );

  // Fetch mechanics from backend API with fallback
  useEffect(() => {
    const loadMechanics = async () => {
      try {
        const response = await mechanicsAPI.getAll();
        if (response.success && Array.isArray(response.data?.mechanics || response.mechanics)) {
          const fetched = response.data?.mechanics || response.mechanics;
          if (fetched.length > 0) {
            const formatted = fetched.map(m => ({
              ...m,
              services: m.services ? m.services.map(s => typeof s === 'string' ? s : s.name) : ["General Service"]
            }));
            setMechanicsList(formatted);
          }
        }
      } catch (err) {
        console.warn("Using fallback local mechanics data:", err.message);
      }
    };
    loadMechanics();
  }, []);

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

  const fetchRouteInfoForMechanic = useCallback(async (mechanic) => {
    if (!location) return null;
    const origin = `${location.lng},${location.lat}`;
    const destination = `${mechanic.lng},${mechanic.lat}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${origin};${destination}?overview=false`;

    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      const data = await response.json();
      if (data.code !== "Ok" || !data.routes?.[0]) return null;

      const route = data.routes[0];
      return {
        distance: +(route.distance / 1000).toFixed(1),
        duration: Math.max(5, Math.round(route.duration / 60)),
      };
    } catch (error) {
      console.warn("OSRM route lookup failed:", error);
      return null;
    }
  }, [location]);

  useEffect(() => {
    if (!location) {
      setRouteInfo({});
      return;
    }

    let isMounted = true;
    const fetchRoutes = async () => {
      const routeResults = {};

      await Promise.all(
        mechanicsList.map(async (mechanic) => {
          const route = await fetchRouteInfoForMechanic(mechanic);
          if (route && isMounted) {
            routeResults[mechanic.id] = route;
          }
        })
      );

      if (isMounted) {
        setRouteInfo(routeResults);
      }
    };

    fetchRoutes();

    return () => {
      isMounted = false;
    };
  }, [location, mechanicsList, fetchRouteInfoForMechanic]);

  useEffect(() => {
    localStorage.setItem("favoriteShops", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("recentlyViewedShops", JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    localStorage.setItem("dashboardTheme", theme);
  }, [theme]);

  useEffect(() => {
    if (savedLocations.length > 0) {
      localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
    }
  }, [savedLocations]);

  const openNavigation = (mechanic) => {
    markRecentlyViewed(mechanic);
    if (mechanic.googleMapsUrl) {
      window.open(mechanic.googleMapsUrl, "_blank");
      return;
    }

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

  const startSupportChat = () => {
    window.open("mailto:support@quickmech.com?subject=Need%20Help%20with%20QuickMech", "_blank");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setServiceFilter("All");
    setAvailabilityFilter("All");
    setDistanceFilter("All");
    setVehicleFilter("All");
    setShowFeaturedOnly(false);
    setShowOfferOnly(false);
    setShowCertifiedOnly(false);
    setShowNewOnly(false);
  };

  const selectSavedLocation = (locationItem) => {
    setSelectedLocationLabel(locationItem.label);
    setLocation({ lat: locationItem.lat, lng: locationItem.lng });
    setLocationName(`${locationItem.label} location`);
  };

  const copyMechanicLink = (mechanic) => {
    const url = `${window.location.origin}/mechanic/${mechanic.id}`;
    navigator.clipboard.writeText(url);
    alert("Mechanic link copied to clipboard");
  };

  const getServiceIcon = (service) => {
    const s = String(service).toLowerCase();
    if (s.includes("oil")) return "🛢️";
    if (s.includes("brake")) return "🛞";
    if (s.includes("engine")) return "⚙️";
    if (s.includes("battery")) return "🔋";
    if (s.includes("tire")) return "🚗";
    if (s.includes("ac")) return "❄️";
    return "🔧";
  };

  const estimateCost = (mechanic) => {
    const base = mechanic.rating ? 150 + mechanic.rating * 10 : 200;
    return `₹${Math.round(base + (mechanic.offer ? 75 : 0))}`;
  };

  const getMechanicScore = (mechanic) => {
    const distance = getMechanicDistance(mechanic);
    return (
      (mechanic.rating || 0) * 20 +
      (mechanic.certified ? 15 : 0) +
      (mechanic.offer ? 10 : 0) -
      distance
    );
  };

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
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

  const getMechanicDistance = (mechanic) => {
    if (location) {
      const route = routeInfo[mechanic.id];
      if (route?.distance != null) return route.distance;

      return getDistanceFromLatLonInKm(
        location.lat,
        location.lng,
        mechanic.lat,
        mechanic.lng
      );
    }

    const match = String(mechanic.distance || '').match(/([\d.]+)/);
    return match ? parseFloat(match[1]) : 999;
  };

  const getDistanceCategory = (mechanic) => {
    const distance = getMechanicDistance(mechanic);
    if (distance < 5) return "Within 5 km";
    if (distance < 10) return "5-10 km";
    return "10+ km";
  };

  const toggleFavorite = (mechanicId) => {
    setFavorites((prev) =>
      prev.includes(mechanicId)
        ? prev.filter((id) => id !== mechanicId)
        : [...prev, mechanicId]
    );
  };

  const markRecentlyViewed = (mechanic) => {
    setRecentlyViewed((prev) => {
      const next = [mechanic, ...prev.filter((item) => item.id !== mechanic.id)];
      return next.slice(0, 5);
    });
  };

  const estimateEta = (mechanic) => {
    if (location) {
      const route = routeInfo[mechanic.id];
      if (route?.duration != null) return `${route.duration} min`;
    }

    const distance = getMechanicDistance(mechanic);
    return `${Math.max(5, Math.round(distance * 2))} min`;
  };

  const categoryOptions = [
    "All",
    ...Array.from(new Set(mechanicsList.map((mechanic) => mechanic.category || "")))
      .filter(Boolean)
      .sort(),
  ];

  const serviceOptions = [
    "All",
    ...Array.from(
      new Set(mechanicsList.flatMap((mechanic) => mechanic.services || []))
    ).sort(),
  ];

  const availabilityOptions = [
    "All",
    ...Array.from(
      new Set(mechanicsList.map((mechanic) => mechanic.availability || ""))
    )
      .filter(Boolean)
      .sort(),
  ];

  const favoriteCount = favorites.length;
  const certifiedCount = mechanicsList.filter((mechanic) => mechanic.certified).length;
  const offerCount = mechanicsList.filter((mechanic) => mechanic.offer).length;
  const newShopsCount = mechanicsList.filter((mechanic) => mechanic.isNew).length;
  const activeNowCount = mechanicsList.filter((mechanic) =>
    mechanic.availability?.toLowerCase().includes("available")
  ).length;

  const serviceFrequency = mechanicsList
    .flatMap((mechanic) => mechanic.services || [])
    .reduce((acc, service) => {
      acc[service] = (acc[service] || 0) + 1;
      return acc;
    }, {});

  const popularServices = Object.entries(serviceFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([service]) => service);

  const filteredMechanics = mechanicsList.filter((mechanic) => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      query === "" ||
      [
        mechanic.name,
        mechanic.address,
        mechanic.description,
        mechanic.contactPerson,
        mechanic.contactNumber,
        mechanic.category,
        ...(mechanic.services || []),
      ]
        .filter(Boolean)
        .some((text) => String(text).toLowerCase().includes(query));

    const matchesService =
      serviceFilter === "All" || mechanic.services?.includes(serviceFilter);

    const matchesAvailability =
      availabilityFilter === "All" || mechanic.availability === availabilityFilter;

    const matchesDistance =
      distanceFilter === "All" || getDistanceCategory(mechanic) === distanceFilter;

    const matchesCategory =
      vehicleFilter === "All" || mechanic.category === vehicleFilter;

    const matchesFeatured = !showFeaturedOnly || mechanic.featured;
    const matchesOffer = !showOfferOnly || mechanic.offer;
    const matchesCertified = !showCertifiedOnly || mechanic.certified;
    const matchesNew = !showNewOnly || mechanic.isNew;

    const matchesFavorite = !showOnlyFavorites || favorites.includes(mechanic.id);

    return (
      matchesSearch &&
      matchesService &&
      matchesAvailability &&
      matchesDistance &&
      matchesCategory &&
      matchesFeatured &&
      matchesOffer &&
      matchesCertified &&
      matchesNew &&
      matchesFavorite
    );
  });

  const sortedMechanics = [...filteredMechanics].sort((a, b) => {
    if (sortBy === "Nearest") {
      return getMechanicDistance(a) - getMechanicDistance(b);
    }
    if (sortBy === "Best Rating") {
      return b.rating - a.rating;
    }
    if (sortBy === "Most Reviews") {
      return (b.reviews || b.reviewsCount || 0) - (a.reviews || a.reviewsCount || 0);
    }
    if (sortBy === "Best Value") {
      return getMechanicScore(b) - getMechanicScore(a);
    }
    if (sortBy === "Best Offer") {
      const aOffer = a.offer ? 1 : 0;
      const bOffer = b.offer ? 1 : 0;
      return bOffer - aOffer || b.rating - a.rating;
    }
    if (sortBy === "Featured") {
      const aFeatured = a.featured ? 1 : 0;
      const bFeatured = b.featured ? 1 : 0;
      return bFeatured - aFeatured || b.rating - a.rating;
    }
    if (sortBy === "New") {
      const aNew = a.isNew ? 1 : 0;
      const bNew = b.isNew ? 1 : 0;
      return bNew - aNew || b.rating - a.rating;
    }
    return getMechanicScore(b) - getMechanicScore(a);
  });

  const nearbyCount = mechanicsList.filter(
    (mechanic) => getMechanicDistance(mechanic) < 5
  ).length;

  const topPicks = sortedMechanics.slice(0, 3);

  return (
    <div className={`dashboard-container ${theme}`}>
      <header className="dashboard-header">
        <div className="header-content">
          <svg viewBox="0 0 500 100" className="signature-logo">
            <text x="10" y="70" className="signature-text">
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

      <main className="dashboard-main">
        <div className="dashboard-section">
          <h2 className="section-title">Find Mechanics Near You</h2>

          <div className="dashboard-summary-row">
            <div className="dashboard-stats">
              <span>{filteredMechanics.length} shops found</span>
              <span>{nearbyCount} within 5 km</span>
              <span>{mechanicsList.length} total listings</span>
            </div>
            <div className="dashboard-filters">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search shop, service, address..."
              />
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
              >
                {serviceOptions.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
              >
                {availabilityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={distanceFilter}
                onChange={(e) => setDistanceFilter(e.target.value)}
              >
                <option value="All">All distances</option>
                <option value="Within 5 km">Within 5 km</option>
                <option value="5-10 km">5-10 km</option>
                <option value="10+ km">10+ km</option>
              </select>
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="Recommended">Recommended</option>
                <option value="Nearest">Nearest</option>
                <option value="Best Rating">Best Rating</option>
                <option value="Most Reviews">Most Reviews</option>
                <option value="Best Value">Best Value</option>
                <option value="Best Offer">Best Offer</option>
                <option value="Featured">Featured</option>
                <option value="New">New</option>
              </select>
              <button
                className="filter-toggle"
                type="button"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
              <button
                className={`filter-toggle ${showOnlyFavorites ? 'active' : ''}`}
                type="button"
                onClick={() => setShowOnlyFavorites((prev) => !prev)}
              >
                {showOnlyFavorites ? 'Showing favorites' : 'Show favorites'}
              </button>
            </div>
          </div>

          <div className="dashboard-toggles">
            <button
              className={`toggle-chip ${showFeaturedOnly ? 'active' : ''}`}
              type="button"
              onClick={() => setShowFeaturedOnly((prev) => !prev)}
            >
              Featured only
            </button>
            <button
              className={`toggle-chip ${showOfferOnly ? 'active' : ''}`}
              type="button"
              onClick={() => setShowOfferOnly((prev) => !prev)}
            >
              Offers only
            </button>
            <button
              className={`toggle-chip ${showCertifiedOnly ? 'active' : ''}`}
              type="button"
              onClick={() => setShowCertifiedOnly((prev) => !prev)}
            >
              Certified only
            </button>
            <button
              className={`toggle-chip ${showNewOnly ? 'active' : ''}`}
              type="button"
              onClick={() => setShowNewOnly((prev) => !prev)}
            >
              New arrivals
            </button>
          </div>

          <div className="dashboard-metrics-grid">
            <div className="metric-block">
              <span>Certified mechanics</span>
              <strong>{certifiedCount}</strong>
            </div>
            <div className="metric-block">
              <span>Active offers</span>
              <strong>{offerCount}</strong>
            </div>
            <div className="metric-block">
              <span>New arrivals</span>
              <strong>{newShopsCount}</strong>
            </div>
            <div className="metric-block">
              <span>Available now</span>
              <strong>{activeNowCount}</strong>
            </div>
            <div className="metric-block">
              <span>Saved searches</span>
              <strong>{savedSearches.length}</strong>
            </div>
            <div className="metric-block">
              <span>Favorites</span>
              <strong>{favoriteCount}</strong>
            </div>
          </div>

          {locationName && (
            <>
              <p style={{ marginBottom: "10px" }}>
                📍 You are in: {locationName}
                {selectedLocationLabel !== "Current" ? ` (${selectedLocationLabel})` : ""}
                {loadingLocation && " (updating...)"}
              </p>
              {savedLocations.length > 0 && (
                <div className="location-shortcuts">
                  {savedLocations.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className="saved-location-chip"
                      onClick={() => selectSavedLocation(item)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          {locationError && (
            <p style={{ color: "#d9534f", marginBottom: "10px" }}>
              ⚠️ {locationError}
            </p>
          )}

          {topPicks.length > 0 && (
            <div className="top-picks-section">
              <div className="top-picks-header">
                <h3>Top Picks</h3>
                <p>Best-rated shops based on user ratings.</p>
              </div>
              <div className="top-picks-grid">
                {topPicks.map((mechanic) => (
                  <div key={mechanic.id} className="top-pick-card">
                    <div className="top-pick-row">
                      <span className="top-pick-avatar">{mechanic.image}</span>
                      <div>
                        <h4>{mechanic.name}</h4>
                        <p>{mechanic.address}</p>
                      </div>
                    </div>
                    <div className="top-pick-tags">
                      {mechanic.certified && <span>Certified</span>}
                      {mechanic.offer && <span>{mechanic.offer}</span>}
                      <span>⭐ {mechanic.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {popularServices.length > 0 && (
            <div className="popular-services-section">
              <div className="top-picks-header">
                <h3>Trending Services</h3>
                <div className="offers-header-actions">
                  <button
                    className="btn-secondary"
                    type="button"
                    onClick={() => setShowOffersPanel((prev) => !prev)}
                  >
                    {showOffersPanel ? "Hide offers" : "Show offers"}
                  </button>
                </div>
              </div>
              <p>Most requested repair services nearby.</p>
              {showOffersPanel && (
                <div className="popular-services-grid">
                  {popularServices.map((service) => (
                    <button
                      key={service}
                      className="service-chip"
                      type="button"
                      onClick={() => {
                        setSearchTerm(service);
                        setShowOnlyFavorites(false);
                      }}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {recentlyViewed.length > 0 && (
            <div className="recently-viewed-section">
              <div className="recently-viewed-header">
                <h3>Recently Viewed</h3>
                <p>Quickly return to shops you've checked before.</p>
              </div>
              <div className="recently-viewed-list">
                {recentlyViewed.map((mechanic) => (
                  <button
                    key={mechanic.id}
                    className="recently-viewed-chip"
                    onClick={() => {
                      setSearchTerm('');
                      setShowOnlyFavorites(false);
                      navigate(`/mechanic/${mechanic.id}`, {
                        state: { mechanic, userLocation: location },
                      });
                    }}
                  >
                    {mechanic.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sortedMechanics.length === 0 && (
            <p className="empty-state">
              No shops match your search or filter settings. Try changing the search term or clearing filters.
            </p>
          )}

          <div className={`mechanics-grid ${viewMode}-view`}>
            {sortedMechanics.map((mechanic) => {
              return (
                <div
                  key={mechanic.id}
                  className="mechanic-card"
                  onClick={() => {
                    markRecentlyViewed(mechanic);
                    navigate(`/mechanic/${mechanic.id}`, {
                      state: { mechanic, userLocation: location },
                    });
                  }}
                >
                  <div className="mechanic-header">
                    <div className="mechanic-avatar">
                      {mechanic.image}
                    </div>

                    <div className="mechanic-info">
                      <h3 className="mechanic-name">
                        {mechanic.name}
                      </h3>
                      <p className="mechanic-contact-info">
                        {mechanic.contactPerson || mechanic.name}
                        {mechanic.contactNumber ? ` • ${mechanic.contactNumber}` : ''}
                      </p>
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
                      <p className="mechanic-eta">ETA: {estimateEta(mechanic)}</p>
                      <p className="mechanic-cost">Approx {estimateCost(mechanic)}</p>
                      <div className="mechanic-badges">
                        {mechanic.certified && <span>Certified</span>}
                        {mechanic.offer && <span className="offer-badge">{mechanic.offer}</span>}
                        {mechanic.isNew && <span>New</span>}
                      </div>
                    </div>

                    <button
                      className={`btn-favorite ${favorites.includes(mechanic.id) ? 'active' : ''}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(mechanic.id);
                      }}
                    >
                      {favorites.includes(mechanic.id) ? '★' : '☆'}
                    </button>
                  </div>

                  <div className="mechanic-services">
                    <p className="services-label">Services:</p>
                    <div className="services-tags">
                      {mechanic.services.map((service, idx) => (
                        <span key={idx} className="service-tag">
                          {getServiceIcon(service)} {service}
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
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        markRecentlyViewed(mechanic);
                        navigate("/book", {
                          state: {
                            mechanic: mechanic,
                            userLocation: location,
                            placeName: locationName,
                          },
                        });
                      }}
                    >
                      Book Now
                    </button>

                    <button
                      className="btn-nav"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openNavigation(mechanic);
                      }}
                    >
                      Start Navigation
                    </button>
                    <button
                      className="btn-secondary"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyMechanicLink(mechanic);
                      }}
                    >
                      Share
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="quick-actions">
          <h2 className="section-title">Quick Actions</h2>

          <div className="actions-list">
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
            <button
              className="action-btn"
              onClick={() => navigate("/ratings-reviews")}
            >
              <span className="action-icon">⭐</span>
              <span className="action-text">
                Ratings & Reviews
              </span>
            </button>
            <button
              className="action-btn"
              onClick={startSupportChat}
            >
              <span className="action-icon">💬</span>
              <span className="action-text">
                Live Support
              </span>
            </button>
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
      </main>
    </div>
  );
};

export default Dashboard;
