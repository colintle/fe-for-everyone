import { GET, DELETE } from "./api/methods";

export const parseToken = (token) => {
  if (!token) {
    return null;
  }

  try {
    const [, payloadBase64] = token.split('.');
    const payload = JSON.parse(atob(payloadBase64));

    return payload;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}

export const checkExpired = (accessToken) => {
  if (!accessToken) {
    return true;
  }

  const { exp } = parseToken(accessToken);

  return Date.now() >= exp * 1000;
};

export const getUsernameFromToken = (accessToken) => {
  if (!accessToken) {
    return null;
  }

  const { username } = parseToken(accessToken);

  return username;
};

export const refreshToken = async () => {
  const refreshResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/refresh`, {
    method: GET,
    credentials: 'include',
  });

  if (refreshResponse.ok) {
    const refreshData = await refreshResponse.json();
    return refreshData.token
  } 
  else {
    return false;
  }
}

export const clearToken = async () => {
  const signoutResponse  = await fetch(`${process.env.REACT_APP_BACKEND_URL}/signout`, {
    method: DELETE,
    credentials: 'include',
  });

  if (signoutResponse.ok) {
    return true;
  } 
  else {
    return false;
  }
}