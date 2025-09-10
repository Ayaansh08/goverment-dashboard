import { NextResponse } from 'next/server';
import { getServerSession } from 'cosmic-authentication';
import { mockAlerts } from '@/app/lib/mockData';
import type { Alert } from '@/app/lib/mockData';

export async function GET(request: Request) {
  try {
    const user = await getServerSession();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const stateId = searchParams.get('stateId');
    const districtId = searchParams.get('districtId');
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let filteredAlerts = [...mockAlerts];

    // Apply filters
    if (stateId) {
      filteredAlerts = filteredAlerts.filter(alert => alert.stateId === stateId);
    }
    
    if (districtId) {
      filteredAlerts = filteredAlerts.filter(alert => alert.districtId === districtId);
    }
    
    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    }
    
    if (status) {
      filteredAlerts = filteredAlerts.filter(alert => alert.status === status);
    }

    // Sort by creation date (most recent first)
    filteredAlerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply limit
    filteredAlerts = filteredAlerts.slice(0, limit);

    // Calculate summary statistics
    const summary = {
      total: filteredAlerts.length,
      active: filteredAlerts.filter(a => a.status === 'active').length,
      resolved: filteredAlerts.filter(a => a.status === 'resolved').length,
      bySeverity: {
        critical: filteredAlerts.filter(a => a.severity === 'critical').length,
        high: filteredAlerts.filter(a => a.severity === 'high').length,
        medium: filteredAlerts.filter(a => a.severity === 'medium').length,
        low: filteredAlerts.filter(a => a.severity === 'low').length
      },
      averageResponseTime: filteredAlerts
        .filter(a => a.responseTime)
        .reduce((sum, a) => sum + (a.responseTime || 0), 0) / filteredAlerts.filter(a => a.responseTime).length || 0
    };

    return NextResponse.json({
      alerts: filteredAlerts,
      summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getServerSession();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const alertData = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'severity', 'location', 'stateId'];
    for (const field of requiredFields) {
      if (!alertData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Create new alert
    const newAlert: Alert = {
      id: `alert-${Date.now()}`,
      title: alertData.title,
      description: alertData.description,
      severity: alertData.severity,
      location: alertData.location,
      stateId: alertData.stateId,
      districtId: alertData.districtId || undefined,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In a real app, this would be saved to the database
    mockAlerts.push(newAlert);

    return NextResponse.json({
      success: true,
      alert: newAlert,
      message: 'Alert created successfully'
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getServerSession();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const alertData = await request.json();
    
    if (!alertData.id) {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 });
    }

    const alertIndex = mockAlerts.findIndex(a => a.id === alertData.id);
    
    if (alertIndex === -1) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    // Update alert
    const updatedAlert: Alert = {
      ...mockAlerts[alertIndex],
      ...alertData,
      updatedAt: new Date().toISOString()
    } as Alert;

    // Calculate response time if status changed to resolved
    if (updatedAlert.status === 'resolved' && !(updatedAlert as unknown as { responseTime?: number }).responseTime) {
      const createdTime = new Date(updatedAlert.createdAt);
      const resolvedTime = new Date();
      (updatedAlert as unknown as { responseTime?: number }).responseTime = Math.floor((resolvedTime.getTime() - createdTime.getTime()) / (1000 * 60 * 60)); // in hours
    }

    mockAlerts[alertIndex] = updatedAlert;

    return NextResponse.json({
      success: true,
      alert: updatedAlert,
      message: 'Alert updated successfully'
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}