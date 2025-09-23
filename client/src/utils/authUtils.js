// This function ensures the token and role are always saved correctly upon login.
export const login = (token, role) => {
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('role', role);
  sessionStorage.setItem('isLoggedIn', 'true'); // Explicitly set login status
};

// This function clears all session data upon logout.
export const logout = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('role');
  sessionStorage.removeItem('isLoggedIn');
};

// This function checks if the user is logged in.
export const isLoggedIn = () => {
  // We check for 'isLoggedIn' for consistency with the login function.
  return sessionStorage.getItem('isLoggedIn') === 'true';
};

// This function gets the user's role from storage.
export const getUserRole = () => {
  return sessionStorage.getItem('role');
};

// This function gets the token for API calls.
export const getToken = () => {
  return sessionStorage.getItem('token');
};
