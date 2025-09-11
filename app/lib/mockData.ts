// app/lib/mockData.ts

// ----------------------
// TYPES
// ----------------------
export type HealthMetrics = {
  mortalityRate: number;
  morbidityRate: number;
  vaccinationCoverage: number;
  healthcareAccess: number;
};

export type DistrictData = {
  id: string;
  name: string;
  stateId: string;
  population: number;
  riskLevel: 'low' | 'medium' | 'high';
  activeAlerts: number;
  completedInterventions: number;
  coordinates: { lat: number; lng: number };
  healthMetrics: HealthMetrics;
};

export type StateData = {
  id: string;
  name: string;
  code: string;
  population: number;
  riskLevel: 'low' | 'medium' | 'high';
  activeAlerts: number;
  completedInterventions: number;
  coordinates: { lat: number; lng: number };
  healthMetrics: HealthMetrics;
  districts: DistrictData[];
};

export type Alert = {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  stateId: string;
  districtId: string | null;
  status: 'active' | 'resolved';
  createdAt: string;
  updatedAt: string;
  responseTime?: number;
};

export type Resource = {
  id: string;
  name: string;
  type: 'facility' | 'equipment' | 'medicine' | 'medical_staff';
  quantity: number;
  allocated: number;
  available: number;
  location: string;
  stateId: string;
  districtId: string | null;
  status: 'available' | 'in_use';
  lastUpdated: string;
};

export type Intervention = {
  id: string;
  title: string;
  description: string;
  type: 'vaccination' | 'screening' | 'awareness';
  targetPopulation: number;
  completedCount: number;
  completionPercentage: number;
  location: string;
  stateId: string;
  districtId: string | null;
  status: 'ongoing' | 'completed';
  startDate: string;
  endDate: string;
  assignedTo: string[];
};

// Placeholder for AI predictions
export type AIPrediction = {
  id: string;
  location: string;
  disease: string;
  riskScore: number; // 0-1
  predictionDate: string;
};

// ----------------------
// MOCK DATA
// ----------------------

