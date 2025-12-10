import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RatingStars from './RatingStars';
import QuickBooking from './QuickBooking';

export function WorkerCard({ worker }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showQuickBooking, setShowQuickBooking] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (user) {
      const favorites = JSON.parse(localStorage.getItem(`favorites_${user._id}`) || '[]');
      setIsFavorite(favorites.some(fav => fav._id === worker._id));
    }
  }, [user, worker._id]);

  const toggleFavorite = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }

    const favorites = JSON.parse(localStorage.getItem(`favorites_${user._id}`) || '[]');
    let updatedFavorites;

    if (isFavorite) {
      updatedFavorites = favorites.filter(fav => fav._id !== worker._id);
    } else {
      updatedFavorites = [...favorites, worker];
    }

    localStorage.setItem(`favorites_${user._id}`, JSON.stringify(updatedFavorites));
    setIsFavorite(!isFavorite);
  };

  if (!worker) return null;

  const handleCardClick = (e) => {
    if (e.target.closest('.quick-book-btn')) {
      return; // Don't navigate if quick book button was clicked
    }
    navigate(`/worker/${worker._id}`);
  };

  return (
    <>
    <div
      onClick={handleCardClick}
      className="bms-card"
      style={{
        cursor: 'pointer',
        padding: '20px',
        textAlign: 'center',
        transition: 'transform 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{
        width: '100%',
        height: '150px',
        borderRadius: '8px',
        marginBottom: '15px',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#2b2b2b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {worker.photo ? (
          <img
            src={worker.photo}
            alt={worker.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1971c2',
            fontSize: '48px'
          }}>
            <div style={{ marginBottom: '8px' }}>👤</div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              backgroundColor: '#1971c2',
              color: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {worker.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
      <h3 style={{ margin: '10px 0', color: '#ffffff' }}>{worker.name}</h3>
      <RatingStars rating={worker.rating || 4.0} />
      <p style={{ 
        fontWeight: 'bold', 
        color: '#1971c2',
        margin: '10px 0'
      }}>
        {worker.profession}
      </p>
      <p style={{ color: '#d1d5db', margin: '5px 0' }}>{worker.location}</p>
      <p style={{ 
        fontWeight: 'bold', 
        color: '#2b8a3e',
        fontSize: '18px',
        margin: '10px 0'
      }}>
        ₹{worker.charges}/day
      </p>
      
      {/* Only show booking options for regular users, not workers */}
      {user?.role !== 'worker' && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button
            className="quick-book-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowQuickBooking(true);
            }}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: '#1971c2',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Quick Book
          </button>
          
          <button
            onClick={toggleFavorite}
            style={{
              padding: '10px',
              backgroundColor: isFavorite ? '#e03131' : '#7048e8',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              minWidth: '45px'
            }}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>
      )}
      
      {/* Show message for workers */}
      {user?.role === 'worker' && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#e9ecef',
          borderRadius: '6px',
          textAlign: 'center',
          color: '#6c757d',
          fontSize: '14px'
        }}>
          👷‍♂️ Workers cannot book other workers
        </div>
      )}
    </div>
    
    {showQuickBooking && (
      <QuickBooking 
        worker={worker} 
        onClose={() => setShowQuickBooking(false)} 
      />
    )}
    </>
  );
}
