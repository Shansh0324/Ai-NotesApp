import { createContext, useState, useEffect } from "react";
import { loginUser, signupUser, getMe } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const { data } = await getMe();
        setUser({ ...data.data, token });
      } catch (err) {
        localStorage.removeItem("token");
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await loginUser({ email, password });
    localStorage.setItem("token", data.token);
    await loadUser(); // Fetch complete user profile
  };

  const signup = async (name, email, password) => {
    const { data } = await signupUser({ name, email, password });
    localStorage.setItem("token", data.token);
    await loadUser(); // Fetch complete user profile
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};
