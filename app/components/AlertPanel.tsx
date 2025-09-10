'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  status: 'active' | 'resolved' | 'under_investigation';
  createdAt: string;
  updatedAt: string;
  responseTime?: number;
}

interface AlertPanelProps {
  alerts: Alert[];
  showActions?: boolean;
  compact?: boolean;
  maxAlerts?: number;
  onAlertClick?: (alert: Alert) => void;
  onUpdateAlert?: (alertId: string, updates: Partial<Alert>) => void;
}

export default function AlertPanel({
  alerts,
  showActions = false,
  compact = false,
  maxAlerts = 10,
  onAlertClick,
  onUpdateAlert
}: AlertPanelProps) {
  const [displayAlerts, setDisplayAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'high-priority'>('all');

  useEffect(() => {
    let filtered = [...alerts];

    // Apply filters
    switch (filter) {
      case 'active':
        filtered = filtered.filter(alert => alert.status === 'active');
        break;
      case 'high-priority':
        filtered = filtered.filter(alert => alert.severity === 'high' || alert.severity === 'critical');
        break;
      default:
        break;
    }

    // Sort by severity and creation date
    filtered.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setDisplayAlerts(filtered.slice(0, maxAlerts));
  }, [alerts, filter, maxAlerts]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-700 bg-red-100';
      case 'resolved': return 'text-green-700 bg-green-100';
      case 'under_investigation': return 'text-blue-700 bg-blue-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return 'mdi:alert';
      case 'high': return 'mdi:alert-outline';
      case 'medium': return 'line-md:alert';
      case 'low': return 'mdi-light:alert';
      default: return 'mdi:alert-outline';
    }
  };

  const handleStatusChange = (alertId: string, newStatus: Alert['status']) => {
    if (onUpdateAlert) {
      onUpdateAlert(alertId, { status: newStatus });
    }
  };

  if (displayAlerts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <Icon icon="mdi:alert-outline" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-900 font-medium mb-2">No alerts found</h3>
          <p className="text-gray-500 text-sm">All systems are currently operating normally.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon icon="mdi:alert-outline" className="w-6 h-6 text-red-500" />
            <h2 className="text-lg font-medium text-gray-900">Health Alerts</h2>
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {displayAlerts.filter(a => a.status === 'active').length} Active
            </span>
          </div>

          {/* Filter Buttons */}
          <div className="flex space-x-2">
            {(['all', 'active', 'high-priority'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
                  filter === filterType
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterType === 'all' ? 'All' : 
                 filterType === 'active' ? 'Active' : 'High Priority'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className={`${compact ? 'max-h-80' : 'max-h-96'} overflow-y-auto`}>
        <AnimatePresence>
          {displayAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 ${
                onAlertClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => onAlertClick?.(alert)}
            >
              <div className="flex items-start space-x-3">
                {/* Severity Icon */}
                <div className={`p-2 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                  <Icon icon={getSeverityIcon(alert.severity)} className="w-4 h-4" />
                </div>

                {/* Alert Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-medium text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
                      {alert.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(alert.status)}`}>
                        {alert.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <p className={`text-gray-600 mb-2 ${compact ? 'text-xs' : 'text-sm'}`}>
                    {compact ? alert.description.slice(0, 100) + '...' : alert.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Icon icon="material-symbols:location-on-outline" className="w-3 h-3 mr-1" />
                        {alert.location}
                      </span>
                      <span>
                        {format(new Date(alert.createdAt), 'MMM dd, HH:mm')}
                      </span>
                      {alert.responseTime && (
                        <span className="text-green-600">
                          Response: {alert.responseTime}h
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {showActions && alert.status === 'active' && (
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(alert.id, 'under_investigation');
                          }}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors duration-200"
                        >
                          Investigate
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(alert.id, 'resolved');
                          }}
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors duration-200"
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {alerts.length > maxAlerts && (
        <div className="p-4 border-t border-gray-200 text-center">
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All {alerts.length} Alerts
          </button>
        </div>
      )}
    </div>
  );
}