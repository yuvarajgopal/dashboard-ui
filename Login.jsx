import React, { useState } from "react";
import { motion } from "framer-motion";
import * as FiIcons from "react-icons/fi";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (username === "admin" && password === "admin") {
      onLogin();
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="w-full h-screen flex">
      {/* Left Side - Animated Visual/Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 items-center justify-center p-12 relative overflow-hidden">
        {/* Animated background grid pattern */}
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, white 1px, transparent 1px),
              linear-gradient(to bottom, white 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
          animate={{
            backgroundPosition: ['0px 0px', '40px 40px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Floating orbs animation - subtle light effect */}
        <motion.div
          className="absolute top-20 left-20 w-40 h-40 bg-white rounded-full opacity-5 blur-3xl"
          animate={{
            y: [0, 30, 0],
            x: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-32 right-20 w-48 h-48 bg-white rounded-full opacity-5 blur-3xl"
          animate={{
            y: [0, -40, 0],
            x: [0, -15, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-36 h-36 bg-teal-300 rounded-full opacity-5 blur-3xl"
          animate={{
            y: [0, 20, 0],
            x: [0, 25, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-white max-w-lg relative z-10"
        >
          <motion.div
            className="mb-8"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <FiIcons.FiServer size={64} className="mb-6 opacity-90" />
            <h2 className="text-4xl font-bold mb-4">
              Grid Infrastructure Management
            </h2>
            <p className="text-lg text-green-50 leading-relaxed">
              Monitor, scale, and manage your Data Synapse cluster with ease.
              Access real-time metrics and control your engine scaling
              configuration.
            </p>
          </motion.div>

          {/* Feature List */}
          <div className="space-y-4 mt-12">
            {[
              {
                icon: FiIcons.FiActivity,
                text: "Real-time cluster monitoring",
              },
              { icon: FiIcons.FiSliders, text: "Dynamic engine scaling" },
              { icon: FiIcons.FiShield, text: "Secure infrastructure control" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <motion.div
                  className="p-2 bg-white bg-opacity-20 rounded-lg"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <item.icon size={20} />
                </motion.div>
                <span className="text-green-50">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo/Title */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiIcons.FiCpu size={32} className="text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Data Synapse
                </h1>
                <p className="text-sm text-gray-500">Grid Controller</p>
              </div>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-600">
              Please enter your credentials to access the dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700"
              >
                <FiIcons.FiAlertCircle size={18} />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiIcons.FiUser size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiIcons.FiLock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <FiIcons.FiEyeOff size={18} />
                  ) : (
                    <FiIcons.FiEye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <FiIcons.FiLogIn size={18} />
              Sign In
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              © DevSecOps - Veritas - TD Securities
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
