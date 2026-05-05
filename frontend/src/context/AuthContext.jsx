import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Ensure cookies are sent with all requests
axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/me');
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
    setUser(res.data.user);
    setIsAuthenticated(true);
  };

  const signup = async (name, email, password, businessDetails = {}) => {
    const res = await axios.post('http://localhost:5000/api/auth/signup', { 
      name, 
      email, 
      password,
      ...businessDetails
    });
    setUser(res.data.user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (profileData) => {
    const res = await axios.put('http://localhost:5000/api/auth/profile', profileData);
    setUser(res.data);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, signup, logout, updateProfile, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Made with Bob
