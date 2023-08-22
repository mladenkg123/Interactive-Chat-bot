import jwt_decode from 'jwt-decode';

export const getUserIDFromJWT = (jwt: string): string | null => {
  try {
    const decodedJWT: { _id: string } = jwt_decode(jwt);
    return decodedJWT._id;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const getExpireFromJWT = (jwt: string): number | null => {
  try {
    const decodedJWT: { expire: number } = jwt_decode(jwt);
    return decodedJWT.expire;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};