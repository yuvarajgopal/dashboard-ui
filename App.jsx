import React, { useState } from "react";
import Login from "./Login.jsx";
import Dashboard from "./Dashboard.jsx";
import './index.css';

// sample config
const config = {
  clusterName: "Cluster-A",
  engineCount: 5,
  brokers: [
    { label: "Broker 1", value: "b1" },
    { label: "Broker 2", value: "b2" }
  ],
  datadogUrl: "https://datadog.com",
  directorUrl: "https://director.example.com",
  brokerUrl: "https://broker.example.com",
  logsUrl: "https://logs.example.com"
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleScale = (data) => {
    console.log("Scale:", data);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return <Dashboard config={config} onScale={handleScale} onLogout={handleLogout} />;
}
