import React, { useState, useRef } from 'react';
import { uploadFile } from '../utils/storage';
import './styles/FileUpload.css';

const FileUpload = ({ 
  type, 
  semester, 
  onUploadSuccess, 
  onUploadError,
  acceptedTypes,
  maxSize,
  preview = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      onUploadError(`Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`);
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      onUploadError(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    setUploading(true);
    try {
      const downloadUrl = await uploadFile(file, type, semester);
      onUploadSuccess(downloadUrl);
    } catch (error) {
      onUploadError(error.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  return (
    <div 
      className={`file-upload ${dragOver ? 'drag-over' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept={acceptedTypes.join(',')}
        style={{ display: 'none' }}
      />
      
      {uploading ? (
        <div className="upload-progress">
          <div 
            className="progress-bar"
            style={{ width: `${progress}%` }}
          />
          <span>{progress}%</span>
        </div>
      ) : (
        <div className="upload-content">
          <i className="fas fa-cloud-upload-alt" />
          <p>Drag & Drop or Click to Upload</p>
          <span className="file-info">
            {type === 'profile' 
              ? 'Accepted: JPG, PNG, WebP (max 2MB)'
              : 'Accepted: PDF (max 10MB)'}
          </span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
