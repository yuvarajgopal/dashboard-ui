import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./index.css";
import * as FiIcons from "react-icons/fi";

export default function Dashboard({ config, onScale }) {
  const [clusterName, setClusterName] = useState("");
  const [brokerName, setBrokerName] = useState("");
  const [minEngines, setMinEngines] = useState("");
  const [maxEngines, setMaxEngines] = useState("");
  const [brokersList, setBrokersList] = useState([]);

  // ---------- Helpers (TEXT ONLY) ----------
  const sanitizeText = (val) => {
    if (val === null || val === undefined) return "N/A";
    if (React.isValidElement(val)) return "N/A";
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };

  const renderIcon = (Icon, size = 20) => {
    if (!Icon) return null;
    if (typeof Icon === "function") return <Icon size={size} />;
    if (React.isValidElement(Icon)) return Icon;
    return null;
  };

  // ---------- Initialize config ----------
  useEffect(() => {
    if (config?.clusterName) {
      setClusterName(
        typeof config.clusterName === "string"
          ? config.clusterName
          : JSON.stringify(config.clusterName)
      );
    }

    if (config?.brokers) {
      const list = config.brokers.map((b) => {
        if (typeof b === "string") return { value: b, label: b };
        if (typeof b === "object") {
          return {
            value: String(b.value ?? b.label ?? ""),
            label: String(b.label ?? b.value ?? ""),
          };
        }
        return { value: String(b), label: String(b) };
      });
      setBrokersList(list);
    }
  }, [config]);

  // ---------- Submit handler ----------
  const handleSubmit = () => {
    if (!brokerName) {
      alert("Please select a broker.");
      return;
    }

    const min = Number(minEngines) || 0;
    const max = Number(maxEngines) || 0;

    if (min > max) {
      alert("Min Engines cannot be greater than Max Engines.");
      return;
    }

    const payload = {
      clusterName,
      brokerName,
      minEngines: min,
      maxEngines: max,
    };

    onScale(payload);
  };

  // ---------- Stats ----------
  const stats = [
    {
      label: "Cluster",
      value: clusterName,
      Icon: FiIcons.FiCpu,
      from: "from-pink-200",
      to: "to-red-300",
    },
    {
      label: "Engines",
      value: config?.engineCount ?? 0,
      Icon: FiIcons.FiServer,
      from: "from-blue-200",
      to: "to-sky-300",
    },
    {
      label: "Brokers",
      value: brokersList.length,
      Icon: FiIcons.FiLayers,
      from: "from-green-200",
      to: "to-emerald-300",
    },
    {
      label: "Directors",
      value: 1,
      Icon: FiIcons.FiUsers,
      from: "from-purple-200",
      to: "to-violet-300",
    },
  ];

  // ---------- Admin Cards (raw URLs) ----------
  const adminCards = [
    {
      label: "DataDog UI",
      url: config?.datadogUrl,
      Icon: FiIcons.FiDatabase,
    },
    {
      label: "Director UI",
      url: config?.directorUrl,
      Icon: FiIcons.FiFileText,
    },
    {
      label: "Broker UI",
      url: config?.brokerUrl,
      Icon: FiIcons.FiServer,
    },
  ];

  // ---------- Render ----------
  return (
    <div className="w-full h-screen p-8 bg-gradient-to-br from-green-50 to-emerald-50 flex flex-col gap-5 overflow-hidden">
      <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">
        Data Synapse Grid Controller
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 w-full px-10">
        {stats.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div
              className={`rounded-lg shadow-lg p-4 text-white bg-gradient-to-br ${item.from} ${item.to} flex flex-col items-center justify-center gap-2`}
            >
              {renderIcon(item.Icon, 22)}
              <div className="text-center">
                <h3 className="font-semibold text-sm">
                  {sanitizeText(item.label)}
                </h3>
                <p className="font-bold text-xl">
                  {sanitizeText(item.value)}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Admin Cards */}
      <div className="flex justify-center px-10">
        <div className="grid grid-cols-3 gap-5 max-w-2xl w-full">
          {adminCards.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div
                className="rounded-lg shadow-md p-3 bg-gradient-to-br from-green-50 to-emerald-100 text-gray-700 text-center cursor-pointer hover:scale-105 hover:shadow-lg transform transition-all"
                onClick={() => item.url && window.open(item.url, "_blank")}
              >
                <div className="flex flex-col items-center gap-2">
                  {renderIcon(item.Icon, 18)}
                  <div className="text-sm font-medium">{sanitizeText(item.label)}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Engine Scaling Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-10 flex-1 flex flex-col min-h-0"
      >
        <div className="rounded-xl shadow-2xl bg-white max-w-5xl mx-auto overflow-hidden flex flex-col h-full w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-4 text-white">
            <div className="flex items-center justify-center gap-2">
              <FiIcons.FiSliders size={20} />
              <h2 className="text-lg font-bold">Engine Scaling Configuration</h2>
            </div>
          </div>

          {/* Form Body */}
          <div className="px-10 py-6 flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="grid grid-cols-2 gap-6">
              {/* Cluster Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FiIcons.FiLayers size={15} className="text-green-600" />
                  Cluster Name
                </label>
                <input
                  value={sanitizeText(clusterName)}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-400 transition-colors text-sm"
                  placeholder="Cluster name"
                />
              </div>

              {/* Broker Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FiIcons.FiServer size={15} className="text-emerald-600" />
                  Broker Selection
                </label>
                <select
                  value={brokerName}
                  onChange={(e) => setBrokerName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400 transition-colors cursor-pointer hover:border-emerald-300 text-sm"
                >
                  <option value="">Select a broker...</option>
                  {brokersList.map((b, i) => (
                    <option key={i} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min Engines */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FiIcons.FiMinimize2 size={15} className="text-green-500" />
                  Min Engines
                </label>
                <input
                  type="number"
                  value={minEngines}
                  onChange={(e) => setMinEngines(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-400 transition-colors text-sm"
                />
              </div>

              {/* Max Engines */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FiIcons.FiMaximize2 size={15} className="text-orange-500" />
                  Max Engines
                </label>
                <input
                  type="number"
                  value={maxEngines}
                  onChange={(e) => setMaxEngines(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 transition-colors text-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-auto pt-5 pb-1">
              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3.5 px-8 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transform transition-all duration-200 flex items-center justify-center gap-2.5 text-base"
              >
                <FiIcons.FiCheck size={18} />
                Apply Configuration
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="pt-4 pb-3">
        <div className="max-w-7xl mx-auto px-10">
          <div className="border-t border-green-200 pt-2">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-xs">© DevSecOps - Veritas  - TD Securities</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="text-xs">GED - Data Synapse Grid Controller v1.0</span>
                <span className="hidden md:inline">•</span>
                <span className="flex items-center gap-1">
                  <FiIcons.FiShield size={12} className="text-green-500" />
                  <span className="text-xs">Secure</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

