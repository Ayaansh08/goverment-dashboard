/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { getServerSession } from 'cosmic-authentication';
import { mockStates } from '@/app/lib/mockData';

export async function GET(request: Request) {
  try {
    const user = await getServerSession();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'predictions';
    const stateId = searchParams.get('stateId');
    const districtId = searchParams.get('districtId');
    const timeframe = searchParams.get('timeframe') || '1week';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let aiData: any = {};

    switch (type) {
      case 'predictions':
        aiData = generateOutbreakPredictions(stateId, districtId, timeframe);
        break;
      
      case 'resource-demand':
        aiData = generateResourceDemandPrediction(stateId, districtId, timeframe);
        break;
      
      case 'risk-assessment':
        aiData = generateRiskAssessment(stateId, districtId);
        break;
      
      case 'simulation':
        aiData = generateInterventionSimulation(stateId, districtId);
        break;
      
      case 'anomaly-detection':
        aiData = generateAnomalyDetection(stateId, districtId);
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid AI analysis type' }, { status: 400 });
    }

    return NextResponse.json({
      type,
      data: aiData,
      metadata: {
        generatedAt: new Date().toISOString(),
        modelVersion: '2.1.0',
        confidence: aiData.confidence || 0.8,
        filters: { stateId, districtId, timeframe }
      }
    });

  } catch (error) {
    console.error('Error generating AI analysis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateOutbreakPredictions(stateId?: string | null, districtId?: string | null, timeframe?: string) {
  const baseOutbreaks = [
    {
      disease: 'Dengue',
      probability: 0.78,
      confidence: 0.85,
      severity: 'high',
      estimatedCases: 1250,
      peakDate: '2024-09-25',
      riskFactors: ['Monsoon season', 'Standing water', 'Temperature rise', 'Humidity increase'],
      preventiveMeasures: [
        'Eliminate standing water sources',
        'Increase vector control activities', 
        'Enhance community awareness',
        'Strengthen surveillance systems'
      ]
    },
    {
      disease: 'Influenza',
      probability: 0.65,
      confidence: 0.72,
      severity: 'medium',
      estimatedCases: 850,
      peakDate: '2024-09-20',
      riskFactors: ['Weather change', 'High population density', 'Air pollution', 'Seasonal pattern'],
      preventiveMeasures: [
        'Promote vaccination',
        'Improve air quality monitoring',
        'Enhance hygiene practices',
        'Prepare healthcare capacity'
      ]
    },
    {
      disease: 'Gastroenteritis',
      probability: 0.45,
      confidence: 0.68,
      severity: 'medium',
      estimatedCases: 600,
      peakDate: '2024-09-18',
      riskFactors: ['Water contamination', 'Food safety issues', 'Poor sanitation'],
      preventiveMeasures: [
        'Improve water quality testing',
        'Strengthen food safety regulations',
        'Enhance sanitation facilities',
        'Public health education'
      ]
    }
  ];

  // Adjust predictions based on location and timeframe
  const predictions = baseOutbreaks.map(outbreak => {
    let adjustedProbability = outbreak.probability;
    let adjustedCases = outbreak.estimatedCases;

    // Location-based adjustments
    if (stateId) {
      const stateData = mockStates.find(s => s.id === stateId);
      if (stateData) {
        const riskMultiplier = 
                             stateData.riskLevel === 'high' ? 1.1 :
                             stateData.riskLevel === 'medium' ? 1.0 : 0.8;
        adjustedProbability *= riskMultiplier;
        adjustedCases *= riskMultiplier;
      }
    }

    // Timeframe adjustments
    const timeMultiplier = timeframe === '1month' ? 1.2 : 
                          timeframe === '3months' ? 0.9 : 1.0;
    adjustedProbability *= timeMultiplier;

    return {
      ...outbreak,
      probability: Math.min(adjustedProbability, 1.0),
      estimatedCases: Math.round(adjustedCases),
      location: getLocationName(stateId, districtId),
      timeframe,
      lastUpdated: new Date().toISOString()
    };
  });

  // Sort by probability
  predictions.sort((a, b) => b.probability - a.probability);

  return {
    predictions,
    summary: {
      totalPredictions: predictions.length,
      highRiskOutbreaks: predictions.filter(p => p.probability > 0.7).length,
      estimatedTotalCases: predictions.reduce((sum, p) => sum + p.estimatedCases, 0),
      mostLikelyOutbreak: predictions[0],
      averageConfidence: predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length
    },
    confidence: predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length
  };
}

function generateResourceDemandPrediction(stateId?: string | null, districtId?: string | null, timeframe?: string) {
  const baseDemand = {
    icuBeds: 1250,
    ventilators: 340,
    medicines: 15000,
    medicalStaff: 450,
    ambulances: 85,
    testingKits: 25000
  };

  // Adjust based on timeframe
  const timeMultiplier = timeframe === '1month' ? 1.4 : 
                        timeframe === '3months' ? 2.1 : 1.0;

  // Location-based adjustments
  let locationMultiplier = 1.0;
  if (stateId) {
    const stateData = mockStates.find(s => s.id === stateId);
    if (stateData) {
      const populationRatio = stateData.population / 100000000; // Adjust based on population
      const riskMultiplier = 
                           stateData.riskLevel === 'high' ? 1.2 :
                           stateData.riskLevel === 'medium' ? 1.0 : 0.8;
      locationMultiplier = populationRatio * riskMultiplier;
    }
  }

  const predictions = Object.entries(baseDemand).map(([resource, baseValue]) => ({
    resource,
    currentCapacity: Math.round(baseValue * 0.8),
    predictedDemand: Math.round(baseValue * timeMultiplier * locationMultiplier),
    surplus: Math.round((baseValue * 0.8) - (baseValue * timeMultiplier * locationMultiplier)),
    confidence: 0.75 + Math.random() * 0.2, // Random confidence between 0.75-0.95
    criticalPeriod: timeframe === '1month' ? 'Week 3-4' : 
                   timeframe === '3months' ? 'Month 2-3' : 'Week 1-2'
  }));

  const criticalShortages = predictions.filter(p => p.surplus < 0);
  
  return {
    predictions,
    summary: {
      totalResourceTypes: predictions.length,
      criticalShortages: criticalShortages.length,
      overallSurplus: predictions.reduce((sum, p) => sum + p.surplus, 0),
      highestDemand: predictions.reduce((max, p) => p.predictedDemand > max.predictedDemand ? p : max),
      averageConfidence: predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length
    },
    recommendations: generateResourceRecommendations(criticalShortages),
    confidence: predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length,
    location: getLocationName(stateId, districtId),
    timeframe
  };
}

function generateRiskAssessment(stateId?: string | null, districtId?: string | null) {
  let locations = mockStates;
  
  if (stateId) {
    locations = locations.filter(state => state.id === stateId);
  }

  const assessments = locations.flatMap(state => {
    const stateAssessment = {
      id: state.id,
      name: state.name,
      type: 'state',
      currentRiskLevel: state.riskLevel,
      riskScore: calculateRiskScore(state),
      predictedRiskLevel: predictFutureRisk(state),
      riskFactors: analyzeRiskFactors(state),
      population: state.population,
      vulnerabilityIndex: calculateVulnerabilityIndex(state),
      confidence: 0.82
    };

    const districtAssessments = state.districts
      .filter(district => !districtId || district.id === districtId)
      .map(district => ({
        id: district.id,
        name: district.name,
        type: 'district',
        stateId: state.id,
        stateName: state.name,
        currentRiskLevel: district.riskLevel,
        riskScore: calculateRiskScore(district),
        predictedRiskLevel: predictFutureRisk(district),
        riskFactors: analyzeRiskFactors(district),
        population: district.population,
        vulnerabilityIndex: calculateVulnerabilityIndex(district),
        confidence: 0.78
      }));

    return [stateAssessment, ...districtAssessments];
  });

  // Sort by risk score
  assessments.sort((a, b) => b.riskScore - a.riskScore);

  return {
    assessments: assessments.slice(0, 20), // Top 20 highest risk
    summary: {
      totalLocations: assessments.length,
      highRiskLocations: assessments.filter(a => a.riskScore > 0.7).length,
      averageRiskScore: assessments.reduce((sum, a) => sum + a.riskScore, 0) / assessments.length,
      topRiskLocation: assessments[0],
      trendAnalysis: {
        increasingRisk: assessments.filter(a => a.predictedRiskLevel === 'high' || a.predictedRiskLevel === 'critical').length,
        stableRisk: assessments.filter(a => a.currentRiskLevel === a.predictedRiskLevel).length,
        decreasingRisk: assessments.filter(a => getRiskValue(a.predictedRiskLevel) < getRiskValue(a.currentRiskLevel)).length
      }
    },
    confidence: assessments.reduce((sum, a) => sum + a.confidence, 0) / assessments.length
  };
}

function generateInterventionSimulation(stateId?: string | null, districtId?: string | null) {
  const interventionTypes = [
    {
      type: 'vaccination',
      name: 'Mass Vaccination Campaign',
      targetPopulation: 100000,
      estimatedCost: 2500000,
      duration: '6 weeks',
      expectedEffectiveness: 0.85,
      impactOnRisk: -0.3
    },
    {
      type: 'screening',
      name: 'Community Health Screening',
      targetPopulation: 50000,
      estimatedCost: 800000,
      duration: '4 weeks',
      expectedEffectiveness: 0.78,
      impactOnRisk: -0.15
    },
    {
      type: 'awareness',
      name: 'Public Health Education',
      targetPopulation: 200000,
      estimatedCost: 300000,
      duration: '8 weeks',
      expectedEffectiveness: 0.65,
      impactOnRisk: -0.1
    },
    {
      type: 'treatment',
      name: 'Enhanced Treatment Protocol',
      targetPopulation: 25000,
      estimatedCost: 1200000,
      duration: '12 weeks',
      expectedEffectiveness: 0.92,
      impactOnRisk: -0.25
    }
  ];

  const simulations = interventionTypes.map(intervention => {
    const baselineRisk = stateId ? 
      mockStates.find(s => s.id === stateId)?.riskLevel || 'medium' : 'medium';
    
    const currentRiskValue = getRiskValue(baselineRisk);
    const projectedRiskValue = Math.max(0.1, currentRiskValue + intervention.impactOnRisk);
    
    return {
      ...intervention,
      currentRisk: baselineRisk,
      projectedRisk: getValueRisk(projectedRiskValue),
      riskReduction: currentRiskValue - projectedRiskValue,
      costEffectiveness: (currentRiskValue - projectedRiskValue) / (intervention.estimatedCost / 1000000),
      confidenceInterval: {
        low: intervention.expectedEffectiveness - 0.1,
        high: Math.min(1.0, intervention.expectedEffectiveness + 0.1)
      },
      resourceRequirements: generateResourceRequirements(intervention),
      timeline: generateInterventionTimeline(intervention),
      location: getLocationName(stateId, districtId)
    };
  });

  // Sort by cost-effectiveness
  simulations.sort((a, b) => b.costEffectiveness - a.costEffectiveness);

  return {
    simulations,
    recommendations: {
      mostCostEffective: simulations[0],
      highestImpact: simulations.reduce((max, sim) => sim.riskReduction > max.riskReduction ? sim : max),
      quickestResult: simulations.reduce((min, sim) => 
        parseInt(sim.duration) < parseInt(min.duration) ? sim : min)
    },
    summary: {
      totalInterventions: simulations.length,
      averageCost: simulations.reduce((sum, s) => sum + s.estimatedCost, 0) / simulations.length,
      averageEffectiveness: simulations.reduce((sum, s) => sum + s.expectedEffectiveness, 0) / simulations.length,
      totalTargetPopulation: simulations.reduce((sum, s) => sum + s.targetPopulation, 0)
    },
    confidence: 0.82
  };
}

function generateAnomalyDetection(stateId?: string | null, districtId?: string | null) {
  const anomalies = [
    {
      id: 'anomaly-001',
      type: 'alert_spike',
      description: 'Unusual increase in health alerts in the past 7 days',
      location: 'Mumbai, Maharashtra',
      stateId: 'mh',
      severity: 'high',
      confidence: 0.87,
      detectedAt: '2024-09-08T14:30:00Z',
      metrics: {
        baseline: 2.3,
        current: 8.1,
        deviation: 252
      },
      possibleCauses: [
        'Disease outbreak',
        'Environmental factors',
        'Reporting system changes',
        'Population event'
      ]
    },
    {
      id: 'anomaly-002',
      type: 'resource_drain',
      description: 'Rapid depletion of medical resources',
      location: 'Agra, Uttar Pradesh',
      stateId: 'up',
      severity: 'critical',
      confidence: 0.91,
      detectedAt: '2024-09-08T10:15:00Z',
      metrics: {
        baseline: 85.2,
        current: 32.7,
        deviation: -62
      },
      possibleCauses: [
        'Supply chain disruption',
        'Increased demand',
        'Resource misallocation',
        'Administrative issues'
      ]
    },
    {
      id: 'anomaly-003',
      type: 'mortality_pattern',
      description: 'Unexpected change in mortality patterns',
      location: 'Lucknow, Uttar Pradesh',
      stateId: 'up',
      severity: 'medium',
      confidence: 0.75,
      detectedAt: '2024-09-07T16:45:00Z',
      metrics: {
        baseline: 5.8,
        current: 9.2,
        deviation: 59
      },
      possibleCauses: [
        'New health threat',
        'Treatment protocol changes',
        'Data collection changes',
        'Seasonal variation'
      ]
    }
  ];

  let filteredAnomalies = anomalies;
  
  if (stateId) {
    filteredAnomalies = filteredAnomalies.filter(anomaly => anomaly.stateId === stateId);
  }

  return {
    anomalies: filteredAnomalies,
    summary: {
      total: filteredAnomalies.length,
      critical: filteredAnomalies.filter(a => a.severity === 'critical').length,
      high: filteredAnomalies.filter(a => a.severity === 'high').length,
      medium: filteredAnomalies.filter(a => a.severity === 'medium').length,
      averageConfidence: filteredAnomalies.reduce((sum, a) => sum + a.confidence, 0) / filteredAnomalies.length,
      recentAnomalies: filteredAnomalies.filter(a => 
        new Date(a.detectedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length
    },
    patterns: {
      mostCommonType: 'alert_spike',
      mostAffectedLocation: 'Uttar Pradesh',
      timeDistribution: analyzeAnomalyTimeDistribution(filteredAnomalies)
    },
    confidence: filteredAnomalies.reduce((sum, a) => sum + a.confidence, 0) / filteredAnomalies.length
  };
}

// Helper functions
function getLocationName(stateId?: string | null, districtId?: string | null): string {
  if (districtId) {
    const state = mockStates.find(s => s.id === stateId);
    const district = state?.districts.find(d => d.id === districtId);
    return `${district?.name}, ${state?.name}` || 'Unknown District';
  }
  if (stateId) {
    const state = mockStates.find(s => s.id === stateId);
    return state?.name || 'Unknown State';
  }
  return 'National Level';
}

function calculateRiskScore(location: any): number {
  const riskValues = { critical: 0.9, high: 0.7, medium: 0.5, low: 0.2 };
  const baseRisk = riskValues[location.riskLevel as keyof typeof riskValues] || 0.5;
  
  // Adjust based on health metrics
  const healthFactor = (
    (100 - location.healthMetrics.vaccinationCoverage) / 100 * 0.3 +
    location.healthMetrics.mortalityRate / 20 * 0.3 +
    (100 - location.healthMetrics.healthcareAccess) / 100 * 0.2 +
    location.healthMetrics.morbidityRate / 50 * 0.2
  );
  
  return Math.min(1.0, baseRisk + healthFactor);
}

function predictFutureRisk(location: any): string {
  const currentScore = calculateRiskScore(location);
  const alertFactor = location.activeAlerts / 10; // Normalize alerts
  
  const futureScore = currentScore + (alertFactor * 0.1) + (Math.random() - 0.5) * 0.1;
  
  return getValueRisk(futureScore);
}

function getRiskValue(riskLevel: string): number {
  switch (riskLevel) {
    case 'critical': return 0.9;
    case 'high': return 0.7;
    case 'medium': return 0.5;
    case 'low': return 0.2;
    default: return 0.5;
  }
}

function getValueRisk(value: number): string {
  if (value >= 0.8) return 'critical';
  if (value >= 0.6) return 'high';
  if (value >= 0.4) return 'medium';
  return 'low';
}

function analyzeRiskFactors(location: any) {
  const factors = [];
  
  if (location.healthMetrics.vaccinationCoverage < 70) {
    factors.push({ factor: 'Low vaccination coverage', impact: 'high' });
  }
  if (location.healthMetrics.mortalityRate > 7) {
    factors.push({ factor: 'High mortality rate', impact: 'high' });
  }
  if (location.healthMetrics.healthcareAccess < 70) {
    factors.push({ factor: 'Limited healthcare access', impact: 'medium' });
  }
  if (location.activeAlerts > 5) {
    factors.push({ factor: 'Multiple active alerts', impact: 'high' });
  }
  
  return factors;
}

function calculateVulnerabilityIndex(location: any): number {
  return (
    (100 - location.healthMetrics.vaccinationCoverage) / 100 * 0.25 +
    location.healthMetrics.mortalityRate / 20 * 0.25 +
    (100 - location.healthMetrics.healthcareAccess) / 100 * 0.25 +
    location.healthMetrics.morbidityRate / 50 * 0.25
  );
}

function generateResourceRecommendations(criticalShortages: any[]) {
  return criticalShortages.map(shortage => ({
    resource: shortage.resource,
    action: `Increase ${shortage.resource} capacity by ${Math.abs(shortage.surplus)} units`,
    priority: shortage.surplus < -100 ? 'critical' : 'high',
    timeline: shortage.surplus < -100 ? 'immediate' : '1-2 weeks'
  }));
}

function generateResourceRequirements(intervention: any) {
  const baseRequirements = {
    vaccination: { staff: 50, equipment: 25, facilities: 10 },
    screening: { staff: 30, equipment: 15, facilities: 8 },
    awareness: { staff: 20, equipment: 5, facilities: 15 },
    treatment: { staff: 80, equipment: 40, facilities: 12 }
  };

  return baseRequirements[intervention.type as keyof typeof baseRequirements] || baseRequirements.vaccination;
}

function generateInterventionTimeline(intervention: any) {
  const totalWeeks = parseInt(intervention.duration);
  const phases = Math.ceil(totalWeeks / 2);
  
  return Array.from({ length: phases }, (_, i) => ({
    phase: i + 1,
    weeks: `${i * 2 + 1}-${Math.min(totalWeeks, (i + 1) * 2)}`,
    activities: [`Phase ${i + 1} activities for ${intervention.name}`],
    milestones: [`Phase ${i + 1} completion target: ${(i + 1) * (100 / phases)}%`]
  }));
}

function analyzeAnomalyTimeDistribution(anomalies: any[]) {
  const hours = anomalies.map(a => new Date(a.detectedAt).getHours());
  const distribution = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: hours.filter(h => h === i).length
  }));
  
  return distribution.filter(d => d.count > 0);
}