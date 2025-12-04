import React, { useState, useEffect } from "react";
import Login from "./src/Login.jsx";
import Dashboard from "./src/Dashboard.jsx";
import './src/index.css';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [config, setConfig] = useState(null);

  // Load config from JSON file
  useEffect(() => {
    fetch('/config/config.json')
      .then(response => response.json())
      .then(data => setConfig(data))
      .catch(error => console.error('Error loading config:', error));
  }, []);

  // Check for existing auth token on component mount
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    console.log('Checking auth token on mount:', authToken);
    if (authToken) {
      console.log('Auth token found, setting authenticated to true');
      setIsAuthenticated(true);
    } else {
      console.log('No auth token found');
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    // Clear auth token from localStorage
    localStorage.removeItem('authToken');
  };

  const handleScale = async (data) => {
    console.log("Scale:", data);
    try {
      const response = await fetch('/scale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Scale operation successful:', result);
      alert('Configuration applied successfully!');
    } catch (error) {
      console.error('Error scaling:', error);
      alert(`Error applying configuration: ${error.message}`);
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Show loading state while config is being fetched
  if (!config) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading configuration...</div>
      </div>
    );
  }

  return <Dashboard config={config} onScale={handleScale} onLogout={handleLogout} />;
}
