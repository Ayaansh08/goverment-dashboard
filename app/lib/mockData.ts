// Mock data for Northeastern Indian states and health monitoring system

export const mockStates: StateData[] = [
  {
    id: 'as',
    name: 'Assam',
    code: 'AS',
    population: 31205576,
    riskLevel: 'medium',
    activeAlerts: 5,
    completedInterventions: 60,
    coordinates: { lat: 26.2006, lng: 92.9376 },
    healthMetrics: {
      mortalityRate: 6.5,
      morbidityRate: 14.2,
      vaccinationCoverage: 85.0,
      healthcareAccess: 72.5
    },
    districts: [
      {
        id: 'as-guwahati',
        name: 'Guwahati',
        stateId: 'as',
        population: 957352,
        riskLevel: 'high',
        activeAlerts: 2,
        completedInterventions: 15,
        coordinates: { lat: 26.1445, lng: 91.7362 },
        healthMetrics: {
          mortalityRate: 6.9,
          morbidityRate: 15.0,
          vaccinationCoverage: 87.0,
          healthcareAccess: 78.0
        }
      },
      {
        id: 'as-dibrugarh',
        name: 'Dibrugarh',
        stateId: 'as',
        population: 154296,
        riskLevel: 'medium',
        activeAlerts: 1,
        completedInterventions: 8,
        coordinates: { lat: 27.4728, lng: 94.9118 },
        healthMetrics: {
          mortalityRate: 6.2,
          morbidityRate: 13.8,
          vaccinationCoverage: 84.0,
          healthcareAccess: 70.5
        }
      }
    ]
  },
  {
    id: 'ml',
    name: 'Meghalaya',
    code: 'ML',
    population: 3366710,
    riskLevel: 'medium',
    activeAlerts: 3,
    completedInterventions: 40,
    coordinates: { lat: 25.4670, lng: 91.3662 },
    healthMetrics: {
      mortalityRate: 5.8,
      morbidityRate: 12.5,
      vaccinationCoverage: 88.0,
      healthcareAccess: 75.0
    },
    districts: [
      {
        id: 'ml-shillong',
        name: 'Shillong',
        stateId: 'ml',
        population: 143229,
        riskLevel: 'medium',
        activeAlerts: 1,
        completedInterventions: 10,
        coordinates: { lat: 25.5788, lng: 91.8933 },
        healthMetrics: {
          mortalityRate: 5.9,
          morbidityRate: 12.8,
          vaccinationCoverage: 89.5,
          healthcareAccess: 77.2
        }
      }
    ]
  },
  {
    id: 'tr',
    name: 'Tripura',
    code: 'TR',
    population: 3671032,
    riskLevel: 'medium',
    activeAlerts: 2,
    completedInterventions: 35,
    coordinates: { lat: 23.9408, lng: 91.9882 },
    healthMetrics: {
      mortalityRate: 5.5,
      morbidityRate: 11.9,
      vaccinationCoverage: 90.2,
      healthcareAccess: 80.0
    },
    districts: [
      {
        id: 'tr-agartala',
        name: 'Agartala',
        stateId: 'tr',
        population: 400000,
        riskLevel: 'medium',
        activeAlerts: 1,
        completedInterventions: 12,
        coordinates: { lat: 23.8315, lng: 91.2868 },
        healthMetrics: {
          mortalityRate: 5.6,
          morbidityRate: 12.1,
          vaccinationCoverage: 91.0,
          healthcareAccess: 81.5
        }
      }
    ]
  },
  {
    id: 'mn',
    name: 'Manipur',
    code: 'MN',
    population: 3091545,
    riskLevel: 'high',
    activeAlerts: 4,
    completedInterventions: 28,
    coordinates: { lat: 24.6637, lng: 93.9063 },
    healthMetrics: {
      mortalityRate: 6.8,
      morbidityRate: 15.0,
      vaccinationCoverage: 82.5,
      healthcareAccess: 68.0
    },
    districts: [
      {
        id: 'mn-imphal',
        name: 'Imphal',
        stateId: 'mn',
        population: 268243,
        riskLevel: 'high',
        activeAlerts: 2,
        completedInterventions: 10,
        coordinates: { lat: 24.8170, lng: 93.9368 },
        healthMetrics: {
          mortalityRate: 7.0,
          morbidityRate: 15.5,
          vaccinationCoverage: 83.0,
          healthcareAccess: 70.0
        }
      }
    ]
  }
];

