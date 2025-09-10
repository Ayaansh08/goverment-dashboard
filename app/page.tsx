'use client';

import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Icon icon="solar:health-bold" className="w-10 h-10 text-blue-600" />
              <div>
                <h1 className="text-xl font-medium text-gray-900">Smart Health Monitor</h1>
                <p className="text-sm text-gray-600">Early Warning System</p>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Icon icon="solar:health-bold-duotone" className="w-20 h-20 text-blue-600 mx-auto mb-8" />
          
          <h1 className="text-5xl font-light text-gray-900 mb-6 leading-tight">
            Smart Community Health
            <br />
            <span className="text-blue-600">Monitoring System</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            AI-powered early warning system for real-time health monitoring,
            outbreak prediction, and resource optimization across India.
          </p>

          <motion.button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-medium text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Access Dashboard
            <Icon icon="material-symbols:arrow-forward" className="w-5 h-5 ml-2 inline" />
          </motion.button>

          <p className="text-sm text-gray-500 mt-4">
            Choose between Central, State, or District dashboards
          </p>
        </motion.div>
      </main>
    </div>
  );
}
