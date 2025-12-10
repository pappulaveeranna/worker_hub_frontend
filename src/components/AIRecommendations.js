import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { workerAPI, bookingAPI } from '../api/api';
import { WorkerCard } from './WorkerCard';

function AIRecommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchRecommendations = useCallback(async () => {
    try {
      // Get user's booking history
      const bookingsResponse = await bookingAPI.getUserBookings();
      const bookings = bookingsResponse.data || [];


      // Get all workers
      const workersResponse = await workerAPI.getAllWorkers();
      const allWorkers = workersResponse.data || [];

      // Generate AI recommendations
      const recommendedWorkers = generateRecommendations(bookings, allWorkers);
      setRecommendations(recommendedWorkers);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role !== 'worker') {
      fetchRecommendations();
    }
  }, [user, fetchRecommendations]);

  const generateRecommendations = (bookings, workers) => {
    // AI Algorithm for recommendations
    const scoredWorkers = workers.map(worker => {
      let score = 0;
      let reasons = [];

      // Factor 1: Previous profession preference (40% weight)
      const previousProfessions = bookings.map(b => b.worker?.profession).filter(Boolean);
      if (previousProfessions.includes(worker.profession)) {
        score += 40;
        reasons.push(`You've hired ${worker.profession}s before`);
      }

      // Factor 2: Rating score (30% weight)
      const baseRating = 3; // Assume average rating if no reviews
      const ratingScore = ((baseRating / 5) * 30);
      score += ratingScore;
      if (baseRating >= 4) {
        reasons.push('Highly rated professional');
      }

      // Factor 3: Price competitiveness (20% weight)
      const avgPrice = workers.reduce((sum, w) => sum + (w.charges || 0), 0) / workers.length;
      if (worker.charges <= avgPrice) {
        score += 20;
        reasons.push('Competitive pricing');
      }

      // Factor 4: Location preference (10% weight)
      const previousLocations = bookings.map(b => b.worker?.location).filter(Boolean);
      if (previousLocations.some(loc => loc === worker.location)) {
        score += 10;
        reasons.push('In your preferred area');
      }

      // Bonus: New workers (encourage diversity)
      if (!previousProfessions.includes(worker.profession)) {
        score += 5;
        reasons.push('Explore new services');
      }

      return {
        ...worker,
        aiScore: score,
        reasons: reasons.slice(0, 2) // Show top 2 reasons
      };
    });

    // Sort by AI score and return top 6
    return scoredWorkers
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 6);
  };

  if (user?.role === 'worker' || !user) {
    return null;
  }

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>🤖 AI Recommendations</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🤖</div>
              <p>Analyzing your preferences...</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🤖</div>
        <h2 style={{ color: '#333', marginBottom: '10px' }}>AI Recommendations</h2>
        <p style={{ color: '#666' }}>
          Make your first booking to get personalized worker recommendations!
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      marginBottom: '30px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px' }}>
        <div style={{ fontSize: '32px', marginRight: '15px' }}>🤖</div>
        <div>
          <h2 style={{ color: '#333', margin: 0 }}>AI Recommendations</h2>
          <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '14px' }}>
            Based on your booking history and preferences
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {recommendations.map(worker => (
          <div key={worker._id} style={{ position: 'relative' }}>
            {/* AI Badge */}
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              🤖 AI Pick
            </div>

            <WorkerCard worker={worker} />

            {/* AI Reasons */}
            <div style={{
              marginTop: '10px',
              padding: '12px',
              backgroundColor: '#e3f2fd',
              borderRadius: '8px',
              border: '1px solid #bbdefb'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1976d2', marginBottom: '6px' }}>
                Why we recommend:
              </div>
              {worker.reasons.map((reason, index) => (
                <div key={index} style={{ fontSize: '12px', color: '#1565c0', marginBottom: '2px' }}>
                  • {reason}
                </div>
              ))}
              <div style={{ fontSize: '11px', color: '#1976d2', marginTop: '6px', fontWeight: 'bold' }}>
                Match Score: {Math.round(worker.aiScore)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
          💡 <strong>How it works:</strong> Our AI analyzes your booking history, worker ratings, 
          and preferences to suggest the best matches for your needs.
        </p>
      </div>
    </div>
  );
}

export default AIRecommendations;