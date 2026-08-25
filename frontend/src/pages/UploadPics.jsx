import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mechanicsAPI } from '../services/api';
import './UploadPics.css';

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const getStoredMechanicImages = () => {
  try {
    return JSON.parse(localStorage.getItem('mechanicImages') || '{}');
  } catch {
    return {};
  }
};

const UploadPics = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const mechanicId = location.state?.mechanicId;

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mechanicId) {
      navigate('/admin');
      return;
    }

    const fetchExistingImages = async () => {
      try {
        const response = await mechanicsAPI.getImages(mechanicId);
        const imagesList = response.data?.images || response.images;
        if (Array.isArray(imagesList) && imagesList.length > 0) {
          setExistingImages(imagesList);
          return;
        }
      } catch (error) {
        console.warn('Could not load backend mechanic images:', error.message);
      }

      const stored = getStoredMechanicImages();
      setExistingImages(stored[mechanicId] || []);
    };

    fetchExistingImages();
  }, [mechanicId, navigate]);

  useEffect(() => {
    if (!selectedFiles.length) {
      setPreviewUrls([]);
      return;
    }

    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  const handleFileChange = (event) => {
    setError('');
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      setSelectedFiles([]);
      return;
    }
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) {
      setError('Please choose one or more images to upload.');
      return;
    }

    setLoading(true);
    try {
      const dataUrls = await Promise.all(
        selectedFiles.map((file) => readFileAsDataUrl(file))
      );

      try {
        const response = await mechanicsAPI.uploadImages(mechanicId, dataUrls);
        const imagesList = response.data?.images || response.images;
        if (Array.isArray(imagesList)) {
          localStorage.setItem('mechanicImages', JSON.stringify({
            ...getStoredMechanicImages(),
            [mechanicId]: imagesList
          }));
          navigate('/admin');
          return;
        }
      } catch (error) {
        console.warn('Failed to save images to backend:', error.message);
      }

      const stored = getStoredMechanicImages();
      const existing = stored[mechanicId] || [];
      stored[mechanicId] = [...existing, ...dataUrls];
      localStorage.setItem('mechanicImages', JSON.stringify(stored));
      navigate('/admin');
    } catch (err) {
      console.error(err);
      setError('Failed to upload images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin');
  };

  const mechanicLabel = useMemo(() => {
    return `Mechanic #${mechanicId}`;
  }, [mechanicId]);

  return (
    <div className="upload-page-shell">
      <div className="upload-card">
        <button className="btn-back-page smaller" onClick={handleCancel}>
          ← Back to Admin
        </button>
        <h2>Upload Shop Images</h2>
        <p>Add pictures from your local device. Uploaded images will appear on the dashboard and mechanic details pages.</p>

        <div className="upload-info">
          <strong>{mechanicLabel}</strong>
          <p>Choose one or more images below.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <label className="file-input-label">
          Select Images
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />
        </label>

        {previewUrls.length > 0 && (
          <div className="preview-grid">
            {previewUrls.map((src, idx) => (
              <div key={idx} className="preview-item">
                <img src={src} alt={`Preview ${idx + 1}`} />
              </div>
            ))}
          </div>
        )}

        {existingImages.length > 0 && (
          <div className="existing-images-section">
            <h3>Already uploaded images</h3>
            <div className="preview-grid">
              {existingImages.map((src, idx) => (
                <div key={idx} className="preview-item">
                  <img src={src} alt={`Existing ${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="upload-actions">
          <button className="btn-primary" onClick={handleUpload} disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Images'}
          </button>
          <button className="btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadPics;
