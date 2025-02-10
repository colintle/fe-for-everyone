export const checkExpired = (accessToken) => {
  if (!accessToken) {
    return true;
  }

  try {
    const [, payloadBase64] = accessToken.split('.');
    const payload = JSON.parse(atob(payloadBase64));

    if (!payload.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const refreshToken = async () => {
  const refreshResponse = await fetch(`${process.env.BACKEND_URL}/refresh`, {
    method: 'GET',
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
