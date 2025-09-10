'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const router = useRouter();

  const roles = [
    {
      id: 'central',
      name: 'Central Dashboard',
      description: 'National overview and coordination',
      icon: 'material-symbols:dashboard',
      color: 'bg-blue-600',
      path: '/central-dashboard',
    },
    {
      id: 'state',
      name: 'State Dashboard',
      description: 'State-level health monitoring',
      icon: 'material-symbols:dashboard-outline',
      color: 'bg-green-600',
      path: '/state-dashboard',
    },
    {
      id: 'district',
      name: 'District Dashboard',
      description: 'Local community health management',
      icon: 'material-symbols:dashboard-outline-rounded',
      color: 'bg-orange-600',
      path: '/district-dashboard',
    },
  ];

  const handleRoleSelect = (role: any) => {
    setSelectedRole(role.id);
    router.push(role.path);
  };

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
                <p className="text-sm text-gray-600">Dashboard Selection</p>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-light text-gray-900 mb-4">
              Welcome to Health Monitor
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select your dashboard level to access role-specific health monitoring tools and insights.
            </p>
          </motion.div>
        </div>

        {/* Role Selection Grid */}
        <motion.div
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {roles.map((role, index) => (
            <motion.button
              key={role.id}
              onClick={() => handleRoleSelect(role)}
              className={`bg-white/70 backdrop-blur-sm rounded-2xl p-8 text-left transition-all duration-300 hover:bg-white/90 hover:shadow-xl hover:-translate-y-1 ${
                selectedRole === role.id ? 'ring-2 ring-blue-500 bg-white/90' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`${role.color} w-16 h-16 rounded-xl flex items-center justify-center mb-6`}>
                <Icon icon={role.icon} className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">{role.name}</h3>
              <p className="text-gray-600 text-sm mb-6">{role.description}</p>
              <div className="flex items-center text-blue-600 text-sm font-medium">
                Access Dashboard
                <Icon icon="material-symbols:arrow-forward" className="w-4 h-4 ml-2" />
              </div>
            </motion.button>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
