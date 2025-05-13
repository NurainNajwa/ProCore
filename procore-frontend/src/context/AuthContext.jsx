import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// Create the AuthContext
const AuthContext = createContext();

// AuthProvider to manage the authentication state and token refreshing
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to fetch user data based on the access token
  const fetchUser = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const res = await axios.get("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && res.data.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // If the access token has expired, try to refresh it
      console.error("Error fetching user:", error);
      if (error.response?.status === 401) {  // Unauthorized (token expired)
        refreshAccessToken(); // Try to refresh the token
      }
      setIsAuthenticated(false);
    }
  };

  // Function to refresh the access token using the refresh token
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/users/refresh-token", {
        refreshToken,
      });
      const newAccessToken = res.data.accessToken;
      localStorage.setItem("accessToken", newAccessToken); // Store the new access token
      await fetchUser();  // Fetch the user data with the new access token
    } catch (error) {
      console.error("Error refreshing token:", error);
      setIsAuthenticated(false);
      logout(); // If refresh fails, log the user out
    }
  };

  // Login function to store tokens in localStorage and set the user
  const login = (accessToken, refreshToken) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setIsAuthenticated(true);
    fetchUser();
  };

  // Logout function to clear tokens from localStorage
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setIsAuthenticated(false);
  };

  // UseEffect to initialize the authentication state
  useEffect(() => {
    fetchUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, refreshUser: fetchUser}}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use authentication state and actions
export const useAuth = () => useContext(AuthContext);
