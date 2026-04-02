import { useState } from 'react';
import axios from 'axios';

import adminService from '../services/admin.js';

function useUpload() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function upload(file, courseId) {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const params = await adminService.getPresignedUpload({
        filename: file.name,
        contentType: file.type,
        courseId
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('public_id', params.publicId);
      formData.append('folder', params.folder);
      formData.append('timestamp', params.timestamp);
      formData.append('signature', params.signature);
      formData.append('api_key', params.apiKey);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${params.cloudName}/video/upload`,
        formData,
        {
          onUploadProgress: (event) => {
            if (!event.total) {
              return;
            }

            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        }
      );

      setProgress(100);
      return response.data.public_id;
    } catch (err) {
      const message = err.response?.data?.error?.message || err.response?.data?.message || 'Video upload failed.';
      setError(message);
      throw err;
    } finally {
      setUploading(false);
    }
  }

  return {
    progress,
    uploading,
    error,
    upload
  };
}

export default useUpload;