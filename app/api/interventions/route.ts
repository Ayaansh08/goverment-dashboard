import { NextResponse } from 'next/server';
import { getServerSession } from 'cosmic-authentication';
import { mockInterventions } from '@/app/lib/mockData';
import type { Intervention } from '@/app/lib/mockData';

export async function GET(request: Request) {
  try {
    const user = await getServerSession();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const stateId = searchParams.get('stateId');
    const districtId = searchParams.get('districtId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');

    let filteredInterventions = [...mockInterventions];

    // Apply filters
    if (stateId) {
      filteredInterventions = filteredInterventions.filter(intervention => intervention.stateId === stateId);
    }
    
    if (districtId) {
      filteredInterventions = filteredInterventions.filter(intervention => intervention.districtId === districtId);
    }
    
    if (type) {
      filteredInterventions = filteredInterventions.filter(intervention => intervention.type === type);
    }
    
    if (status) {
      filteredInterventions = filteredInterventions.filter(intervention => intervention.status === status);
    }

    if (assignedTo) {
      filteredInterventions = filteredInterventions.filter(intervention => 
        intervention.assignedTo.some(person => person.toLowerCase().includes(assignedTo.toLowerCase()))
      );
    }

    // Sort by start date (most recent first)
    filteredInterventions.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    // Calculate summary statistics
    const summary = {
      total: filteredInterventions.length,
      completed: filteredInterventions.filter(i => i.status === 'completed').length,
      ongoing: filteredInterventions.filter(i => i.status === 'ongoing').length,
      planned: filteredInterventions.filter(i => i.status === 'planned').length,
      suspended: filteredInterventions.filter(i => i.status === 'suspended').length,
      averageCompletion: filteredInterventions.length > 0 
        ? filteredInterventions.reduce((sum, i) => sum + i.completionPercentage, 0) / filteredInterventions.length 
        : 0,
      totalTargetPopulation: filteredInterventions.reduce((sum, i) => sum + i.targetPopulation, 0),
      totalCompleted: filteredInterventions.reduce((sum, i) => sum + i.completedCount, 0),
      byType: {
        vaccination: filteredInterventions.filter(i => i.type === 'vaccination').length,
        screening: filteredInterventions.filter(i => i.type === 'screening').length,
        treatment: filteredInterventions.filter(i => i.type === 'treatment').length,
        awareness: filteredInterventions.filter(i => i.type === 'awareness').length
      }
    };

    return NextResponse.json({
      interventions: filteredInterventions,
      summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching interventions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getServerSession();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const interventionData = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'type', 'targetPopulation', 'location', 'stateId', 'startDate', 'endDate'];
    for (const field of requiredFields) {
      if (!interventionData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Create new intervention
    const newIntervention: Intervention = {
      id: `int-${Date.now()}`,
      title: interventionData.title,
      description: interventionData.description,
      type: interventionData.type,
      targetPopulation: interventionData.targetPopulation,
      completedCount: 0,
      completionPercentage: 0,
      location: interventionData.location,
      stateId: interventionData.stateId,
      districtId: interventionData.districtId || undefined,
      status: 'planned',
      startDate: interventionData.startDate,
      endDate: interventionData.endDate,
      assignedTo: interventionData.assignedTo || []
    };

    // In a real app, this would be saved to the database
    mockInterventions.push(newIntervention);

    return NextResponse.json({
      success: true,
      intervention: newIntervention,
      message: 'Intervention created successfully'
    });
  } catch (error) {
    console.error('Error creating intervention:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getServerSession();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const interventionData = await request.json();
    
    if (!interventionData.id) {
      return NextResponse.json({ error: 'Intervention ID is required' }, { status: 400 });
    }

    const interventionIndex = mockInterventions.findIndex(i => i.id === interventionData.id);
    
    if (interventionIndex === -1) {
      return NextResponse.json({ error: 'Intervention not found' }, { status: 404 });
    }

    // Calculate completion percentage if completedCount is provided
    let completionPercentage = interventionData.completionPercentage as number | undefined;
    if (interventionData.completedCount !== undefined && interventionData.targetPopulation) {
      completionPercentage = (interventionData.completedCount / interventionData.targetPopulation) * 100;
    }

    // Update intervention
    const updatedIntervention: Intervention = {
      ...mockInterventions[interventionIndex],
      ...interventionData,
      completionPercentage: completionPercentage ?? mockInterventions[interventionIndex].completionPercentage
    } as Intervention;

    mockInterventions[interventionIndex] = updatedIntervention;

    return NextResponse.json({
      success: true,
      intervention: updatedIntervention,
      message: 'Intervention updated successfully'
    });
  } catch (error) {
    console.error('Error updating intervention:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getServerSession();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const interventionId = searchParams.get('id');
    
    if (!interventionId) {
      return NextResponse.json({ error: 'Intervention ID is required' }, { status: 400 });
    }

    const interventionIndex = mockInterventions.findIndex(i => i.id === interventionId);
    
    if (interventionIndex === -1) {
      return NextResponse.json({ error: 'Intervention not found' }, { status: 404 });
    }

    // Remove intervention
    const deletedIntervention = mockInterventions.splice(interventionIndex, 1)[0];

    return NextResponse.json({
      success: true,
      intervention: deletedIntervention,
      message: 'Intervention deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting intervention:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}