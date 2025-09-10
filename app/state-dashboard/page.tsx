'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import ChartContainer from '@/app/components/ChartContainer';
import AlertPanel from '@/app/components/AlertPanel';
import ResourceCard from '@/app/components/ResourceCard';
import PointDensityMap from '@/app/components/PointDensityMap';

export default function StateDashboard() {
  const user = { displayName: "State Officer" };
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedState, setSelectedState] = useState('as'); // Default NE state
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'alerts' | 'interventions'>('overview');

  const states = [
    { id: 'as', name: 'Assam', code: 'AS' },
    { id: 'ml', name: 'Meghalaya', code: 'ML' },
    { id: 'tr', name: 'Tripura', code: 'TR' },
    { id: 'mn', name: 'Manipur', code: 'MN' }
  ];

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/state?stateId=${selectedState}`);
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedState]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleAllocate = async (resourceId: string, amount: number) => {
    if (!dashboardData?.resources) return;
    const resource = dashboardData.resources.find((r: any) => r.id === resourceId);
    if (!resource) return;

    const newAllocated = Math.min((resource.allocated || 0) + amount, resource.quantity || 0);
    try {
      await fetch('/api/resources', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resourceId, allocated: newAllocated }),
      });
      fetchDashboardData();
    } catch (e) {
      console.error('Allocation failed', e);
    }
  };

  const handleRelease = async (resourceId: string, amount: number) => {
    if (!dashboardData?.resources) return;
    const resource = dashboardData.resources.find((r: any) => r.id === resourceId);
    if (!resource) return;

    const newAllocated = Math.max((resource.allocated || 0) - amount, 0);
    try {
      await fetch('/api/resources', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resourceId, allocated: newAllocated }),
      });
      fetchDashboardData();
    } catch (e) {
      console.error('Release failed', e);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading State Dashboard...</p>
        </div>
      </div>
    );
  }

  const districtComparisonData = dashboardData?.districts?.slice(0, 6).map((d: any) => ({
    name: d.name,
    healthcareAccess: d.healthMetrics.healthcareAccess || 0,
    vaccinationCoverage: d.healthMetrics.vaccinationCoverage || 0,
    alerts: d.activeAlerts || 0
  })) || [];

  const interventionProgressData = dashboardData?.interventions?.map((i: any) => ({
    name: i.title.split(' ').slice(0, 2).join(' '),
    progress: i.completionPercentage || 0,
    target: 100
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-green-100 rounded-lg transition-colors duration-200">
                <Icon icon="material-symbols:arrow-back" className="w-5 h-5 text-green-600" />
              </button>
              <div className="flex items-center space-x-3">
                <Icon icon="material-symbols:dashboard-outline" className="w-8 h-8 text-green-600" />
                <div>
                  <h1 className="text-lg font-medium text-gray-900">State Dashboard</h1>
                  <p className="text-sm text-gray-600">State-level Health Monitoring</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-white border border-green-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 px-3 py-2"
              >
                {states.map((state) => (
                  <option key={state.id} value={state.id}>{state.name}</option>
                ))}
              </select>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                <p className="text-xs text-gray-600">State Authority</p>
              </div>
              <button onClick={() => router.push('/')} className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                Exit
              </button>
            </div>
          </div>

          {/* Dashboard Tabs */}
          <div className="mt-4 flex space-x-4 border-b border-green-200">
            {['overview', 'map', 'alerts', 'interventions'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 -mb-px font-medium text-sm rounded-t-lg transition-colors ${
                  activeTab === tab
                    ? 'text-green-800 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-green-700'
                }`}
              >
                {tab === 'overview' ? 'Overview' : tab === 'map' ? 'GIS Map' : tab === 'alerts' ? 'Active Alerts' : 'Active Interventions'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* State Info */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-light text-gray-900 mb-2">{dashboardData?.stateInfo?.name}</h2>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span>Population: {(dashboardData?.stateInfo?.population / 1_000_000).toFixed(1)}M</span>
              <span>Districts: {dashboardData?.districts?.length}</span>
              <span>Active Interventions: {dashboardData?.interventions?.filter((i: any) => i.status === 'ongoing').length}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600 mb-2">Overall Risk Level</p>
            <span className={`inline-block px-4 py-2 rounded-lg text-sm font-medium capitalize ${getRiskLevelColor(dashboardData?.stateInfo?.riskLevel)}`}>
              {dashboardData?.stateInfo?.riskLevel}
            </span>
          </div>
        </div>

        {/* Conditional Sections */}
        {activeTab === 'overview' && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[ 
                { title: 'Districts', value: dashboardData?.districts?.length, icon: 'material-symbols:domain', color: 'green' },
                { title: 'Active Alerts', value: dashboardData?.activeAlerts?.length, icon: 'mdi:alert', color: 'red' },
                { title: 'Interventions', value: dashboardData?.interventions?.length, icon: 'solar:health-linear', color: 'blue' },
                { title: 'Resource Utilization', value: dashboardData?.resourceSummary?.utilizationRate?.toFixed(0) + '%', icon: 'ion:medical-outline', color: 'purple' }
              ].map((card, i) => (
                <motion.div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: i * 0.1 }}>
                  <div className="flex items-center">
                    <div className={`p-3 bg-${card.color}-100 rounded-lg`}>
                      <Icon icon={card.icon} className={`w-6 h-6 text-${card.color}-600`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{card.title}</p>
                      <p className="text-2xl font-light text-gray-900">{card.value || 0}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <ChartContainer title="District Health Metrics Comparison" type="bar" data={districtComparisonData} xKey="name" yKey="healthcareAccess" color="#16a34a" height={300} />
              <ChartContainer title="Intervention Progress" type="bar" data={interventionProgressData} xKey="name" yKey="progress" color="#059669" height={300} />
            </div>

            {/* District Ranking & Resources */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-1 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">District Risk Ranking</h3>
                <div className="space-y-4">
                  {dashboardData?.districtRanking?.slice(0, 6).map((district: any, index: number) => (
                    <motion.div key={district.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg"
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-500">#{district.rank}</span>
                          <h4 className="font-medium text-gray-900">{district.name}</h4>
                        </div>
                        <p className="text-xs text-gray-600">{(district.population / 100_000).toFixed(1)}L population</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getRiskLevelColor(district.riskLevel)}`}>{district.riskLevel}</span>
                        <p className="text-xs text-gray-600 mt-1">{district.activeAlerts} alerts</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Resource Allocation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dashboardData?.resources?.slice(0, 4).map((resource: any) => (
                    <ResourceCard key={resource.id} resource={resource} showActions compact onAllocate={handleAllocate} onRelease={handleRelease} />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'map' && (
          <div className="mb-8">
            <PointDensityMap disease="waterborne" status="active" region="ne" refreshMs={10000} />
          </div>
        )}

        {activeTab === 'alerts' && dashboardData?.activeAlerts && (
          <AlertPanel alerts={dashboardData.activeAlerts} maxAlerts={12} showActions />
        )}

        {activeTab === 'interventions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData?.interventions?.filter((i: any) => i.status === 'ongoing').map((intervention: any) => (
              <motion.div key={intervention.id} className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 text-sm">{intervention.title}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${intervention.type === 'vaccination' ? 'bg-blue-100 text-blue-800' : intervention.type === 'screening' ? 'bg-green-100 text-green-800' : intervention.type === 'awareness' ? 'bg-yellow-100 text-yellow-800' : 'bg-purple-100 text-purple-800'}`}>{intervention.type}</span>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{intervention.completionPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(intervention.completionPercentage, 100)}%` }} />
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  <p>{intervention.completedCount.toLocaleString()} of {intervention.targetPopulation.toLocaleString()} completed</p>
                  <p className="mt-1">Location: {intervention.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