// Example mock alerts for NE region
// Example mock alerts for NE region
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
    title: 'Cholera Outbreak Suspected',
    description: 'Cluster of suspected cholera cases in Imphal',
    severity: 'critical',
    location: 'Imphal, Manipur',
    stateId: 'mn',
    districtId: 'mn-imphal',
    status: 'active',
    createdAt: '2024-09-07T09:30:00Z',
    updatedAt: '2024-09-08T15:45:00Z',
    responseTime: 24
  },
  {
    id: 'alert-104',
    title: 'Dengue Cases Detected',
    description: '10 dengue cases confirmed in Dibrugarh',
    severity: 'medium',
    location: 'Dibrugarh, Assam',
    stateId: 'as',
    districtId: 'as-dibrugarh',
    status: 'active',
    createdAt: '2024-09-04T07:00:00Z',
    updatedAt: '2024-09-07T13:20:00Z'
  },
  {
    id: 'alert-105',
    title: 'Flood-related Diarrhea',
    description: 'Post-flood diarrhea surge in Agartala',
    severity: 'high',
    location: 'Agartala, Tripura',
    stateId: 'tr',
    districtId: 'tr-agartala',
    status: 'active',
    createdAt: '2024-09-03T12:00:00Z',
    updatedAt: '2024-09-06T16:45:00Z'
  },
  {
    id: 'alert-106',
    title: 'Typhoid Cases Reported',
    description: 'Multiple typhoid cases in rural areas of Meghalaya',
    severity: 'medium',
    location: 'Rural Meghalaya',
    stateId: 'ml',
    districtId: null,
    status: 'active',
    createdAt: '2024-09-02T11:15:00Z',
    updatedAt: '2024-09-05T14:30:00Z'
  }
];


// Mock resources for NE region
// Mock resources for NE region (state-wise)
// app/lib/mockData.ts
export const mockResources: Resource[] = [
  // Assam (as)
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
    id: 'res-as-vent-1',
    name: 'Ventilators',
    type: 'equipment',
    quantity: 80,
    allocated: 70,
    available: 10,
    location: 'Dibrugarh, Assam',
    stateId: 'as',
    districtId: 'as-dibrugarh',
    status: 'in_use',
    lastUpdated: '2024-09-08T16:00:00Z'
  },
  {
    id: 'res-as-meds-1',
    name: 'Oral Rehydration Salts (ORS)',
    type: 'medicine',
    quantity: 5000,
    allocated: 4200,
    available: 800,
    location: 'Guwahati, Assam',
    stateId: 'as',
    districtId: 'as-guwahati',
    status: 'available',
    lastUpdated: '2024-09-08T15:00:00Z'
  },

  // Meghalaya (ml)
  {
    id: 'res-ml-doc-1',
    name: 'Doctors',
    type: 'medical_staff',
    quantity: 200,
    allocated: 180,
    available: 20,
    location: 'Shillong, Meghalaya',
    stateId: 'ml',
    districtId: 'ml-shillong',
    status: 'available',
    lastUpdated: '2024-09-08T17:30:00Z'
  },
  {
    id: 'res-ml-kits-1',
    name: 'Testing Kits',
    type: 'equipment',
    quantity: 1000,
    allocated: 700,
    available: 300,
    location: 'Shillong, Meghalaya',
    stateId: 'ml',
    districtId: 'ml-shillong',
    status: 'available',
    lastUpdated: '2024-09-08T15:00:00Z'
  },
  {
    id: 'res-ml-vax-1',
    name: 'Vaccines (Routine)',
    type: 'medicine',
    quantity: 15000,
    allocated: 12000,
    available: 3000,
    location: 'Shillong, Meghalaya',
    stateId: 'ml',
    districtId: 'ml-shillong',
    status: 'available',
    lastUpdated: '2024-09-08T14:30:00Z'
  },

  // Tripura (tr)
  {
    id: 'res-tr-vent-1',
    name: 'Ventilators',
    type: 'equipment',
    quantity: 60,
    allocated: 50,
    available: 10,
    location: 'Agartala, Tripura',
    stateId: 'tr',
    districtId: 'tr-agartala',
    status: 'available',
    lastUpdated: '2024-09-08T14:45:00Z'
  },
  {
    id: 'res-tr-nurse-1',
    name: 'Nurses',
    type: 'medical_staff',
    quantity: 300,
    allocated: 250,
    available: 50,
    location: 'Agartala, Tripura',
    stateId: 'tr',
    districtId: 'tr-agartala',
    status: 'available',
    lastUpdated: '2024-09-08T13:20:00Z'
  },
  {
    id: 'res-tr-beds-1',
    name: 'Hospital Beds',
    type: 'facility',
    quantity: 200,
    allocated: 160,
    available: 40,
    location: 'Agartala, Tripura',
    stateId: 'tr',
    districtId: 'tr-agartala',
    status: 'available',
    lastUpdated: '2024-09-08T12:50:00Z'
  },

  // Manipur (mn)
  {
    id: 'res-mn-beds-1',
    name: 'Hospital Beds',
    type: 'facility',
    quantity: 500,
    allocated: 420,
    available: 80,
    location: 'Imphal, Manipur',
    stateId: 'mn',
    districtId: 'mn-imphal',
    status: 'available',
    lastUpdated: '2024-09-08T12:30:00Z'
  },
  {
    id: 'res-mn-doc-1',
    name: 'Doctors',
    type: 'medical_staff',
    quantity: 150,
    allocated: 130,
    available: 20,
    location: 'Imphal, Manipur',
    stateId: 'mn',
    districtId: 'mn-imphal',
    status: 'available',
    lastUpdated: '2024-09-08T11:50:00Z'
  },
  {
    id: 'res-mn-meds-1',
    name: 'Essential Medicines',
    type: 'medicine',
    quantity: 8000,
    allocated: 6500,
    available: 1500,
    location: 'Imphal, Manipur',
    stateId: 'mn',
    districtId: 'mn-imphal',
    status: 'available',
    lastUpdated: '2024-09-08T11:20:00Z'
  }
];


