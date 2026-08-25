import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import mechanics from "../data/mechanicsData";
import { mechanicsAPI } from "../services/api";
import "./MechanicDetails.css";

const loadStoredMechanicImages = (id) => {
  try {
    const data = JSON.parse(localStorage.getItem('mechanicImages') || '{}');
    return data[id] || [];
  } catch {
    return [];
  }
};

const toRad = (value) => (value * Math.PI) / 180;
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
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

function MechanicDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const mechanicFromState = location.state?.mechanic;
  const userLocation = location.state?.userLocation;
  const savedMechanics =
    JSON.parse(localStorage.getItem('adminMechanics') || 'null') || mechanics;

  const [mechanic, setMechanic] = useState(
    mechanicFromState || savedMechanics.find((item) => item.id === Number(id))
  );

  const [backendImages, setBackendImages] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);

  // Fetch full details from API if ID is available
  useEffect(() => {
    const fetchMechanic = async () => {
      if (!id) return;
      try {
        const response = await mechanicsAPI.getById(id);
        if (response.success && (response.data?.mechanic || response.mechanic)) {
          const fetched = response.data?.mechanic || response.mechanic;
          const formatted = {
            ...fetched,
            services: fetched.services ? fetched.services.map(s => typeof s === 'string' ? s : s.name) : ["General Service"]
          };
          setMechanic(formatted);
          if (Array.isArray(fetched.images)) {
            setBackendImages(fetched.images);
          }
        }
      } catch (err) {
        console.warn("Using local mechanic fallback:", err.message);
      }
    };

    fetchMechanic();
  }, [id]);

  useEffect(() => {
    const fetchMechanicImages = async () => {
      if (!mechanic?.id) return;
      try {
        const response = await mechanicsAPI.getImages(mechanic.id);
        const imagesList = response.data?.images || response.images;
        if (Array.isArray(imagesList)) {
          setBackendImages(imagesList);
        }
      } catch (error) {
        console.warn('Unable to load mechanic images from backend:', error);
      }
    };

    fetchMechanicImages();
  }, [mechanic?.id]);

  useEffect(() => {
    if (!userLocation || !mechanic) {
      setRouteInfo(null);
      return;
    }

    let active = true;
    const fetchRoute = async () => {
      try {
        const origin = `${userLocation.lng},${userLocation.lat}`;
        const destination = `${mechanic.lng},${mechanic.lat}`;
        const url = `https://router.project-osrm.org/route/v1/driving/${origin};${destination}?overview=false`;
        const response = await fetch(url);
        if (!response.ok) return;
        const data = await response.json();
        if (data.code !== "Ok" || !data.routes?.[0]) return;
        const route = data.routes[0];
        if (!active) return;
        setRouteInfo({
          distance: +(route.distance / 1000).toFixed(1),
          duration: Math.max(5, Math.round(route.duration / 60)),
        });
      } catch (error) {
        console.warn('OSRM route lookup failed:', error);
      }
    };

    fetchRoute();

    return () => {
      active = false;
    };
  }, [userLocation, mechanic]);

  if (!mechanic) {
    return (
      <div className="page-shell">
        <div className="page-card">
          <h2>Mechanic not found</h2>
          <p>The mechanic you selected does not exist.</p>
          <button className="btn-back-page" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const storedImages = mechanic?.id ? loadStoredMechanicImages(mechanic.id) : [];
  const galleryImages = [...new Set([...(mechanic.images || []), ...storedImages, ...backendImages])];

  const travelDistance = routeInfo?.distance ?? (userLocation
    ? getDistanceFromLatLonInKm(
        userLocation.lat,
        userLocation.lng,
        mechanic.lat,
        mechanic.lng
      )
    : null);

  const openNavigation = () => {
    if (mechanic.googleMapsUrl) {
      window.open(mechanic.googleMapsUrl, "_blank");
      return;
    }

    if (!userLocation) {
      alert("Please fetch your current location from the dashboard first.");
      return;
    }

    const origin = `${userLocation.lat},${userLocation.lng}`;
    const destination = `${mechanic.lat},${mechanic.lng}`;
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    window.open(mapsUrl, "_blank");
  };

  return (
    <div className="page-shell">
      <div className="mechanic-details-card">
        <button className="btn-back-page smaller" onClick={() => navigate("/dashboard")}>← Back</button>
        <div className="mechanic-top">
          <div className="mechanic-avatar-large">{mechanic.image}</div>
          <div>
            <h2>{mechanic.name}</h2>
            <p className="mechanic-address">{mechanic.address}</p>
            <p className="mechanic-contact">
              <strong>Contact:</strong>{' '}
              {mechanic.contactPerson || mechanic.name}
              {mechanic.contactNumber ? ` • ${mechanic.contactNumber}` : ''}
            </p>
            <p className="mechanic-description">{mechanic.description}</p>
          </div>
        </div>

        <div className="mechanic-metrics">
          <div>
            <strong>Rating</strong>
            <p>⭐ {mechanic.rating} ({mechanic.reviews || mechanic.reviewsCount || 0} reviews)</p>
          </div>
          <div>
            <strong>Availability</strong>
            <p>{mechanic.availability}</p>
          </div>
          <div>
            <strong>Distance</strong>
            <p>{travelDistance ? `${travelDistance} km away` : mechanic.distance}</p>
          </div>
        </div>

        <div className="mechanic-services-list">
          <h3>Services Offered</h3>
          <ul>
            {(mechanic.services || []).map((service, idx) => (
              <li key={idx}>{typeof service === 'string' ? service : service.name}</li>
            ))}
          </ul>
        </div>

        {galleryImages.length > 0 && (
          <div className="mechanic-gallery">
            <h3>Shop Images</h3>
            <div className="gallery-grid">
              {galleryImages.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`${mechanic.name} shop ${idx + 1}`}
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
          </div>
        )}

        <div className="mechanic-actions">
          <button className="btn-primary" onClick={() => navigate("/book", { state: { mechanic, userLocation } })}>
            Book Now
          </button>
          <button className="btn-secondary" onClick={openNavigation}>
            Start Navigation
          </button>
          {mechanic.googleMapsUrl && (
            <button
              className="btn-secondary"
              onClick={() => window.open(mechanic.googleMapsUrl, "_blank")}
            >
              Open in Google Maps
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MechanicDetails;
