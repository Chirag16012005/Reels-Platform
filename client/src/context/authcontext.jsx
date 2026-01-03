  import { createContext, useContext, useEffect, useState } from "react";
  import api from "../api/axios";

  const AuthContext = createContext();

  export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check auth on page refresh
    useEffect(() => {

      api.get("/auth/me")
        .then(res => {
          console.log(res?.data?.user);
          setUser(res.data.user)})
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
        
    }, []);

    // ONLY updates state (no API call here)
    const login = (userData) => {
      setUser(userData);
    };

    const logout = async () => {
      await api.post("/auth/logout");
      setUser(null);
    };

    return (
      <AuthContext.Provider value={{ user, login, logout,loading }}>
        {children}
      </AuthContext.Provider>
    );
  };

  export const useAuth = () => useContext(AuthContext);
