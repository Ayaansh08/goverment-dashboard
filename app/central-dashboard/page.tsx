'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import ChartContainer from '@/app/components/ChartContainer';
import AlertPanel from '@/app/components/AlertPanel';
import PointDensityMap from '@/app/components/PointDensityMap';
import ResourceCard from '@/app/components/ResourceCard';
import AddResourceForm from '@/app/components/AddResourceForm';

export default function CentralDashboard() {
  const user = { displayName: "Central Authority" };
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'map'>('overview');

  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [stateResources, setStateResources] = useState<any[]>([]);
  const [stateResourcesLoading, setStateResourcesLoading] = useState(false);

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
      const response = await fetch('/api/dashboard/central');
      if (response.ok) {
        setDashboardData(await response.json());
      } else {
        console.error('Failed to fetch central dashboard:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStateResources = async (stateId: string) => {
    try {
      setStateResourcesLoading(true);
      const res = await fetch(`/api/resources?stateId=${encodeURIComponent(stateId)}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setStateResources(data.resources ?? data ?? []);
    } catch (err) {
      console.error('Error fetching state resources:', err);
      setStateResources([]);
    } finally {
      setStateResourcesLoading(false);
    }
  };

  const updateResourceAllocation = async (resourceId: string, delta: number) => {
    const res =
      stateResources.find((r: any) => r.id === resourceId) ??
      (dashboardData?.resources || []).find((r: any) => r.id === resourceId);

    if (!res) return;

    const newAllocated = Math.max(
      0,
      Math.min((Number(res.allocated) || 0) + delta, Number(res.quantity) || 0)
    );

    try {
      const put = await fetch('/api/resources', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resourceId, allocated: newAllocated })
      });
      if (!put.ok) console.error('Resource update failed:', await put.text());
    } catch (e) {
      console.error('Allocation update failed:', e);
    } finally {
      fetchDashboardData();
      if (selectedStateId) fetchStateResources(selectedStateId);
    }
  };

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

  const stateRiskData =
    dashboardData?.topRiskStates?.map((state: any) => ({
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
      population: state.population / 1_000_000
    })) || [];

  const alertTrendData = [
    { date: 'Sep 1', alerts: 15, resolved: 12 },
    { date: 'Sep 2', alerts: 23, resolved: 18 },
    { date: 'Sep 3', alerts: 18, resolved: 15 },
    { date: 'Sep 4', alerts: 31, resolved: 22 },
    { date: 'Sep 5', alerts: 27, resolved: 25 },
    { date: 'Sep 6', alerts: 35, resolved: 28 },
    { date: 'Sep 7', alerts: 29, resolved: 26 },
    { date: 'Sep 8', alerts: 38, resolved: 30 }
  ];

  const resourceUtilizationData = [
    { name: 'ICU Beds', value: 85 },
    { name: 'Ventilators', value: 72 },
    { name: 'Medical Staff', value: 68 },
    { name: 'Medicines', value: 91 },
    { name: 'Ambulances', value: 79 }
  ];

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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Resources (State)</h3>
                  <span className="text-xs text-gray-600">Select state to view</span>
                </div>

                <div className="bg-white shadow rounded-xl p-4 mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select State</label>
                  <select
                    value={selectedStateId}
                    onChange={(e) => setSelectedStateId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Select a state --</option>
                    {dashboardData?.stateData?.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-white shadow rounded-xl p-6">
                  {!selectedStateId ? (
                    <p className="text-sm text-gray-600">Pick a state from the dropdown to see its resources.</p>
                  ) : stateResourcesLoading ? (
                    <p className="text-sm text-gray-600">Loading resources...</p>
                  ) : stateResources.length === 0 ? (
                    <p className="text-sm text-gray-600">No resources found for this state.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {stateResources.map((resource: any) => (
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

              <div>
                <AddResourceForm
                  stateId={selectedStateId}
                  onCreated={async () => {
                    await fetchDashboardData();
                    if (selectedStateId) await fetchStateResources(selectedStateId);
                  }}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'alerts' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Alerts</h2>
            {dashboardData?.recentAlerts ? (
              <AlertPanel alerts={dashboardData.recentAlerts} maxAlerts={20} showActions={false} />
            ) : (
              <p className="text-gray-600">No alerts currently.</p>
            )}
          </div>
        )}

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
