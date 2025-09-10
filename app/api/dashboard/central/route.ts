import { NextResponse } from 'next/server';
import { mockStates, mockAlerts, mockInterventions, mockAIPredictions } from '@/app/lib/mockData';

// REMOVE cosmic-authentication + cosmic-database for now

export async function GET() {
  try {
    // Central dashboard - national overview
    const totalPopulation = mockStates.reduce((sum, state) => sum + state.population, 0);
    const totalDistricts = mockStates.reduce((sum, state) => sum + state.districts.length, 0);
    const activeAlerts = mockAlerts.filter(alert => alert.status === 'active').length;
    const completedInterventions = mockInterventions.filter(int => int.status === 'completed').length;

    // Calculate overall risk level
    const highRiskStates = mockStates.filter(state => 
      state.riskLevel === 'high' || state.riskLevel === 'medium'
    ).length;

    let overallRiskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (highRiskStates >= 3) overallRiskLevel = 'critical';
    else if (highRiskStates >= 2) overallRiskLevel = 'high';
    else if (highRiskStates >= 1) overallRiskLevel = 'medium';

    // Top 5 at-risk states
    const topRiskStates = mockStates
      .sort((a, b) => {
        const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
      })
      .slice(0, 5)
      .map(state => ({
        name: state.name,
        riskLevel: state.riskLevel,
        activeAlerts: state.activeAlerts,
        population: state.population,
        coordinates: state.coordinates
      }));

    // Recent alerts
    const recentAlerts = mockAlerts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    // Mock resources for now (since no DB)
    const resources = [
      { id: '1', name: 'ICU Beds', quantity: 100, allocated: 45 },
      { id: '2', name: 'Ventilators', quantity: 50, allocated: 30 },
    ];

    const dashboardData = {
      nationalOverview: {
        totalPopulation,
        totalStates: mockStates.length,
        totalDistricts,
        activeAlerts,
        completedInterventions,
        riskLevel: overallRiskLevel,
      },
      stateData: mockStates,
      topRiskStates,
      recentAlerts,
      aiPredictions: mockAIPredictions,
      resources,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching central dashboard data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
