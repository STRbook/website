import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

const isDevelopment = process.env.NODE_ENV === 'development';
const UPLOAD_DIR = 'uploads';

// Local storage utility functions
const saveFileLocally = async (file, userId, type) => {
  try {
    
    const fileName = `${Date.now()}-${file.name}`;
    const path = `${UPLOAD_DIR}/${type}/${userId}/${fileName}`;
    
    // Simulate local storage
    const localUrl = `/api/files/${path}`;
    console.log('File saved locally:', localUrl);
    return localUrl;
  } catch (error) {
    console.error('Error saving file locally:', error);
    throw error;
  }
};

// Firebase storage utility
const saveFileToFirebase = async (file, userId, type) => {
  try {
    const fileName = `${Date.now()}-${file.name}`;
    const path = `${type}/${userId}/${fileName}`;
    const storageRef = ref(storage, path);
    
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading to Firebase:', error);
    throw error;
  }
};

// Delete file utility
const deleteFile = async (fileUrl, userId, type) => {
  if (isDevelopment) {
    console.log('Development: Simulating file deletion:', fileUrl);
    return true;
  }

  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Main upload function that handles both development and production
export const uploadFile = async (file, userId, type) => {
  // Validate file type and size
  const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const validCertTypes = ['application/pdf'];
  const maxProfileSize = 2 * 1024 * 1024; // 2MB
  const maxCertSize = 10 * 1024 * 1024; // 10MB

  if (type === 'profiles' && !validImageTypes.includes(file.type)) {
    throw new Error('Invalid image type. Please upload JPG, PNG, or WebP.');
  }

  if (type === 'certificates' && !validCertTypes.includes(file.type)) {
    throw new Error('Invalid certificate type. Please upload PDF.');
  }

  if (type === 'profiles' && file.size > maxProfileSize) {
    throw new Error('Profile picture must be less than 2MB.');
  }

  if (type === 'certificates' && file.size > maxCertSize) {
    throw new Error('Certificate must be less than 10MB.');
  }

  // Upload based on environment
  return isDevelopment
    ? saveFileLocally(file, userId, type)
    : saveFileToFirebase(file, userId, type);
};

export const deleteUploadedFile = async (fileUrl, userId, type) => {
  return deleteFile(fileUrl, userId, type);
};
