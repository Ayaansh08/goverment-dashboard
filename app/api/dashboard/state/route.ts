import { NextResponse } from 'next/server';
import { mockStates, mockAlerts, mockInterventions, mockResources } from '@/app/lib/mockData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stateId = searchParams.get('stateId') || 'ar'; // Default to NE state (Arunachal Pradesh)

    // Fetch state data
    const stateData = mockStates.find(state => state.id === stateId);

    if (!stateData) {
      return NextResponse.json({ error: 'State not found' }, { status: 404 });
    }

    // State-specific alerts
    const stateAlerts = mockAlerts.filter(alert => alert.stateId === stateId);

    // State-specific interventions
    const stateInterventions = mockInterventions.filter(int => int.stateId === stateId);

    // State-specific resources
    const stateResources = mockResources.filter(res => res.stateId === stateId);

    // District risk ranking (sorted by severity: critical > high > medium > low)
    const districtRanking = stateData.districts
      .sort((a, b) => {
        const riskOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        return (riskOrder[b.riskLevel] || 0) - (riskOrder[a.riskLevel] || 0);
      })
      .map((district, index) => ({
        rank: index + 1,
        id: district.id,
        name: district.name,
        riskLevel: district.riskLevel,
        activeAlerts: district.activeAlerts,
        completedInterventions: district.completedInterventions,
        population: district.population,
        coordinates: district.coordinates,
        healthMetrics: district.healthMetrics,
      }));

    // Resource utilization summary
    const totalAllocated = stateResources.reduce((sum, r) => sum + (r.allocated || 0), 0);
    const totalQuantity = stateResources.reduce((sum, r) => sum + (r.quantity || 0), 0);
    const utilizationRate = totalQuantity ? Math.round((totalAllocated / totalQuantity) * 100) : 0;

    const resourceSummary = {
      totalResources: stateResources.length,
      utilizationRate,
      criticalShortages: stateResources.filter(r => r.available === 0).length,
    };

    const dashboardData = {
      stateInfo: stateData,
      districts: stateData.districts,
      districtRanking,
      activeAlerts: stateAlerts.filter(alert => alert.status === 'active'),
      recentAlerts: stateAlerts
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
      interventions: stateInterventions,
      resources: stateResources,
      resourceSummary,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching state dashboard data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
