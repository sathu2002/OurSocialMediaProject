export const DEPLOYED_API_URL =
  'https://oursocialmediaproject-production-6f95.up.railway.app/api';

// Expo only exposes EXPO_PUBLIC_* env vars to the client bundle.
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.API_URL ||
  DEPLOYED_API_URL;

export default API_URL;
