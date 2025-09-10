import { NextResponse } from 'next/server';
import { getServerSession } from 'cosmic-authentication';
import { mockStates, mockAlerts, mockInterventions } from '@/app/lib/mockData';
import { db } from 'cosmic-database';

export async function GET(request: Request) {
  try {
    const user = await getServerSession();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const stateId = searchParams.get('stateId') || 'mh';
    const districtId = searchParams.get('districtId') || 'mh-mumbai';

    const stateData = mockStates.find(state => state.id === stateId);
    
    if (!stateData) {
      return NextResponse.json({ error: 'State not found' }, { status: 404 });
    }

    const districtData = stateData.districts.find(district => district.id === districtId);
    
    if (!districtData) {
      return NextResponse.json({ error: 'District not found' }, { status: 404 });
    }

    // District-specific alerts
    const districtAlerts = mockAlerts.filter(alert => alert.districtId === districtId);
    
    // District-specific interventions
    const districtInterventions = mockInterventions.filter(int => int.districtId === districtId);
    
    // District-specific resources from DB
    const resSnap = await db.collection('resources').where('districtId', '==', districtId).limit(500).get();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const districtResources = resSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    // Generate outbreak trend data (mock)
    const outbreakTrends = [
      { date: '2024-08-01', cases: 12, deaths: 0 },
      { date: '2024-08-08', cases: 18, deaths: 1 },
      { date: '2024-08-15', cases: 25, deaths: 1 },
      { date: '2024-08-22', cases: 32, deaths: 2 },
      { date: '2024-08-29', cases: 28, deaths: 1 },
      { date: '2024-09-05', cases: 35, deaths: 2 },
      { date: '2024-09-08', cases: 41, deaths: 3 }
    ];

    // AI prediction confidence for this district
    const aiConfidenceMetrics = {
      outbreakPrediction: {
        nextWeek: { confidence: 0.82, riskLevel: districtData.riskLevel },
        nextMonth: { confidence: 0.65, riskLevel: districtData.riskLevel }
      },
      resourceDemand: {
        beds: { predicted: 150, confidence: 0.78 },
        staff: { predicted: 45, confidence: 0.71 },
        medicines: { predicted: 2500, confidence: 0.85 }
      }
    };

    // Local resource status cards
    const resourceStatusCards = districtResources.map(resource => ({
      id: resource.id,
      name: resource.name,
      type: resource.type,
      utilizationRate: (Number(resource.allocated) || 0) / (Number(resource.quantity) || 1) * 100,
      availability: Number(resource.available) || 0,
      status: resource.status,
      lastUpdated: resource.lastUpdated
    }));

    const dashboardData = {
      districtInfo: districtData,
      stateInfo: { name: stateData.name, id: stateData.id },
      activeAlerts: districtAlerts.filter(alert => alert.status === 'active'),
      recentAlerts: districtAlerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3),
      interventions: districtInterventions,
      outbreakTrends,
      aiConfidenceMetrics,
      resourceStatusCards,
      resources: districtResources,
      totalResources: districtResources.length,
      interventionCompletionRate: districtInterventions.length > 0 
        ? districtInterventions.reduce((sum, int) => sum + int.completionPercentage, 0) / districtInterventions.length 
        : 0,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching district dashboard data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}