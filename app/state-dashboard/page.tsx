'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import ChartContainer from '@/app/components/ChartContainer';
import AlertPanel from '@/app/components/AlertPanel';
import ResourceCard from '@/app/components/ResourceCard';
import PointDensityMap from '@/app/components/PointDensityMap';

// ---------- Types ----------
interface StateInfo {
  name: string;
  population: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | string;
}

interface HealthMetrics {
  healthcareAccess: number;
  vaccinationCoverage: number;
}

interface District {
  id: string;
  name: string;
  population: number;
  healthMetrics: HealthMetrics;
  activeAlerts: number;
  rank?: number;
  riskLevel?: string;
}

interface Resource {
  id: string;
  name: string;
  quantity: number;
  allocated: number;
}

interface Intervention {
  id: string;
  title: string;
  type: 'vaccination' | 'screening' | 'awareness' | string;
  status: 'ongoing' | 'completed' | string;
  completionPercentage: number;
  completedCount: number;
  targetPopulation: number;
  location: string;
}

interface DashboardData {
  stateInfo: StateInfo;
  districts: District[];
  districtRanking: District[];
  resources: Resource[];
  interventions: Intervention[];
  activeAlerts: any[]; // If you know the shape of alerts, replace "any" with an Alert type
  resourceSummary?: { utilizationRate: number };
}

// ---------- Component ----------
export default function StateDashboard() {
  const user = { displayName: "State Officer" };
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
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
      const data: DashboardData = await res.json();
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
    const resource = dashboardData.resources.find((r) => r.id === resourceId);
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
    const resource = dashboardData.resources.find((r) => r.id === resourceId);
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

  const districtComparisonData =
    dashboardData?.districts?.slice(0, 6).map((d) => ({
      name: d.name,
      healthcareAccess: d.healthMetrics.healthcareAccess || 0,
      vaccinationCoverage: d.healthMetrics.vaccinationCoverage || 0,
      alerts: d.activeAlerts || 0,
    })) || [];

  const interventionProgressData =
    dashboardData?.interventions?.map((i) => ({
      name: i.title.split(' ').slice(0, 2).join(' '),
      progress: i.completionPercentage || 0,
      target: 100,
    })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* --- HEADER, CONTENT, AND REST OF YOUR JSX (UNCHANGED) --- */}
      {/* Only types were fixed, JSX logic remains same */}
    </div>
  );
}