// States & Districts
export const mockStates: StateData[] = [
  {
    id: 'as',
    name: 'Assam',
    code: 'AS',
    population: 31205576,
    riskLevel: 'medium',
    activeAlerts: 7,
    completedInterventions: 90,
    coordinates: { lat: 26.2006, lng: 92.9376 },
    healthMetrics: { mortalityRate: 6.5, morbidityRate: 14.2, vaccinationCoverage: 85, healthcareAccess: 72.5 },
    districts: [
      {
        id: 'as-guwahati',
        name: 'Guwahati',
        stateId: 'as',
        population: 957352,
        riskLevel: 'high',
        activeAlerts: 2,
        completedInterventions: 20,
        coordinates: { lat: 26.1445, lng: 91.7362 },
        healthMetrics: { mortalityRate: 6.9, morbidityRate: 15, vaccinationCoverage: 87, healthcareAccess: 78 }
      },
      {
        id: 'as-dibrugarh',
        name: 'Dibrugarh',
        stateId: 'as',
        population: 154296,
        riskLevel: 'medium',
        activeAlerts: 1,
        completedInterventions: 12,
        coordinates: { lat: 27.4728, lng: 94.9118 },
        healthMetrics: { mortalityRate: 6.2, morbidityRate: 13.8, vaccinationCoverage: 84, healthcareAccess: 70.5 }
      },
      {
        id: 'as-silchar',
        name: 'Silchar',
        stateId: 'as',
        population: 229136,
        riskLevel: 'low',
        activeAlerts: 1,
        completedInterventions: 10,
        coordinates: { lat: 24.8333, lng: 92.7789 },
        healthMetrics: { mortalityRate: 5.8, morbidityRate: 12.5, vaccinationCoverage: 88, healthcareAccess: 76 }
      }
    ]
  },
  {
    id: 'ml',
    name: 'Meghalaya',
    code: 'ML',
    population: 3366710,
    riskLevel: 'medium',
    activeAlerts: 4,
    completedInterventions: 55,
    coordinates: { lat: 25.467, lng: 91.3662 },
    healthMetrics: { mortalityRate: 5.8, morbidityRate: 12.5, vaccinationCoverage: 88, healthcareAccess: 75 },
    districts: [
      {
        id: 'ml-shillong',
        name: 'Shillong',
        stateId: 'ml',
        population: 143229,
        riskLevel: 'medium',
        activeAlerts: 2,
        completedInterventions: 15,
        coordinates: { lat: 25.5788, lng: 91.8933 },
        healthMetrics: { mortalityRate: 5.9, morbidityRate: 12.8, vaccinationCoverage: 89.5, healthcareAccess: 77.2 }
      },
      {
        id: 'ml-tura',
        name: 'Tura',
        stateId: 'ml',
        population: 74000,
        riskLevel: 'low',
        activeAlerts: 0,
        completedInterventions: 8,
        coordinates: { lat: 25.5142, lng: 90.2026 },
        healthMetrics: { mortalityRate: 5.6, morbidityRate: 11.9, vaccinationCoverage: 90, healthcareAccess: 78 }
      }
    ]
  },
  {
    id: 'tr',
    name: 'Tripura',
    code: 'TR',
    population: 3671032,
    riskLevel: 'medium',
    activeAlerts: 3,
    completedInterventions: 45,
    coordinates: { lat: 23.9408, lng: 91.9882 },
    healthMetrics: { mortalityRate: 5.5, morbidityRate: 11.9, vaccinationCoverage: 90.2, healthcareAccess: 80 },
    districts: [
      {
        id: 'tr-agartala',
        name: 'Agartala',
        stateId: 'tr',
        population: 400000,
        riskLevel: 'medium',
        activeAlerts: 1,
        completedInterventions: 15,
        coordinates: { lat: 23.8315, lng: 91.2868 },
        healthMetrics: { mortalityRate: 5.6, morbidityRate: 12.1, vaccinationCoverage: 91, healthcareAccess: 81.5 }
      },
      {
        id: 'tr-udaipur',
        name: 'Udaipur',
        stateId: 'tr',
        population: 32000,
        riskLevel: 'low',
        activeAlerts: 0,
        completedInterventions: 5,
        coordinates: { lat: 23.5333, lng: 91.4833 },
        healthMetrics: { mortalityRate: 5.3, morbidityRate: 11.5, vaccinationCoverage: 92, healthcareAccess: 83 }
      }
    ]
  },
  {
    id: 'mn',
    name: 'Manipur',
    code: 'MN',
    population: 3091545,
    riskLevel: 'high',
    activeAlerts: 5,
    completedInterventions: 38,
    coordinates: { lat: 24.6637, lng: 93.9063 },
    healthMetrics: { mortalityRate: 6.8, morbidityRate: 15, vaccinationCoverage: 82.5, healthcareAccess: 68 },
    districts: [
      {
        id: 'mn-imphal',
        name: 'Imphal',
        stateId: 'mn',
        population: 268243,
        riskLevel: 'high',
        activeAlerts: 3,
        completedInterventions: 15,
        coordinates: { lat: 24.817, lng: 93.9368 },
        healthMetrics: { mortalityRate: 7, morbidityRate: 15.5, vaccinationCoverage: 83, healthcareAccess: 70 }
      },
      {
        id: 'mn-thoubal',
        name: 'Thoubal',
        stateId: 'mn',
        population: 42000,
        riskLevel: 'medium',
        activeAlerts: 1,
        completedInterventions: 8,
        coordinates: { lat: 24.6387, lng: 94.0206 },
        healthMetrics: { mortalityRate: 6.5, morbidityRate: 14.2, vaccinationCoverage: 84, healthcareAccess: 72 }
      }
    ]
  }
];

