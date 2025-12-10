import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingAPI } from '../api/api';

function Profile() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || '',
    // Worker-specific fields
    profession: user?.profession || '',
    charges: user?.charges || '',
    location: user?.location || '',
    contact: user?.contact || '',
    experience: user?.experience || ''
  });
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedJobs: 0,
    reviewsReceived: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch user statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        // Get user's bookings
        const bookingsResponse = await bookingAPI.getUserBookings();
        const bookings = bookingsResponse.data || [];
        
        if (user?.role === 'worker') {
          // Worker stats - bookings where they are the worker
          const workerBookings = bookings.filter(booking => booking.worker?.name === user.name);
          const totalBookings = workerBookings.length;
          const completedJobs = workerBookings.filter(booking => booking.status === 'completed').length;
          const reviewsReceived = workerBookings.filter(booking => booking.reviewId).length;
          const totalEarnings = workerBookings
            .filter(booking => booking.status === 'completed')
            .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
          
          setStats({
            totalBookings,
            completedJobs,
            reviewsReceived,
            totalEarnings
          });
        } else {
          // Regular user stats
          const totalBookings = bookings.length;
          const completedJobs = bookings.filter(booking => booking.status === 'completed').length;
          const reviewsGiven = bookings.filter(booking => booking.reviewId).length;
          const favorites = JSON.parse(localStorage.getItem(`favorites_${user._id}`) || '[]');
          
          setStats({
            totalBookings,
            completedJobs,
            reviewsReceived: reviewsGiven,
            totalEarnings: favorites.length
          });
        }
      } catch (error) {
        console.error('Failed to fetch user statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const handleSave = () => {
    // In a real app, this would save to backend
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    setEditing(false);
    alert('Profile updated successfully!');
  };

  const statsDisplay = user?.role === 'worker' ? [
    { label: 'Total Bookings', value: stats.totalBookings, icon: '📋' },
    { label: 'Completed Jobs', value: stats.completedJobs, icon: '✅' },
    { label: 'Reviews Received', value: stats.reviewsReceived, icon: '⭐' },
    { label: 'Total Earnings', value: `₹${stats.totalEarnings}`, icon: '💰' }
  ] : [
    { label: 'Total Bookings', value: stats.totalBookings, icon: '📋' },
    { label: 'Completed Jobs', value: stats.completedJobs, icon: '✅' },
    { label: 'Reviews Given', value: stats.reviewsReceived, icon: '⭐' },
    { label: 'Favorite Workers', value: stats.totalEarnings, icon: '❤️' }
  ];

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '20px'
    }}>
      {/* Profile Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '15px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          backgroundColor: '#007bff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '48px',
          fontWeight: 'bold',
          margin: '0 auto 20px'
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>{user?.name}</h1>
        <p style={{ color: '#666', fontSize: '16px' }}>{user?.email}</p>
        <div style={{ marginTop: '20px' }}>
          <span style={{
            backgroundColor: user?.role === 'worker' ? '#28a745' : '#007bff',
            color: 'white',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {user?.role === 'worker' ? '🔧 Worker' : '👤 Customer'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {loading ? (
          // Loading skeleton
          [1,2,3,4].map((_, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ccc', marginBottom: '5px' }}>
                --
              </div>
              <div style={{ color: '#ccc', fontSize: '14px' }}>Loading...</div>
            </div>
          ))
        ) : (
          statsDisplay.map((stat, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              textAlign: 'center',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>{stat.icon}</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
                {typeof stat.value === 'string' ? stat.value : stat.value}
              </div>
              <div style={{ color: '#666', fontSize: '14px' }}>{stat.label}</div>
            </div>
          ))
        )}
      </div>

      {/* Profile Details */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px'
        }}>
          <h2 style={{ color: '#333', margin: 0 }}>Profile Information</h2>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: editing ? '#28a745' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {editing ? '💾 Save' : '✏️ Edit'}
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Full Name
            </label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              disabled={!editing}
              style={{
                width: '100%',
                padding: '12px',
                border: editing ? '2px solid #007bff' : '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: editing ? 'white' : '#f8f9fa'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Email
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              disabled={!editing}
              style={{
                width: '100%',
                padding: '12px',
                border: editing ? '2px solid #007bff' : '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: editing ? 'white' : '#f8f9fa'
              }}
            />
          </div>

          {user?.role === 'worker' ? (
            // Worker-specific fields
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                  Profession
                </label>
                <input
                  type="text"
                  value={profileData.profession}
                  onChange={(e) => setProfileData({...profileData, profession: e.target.value})}
                  disabled={!editing}
                  placeholder="e.g., Plumber, Electrician"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: editing ? '2px solid #007bff' : '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: editing ? 'white' : '#f8f9fa'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                  Daily Rate (₹)
                </label>
                <input
                  type="number"
                  value={profileData.charges}
                  onChange={(e) => setProfileData({...profileData, charges: e.target.value})}
                  disabled={!editing}
                  placeholder="Enter daily rate"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: editing ? '2px solid #007bff' : '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: editing ? 'white' : '#f8f9fa'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                  Location
                </label>
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                  disabled={!editing}
                  placeholder="Enter your work location"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: editing ? '2px solid #007bff' : '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: editing ? 'white' : '#f8f9fa'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={profileData.contact}
                  onChange={(e) => setProfileData({...profileData, contact: e.target.value})}
                  disabled={!editing}
                  placeholder="Enter contact number"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: editing ? '2px solid #007bff' : '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: editing ? 'white' : '#f8f9fa'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                  Experience
                </label>
                <input
                  type="text"
                  value={profileData.experience}
                  onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                  disabled={!editing}
                  placeholder="e.g., 5 years"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: editing ? '2px solid #007bff' : '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: editing ? 'white' : '#f8f9fa'
                  }}
                />
              </div>
            </>
          ) : (
            // Regular user fields
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  disabled={!editing}
                  placeholder="Enter phone number"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: editing ? '2px solid #007bff' : '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: editing ? 'white' : '#f8f9fa'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                  Address
                </label>
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                  disabled={!editing}
                  placeholder="Enter your address"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: editing ? '2px solid #007bff' : '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: editing ? 'white' : '#f8f9fa'
                  }}
                />
              </div>
            </>
          )}
        </div>

        <div style={{ marginTop: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
            {user?.role === 'worker' ? 'About Your Services' : 'Bio'}
          </label>
          <textarea
            value={profileData.bio}
            onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
            disabled={!editing}
            placeholder={user?.role === 'worker' ? 'Describe your services and expertise...' : 'Tell us about yourself...'}
            style={{
              width: '100%',
              padding: '12px',
              border: editing ? '2px solid #007bff' : '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: editing ? 'white' : '#f8f9fa',
              minHeight: '100px',
              resize: 'vertical'
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Profile;