import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./index.css";
import * as FiIcons from "react-icons/fi";

export default function Dashboard({ config, onScale, onLogout }) {
  const [clusterName, setClusterName] = useState("");
  const [brokerName, setBrokerName] = useState("");
  const [minEngines, setMinEngines] = useState("");
  const [maxEngines, setMaxEngines] = useState("");
  const [brokersList, setBrokersList] = useState([]);
  const [engineCount, setEngineCount] = useState(0);

  // ---------- Helpers (TEXT ONLY) ----------
  const sanitizeText = (val) => {
    if (val === null || val === undefined) return "N/A";
    if (React.isValidElement(val)) return "N/A";
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };

  const renderIcon = (Icon, size = 20, className = "") => {
    if (!Icon) return null;
    if (typeof Icon === "function") return <Icon size={size} className={className} />;
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

  // ---------- Fetch engine count ----------
  useEffect(() => {
    const fetchEngineCount = async () => {
      try {
        const response = await fetch('/enginecount');
        if (response.ok) {
          const data = await response.json();
          setEngineCount(data.engine_count || 0);
        }
      } catch (error) {
        console.error('Error fetching engine count:', error);
      }
    };

    // Fetch immediately
    fetchEngineCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchEngineCount, 30000);

    return () => clearInterval(interval);
  }, []);

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
      broker: brokerName,
      minReplicas: min,
      maxReplicas: max,
    };

    onScale(payload);
  };

  // ---------- Stats ----------
  const stats = [
    {
      label: "Cluster",
      value: clusterName,
      Icon: FiIcons.FiCpu,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Engines",
      value: engineCount,
      Icon: FiIcons.FiServer,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Brokers",
      value: brokersList.length,
      Icon: FiIcons.FiLayers,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Directors",
      value: 1,
      Icon: FiIcons.FiUsers,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  // ---------- Admin Cards (raw URLs) ----------
  const adminCards = [
    {
      label: "DataDog UI",
      url: config?.datadogUrl,
      Icon: FiIcons.FiDatabase,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      hoverBorder: "hover:border-orange-500",
    },
    {
      label: "Director UI",
      url: config?.directorUrl,
      Icon: FiIcons.FiFileText,
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      hoverBorder: "hover:border-indigo-500",
    },
    {
      label: "Broker1 UI",
      url: config?.brokerUrl,
      Icon: FiIcons.FiServer,
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600",
      hoverBorder: "hover:border-teal-500",
    },
    {
      label: "Broker2 UI",
      url: config?.broker2Url,
      Icon: FiIcons.FiServer,
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600",
      hoverBorder: "hover:border-pink-500",
    },
  ];

  // ---------- Render ----------
  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col">
      {/* Header Section */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Data Synapse Grid Controller
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage and scale your grid infrastructure
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                <FiIcons.FiShield size={16} className="text-green-600" />
                <span className="text-sm font-medium text-green-700">System Active</span>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition-colors"
                >
                  <FiIcons.FiLogOut size={16} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {sanitizeText(item.label)}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {sanitizeText(item.value)}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${item.bgColor}`}>
                  {renderIcon(item.Icon, 24, item.iconColor)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Admin Quick Links */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {adminCards.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <div
                  className={`bg-white rounded-lg border border-gray-200 shadow-sm p-3 cursor-pointer ${item.hoverBorder} hover:shadow-md transition-all group`}
                  onClick={() => item.url && window.open(item.url, "_blank")}
                >
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${item.bgColor} transition-colors`}>
                      {renderIcon(item.Icon, 18, item.iconColor)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{sanitizeText(item.label)}</p>
                      <p className="text-xs text-gray-500">Access portal</p>
                    </div>
                    <FiIcons.FiExternalLink size={14} className={`text-gray-400 ${item.iconColor.replace('text-', 'group-hover:text-')}`} />
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
          transition={{ delay: 0.6 }}
        >
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Card Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <FiIcons.FiSliders size={20} className="text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">Engine Scaling Configuration</h2>
              </div>
              <p className="text-sm text-gray-500 mt-1">Configure engine scaling parameters for your cluster</p>
            </div>

            {/* Form Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cluster Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cluster Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiIcons.FiLayers size={16} className="text-gray-400" />
                    </div>
                    <input
                      value={sanitizeText(clusterName)}
                      readOnly
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      placeholder="Cluster name"
                    />
                  </div>
                </div>

                {/* Broker Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Broker Selection
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiIcons.FiServer size={16} className="text-gray-400" />
                    </div>
                    <select
                      value={brokerName}
                      onChange={(e) => setBrokerName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer text-sm appearance-none"
                    >
                      <option value="">Select a broker...</option>
                      {brokersList.map((b, i) => (
                        <option key={i} value={b.value}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FiIcons.FiChevronDown size={16} className="text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Min Engines */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Engines
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiIcons.FiMinimize2 size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={minEngines}
                      onChange={(e) => setMinEngines(e.target.value)}
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Max Engines */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Engines
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiIcons.FiMaximize2 size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={maxEngines}
                      onChange={(e) => setMaxEngines(e.target.value)}
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSubmit}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <FiIcons.FiCheck size={18} />
                  Apply Configuration
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-gray-500">
            <div>
              <span>© DevSecOps - Veritas - TD Securities</span>
            </div>
            <div className="flex items-center gap-3">
              <span>GED - Data Synapse Grid Controller v1.0</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-1">
                <FiIcons.FiShield size={14} className="text-green-500" />
                <span>Secure</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

