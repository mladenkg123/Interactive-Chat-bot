import { jwtDecode } from 'jwt-decode';

export const getUserIDFromJWT = (jwt: string): string | null => {
  if (!jwt) {
    return null;
  }
  try {
    const decodedJWT: { _id: string } = jwtDecode(jwt);
    return decodedJWT._id;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const getExpireFromJWT = (jwt: string): number | null => {
  try {
    const decodedJWT: { expire: number } = jwtDecode(jwt);
    return decodedJWT.expire;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};
