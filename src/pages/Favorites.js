import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { WorkerCard } from '../components/WorkerCard';

function Favorites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(() => {
    const savedFavorites = JSON.parse(localStorage.getItem(`favorites_${user?._id}`) || '[]');
    setFavorites(savedFavorites);
    setLoading(false);
  }, [user?._id]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const removeFavorite = (workerId) => {
    const updatedFavorites = favorites.filter(worker => worker._id !== workerId);
    setFavorites(updatedFavorites);
    localStorage.setItem(`favorites_${user?._id}`, JSON.stringify(updatedFavorites));
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        Loading favorites...
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
        marginBottom: '40px'
      }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>
          ❤️ My Favorite Workers
        </h1>
        <p style={{ color: '#666', fontSize: '18px' }}>
          Workers you've saved for future bookings
        </p>
      </div>

      {favorites.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: 'white',
          borderRadius: '15px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>💔</div>
          <h3 style={{ color: '#666', marginBottom: '15px' }}>No favorites yet</h3>
          <p style={{ color: '#999', marginBottom: '25px' }}>
            Start adding workers to your favorites for quick access!
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#0056b3';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#007bff';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Browse Workers
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {favorites.map(worker => (
            <div key={worker._id} style={{ position: 'relative' }}>
              <WorkerCard worker={worker} />
              <button
                onClick={() => removeFavorite(worker._id)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
                title="Remove from favorites"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;