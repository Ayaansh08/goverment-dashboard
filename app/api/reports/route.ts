/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { getServerSession } from 'cosmic-authentication';
import { mockStates, mockAlerts, mockInterventions, mockResources } from '@/app/lib/mockData';
import { format } from 'date-fns';

export async function GET(request: Request) {
  try {
    const user = await getServerSession();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'overview';
    const format = searchParams.get('format') || 'json';
    const stateId = searchParams.get('stateId');
    const districtId = searchParams.get('districtId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let reportData: any = {};

    switch (reportType) {
      case 'overview':
        reportData = generateOverviewReport(stateId, districtId, startDate, endDate);
        break;
      
      case 'alerts':
        reportData = generateAlertsReport(stateId, districtId, startDate, endDate);
        break;
      
      case 'interventions':
        reportData = generateInterventionsReport(stateId, districtId, startDate, endDate);
        break;
      
      case 'resources':
        reportData = generateResourcesReport(stateId, districtId);
        break;
      
      case 'health-metrics':
        reportData = generateHealthMetricsReport(stateId, districtId);
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    if (format === 'json') {
      return NextResponse.json({
        reportType,
        data: reportData,
        metadata: {
          generatedAt: new Date().toISOString(),
          generatedBy: user.displayName || user.email,
          filters: {
            stateId,
            districtId,
            startDate,
            endDate
          }
        }
      });
    }

    // For PDF and Excel formats, we'll return the data structure
    // In a real implementation, you'd use jsPDF and xlsx libraries here
    return NextResponse.json({
      reportType,
      format,
      downloadUrl: `/api/reports/download?type=${reportType}&format=${format}&stateId=${stateId}&districtId=${districtId}`,
      data: reportData
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateOverviewReport(stateId?: string | null, districtId?: string | null, startDate?: string | null, endDate?: string | null) {
  let states = mockStates;
  
  if (stateId) {
    states = states.filter(state => state.id === stateId);
  }

  const totalPopulation = states.reduce((sum, state) => sum + state.population, 0);
  const totalDistricts = states.reduce((sum, state) => sum + state.districts.length, 0);
  
  let alerts = mockAlerts;
  let interventions = mockInterventions;
  let resources = mockResources;

  // Apply filters
  if (stateId) {
    alerts = alerts.filter(alert => alert.stateId === stateId);
    interventions = interventions.filter(int => int.stateId === stateId);
    resources = resources.filter(res => res.stateId === stateId);
  }

  if (districtId) {
    alerts = alerts.filter(alert => alert.districtId === districtId);
    interventions = interventions.filter(int => int.districtId === districtId);
    resources = resources.filter(res => res.districtId === districtId);
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    alerts = alerts.filter(alert => {
      const alertDate = new Date(alert.createdAt);
      return alertDate >= start && alertDate <= end;
    });
    interventions = interventions.filter(int => {
      const intDate = new Date(int.startDate);
      return intDate >= start && intDate <= end;
    });
  }

  return {
    summary: {
      totalStates: states.length,
      totalDistricts,
      totalPopulation,
      activeAlerts: alerts.filter(a => a.status === 'active').length,
      completedInterventions: interventions.filter(i => i.status === 'completed').length,
      totalResources: resources.length,
      resourceUtilization: resources.length > 0 
        ? resources.reduce((sum, r) => sum + (r.allocated / r.quantity), 0) / resources.length * 100 
        : 0
    },
    stateBreakdown: states.map(state => ({
      name: state.name,
      population: state.population,
      riskLevel: state.riskLevel,
      activeAlerts: state.activeAlerts,
      completedInterventions: state.completedInterventions,
      healthMetrics: state.healthMetrics
    })),
    alertsSummary: {
      total: alerts.length,
      active: alerts.filter(a => a.status === 'active').length,
      resolved: alerts.filter(a => a.status === 'resolved').length,
      bySeverity: {
        critical: alerts.filter(a => a.severity === 'critical').length,
        high: alerts.filter(a => a.severity === 'high').length,
        medium: alerts.filter(a => a.severity === 'medium').length,
        low: alerts.filter(a => a.severity === 'low').length
      }
    },
    interventionsSummary: {
      total: interventions.length,
      completed: interventions.filter(i => i.status === 'completed').length,
      ongoing: interventions.filter(i => i.status === 'ongoing').length,
 
      averageCompletion: interventions.length > 0 
        ? interventions.reduce((sum, i) => sum + i.completionPercentage, 0) / interventions.length 
        : 0
    }
  };
}

function generateAlertsReport(stateId?: string | null, districtId?: string | null, startDate?: string | null, endDate?: string | null) {
  let alerts = mockAlerts;

  // Apply filters
  if (stateId) {
    alerts = alerts.filter(alert => alert.stateId === stateId);
  }
  
  if (districtId) {
    alerts = alerts.filter(alert => alert.districtId === districtId);
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    alerts = alerts.filter(alert => {
      const alertDate = new Date(alert.createdAt);
      return alertDate >= start && alertDate <= end;
    });
  }

  // Sort by creation date
  alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    summary: {
      total: alerts.length,
      active: alerts.filter(a => a.status === 'active').length,
      resolved: alerts.filter(a => a.status === 'resolved').length,
   
      averageResponseTime: alerts
        .filter(a => a.responseTime)
        .reduce((sum, a) => sum + (a.responseTime || 0), 0) / alerts.filter(a => a.responseTime).length || 0
    },
    severityBreakdown: {
      critical: alerts.filter(a => a.severity === 'critical'),
      high: alerts.filter(a => a.severity === 'high'),
      medium: alerts.filter(a => a.severity === 'medium'),
      low: alerts.filter(a => a.severity === 'low')
    },
    timeline: alerts.map(alert => ({
      id: alert.id,
      title: alert.title,
      severity: alert.severity,
      location: alert.location,
      status: alert.status,
      createdAt: alert.createdAt,
      responseTime: alert.responseTime
    })),
    locationAnalysis: analyzeAlertsByLocation(alerts)
  };
}

function generateInterventionsReport(stateId?: string | null, districtId?: string | null, startDate?: string | null, endDate?: string | null) {
  let interventions = mockInterventions;

  // Apply filters
  if (stateId) {
    interventions = interventions.filter(int => int.stateId === stateId);
  }
  
  if (districtId) {
    interventions = interventions.filter(int => int.districtId === districtId);
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    interventions = interventions.filter(int => {
      const intDate = new Date(int.startDate);
      return intDate >= start && intDate <= end;
    });
  }

  return {
    summary: {
      total: interventions.length,
      completed: interventions.filter(i => i.status === 'completed').length,
      ongoing: interventions.filter(i => i.status === 'ongoing').length,
 
      totalTargetPopulation: interventions.reduce((sum, i) => sum + i.targetPopulation, 0),
      totalCompleted: interventions.reduce((sum, i) => sum + i.completedCount, 0),
      overallCompletionRate: interventions.length > 0 
        ? interventions.reduce((sum, i) => sum + i.completionPercentage, 0) / interventions.length 
        : 0
    },
    byType: {
      vaccination: interventions.filter(i => i.type === 'vaccination'),
      screening: interventions.filter(i => i.type === 'screening'),
    
      awareness: interventions.filter(i => i.type === 'awareness')
    },
    performance: interventions.map(intervention => ({
      id: intervention.id,
      title: intervention.title,
      type: intervention.type,
      targetPopulation: intervention.targetPopulation,
      completedCount: intervention.completedCount,
      completionPercentage: intervention.completionPercentage,
      status: intervention.status,
      location: intervention.location,
      assignedTo: intervention.assignedTo
    }))
  };
}

function generateResourcesReport(stateId?: string | null, districtId?: string | null) {
  let resources = mockResources;

  if (stateId) {
    resources = resources.filter(res => res.stateId === stateId);
  }
  
  if (districtId) {
    resources = resources.filter(res => res.districtId === districtId);
  }

  return {
    summary: {
      total: resources.length,
      totalQuantity: resources.reduce((sum, r) => sum + r.quantity, 0),
      totalAllocated: resources.reduce((sum, r) => sum + r.allocated, 0),
      totalAvailable: resources.reduce((sum, r) => sum + r.available, 0),
      overallUtilization: resources.length > 0 
        ? resources.reduce((sum, r) => sum + (r.allocated / r.quantity), 0) / resources.length * 100 
        : 0,
      criticalShortages: resources.filter(r => (r.available / r.quantity) < 0.2).length
    },
    byType: {
      medical_staff: resources.filter(r => r.type === 'medical_staff'),
      equipment: resources.filter(r => r.type === 'equipment'),
      medicine: resources.filter(r => r.type === 'medicine'),
      facility: resources.filter(r => r.type === 'facility')
    },
    byStatus: {
      available: resources.filter(r => r.status === 'available'),
      in_use: resources.filter(r => r.status === 'in_use'),
 
    },
    allocation: resources.map(resource => ({
      id: resource.id,
      name: resource.name,
      type: resource.type,
      quantity: resource.quantity,
      allocated: resource.allocated,
      available: resource.available,
      utilizationRate: (resource.allocated / resource.quantity) * 100,
      status: resource.status,
      location: resource.location
    }))
  };
}

function generateHealthMetricsReport(stateId?: string | null, districtId?: string | null) {
  let states = mockStates;
  
  if (stateId) {
    states = states.filter(state => state.id === stateId);
  }

  const healthData = states.flatMap(state => {
    const stateMetrics = [{
      type: 'state',
      id: state.id,
      name: state.name,
      population: state.population,
      ...state.healthMetrics
    }];

    const districtMetrics = state.districts
      .filter(district => !districtId || district.id === districtId)
      .map(district => ({
        type: 'district',
        id: district.id,
        name: district.name,
        stateId: state.id,
        stateName: state.name,
        population: district.population,
        ...district.healthMetrics
      }));

    return [...stateMetrics, ...districtMetrics];
  });

  return {
    summary: {
      totalLocations: healthData.length,
      averageMetrics: {
        mortalityRate: healthData.reduce((sum, d) => sum + d.mortalityRate, 0) / healthData.length,
        morbidityRate: healthData.reduce((sum, d) => sum + d.morbidityRate, 0) / healthData.length,
        vaccinationCoverage: healthData.reduce((sum, d) => sum + d.vaccinationCoverage, 0) / healthData.length,
        healthcareAccess: healthData.reduce((sum, d) => sum + d.healthcareAccess, 0) / healthData.length
      }
    },
    detailed: healthData.map(location => ({
      location: location.name,
      type: location.type,
      population: location.population,
      mortalityRate: location.mortalityRate,
      morbidityRate: location.morbidityRate,
      vaccinationCoverage: location.vaccinationCoverage,
      healthcareAccess: location.healthcareAccess,
      stateName: location.type === 'district' ? (location as { stateName?: string }).stateName : undefined
    })),
    rankings: {
      bestPerforming: healthData
        .sort((a, b) => (b.vaccinationCoverage + b.healthcareAccess - b.mortalityRate - b.morbidityRate) - 
                      (a.vaccinationCoverage + a.healthcareAccess - a.mortalityRate - a.morbidityRate))
        .slice(0, 5),
      needsAttention: healthData
        .sort((a, b) => (a.vaccinationCoverage + a.healthcareAccess - a.mortalityRate - a.morbidityRate) - 
                      (b.vaccinationCoverage + b.healthcareAccess - b.mortalityRate - b.morbidityRate))
        .slice(0, 5)
    }
  };
}

function analyzeAlertsByLocation(alerts: any[]) {
  const locationCounts = alerts.reduce((acc, alert) => {
    const location = alert.location;
    if (!acc[location]) {
      acc[location] = { total: 0, active: 0, resolved: 0 };
    }
    acc[location].total++;
    if (alert.status === 'active') acc[location].active++;
    if (alert.status === 'resolved') acc[location].resolved++;
    return acc;
  }, {} as Record<string, { total: number; active: number; resolved: number }>);

  const result: Array<{ location: string; total: number; active: number; resolved: number }> =
    Object.entries(locationCounts)
      .map(([location, counts]) => {
        const c = counts as { total: number; active: number; resolved: number };
        return { location, total: c.total, active: c.active, resolved: c.resolved };
      });

  return result.sort((a, b) => b.total - a.total);
}