'use client';

import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface Resource {
  id: string;
  name: string;
  type: 'medical_staff' | 'equipment' | 'medicine' | 'facility';
  quantity: number;
  allocated: number;
  available: number;
  location: string;
  status: 'available' | 'in_use' | 'maintenance';
  lastUpdated: string;
}

interface ResourceCardProps {
  resource: Resource;
  onClick?: (resource: Resource) => void;
  compact?: boolean;
  showActions?: boolean;
  onAllocate?: (resourceId: string, amount: number) => void;
  onRelease?: (resourceId: string, amount: number) => void;
}

const TYPE_LABELS: Record<Resource['type'], string> = {
  medical_staff: 'Medical Staff',
  equipment: 'Equipment',
  medicine: 'Medicine',
  facility: 'Facility',
};

const STATUS_LABELS: Record<Resource['status'], string> = {
  available: 'AVAILABLE',
  in_use: 'IN USE',
  maintenance: 'MAINTENANCE',
};

export default function ResourceCard({
  resource,
  onClick,
  compact = false,
  showActions = false,
  onAllocate,
  onRelease
}: ResourceCardProps) {
  const [allocAmount, setAllocAmount] = useState<number>(1);

  const getTypeIcon = (type: Resource['type']) => {
    switch (type) {
      case 'medical_staff': return 'ion:medical';
      case 'equipment': return 'material-symbols:medical-services-outline';
      case 'medicine': return 'material-symbols:medication-outline';
      case 'facility': return 'material-symbols:local-hospital-outline';
      default: return 'material-symbols:inventory-2-outline';
    }
  };

  const getTypeColor = (type: Resource['type']) => {
    switch (type) {
      case 'medical_staff': return 'bg-blue-100 text-blue-600';
      case 'equipment': return 'bg-green-100 text-green-600';
      case 'medicine': return 'bg-orange-100 text-orange-600';
      case 'facility': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusColor = (status: Resource['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in_use': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const utilizationPercentage = resource.quantity ? (resource.allocated / resource.quantity) * 100 : 0;
  const availabilityPercentage = resource.quantity ? (resource.available / resource.quantity) * 100 : 0;

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatTypeLabel = (type: Resource['type']) => TYPE_LABELS[type];

  const handleAllocate = () => {
    if (allocAmount <= 0 || allocAmount > resource.available) return;
    onAllocate?.(resource.id, allocAmount);
    setAllocAmount(1);
  };

  const handleRelease = () => {
    if (allocAmount <= 0 || allocAmount > resource.allocated) return;
    onRelease?.(resource.id, allocAmount);
    setAllocAmount(1);
  };

  return (
    <motion.div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:border-blue-300' : ''
      }`}
      onClick={() => onClick?.(resource)}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${getTypeColor(resource.type)}`}>
            <Icon icon={getTypeIcon(resource.type)} className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`font-medium text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
              {resource.name}
            </h3>
            <p className="text-sm text-gray-600">{formatTypeLabel(resource.type)}</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(resource.status)}`}>
          {STATUS_LABELS[resource.status]}
        </span>
      </div>

      {/* Statistics */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Utilization</span>
            <span className="text-sm text-gray-600">{utilizationPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${getUtilizationColor(utilizationPercentage)}`}
              style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Resource Numbers */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-light text-gray-900">{resource.quantity}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div>
            <p className="text-2xl font-light text-blue-600">{resource.allocated}</p>
            <p className="text-xs text-gray-600">Allocated</p>
          </div>
          <div>
            <p className="text-2xl font-light text-green-600">{resource.available}</p>
            <p className="text-xs text-gray-600">Available</p>
          </div>
        </div>

        {/* Allocation Slider & Input */}
        {showActions && (
          <div className="pt-4 border-t border-gray-100 mt-4 space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min={1}
                max={resource.available}
                value={allocAmount}
                onChange={(e) => setAllocAmount(Number(e.target.value))}
                className="flex-1"
              />
              <input
                type="number"
                min={1}
                max={resource.available}
                value={allocAmount}
                onChange={(e) => {
                  let val = Number(e.target.value);
                  if (val < 1) val = 1;
                  if (val > resource.available) val = resource.available;
                  setAllocAmount(val);
                }}
                className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={(e) => { e.stopPropagation(); handleAllocate(); }}
                className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors duration-200"
                disabled={resource.available === 0}
              >
                Allocate
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleRelease(); }}
                className="flex-1 bg-gray-50 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors duration-200"
                disabled={resource.allocated === 0}
              >
                Release
              </button>
            </div>
          </div>
        )}

        {/* Location and Last Updated */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center">
              <Icon icon="material-symbols:location-on-outline" className="w-3 h-3 mr-1" />
              {resource.location}
            </div>
            <div>
              Updated: {new Date(resource.lastUpdated).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Critical Alert */}
        {availabilityPercentage < 20 && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <Icon icon="mdi:alert" className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-sm font-medium text-red-800">Critical Shortage</span>
            </div>
            <p className="text-xs text-red-600 mt-1">
              Only {availabilityPercentage.toFixed(0)}% available - immediate restocking required
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
