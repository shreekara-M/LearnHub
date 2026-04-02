const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

function getSignedUploadParams(folder, publicId) {
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = {
    folder,
    public_id: publicId,
    timestamp
  };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
    publicId
  };
}

function createSignedStreamUrl(publicId, expiresIn = 900) {
  const expireAt = Math.round(Date.now() / 1000) + expiresIn;

  return cloudinary.url(publicId, {
    resource_type: 'video',
    type: 'authenticated',
    sign_url: true,
    secure: true,
    expires_at: expireAt
  });
}

module.exports = {
  cloudinary,
  getSignedUploadParams,
  createSignedStreamUrl
};