'use client';

import { useState, useEffect } from 'react';
import { Trophy, Plus, Search, TrendingUp, Calendar, Target } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { PersonalRecord } from '@/lib/types/database';

const RECORD_TYPES = [
  { value: '1rm', label: '1 Rep Max', color: 'text-red-400' },
  { value: '3rm', label: '3 Rep Max', color: 'text-orange-400' },
  { value: '5rm', label: '5 Rep Max', color: 'text-yellow-400' },
  { value: 'distance', label: 'Distance', color: 'text-blue-400' },
  { value: 'time', label: 'Time', color: 'text-green-400' },
  { value: 'reps', label: 'Max Reps', color: 'text-purple-400' },
];

export default function PersonalRecordsPage() {
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecordType, setSelectedRecordType] = useState<string>('all');
  const [filteredRecords, setFilteredRecords] = useState<PersonalRecord[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    let filtered = records;

    // Filter by record type
    if (selectedRecordType !== 'all') {
      filtered = filtered.filter(record => record.record_type === selectedRecordType);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(record =>
        record.exercise_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRecords(filtered);
  }, [searchTerm, selectedRecordType, records]);

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/personal-records');
      if (response.ok) {
        const data = await response.json();
        setRecords(data.personalRecords || []);
      }
    } catch (error) {
      console.error('Error fetching personal records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRecord = async (recordData: any) => {
    try {
      const response = await fetch('/api/personal-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Personal record saved!');
        await fetchRecords(); // Refresh the list
        setShowAddForm(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save personal record');
      }
    } catch (error) {
      console.error('Error saving personal record:', error);
      alert('Failed to save personal record');
    }
  };

  const getRecordTypeInfo = (recordType: string) => {
    const info = RECORD_TYPES.find(r => r.value === recordType);
    return info || { label: recordType, color: 'text-text-secondary' };
  };

  const formatValue = (record: PersonalRecord) => {
    const { value, unit, record_type } = record;
    
    if (record_type === 'time') {
      if (unit === 'seconds') {
        const minutes = Math.floor(value / 60);
        const seconds = Math.round(value % 60);
        return minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds}s`;
      }
      return `${value} ${unit}`;
    }
    
    return `${value} ${unit}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Group records by exercise
  const groupedRecords = filteredRecords.reduce((groups, record) => {
    const exercise = record.exercise_name;
    if (!groups[exercise]) {
      groups[exercise] = [];
    }
    groups[exercise].push(record);
    return groups;
  }, {} as Record<string, PersonalRecord[]>);

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Trophy className="w-10 h-10 text-yellow-400" />
              Personal Records
            </h1>
            <p className="text-text-secondary text-lg">
              Track your best performances and celebrate progress
            </p>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-success hover:bg-success/80"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-surface border border-border rounded-xl p-6 mb-8">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search exercises..."
                className="w-full pl-12 pr-4 py-3 bg-bg border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>

            {/* Record Type Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Record Type</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedRecordType('all')}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    selectedRecordType === 'all'
                      ? 'bg-navy/20 border-navy text-navy'
                      : 'bg-bg border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  All Types
                </button>
                {RECORD_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedRecordType(type.value)}
                    className={`px-3 py-2 rounded-lg border transition-colors ${
                      selectedRecordType === type.value
                        ? 'bg-navy/20 border-navy text-navy'
                        : 'bg-bg border-border text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span className="text-sm">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-border rounded mb-3"></div>
                <div className="h-4 bg-border rounded mb-2"></div>
                <div className="h-4 bg-border rounded w-3/4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && Object.keys(groupedRecords).length === 0 && !searchTerm && selectedRecordType === 'all' && (
          <div className="text-center py-16">
            <Trophy className="w-24 h-24 text-text-muted mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-4">No personal records yet</h3>
            <p className="text-text-secondary mb-8">
              Start tracking your best performances to see your progress
            </p>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-success hover:bg-success/80"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Record
            </Button>
          </div>
        )}

        {/* No Search Results */}
        {!isLoading && Object.keys(groupedRecords).length === 0 && (searchTerm || selectedRecordType !== 'all') && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No records found</h3>
            <p className="text-text-secondary">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}

        {/* Records Grid */}
        {!isLoading && Object.keys(groupedRecords).length > 0 && (
          <div className="space-y-8">
            {Object.entries(groupedRecords).map(([exercise, exerciseRecords]) => (
              <div key={exercise} className="bg-surface border border-border rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <Target className="w-6 h-6 text-navy" />
                  {exercise}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exerciseRecords.map((record) => {
                    const typeInfo = getRecordTypeInfo(record.record_type);
                    
                    return (
                      <div key={record.id} className="bg-bg border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                          <span className="text-xs text-text-muted flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(record.achieved_at)}
                          </span>
                        </div>
                        
                        <div className="text-2xl font-bold text-text-primary mb-1">
                          {formatValue(record)}
                        </div>
                        
                        {record.notes && (
                          <p className="text-sm text-text-secondary line-clamp-2">
                            {record.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Record Form Modal */}
        {showAddForm && (
          <AddRecordForm 
            onSave={handleAddRecord}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Stats Footer */}
        {!isLoading && records.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-text-primary">{records.length}</div>
                <div className="text-sm text-text-muted">Total Records</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-text-primary">
                  {Object.keys(groupedRecords).length}
                </div>
                <div className="text-sm text-text-muted">Exercises Tracked</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-text-primary">
                  {new Set(records.map(r => r.record_type)).size}
                </div>
                <div className="text-sm text-text-muted">Record Types</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple Add Record Form Component
function AddRecordForm({ onSave, onCancel }: { 
  onSave: (data: any) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    exercise_name: '',
    record_type: '1rm',
    value: '',
    unit: 'kg',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.exercise_name || !formData.value) return;
    
    onSave({
      ...formData,
      value: parseFloat(formData.value)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Add Personal Record</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Exercise</label>
            <input
              type="text"
              value={formData.exercise_name}
              onChange={(e) => setFormData(prev => ({ ...prev, exercise_name: e.target.value }))}
              placeholder="e.g., Bench Press"
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-navy"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={formData.record_type}
                onChange={(e) => setFormData(prev => ({ ...prev, record_type: e.target.value }))}
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-navy"
              >
                {RECORD_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-navy"
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
                <option value="km">km</option>
                <option value="mi">mi</option>
                <option value="seconds">seconds</option>
                <option value="minutes">minutes</option>
                <option value="reps">reps</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Value</label>
            <input
              type="number"
              value={formData.value}
              onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
              placeholder="0"
              step="0.1"
              min="0"
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-navy"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Notes (optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any notes about this record..."
              rows={2}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-navy resize-none"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="bg-success hover:bg-success/80 flex-1">
              Save Record
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}