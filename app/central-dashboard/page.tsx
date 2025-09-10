'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import ChartContainer from '@/app/components/ChartContainer';
import AlertPanel from '@/app/components/AlertPanel';
import PointDensityMap from '@/app/components/PointDensityMap';
import ResourceCard from '@/app/components/ResourceCard';
import AddResourceForm from '@/app/components/AddResourceForm';

// ----------------------
// TYPES
// ----------------------
// dashboard/types.ts
export interface Resource {
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

export interface StateData {
  id: string;
  name: string;
  population: number;
  activeAlerts: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
}

export interface Alert {
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

export interface DashboardData {
  stateData: StateData[];
  topRiskStates?: StateData[];
  recentAlerts?: Alert[];
  resources?: Resource[];
}


// ----------------------
// COMPONENT
// ----------------------
export default function CentralDashboard() {
  const user = { displayName: 'Central Authority' };
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'map'>('overview');

  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [stateResources, setStateResources] = useState<Resource[]>([]);
  const [stateResourcesLoading, setStateResourcesLoading] = useState(false);

  // ----------------------
  // FETCH DASHBOARD
  // ----------------------
  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (dashboardData?.stateData?.length && !selectedStateId) {
      setSelectedStateId(dashboardData.stateData[0].id);
    }
  }, [dashboardData, selectedStateId]);

  useEffect(() => {
    if (selectedStateId) fetchStateResources(selectedStateId);
    else setStateResources([]);
  }, [selectedStateId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/central');
      if (res.ok) setDashboardData(await res.json());
      else console.error('Failed to fetch dashboard data:', res.statusText);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStateResources = async (stateId: string) => {
    try {
      setStateResourcesLoading(true);
      const res = await fetch(`/api/resources?stateId=${encodeURIComponent(stateId)}`);
      if (!res.ok) throw new Error(await res.text());
      const data: { resources?: Resource[] } = await res.json();
      setStateResources(data.resources ?? []);
    } catch (err) {
      console.error('Error fetching state resources:', err);
      setStateResources([]);
    } finally {
      setStateResourcesLoading(false);
    }
  };

  const updateResourceAllocation = async (resourceId: string, delta: number) => {
    const res =
      stateResources.find((r) => r.id === resourceId) ??
      dashboardData?.resources?.find((r) => r.id === resourceId);

    if (!res) return;

    const newAllocated = Math.max(
      0,
      Math.min((res.allocated || 0) + delta, res.quantity)
    );

    try {
      const put = await fetch('/api/resources', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resourceId, allocated: newAllocated }),
      });
      if (!put.ok) console.error('Resource update failed:', await put.text());
    } catch (err) {
      console.error('Allocation update failed:', err);
    } finally {
      fetchDashboardData();
      if (selectedStateId) fetchStateResources(selectedStateId);
    }
  };

  // ----------------------
  // LOADING STATE
  // ----------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Central Dashboard...</p>
        </div>
      </div>
    );
  }

  // ----------------------
  // DATA TRANSFORMATIONS
  // ----------------------
  const stateRiskData =
    dashboardData?.topRiskStates?.map((state) => ({
      name: state.name,
      riskScore:
        state.riskLevel === 'critical'
          ? 90
          : state.riskLevel === 'high'
          ? 70
          : state.riskLevel === 'medium'
          ? 50
          : 30,
      alerts: state.activeAlerts,
      population: state.population / 1_000_000,
    })) || [];

  const resourceUtilizationData = [
    { name: 'ICU Beds', value: 85 },
    { name: 'Ventilators', value: 72 },
    { name: 'Medical Staff', value: 68 },
    { name: 'Medicines', value: 91 },
    { name: 'Ambulances', value: 79 },
  ];

  // ----------------------
  // RENDER
  // ----------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Icon icon="material-symbols:arrow-back" className="w-5 h-5 text-blue-600" />
              </button>
              <div className="flex items-center space-x-3">
                <Icon icon="material-symbols:dashboard" className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-lg font-medium text-gray-900">Central Dashboard</h1>
                  <p className="text-sm text-gray-600">National Health Monitoring</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.displayName}</p>
                <p className="text-xs text-gray-600">Central Authority</p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-blue-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-6">
          {['overview', 'alerts', 'map'].map((tab) => (
            <button
              key={tab}
              className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === tab ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-blue-50'
              }`}
              onClick={() => setActiveTab(tab as typeof activeTab)}
            >
              {tab === 'overview' ? 'Overview' : tab === 'alerts' ? 'Alerts' : 'GIS Map'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <>
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                <ChartContainer
                  title="State Risk Levels"
                  type="bar"
                  data={stateRiskData}
                  xKey="name"
                  yKey="riskScore"
                  color="#2563eb"
                  height={300}
                />
              </div>
              <ChartContainer
                title="Resource Utilization"
                type="pie"
                data={resourceUtilizationData}
                height={300}
                colors={['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed']}
              />
            </div>

            {/* Resource Allocation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                {/* State Dropdown */}
                <div className="bg-white shadow rounded-xl p-4 mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select State</label>
                  <select
                    value={selectedStateId}
                    onChange={(e) => setSelectedStateId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {dashboardData?.stateData?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Resource Cards */}
                <div className="bg-white shadow rounded-xl p-6">
                  {!selectedStateId ? (
                    <p className="text-sm text-gray-600">Pick a state to see resources.</p>
                  ) : stateResourcesLoading ? (
                    <p className="text-sm text-gray-600">Loading resources...</p>
                  ) : stateResources.length === 0 ? (
                    <p className="text-sm text-gray-600">No resources found for this state.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {stateResources.map((resource) => (
                        <ResourceCard
                          key={resource.id}
                          resource={resource}
                          showActions
                          compact
                          onAllocate={(id, amt) => updateResourceAllocation(id, amt)}
                          onRelease={(id, amt) => updateResourceAllocation(id, -amt)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Add Resource Form */}
              <div>
                {selectedStateId && (
                  <AddResourceForm
                    stateId={selectedStateId}
                    onCreated={async () => {
                      await fetchDashboardData();
                      if (selectedStateId) await fetchStateResources(selectedStateId);
                    }}
                  />
                )}
              </div>
            </div>
          </>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Alerts</h2>
            {dashboardData?.recentAlerts?.length ? (
              <AlertPanel alerts={dashboardData.recentAlerts} maxAlerts={20} showActions={false} />
            ) : (
              <p className="text-gray-600">No alerts currently.</p>
            )}
          </div>
        )}

        {/* Map Tab */}
        {activeTab === 'map' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">NE India Active Waterborne Cases</h2>
            <PointDensityMap disease="waterborne" status="active" region="ne" refreshMs={10000} />
          </div>
        )}
      </main>
    </div>
  );
}