// Alerts
export const mockAlerts: Alert[] = [
  {
    id: 'alert-101',
    title: 'Waterborne Disease Spike',
    description: 'Sudden increase in diarrhea cases in Guwahati',
    severity: 'high',
    location: 'Guwahati, Assam',
    stateId: 'as',
    districtId: 'as-guwahati',
    status: 'active',
    createdAt: '2024-09-05T08:00:00Z',
    updatedAt: '2024-09-08T14:30:00Z',
    responseTime: 48
  },
  {
    id: 'alert-102',
    title: 'Malaria Cases Rising',
    description: 'Multiple malaria cases reported in Shillong',
    severity: 'medium',
    location: 'Shillong, Meghalaya',
    stateId: 'ml',
    districtId: 'ml-shillong',
    status: 'active',
    createdAt: '2024-09-06T10:00:00Z',
    updatedAt: '2024-09-08T11:00:00Z'
  },
  {
    id: 'alert-103',
    title: 'Cholera Outbreak Risk',
    description: 'Contaminated water reported in Imphal area',
    severity: 'critical',
    location: 'Imphal, Manipur',
    stateId: 'mn',
    districtId: 'mn-imphal',
    status: 'active',
    createdAt: '2024-09-07T12:00:00Z',
    updatedAt: '2024-09-09T09:30:00Z'
  },
  {
    id: 'alert-104',
    title: 'Dengue Cases',
    description: 'Spike in dengue cases in Agartala',
    severity: 'high',
    location: 'Agartala, Tripura',
    stateId: 'tr',
    districtId: 'tr-agartala',
    status: 'resolved',
    createdAt: '2024-09-04T07:00:00Z',
    updatedAt: '2024-09-06T15:00:00Z'
  }
];

// Resources
export const mockResources: Resource[] = [
  {
    id: 'res-as-icu-1',
    name: 'ICU Beds',
    type: 'facility',
    quantity: 150,
    allocated: 120,
    available: 30,
    location: 'Guwahati, Assam',
    stateId: 'as',
    districtId: 'as-guwahati',
    status: 'available',
    lastUpdated: '2024-09-08T18:00:00Z'
  },
  {
    id: 'res-as-lab-1',
    name: 'Diagnostic Labs',
    type: 'facility',
    quantity: 25,
    allocated: 18,
    available: 7,
    location: 'Dibrugarh, Assam',
    stateId: 'as',
    districtId: 'as-dibrugarh',
    status: 'in_use',
    lastUpdated: '2024-09-09T09:00:00Z'
  },
  {
    id: 'res-ml-doc-1',
    name: 'Doctors on Call',
    type: 'medical_staff',
    quantity: 50,
    allocated: 35,
    available: 15,
    location: 'Shillong, Meghalaya',
    stateId: 'ml',
    districtId: 'ml-shillong',
    status: 'in_use',
    lastUpdated: '2024-09-08T20:00:00Z'
  },
  {
    id: 'res-ml-nurse-1',
    name: 'Nursing Staff',
    type: 'medical_staff',
    quantity: 120,
    allocated: 90,
    available: 30,
    location: 'Shillong, Meghalaya',
    stateId: 'ml',
    districtId: 'ml-shillong',
    status: 'in_use',
    lastUpdated: '2024-09-09T15:15:00Z'
  },
  {
    id: 'res-tr-vac-1',
    name: 'Cholera Vaccines',
    type: 'medicine',
    quantity: 20000,
    allocated: 15000,
    available: 5000,
    location: 'Agartala, Tripura',
    stateId: 'tr',
    districtId: 'tr-agartala',
    status: 'available',
    lastUpdated: '2024-09-09T10:30:00Z'
  },
  {
    id: 'res-tr-kit-1',
    name: 'Malaria Test Kits',
    type: 'equipment',
    quantity: 5000,
    allocated: 3200,
    available: 1800,
    location: 'Agartala, Tripura',
    stateId: 'tr',
    districtId: 'tr-agartala',
    status: 'available',
    lastUpdated: '2024-09-10T11:20:00Z'
  },
  {
    id: 'res-mn-ox-1',
    name: 'Oxygen Cylinders',
    type: 'equipment',
    quantity: 800,
    allocated: 600,
    available: 200,
    location: 'Imphal, Manipur',
    stateId: 'mn',
    districtId: 'mn-imphal',
    status: 'in_use',
    lastUpdated: '2024-09-09T09:45:00Z'
  },
  {
    id: 'res-mn-vent-1',
    name: 'Ventilators',
    type: 'equipment',
    quantity: 60,
    allocated: 45,
    available: 15,
    location: 'Imphal, Manipur',
    stateId: 'mn',
    districtId: 'mn-imphal',
    status: 'available',
    lastUpdated: '2024-09-10T13:00:00Z'
  },
  {
    id: 'res-as-ambulance-1',
    name: 'Ambulances',
    type: 'facility',
    quantity: 40,
    allocated: 28,
    available: 12,
    location: 'Dibrugarh, Assam',
    stateId: 'as',
    districtId: 'as-dibrugarh',
    status: 'available',
    lastUpdated: '2024-09-09T12:00:00Z'
  },
  {
    id: 'res-as-meds-1',
    name: 'Essential Medicines',
    type: 'medicine',
    quantity: 100000,
    allocated: 85000,
    available: 15000,
    location: 'Guwahati, Assam',
    stateId: 'as',
    districtId: 'as-guwahati',
    status: 'in_use',
    lastUpdated: '2024-09-10T08:15:00Z'
  },
  {
    id: 'res-ml-icu-1',
    name: 'ICU Beds',
    type: 'facility',
    quantity: 75,
    allocated: 55,
    available: 20,
    location: 'Shillong, Meghalaya',
    stateId: 'ml',
    districtId: 'ml-shillong',
    status: 'available',
    lastUpdated: '2024-09-09T21:00:00Z'
  },
  {
    id: 'res-tr-nurse-1',
    name: 'Nursing Staff',
    type: 'medical_staff',
    quantity: 80,
    allocated: 60,
    available: 20,
    location: 'Agartala, Tripura',
    stateId: 'tr',
    districtId: 'tr-agartala',
    status: 'in_use',
    lastUpdated: '2024-09-10T07:30:00Z'
  },
  {
    id: 'res-mn-doc-1',
    name: 'Specialist Doctors',
    type: 'medical_staff',
    quantity: 40,
    allocated: 30,
    available: 10,
    location: 'Imphal, Manipur',
    stateId: 'mn',
    districtId: 'mn-imphal',
    status: 'available',
    lastUpdated: '2024-09-09T16:40:00Z'
  },
  {
    id: 'res-as-kit-1',
    name: 'COVID Rapid Test Kits',
    type: 'equipment',
    quantity: 15000,
    allocated: 10000,
    available: 5000,
    location: 'Guwahati, Assam',
    stateId: 'as',
    districtId: 'as-guwahati',
    status: 'available',
    lastUpdated: '2024-09-10T14:10:00Z'
  }
];


