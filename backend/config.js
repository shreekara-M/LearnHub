const REQUIRED_ENV_KEYS = [
  'DATABASE_URL',
  'DIRECT_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'RESEND_API_KEY',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'FRONTEND_URL'
];

function validateEnv(env = process.env) {
  const missing = REQUIRED_ENV_KEYS.filter((key) => {
    const value = env[key];
    return value === undefined || String(value).trim() === '';
  });

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return true;
}

module.exports = {
  validateEnv,
  REQUIRED_ENV_KEYS
};