// Mock interventions
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
    title: 'Malaria Screening',
    description: 'Community screening in Shillong',
    type: 'screening',
    targetPopulation: 20000,
    completedCount: 18000,
    completionPercentage: 90,
    location: 'Shillong, Meghalaya',
    stateId: 'ml',
    districtId: 'ml-shillong',
    status: 'ongoing',
    startDate: '2024-08-15T00:00:00Z',
    endDate: '2024-09-30T00:00:00Z',
    assignedTo: ['Dr. Roy', 'NGO Meghalaya']
  },
  {
    id: 'int-103',
    title: 'Waterborne Disease Awareness Campaign',
    description: 'Hygiene and sanitation awareness in Dibrugarh',
    type: 'awareness',
    targetPopulation: 15000,
    completedCount: 9000,
    completionPercentage: 60,
    location: 'Dibrugarh, Assam',
    stateId: 'as',
    districtId: 'as-dibrugarh',
    status: 'ongoing',
    startDate: '2024-08-10T00:00:00Z',
    endDate: '2024-09-20T00:00:00Z',
    assignedTo: ['Community Health Team Assam']
  },
  {
    id: 'int-104',
    title: 'Typhoid Vaccination Drive',
    description: 'Vaccination for school children in Imphal',
    type: 'vaccination',
    targetPopulation: 10000,
    completedCount: 7000,
    completionPercentage: 70,
    location: 'Imphal, Manipur',
    stateId: 'mn',
    districtId: 'mn-imphal',
    status: 'ongoing',
    startDate: '2024-08-05T00:00:00Z',
    endDate: '2024-09-25T00:00:00Z',
    assignedTo: ['Dr. Singh', 'Manipur Health Department']
  },
  {
    id: 'int-105',
    title: 'Dengue Surveillance',
    description: 'Vector monitoring and awareness in Agartala',
    type: 'screening',
    targetPopulation: 5000,
    completedCount: 2500,
    completionPercentage: 50,
    location: 'Agartala, Tripura',
    stateId: 'tr',
    districtId: 'tr-agartala',
    status: 'ongoing',
    startDate: '2024-08-20T00:00:00Z',
    endDate: '2024-09-30T00:00:00Z',
    assignedTo: ['Tripura Vector Control Team']
  },
  {
    id: 'int-106',
    title: 'Routine Immunization Catch-up',
    description: 'Vaccination drive for missed children in rural Assam',
    type: 'vaccination',
    targetPopulation: 12000,
    completedCount: 8000,
    completionPercentage: 66,
    location: 'Rural Assam',
    stateId: 'as',
    districtId: null,
    status: 'ongoing',
    startDate: '2024-08-12T00:00:00Z',
    endDate: '2024-09-28T00:00:00Z',
    assignedTo: ['ASHA Workers', 'NGO Assam Health']
  },
  {
    id: 'int-107',
    title: 'Sanitation Improvement Initiative',
    description: 'Community-led sanitation improvement in Shillong slums',
    type: 'awareness',
    targetPopulation: 8000,
    completedCount: 4000,
    completionPercentage: 50,
    location: 'Shillong, Meghalaya',
    stateId: 'ml',
    districtId: 'ml-shillong',
    status: 'ongoing',
    startDate: '2024-08-18T00:00:00Z',
    endDate: '2024-09-25T00:00:00Z',
    assignedTo: ['NGO Meghalaya', 'Local Health Teams']
  },
  {
    id: 'int-108',
    title: 'Flood-Relief Health Camp',
    description: 'Medical aid and ORS distribution post-flood in Tripura',
    type: 'screening',
    targetPopulation: 6000,
    completedCount: 4500,
    completionPercentage: 75,
    location: 'Agartala, Tripura',
    stateId: 'tr',
    districtId: 'tr-agartala',
    status: 'ongoing',
    startDate: '2024-09-01T00:00:00Z',
    endDate: '2024-09-20T00:00:00Z',
    assignedTo: ['Tripura Health Dept', 'NGO RedCross']
  }
];

// Mock GIS heatmap points for NE region
export const mockGISData = {
  heatmapPoints: [
    { lat: 26.1445, lng: 91.7362, intensity: 0.8, location: 'Guwahati' },
    { lat: 27.4728, lng: 94.9118, intensity: 0.6, location: 'Dibrugarh' },
    { lat: 25.5788, lng: 91.8933, intensity: 0.5, location: 'Shillong' },
    { lat: 23.8315, lng: 91.2868, intensity: 0.4, location: 'Agartala' },
    { lat: 24.8170, lng: 93.9368, intensity: 0.7, location: 'Imphal' }
  ]
};
