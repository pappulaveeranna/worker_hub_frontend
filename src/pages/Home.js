import React, { useState, useEffect, useCallback } from 'react';
import { workerAPI } from '../api/api';
import { WorkerCard } from '../components/WorkerCard';
import AIRecommendations from '../components/AIRecommendations';

function Home() {
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfession, setSelectedProfession] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const professions = [
    'Plumber', 'Electrician', 'Carpenter', 'Mechanic', 'Cleaner',
    'Painter', 'AC Repair', 'Appliance Repair', 'Gardener'
  ];

  // Fetch all workers from API
  const fetchWorkers = async () => {
    try {
      console.log('Fetching workers...');
      const response = await workerAPI.getAllWorkers();
      console.log('Workers API response:', response);
      console.log('Workers data:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setWorkers(response.data);
        console.log(`Successfully loaded ${response.data.length} workers`);
      } else {
        console.warn('Invalid workers data format:', response.data);
        setWorkers([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch workers:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter workers based on search term, profession, and location
  const filterWorkers = useCallback(() => {
    let filtered = workers;

    if (searchTerm) {
      filtered = filtered.filter(worker =>
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.profession.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedProfession) {
      filtered = filtered.filter(worker => worker.profession === selectedProfession);
    }

    if (selectedLocation) {
      filtered = filtered.filter(worker =>
        worker.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredWorkers(filtered);
  }, [workers, searchTerm, selectedProfession, selectedLocation]); // ✅ dependencies

  // Fetch workers on component mount
  useEffect(() => {
    fetchWorkers();
  }, []);

  // Filter workers whenever dependencies change
  useEffect(() => {
    filterWorkers();
  }, [filterWorkers]);

  const locations = [...new Set(workers.map(worker => worker.location))];

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <div>Loading workers...</div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '50px',
        padding: '30px 20px',
        background: 'linear-gradient(135deg, #4c6ef5 0%, #9775fa 100%)',
        borderRadius: '20px',
        color: 'white',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{ 
          color: '#ffffff', 
          marginBottom: '15px',
          fontSize: '2.5rem',
          fontWeight: '700',
          letterSpacing: '1px',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          🔧 Find Skilled Workers
        </h1>
        <p style={{ 
          color: '#f1f3f4', 
          fontSize: '20px',
          fontWeight: '400',
          letterSpacing: '0.5px',
          lineHeight: '1.6'
        }}>
          Connect with trusted professionals in your area
        </p>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        marginBottom: '32px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end'
        }}>
          {/* Search Input */}
          <div style={{ flex: '1' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '500',
              color: '#374151',
              fontSize: '14px'
            }}>Search Workers</label>
            <input
              type="text"
              placeholder="Search by name or profession..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#111827',
                backgroundColor: '#ffffff',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {/* Job Role Filter */}
          <div style={{ minWidth: '180px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '500',
              color: '#374151',
              fontSize: '14px'
            }}>Job Role</label>
            <select
              value={selectedProfession}
              onChange={(e) => setSelectedProfession(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#111827',
                backgroundColor: '#ffffff',
                outline: 'none',
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="">All Roles</option>
              {professions.map(profession => (
                <option key={profession} value={profession}>
                  {profession}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div style={{ minWidth: '180px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '500',
              color: '#374151',
              fontSize: '14px'
            }}>Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#111827',
                backgroundColor: '#ffffff',
                outline: 'none',
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {(searchTerm || selectedProfession || selectedLocation) && (
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedProfession('');
                setSelectedLocation('');
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* AI Recommendations */}
      <AIRecommendations />

      {/* Worker list */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {filteredWorkers.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '40px',
            color: '#666'
          }}>
            <div>No workers found matching your criteria</div>
            <div style={{ fontSize: '14px', marginTop: '10px', color: '#999' }}>
              Debug: Total workers: {workers.length}, Filtered: {filteredWorkers.length}
            </div>
            <button 
              onClick={fetchWorkers}
              style={{
                marginTop: '15px',
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Refresh Workers
            </button>
          </div>
        ) : (
          filteredWorkers.map(worker => (
            <WorkerCard key={worker._id} worker={worker} />
          ))
        )}
      </div>
    </div>
  );
}

export default Home;
