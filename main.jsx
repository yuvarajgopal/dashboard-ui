import React from "react";
import ReactDOM from "react-dom/client";
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

const handleScale = (data) => console.log("Scale:", data);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Dashboard config={config} onScale={handleScale} />);
