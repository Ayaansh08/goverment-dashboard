import { NextResponse } from 'next/server';
import { getServerSession } from 'cosmic-authentication';
import { mockStates, mockResources } from '@/app/lib/mockData';

// Convert mockResources to a state-wise map for quick access
const stateResources: Record<string, typeof mockResources> = {};
mockResources.forEach(resource => {
  if (!stateResources[resource.stateId]) stateResources[resource.stateId] = [];
  stateResources[resource.stateId].push(resource);
});

export async function GET(request: Request) {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'heatmap';
    const stateId = searchParams.get('stateId');
    const metric = searchParams.get('metric') || 'riskLevel';

    const gisData: Record<string, unknown> = {};

    switch (type) {
      case 'heatmap': {
        const heatmapPoints = mockStates.flatMap(state => [
          {
            lat: state.coordinates.lat,
            lng: state.coordinates.lng,
            intensity: getRiskIntensity(state.riskLevel),
            location: state.name,
            type: 'state',
            id: state.id,
            riskLevel: state.riskLevel,
            activeAlerts: state.activeAlerts,
            population: state.population,
            healthMetrics: state.healthMetrics
          },
          ...state.districts.map(district => ({
            lat: district.coordinates.lat,
            lng: district.coordinates.lng,
            intensity: getRiskIntensity(district.riskLevel),
            location: district.name,
            type: 'district',
            id: district.id,
            stateId: district.stateId,
            riskLevel: district.riskLevel,
            activeAlerts: district.activeAlerts,
            population: district.population,
            healthMetrics: district.healthMetrics
          }))
        ]);

        (gisData as { heatmapPoints: unknown[] }).heatmapPoints = stateId
          ? heatmapPoints.filter(point =>
              (point as { type: string; stateId?: string; id: string }).type === 'district'
                ? (point as { stateId?: string }).stateId === stateId
                : (point as { id: string }).id === stateId
            )
          : heatmapPoints;
        break;
      }

      case 'boundaries': {
        (gisData as { boundaries: unknown[] }).boundaries = mockStates.map(state => ({
          type: 'state',
          id: state.id,
          name: state.name,
          coordinates: state.coordinates,
          bounds: generateStateBounds(state.coordinates),
          districts: state.districts.map(district => ({
            type: 'district',
            id: district.id,
            name: district.name,
            coordinates: district.coordinates,
            bounds: generateDistrictBounds(district.coordinates),
            stateId: state.id
          }))
        }));
        break;
      }

      case 'layers': {
        const layers = {
          riskLevel: generateRiskLevelLayer(),
          healthcareAccess: generateHealthcareAccessLayer(),
          vaccinationCoverage: generateVaccinationLayer(),
          populationDensity: generatePopulationDensityLayer(),
          waterborneCases: generateWaterborneLayer(),
          malariaCases: generateMalariaLayer(),
          resourceAvailability: generateResourceAvailabilityLayer()
        };

        (gisData as { layers: unknown }).layers = metric && (layers as Record<string, unknown>)[metric]
          ? { [metric]: (layers as Record<string, unknown>)[metric] }
          : layers;
        break;
      }

      case 'markers': {
        (gisData as { markers: unknown[] }).markers = generateHealthFacilityMarkers(stateId);
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid GIS data type' }, { status: 400 });
    }

    return NextResponse.json({
      type,
      data: gisData,
      metadata: {
        totalStates: mockStates.length,
        totalDistricts: mockStates.reduce((sum, state) => sum + state.districts.length, 0),
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching GIS data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// --- Helper Functions ---

function getRiskIntensity(riskLevel: string): number {
  switch (riskLevel) {
    case 'critical': return 1.0;
    case 'high': return 0.8;
    case 'medium': return 0.5;
    case 'low': return 0.2;
    default: return 0.1;
  }
}

function generateStateBounds(center: { lat: number; lng: number }) {
  return { north: center.lat + 2, south: center.lat - 2, east: center.lng + 2, west: center.lng - 2 };
}

function generateDistrictBounds(center: { lat: number; lng: number }) {
  return { north: center.lat + 0.5, south: center.lat - 0.5, east: center.lng + 0.5, west: center.lng - 0.5 };
}

// --- Layer Generators ---

function generateRiskLevelLayer() {
  return mockStates.map(state => ({
    id: state.id,
    name: state.name,
    coordinates: state.coordinates,
    value: getRiskIntensity(state.riskLevel),
    color: getRiskColor(state.riskLevel),
    label: `${state.name}: ${state.riskLevel.toUpperCase()} risk`
  }));
}

function generateHealthcareAccessLayer() {
  return mockStates.map(state => ({
    id: state.id,
    name: state.name,
    coordinates: state.coordinates,
    value: state.healthMetrics.healthcareAccess / 100,
    color: getHealthcareAccessColor(state.healthMetrics.healthcareAccess),
    label: `${state.name}: ${state.healthMetrics.healthcareAccess}% healthcare access`
  }));
}

function generateVaccinationLayer() {
  return mockStates.map(state => ({
    id: state.id,
    name: state.name,
    coordinates: state.coordinates,
    value: state.healthMetrics.vaccinationCoverage / 100,
    color: getVaccinationColor(state.healthMetrics.vaccinationCoverage),
    label: `${state.name}: ${state.healthMetrics.vaccinationCoverage}% vaccination coverage`
  }));
}

function generatePopulationDensityLayer() {
  const maxPopulation = Math.max(...mockStates.map(s => s.population));
  return mockStates.map(state => ({
    id: state.id,
    name: state.name,
    coordinates: state.coordinates,
    value: state.population / maxPopulation,
    color: getPopulationDensityColor(state.population / maxPopulation),
    label: `${state.name}: ${(state.population / 1000000).toFixed(1)}M population`
  }));
}

function generateWaterborneLayer() {
  return mockStates.map(state => ({
    id: state.id,
    name: state.name,
    coordinates: state.coordinates,
    value: (state.healthMetrics.waterborneCases || 0) / state.population,
    color: getOutbreakColor((state.healthMetrics.waterborneCases || 0) / state.population),
    label: `${state.name}: ${state.healthMetrics.waterborneCases || 0} waterborne cases`
  }));
}

function generateMalariaLayer() {
  return mockStates.map(state => ({
    id: state.id,
    name: state.name,
    coordinates: state.coordinates,
    value: (state.healthMetrics.malariaCases || 0) / state.population,
    color: getOutbreakColor((state.healthMetrics.malariaCases || 0) / state.population),
    label: `${state.name}: ${state.healthMetrics.malariaCases || 0} malaria cases`
  }));
}

function generateResourceAvailabilityLayer() {
  return mockStates.map(state => {
    const resources = stateResources[state.id] || [];
    const totalBeds = resources.filter(r => r.type === 'ICU Beds').reduce((sum, r) => sum + r.quantity, 0);
    const allocatedBeds = resources.filter(r => r.type === 'ICU Beds').reduce((sum, r) => sum + r.allocated, 0);
    const availabilityPercent = totalBeds > 0 ? (totalBeds - allocatedBeds) / totalBeds : 0;

    return {
      id: state.id,
      name: state.name,
      coordinates: state.coordinates,
      value: availabilityPercent,
      color: getResourceAvailabilityColor(availabilityPercent),
      label: `${state.name}: ${Math.round(availabilityPercent * 100)}% ICU bed availability`
    };
  });
}

// --- Markers ---

function generateHealthFacilityMarkers(stateId?: string | null) {
  const facilities = mockResources
    .filter(r => ['ICU Beds', 'Hospital', 'Clinic'].includes(r.type))
    .map(r => ({
      type: r.type === 'facility' ? 'hospital' : 'clinic',
      name: r.name,
      lat: r.coordinates?.lat || 0,
      lng: r.coordinates?.lng || 0,
      stateId: r.stateId,
      icon: r.type === 'facility' ? 'hospital' : 'clinic',
      color: r.type === 'facility' ? '#ef4444' : '#3b82f6'
    }));

  return stateId ? facilities.filter(f => f.stateId === stateId) : facilities;
}

// --- Color Functions ---

function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'critical': return '#dc2626';
    case 'high': return '#ea580c';
    case 'medium': return '#ca8a04';
    case 'low': return '#16a34a';
    default: return '#6b7280';
  }
}

function getHealthcareAccessColor(access: number): string {
  if (access >= 80) return '#16a34a';
  if (access >= 60) return '#ca8a04';
  if (access >= 40) return '#ea580c';
  return '#dc2626';
}

function getVaccinationColor(coverage: number): string {
  if (coverage >= 90) return '#16a34a';
  if (coverage >= 75) return '#65a30d';
  if (coverage >= 60) return '#ca8a04';
  if (coverage >= 45) return '#ea580c';
  return '#dc2626';
}

function getPopulationDensityColor(density: number): string {
  if (density >= 0.8) return '#1e40af';
  if (density >= 0.6) return '#3b82f6';
  if (density >= 0.4) return '#60a5fa';
  if (density >= 0.2) return '#93c5fd';
  return '#dbeafe';
}

function getOutbreakColor(value: number): string {
  if (value > 0.02) return '#dc2626'; // High outbreak
  if (value > 0.01) return '#ea580c'; // Medium outbreak
  if (value > 0.005) return '#ca8a04'; // Low outbreak
  return '#16a34a'; // Minimal/no outbreak
}

function getResourceAvailabilityColor(availability: number): string {
  if (availability >= 0.8) return '#16a34a';
  if (availability >= 0.6) return '#ca8a04';
  if (availability >= 0.4) return '#ea580c';
  return '#dc2626';
}
