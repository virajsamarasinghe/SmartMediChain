// API configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://135.235.193.242:3001/api';

// Token configuration
export const TOKEN_KEY = 'token';
export const REFRESH_TOKEN_KEY = 'refreshToken';

// Other app configuration
export const APP_NAME = 'SmartMediChain';

// Create default export of config object
const config = {
  apiUrl: API_URL,
  tokenKey: TOKEN_KEY,
  refreshTokenKey: REFRESH_TOKEN_KEY,
  appName: APP_NAME
};

export default config;
