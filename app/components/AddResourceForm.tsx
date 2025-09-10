'use client';

import { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { mockStates } from '@/app/lib/mockData';

interface AddResourceFormProps {
  onCreated?: () => void;
}

export default function AddResourceForm({ onCreated }: AddResourceFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'medical_staff' | 'equipment' | 'medicine' | 'facility'>('facility');
  const [quantity, setQuantity] = useState<number>(100);
  const [stateId, setStateId] = useState<string>('mh');
  const [districtId, setDistrictId] = useState<string | null>(null);
  const [location, setLocation] = useState<string>('');
  const [status, setStatus] = useState<'available' | 'in_use' | 'maintenance'>('available');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const districts = useMemo(() => {
    const st = mockStates.find(s => s.id === stateId);
    return st ? st.districts : [];
  }, [stateId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          quantity,
          location: location || (districtId ? `${districts.find(d => d.id === districtId)?.name}, ${mockStates.find(s => s.id === stateId)?.name}` : mockStates.find(s => s.id === stateId)?.name),
          stateId,
          districtId: districtId || undefined,
          status
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to create resource');
      }
      setSuccess('Resource created');
      setName('');
      setQuantity(100);
      setLocation('');
      setDistrictId(null);
      onCreated?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Add Resource</h3>
        <Icon icon="mdi:plus" className="w-5 h-5 text-gray-400" />
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{error}</div>
      )}
      {success && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-2">{success}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., ICU Beds" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as 'medical_staff' | 'equipment' | 'medicine' | 'facility')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="facility">Facility</option>
            <option value="equipment">Equipment</option>
            <option value="medical_staff">Medical Staff</option>
            <option value="medicine">Medicine</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Quantity</label>
          <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as 'available' | 'in_use' | 'maintenance')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="available">Available</option>
            <option value="in_use">In Use</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">State</label>
          <select value={stateId} onChange={(e) => setStateId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            {mockStates.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">District (optional)</label>
          <select value={districtId || ''} onChange={(e) => setDistrictId(e.target.value || null)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">-- none --</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-700 mb-1">Location Label</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Mumbai, Maharashtra" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
          {submitting ? 'Saving...' : 'Create Resource'}
        </button>
      </div>
    </form>
  );
}