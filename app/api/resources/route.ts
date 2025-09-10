// app/api/resources/route.ts
import { NextResponse } from 'next/server';
import { mockResources } from '@/app/lib/mockData';

// Seed in-memory DB from mockResources so dashboard can query immediately in dev
let resourcesDB: any[] = mockResources.map((r) => ({ ...r }));

function computeAvailable(quantity: number, allocated: number) {
  return Math.max(0, quantity - allocated);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const stateId = searchParams.get('stateId');
    const districtId = searchParams.get('districtId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    let resources = [...resourcesDB];

    // single resource by id
    if (id) {
      const resource = resources.find((r) => r.id === id);
      if (!resource) {
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
      }
      return NextResponse.json({ resource });
    }

    // filters
    if (stateId) resources = resources.filter((r) => r.stateId === stateId);
    if (districtId) resources = resources.filter((r) => r.districtId === districtId);
    if (type) resources = resources.filter((r) => r.type === type);
    if (status) resources = resources.filter((r) => r.status === status);

    const summary = {
      total: resources.length,
      available: resources.filter((r) => r.status === 'available').length,
      inUse: resources.filter((r) => r.status === 'in_use').length,
      maintenance: resources.filter((r) => r.status === 'maintenance').length,
      totalQuantity: resources.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0),
      totalAllocated: resources.reduce((sum, r) => sum + (Number(r.allocated) || 0), 0),
      totalAvailable: resources.reduce((sum, r) => sum + (Number(r.available) || 0), 0),
      utilizationRate:
        resources.length > 0
          ? (resources.reduce((sum, r) => sum + ((Number(r.allocated) || 0) / (Number(r.quantity) || 1)), 0) /
              resources.length) *
            100
          : 0,
    };

    return NextResponse.json({
      resources,
      summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Required fields
    const requiredFields = ['name', 'type', 'quantity', 'location', 'stateId'];
    for (const field of requiredFields) {
      if (!data[field] && data[field] !== 0) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const incomingQuantity = Number(data.quantity);
    if (!Number.isFinite(incomingQuantity) || incomingQuantity < 0) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
    }
    const incomingAllocated = Number(data.allocated || 0);
    if (!Number.isFinite(incomingAllocated) || incomingAllocated < 0) {
      return NextResponse.json({ error: 'Invalid allocated value' }, { status: 400 });
    }

    // Normalize name/state/district for matching
    const incomingName = String(data.name).trim().toLowerCase();
    const incomingState = String(data.stateId).trim();
    const incomingDistrict = data.districtId ? String(data.districtId).trim() : null;

    // Find existing by name + stateId + districtId (case-insensitive name)
    const existingIndex = resourcesDB.findIndex((r) => {
      const rName = String(r.name || '').trim().toLowerCase();
      const rState = String(r.stateId || '').trim();
      const rDistrict = r.districtId ? String(r.districtId).trim() : null;
      return rName === incomingName && rState === incomingState && rDistrict === incomingDistrict;
    });

    if (existingIndex !== -1) {
      // Merge/update existing resource
      const existing = resourcesDB[existingIndex];

      const newQuantity = (Number(existing.quantity) || 0) + incomingQuantity;
      let newAllocated = (Number(existing.allocated) || 0) + incomingAllocated;
      if (newAllocated > newQuantity) newAllocated = newQuantity;
      const newAvailable = computeAvailable(newQuantity, newAllocated);

      const updatedResource = {
        ...existing,
        // allow overriding certain fields if provided
        name: data.name ?? existing.name,
        type: data.type ?? existing.type,
        location: data.location ?? existing.location,
        stateId: data.stateId ?? existing.stateId,
        districtId: data.districtId ?? existing.districtId,
        quantity: newQuantity,
        allocated: newAllocated,
        available: newAvailable,
        status: data.status ?? existing.status,
        lastUpdated: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      resourcesDB[existingIndex] = updatedResource;

      // Also update the exported mockResources array so mock data reflects change during runtime
      const mockIndex = mockResources.findIndex((r) => r.id === existing.id);
      if (mockIndex !== -1) {
        mockResources[mockIndex] = { ...mockResources[mockIndex], ...updatedResource };
      }

      return NextResponse.json({
        success: true,
        merged: true,
        resource: updatedResource,
        message: 'Existing resource found — merged quantities and updated resource.',
      });
    }

    // No existing resource found — create new
    const newResource = {
      id: Date.now().toString(),
      name: data.name,
      type: data.type,
      quantity: incomingQuantity,
      allocated: Math.min(incomingAllocated, incomingQuantity),
      available: computeAvailable(incomingQuantity, Math.min(incomingAllocated, incomingQuantity)),
      location: data.location,
      stateId: data.stateId,
      districtId: data.districtId || null,
      status: data.status || 'available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    resourcesDB.push(newResource);
    // Also push to mockResources so mockData reflects changes in-memory
    try {
      mockResources.push(newResource);
    } catch (e) {
      // if mockResources is read-only for whatever reason just ignore (resourcesDB is authoritative)
      console.warn('Could not push to mockResources export:', e);
    }

    return NextResponse.json({
      success: true,
      merged: false,
      id: newResource.id,
      resource: newResource,
      message: 'Resource created successfully.',
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();

    if (!data.id) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    const index = resourcesDB.findIndex((r) => r.id === data.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const current = resourcesDB[index];

    const quantity = data.quantity !== undefined ? Number(data.quantity) : Number(current.quantity) || 0;
    let allocated = data.allocated !== undefined ? Number(data.allocated) : Number(current.allocated) || 0;

    if (!Number.isFinite(quantity) || quantity < 0) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
    }
    if (!Number.isFinite(allocated) || allocated < 0) {
      allocated = 0;
    }
    if (allocated > quantity) allocated = quantity;

    const available = computeAvailable(quantity, allocated);

    const updatedResource = {
      ...current,
      ...data,
      quantity,
      allocated,
      available,
      lastUpdated: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    resourcesDB[index] = updatedResource;

    // Update mockResources too
    const mockIndex = mockResources.findIndex((r) => r.id === data.id);
    if (mockIndex !== -1) {
      mockResources[mockIndex] = { ...mockResources[mockIndex], ...updatedResource };
    }

    return NextResponse.json({
      success: true,
      resource: updatedResource,
      message: 'Resource updated successfully',
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get('id');

    if (!resourceId) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    const index = resourcesDB.findIndex((r) => r.id === resourceId);
    if (index === -1) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Remove from in-memory DB
    resourcesDB.splice(index, 1);

    // Remove from exported mockResources too (if present)
    const mockIndex = mockResources.findIndex((r) => r.id === resourceId);
    if (mockIndex !== -1) {
      mockResources.splice(mockIndex, 1);
    }

    return NextResponse.json({
      success: true,
      id: resourceId,
      message: 'Resource deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
