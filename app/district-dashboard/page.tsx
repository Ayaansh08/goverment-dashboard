'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import ChartContainer from '@/app/components/ChartContainer';
import AlertPanel from '@/app/components/AlertPanel';
import ResourceCard from '@/app/components/ResourceCard';
import PointDensityMap from '@/app/components/PointDensityMap';

import { mockStates, mockAlerts, mockResources, mockInterventions } from '@/app/lib/mockData';

export default function DistrictDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedState, setSelectedState] = useState('as');
  const [selectedDistrict, setSelectedDistrict] = useState('as-guwahati');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'gismap' | 'resources' | 'alerts'>('overview');

  const mockUser = { displayName: 'District Admin' };

  const locations = mockStates.flatMap((state) =>
    state.districts.map((district) => ({
      stateId: state.id,
      districtId: district.id,
      stateName: state.name,
      districtName: district.name
    }))
  );

  const fetchDashboardData = () => {
    setLoading(true);
    const state = mockStates.find((s) => s.id === selectedState);
    const district = state?.districts.find((d) => d.id === selectedDistrict);

    const activeAlerts = mockAlerts.filter(
      (a) => a.stateId === selectedState && a.districtId === selectedDistrict
    );

    const resources = mockResources.filter(
      (r) => r.stateId === selectedState && r.districtId === selectedDistrict
    );

    const interventions = mockInterventions.filter(
      (i) => i.stateId === selectedState && i.districtId === selectedDistrict
    );

    const totalTarget = interventions.reduce((sum, i) => sum + (i.targetPopulation || 0), 0);
    const totalCompleted = interventions.reduce((sum, i) => sum + (i.completedCount || 0), 0);
    const interventionCompletionRate = totalTarget > 0 ? (totalCompleted / totalTarget) * 100 : 0;

    setDashboardData({
      districtInfo: district,
      activeAlerts,
      resources,
      interventions,
      interventionCompletionRate,
      totalResources: resources.length,
      outbreakTrends: district
        ? [
            { date: '2024-09-01', cases: Math.floor(Math.random() * 20) },
            { date: '2024-09-02', cases: Math.floor(Math.random() * 20) },
            { date: '2024-09-03', cases: Math.floor(Math.random() * 20) },
            { date: '2024-09-04', cases: Math.floor(Math.random() * 20) }
          ]
        : [],
      aiConfidenceMetrics: {
        outbreakPrediction: { nextWeek: { confidence: 0.82, riskLevel: district?.riskLevel || 'medium' } },
        resourceDemand: {
          beds: { predicted: 100, confidence: 0.78 },
          staff: { predicted: 30, confidence: 0.71 },
          medicines: { predicted: 500, confidence: 0.85 }
        }
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedState, selectedDistrict]);

  const handleAllocate = (resourceId: string, amount: number) => {
    const resource = mockResources.find((r) => r.id === resourceId);
    if (!resource) return;
    resource.allocated = Math.min(resource.allocated + amount, resource.quantity);
    fetchDashboardData();
  };

  const handleRelease = (resourceId: string, amount: number) => {
    const resource = mockResources.find((r) => r.id === resourceId);
    if (!resource) return;
    resource.allocated = Math.max(resource.allocated - amount, 0);
    fetchDashboardData();
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const currentLocation = locations.find(
    (loc) => loc.stateId === selectedState && loc.districtId === selectedDistrict
  ) || locations[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading District Dashboard...</p>
        </div>
      </div>
    );
  }

  const outbreakTrendData = dashboardData.outbreakTrends || [];
  const aiConfidenceData = [
    { name: 'Outbreak Prediction', confidence: dashboardData.aiConfidenceMetrics.outbreakPrediction.nextWeek.confidence * 100 },
    { name: 'Beds', confidence: dashboardData.aiConfidenceMetrics.resourceDemand.beds.confidence * 100 },
    { name: 'Staff', confidence: dashboardData.aiConfidenceMetrics.resourceDemand.staff.confidence * 100 },
    { name: 'Medicines', confidence: dashboardData.aiConfidenceMetrics.resourceDemand.medicines.confidence * 100 }
  ];
  const resourceMixPie = [
    { name: 'Beds', value: dashboardData.aiConfidenceMetrics.resourceDemand.beds.predicted },
    { name: 'Staff', value: dashboardData.aiConfidenceMetrics.resourceDemand.staff.predicted },
    { name: 'Medicines', value: dashboardData.aiConfidenceMetrics.resourceDemand.medicines.predicted }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Icon icon="material-symbols:dashboard-outline-rounded" className="w-8 h-8 text-orange-600" />
            <div>
              <h1 className="text-lg font-medium text-gray-900">District Dashboard</h1>
              <p className="text-sm text-gray-600">Local Community Health Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={`${selectedState}:${selectedDistrict}`}
              onChange={(e) => {
                const [stateId, districtId] = e.target.value.split(':');
                setSelectedState(stateId);
                setSelectedDistrict(districtId);
              }}
              className="bg-white border border-orange-300 text-gray-900 text-sm rounded-lg px-3 py-2"
            >
              {locations.map((location) => (
                <option key={`${location.stateId}:${location.districtId}`} value={`${location.stateId}:${location.districtId}`}>
                  {location.districtName}, {location.stateName}
                </option>
              ))}
            </select>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{mockUser.displayName}</p>
              <p className="text-xs text-gray-600">District Authority</p>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <nav className="bg-white/80 backdrop-blur-sm border-t border-orange-200">
          <ul className="flex space-x-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {['overview', 'gismap', 'resources', 'alerts'].map((tab) => (
              <li key={tab} className={`cursor-pointer py-3 border-b-2 ${activeTab === tab ? 'border-orange-600 font-medium text-orange-600' : 'border-transparent text-gray-600'}`} onClick={() => setActiveTab(tab as any)}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <section>
            <h2 className="text-2xl font-light text-gray-900 mb-4">{currentLocation.districtName}, {currentLocation.stateName}</h2>
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-8">
              <span>Population: {dashboardData.districtInfo.population}</span>
              <span>Active Interventions: {dashboardData.interventions.length}</span>
              <span>Completion Rate: {dashboardData.interventionCompletionRate.toFixed(1)}%</span>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-light text-gray-900">{dashboardData.activeAlerts.length}</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-600">Interventions</p>
                <p className="text-2xl font-light text-gray-900">{dashboardData.interventions.length}</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-light text-gray-900">{dashboardData.interventionCompletionRate.toFixed(0)}%</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-600">Total Resources</p>
                <p className="text-2xl font-light text-gray-900">{dashboardData.totalResources}</p>
              </div>
            </div>

            {/* Intervention Charts */}
            <div className="space-y-8">
              <ChartContainer title="Local Outbreak Trends" type="line" data={outbreakTrendData} xKey="date" yKey="cases" color="#ea580c" height={300} />
              <ChartContainer title="AI Prediction Confidence" type="bar" data={aiConfidenceData} xKey="name" yKey="confidence" color="#f97316" height={300} />
              <ChartContainer title="Predicted Resource Mix" type="pie" data={resourceMixPie} height={300} colors={["#fb923c", "#10b981", "#3b82f6", "#eab308"]} />
            </div>
          </section>
        )}

        {activeTab === 'gismap' && (
          <section>
            <PointDensityMap disease="waterborne" status="active" region="ne" refreshMs={10000} />
          </section>
        )}

        {activeTab === 'resources' && (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData.resources.map((resource: any) => (
                <ResourceCard key={resource.id} resource={resource} compact={true} showActions={true} onAllocate={handleAllocate} onRelease={handleRelease} />
              ))}
            </div>
          </section>
        )}

        {activeTab === 'alerts' && (
          <section>
            <AlertPanel alerts={dashboardData.activeAlerts} maxAlerts={20} showActions={true} compact={false} />
          </section>
        )}
      </main>
    </div>
  );
}
