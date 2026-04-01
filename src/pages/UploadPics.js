import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './UploadPics.css';

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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

  useEffect(() => {
    if (!mechanicId) {
      navigate('/admin');
      return;
    }

    const fetchExistingImages = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/mechanics/${mechanicId}/images`);
        const data = await response.json();
        if (response.ok && Array.isArray(data.images)) {
          setExistingImages(data.images);
          return;
        }
      } catch (error) {
        console.warn('Could not load backend mechanic images:', error);
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

    try {
      const dataUrls = await Promise.all(
        selectedFiles.map((file) => readFileAsDataUrl(file))
      );

      try {
        const response = await fetch(`${API_BASE_URL}/api/mechanics/${mechanicId}/images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ images: dataUrls })
        });
        const data = await response.json();
        if (response.ok && data.success) {
          localStorage.setItem('mechanicImages', JSON.stringify({
            ...getStoredMechanicImages(),
            [mechanicId]: data.images
          }));
          navigate('/admin');
          return;
        }
      } catch (error) {
        console.warn('Failed to save images to backend:', error);
      }

      const stored = getStoredMechanicImages();
      const existing = stored[mechanicId] || [];
      stored[mechanicId] = [...existing, ...dataUrls];
      localStorage.setItem('mechanicImages', JSON.stringify(stored));
      navigate('/admin');
    } catch (err) {
      console.error(err);
      setError('Failed to upload images. Please try again.');
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

        {error && <div className="alert-error">{error}</div>}

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
          <button className="btn-primary" onClick={handleUpload}>
            Upload Images
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
