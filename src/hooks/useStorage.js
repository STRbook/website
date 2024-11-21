import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

const useStorage = () => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState(null);

  const uploadFile = (file) => {
    if (!file) return;

    // Check file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      setError('File size exceeds 2MB limit');
      return Promise.reject(new Error('File size exceeds 2MB limit'));
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return Promise.reject(new Error('Only image files are allowed'));
    }

    const storageRef = ref(storage, `profile-pictures/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(percentage);
        },
        (error) => {
          setError(error.message);
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            setUrl(downloadUrl);
            setError(null);
            resolve(downloadUrl);
          } catch (err) {
            setError('Failed to get download URL');
            reject(err);
          }
        }
      );
    });
  };

  return { progress, url, error, uploadFile };
};

export default useStorage;