// Interventions
export const mockInterventions: Intervention[] = [
  {
    id: 'int-101',
    title: 'Cholera Vaccination Drive',
    description: 'Vaccination campaign in Guwahati slums',
    type: 'vaccination',
    targetPopulation: 50000,
    completedCount: 42000,
    completionPercentage: 84,
    location: 'Guwahati, Assam',
    stateId: 'as',
    districtId: 'as-guwahati',
    status: 'ongoing',
    startDate: '2024-08-01T00:00:00Z',
    endDate: '2024-09-30T00:00:00Z',
    assignedTo: ['Dr. Das', 'Health Team Assam']
  },
  {
    id: 'int-102',
    title: 'Malaria Awareness Program',
    description: 'Door-to-door campaign in Shillong',
    type: 'awareness',
    targetPopulation: 20000,
    completedCount: 15000,
    completionPercentage: 75,
    location: 'Shillong, Meghalaya',
    stateId: 'ml',
    districtId: 'ml-shillong',
    status: 'ongoing',
    startDate: '2024-08-15T00:00:00Z',
    endDate: '2024-09-20T00:00:00Z',
    assignedTo: ['Dr. Nongrum', 'Shillong Health Volunteers']
  }
];

// GIS Heatmap
export const mockGISData = {
  heatmapPoints: [
    { lat: 26.1445, lng: 91.7362, intensity: 0.8, location: 'Guwahati' },
    { lat: 24.817, lng: 93.9368, intensity: 0.9, location: 'Imphal' },
    { lat: 23.8315, lng: 91.2868, intensity: 0.7, location: 'Agartala' }
  ]
};

// AI Predictions placeholder
export const mockAIPredictions: AIPrediction[] = [
  {
    id: 'ai-101',
    location: 'Guwahati',
    disease: 'Cholera',
    riskScore: 0.85,
    predictionDate: '2024-09-10'
  },
  {
    id: 'ai-102',
    location: 'Shillong',
    disease: 'Malaria',
    riskScore: 0.65,
    predictionDate: '2024-09-11'
  },
  {
    id: 'ai-103',
    location: 'Imphal',
    disease: 'Dengue',
    riskScore: 0.78,
    predictionDate: '2024-09-12'
  }
];
